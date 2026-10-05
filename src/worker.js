/**
 * absolutcas.com — mailing list infrastructure
 *
 * The site is a Worker serving static assets. This script adds the mailing-list endpoints
 * under /api/* and lets everything else fall straight through to the assets.
 *
 * Two systems, two jobs:
 *   D1      the master record. Consent, unsubscribe state, claim ledger. Owned here.
 *   Brevo   the sender. Contacts + transactional mail. Never the source of truth.
 *
 * The three jobs, nothing else:
 *   POST /api/waitlist    -> write the row to D1, send the confirmation mail
 *   GET  /api/confirm     -> mark consent, THEN add the contact to the Brevo list
 *   GET  /api/unsubscribe -> mark removal, THEN delete the contact from Brevo
 *
 * Campaigns are sent from Brevo by hand, to that list. This Worker never sends a campaign.
 * The Brevo list is held exactly equal to "addresses that may be mailed": a contact is
 * added only after the confirm click, and deleted the moment someone removes themselves.
 *
 * The D1 write happens first and unconditionally. A Brevo outage must never cost a signup,
 * so every outbound call is wrapped and its failure is logged, not surfaced.
 *
 * Routes:
 *   POST /api/waitlist      { email, hp, cf-turnstile-response?, source? }
 *   GET  /api/confirm?t=..  records consent, serves a page
 *   GET  /api/unsubscribe?t=.. records removal, serves a page
 *   POST /api/claim         NOT IMPLEMENTED — see the stub at the bottom.
 *
 * Secrets / vars (see wrangler.jsonc):
 *   BREVO_API_KEY       secret. Absent = mail is skipped, signups still stored.
 *   BREVO_LIST_ID       var.    Brevo list the contact is added to.
 *   TURNSTILE_SECRET    secret, optional. If set, /api/waitlist requires a valid token.
 *   MAIL_FROM           var.    Verified sender address.
 */

import { confirmationEmail, confirmedPage, unsubscribedPage } from './emails.js';

const SITE = 'https://absolutcas.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------------ router */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      return api(request, env, url);
    }
    return env.ASSETS.fetch(request);
  },
};

async function api(request, env, url) {
  const path = url.pathname.replace(/\/+$/, '');

  if (path === '/api/waitlist') {
    if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
    return signup(request, env);
  }
  if (path === '/api/confirm' && request.method === 'GET') {
    return confirm(env, url);
  }
  if (path === '/api/unsubscribe' && request.method === 'GET') {
    return unsubscribe(env, url);
  }
  if (path === '/api/claim') {
    // Deliberately not implemented. See the stub at the bottom of this file for what it
    // needs before it can exist. Returning 501 is honest; a half-built claim endpoint
    // that issues $5 keys is not.
    return json({ ok: false, error: 'not_implemented' }, 501);
  }
  return json({ ok: false, error: 'not_found' }, 404);
}

/* ------------------------------------------------------------------ signup */

async function signup(request, env) {
  let body;
  try {
    const ct = request.headers.get('content-type') || '';
    body = ct.includes('application/json')
      ? await request.json()
      : Object.fromEntries(await request.formData());
  } catch {
    return json({ ok: false, error: 'bad_body' }, 400);
  }

  // Honeypot. A real browser never fills this. Pretend it worked and store nothing —
  // telling a bot it failed just teaches it to try harder.
  if (body.hp) return json({ ok: true });

  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(env, body['cf-turnstile-response'], request);
    if (!ok) return json({ ok: false, error: 'challenge_failed' }, 403);
  }

  const email = String(body.email || '').trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'bad_email' }, 400);
  }

  const now = new Date().toISOString();
  const token = newToken();

  // Write first. Never conditional on anything downstream.
  await env.DB.prepare(
    `INSERT INTO subscribers (email, created_at, source, token)
     VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(email) DO NOTHING`
  )
    .bind(email, now, String(body.source || 'site').slice(0, 32), token)
    .run();

  const row = await env.DB.prepare(
    `SELECT email, token, consented_at, unsubscribed_at FROM subscribers WHERE email = ?1`
  )
    .bind(email)
    .first();

  if (!row) return json({ ok: true });

  // Already removed, and now asking again. Honour it: clear the removal, drop the old
  // consent, and require a fresh confirmation. Silently doing nothing here would mean the
  // form says "you're on the list" while leaving them off it — the exact failure this
  // whole pipeline exists to avoid.
  if (row.unsubscribed_at) {
    const fresh = newToken();
    await env.DB.prepare(
      `UPDATE subscribers SET unsubscribed_at = NULL, consented_at = NULL, token = ?1 WHERE email = ?2`
    )
      .bind(fresh, email)
      .run();
    row.token = fresh;
    row.consented_at = null;
    row.unsubscribed_at = null;
  }

  let emailSent = false;
  if (env.BREVO_API_KEY) {
    // No Brevo contact here. The list is only for people who may be mailed, and that is
    // not decided until they click confirm. See /api/confirm.
    if (!row.consented_at) {
      emailSent = await sendConfirmation(env, row.email, row.token);
    }
  } else {
    console.warn('BREVO_API_KEY is not set: signup stored, no mail sent.');
  }

  // The response is identical whether or not the address already existed. Confirming
  // that an address is on the list is a privacy leak; the page must not do it either.
  return json({ ok: true, email_sent: emailSent });
}

/* ------------------------------------------------------------------ confirm */

async function confirm(env, url) {
  const token = url.searchParams.get('t') || '';
  if (!token) return html('Bad link', 'That confirmation link is missing its token.');

  const row = await env.DB.prepare(
    `SELECT email, consented_at, unsubscribed_at FROM subscribers WHERE token = ?1`
  )
    .bind(token)
    .first();
  if (!row) return html('Bad link', 'That confirmation link is not recognised.');

  // Idempotent: clicking twice is not an error, and an unsubscribed address stays removed.
  if (!row.consented_at && !row.unsubscribed_at) {
    await env.DB.prepare(`UPDATE subscribers SET consented_at = ?1 WHERE token = ?2`)
      .bind(new Date().toISOString(), token)
      .run();
    // Consent is what puts them on the Brevo list, so a campaign sent from Brevo can only
    // reach people who confirmed. Inside the guard, so a repeat click does not re-add.
    await addBrevoContact(env, row.email);
  }

  if (row.unsubscribed_at) {
    return html('Removed', 'This address was removed from the list. Nothing to confirm.');
  }
  return new Response(confirmedPage(), {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

/* ------------------------------------------------------------------ unsubscribe */

async function unsubscribe(env, url) {
  const token = url.searchParams.get('t') || '';
  if (!token) return html('Bad link', 'That unsubscribe link is missing its token.');

  const row = await env.DB.prepare(
    `SELECT id, email, unsubscribed_at FROM subscribers WHERE token = ?1`
  )
    .bind(token)
    .first();
  if (!row) return html('Bad link', 'That unsubscribe link is not recognised.');

  if (!row.unsubscribed_at) {
    await env.DB.prepare(`UPDATE subscribers SET unsubscribed_at = ?1 WHERE token = ?2`)
      .bind(new Date().toISOString(), token)
      .run();
    // Removal is absolute, so it has to be absolute in both systems. Without this the
    // address stays in the Brevo list and the next campaign mails someone who opted out.
    await removeBrevoContact(env, row.email);
  }
  return new Response(unsubscribedPage(), {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

/* ------------------------------------------------------------------ Brevo */

/**
 * Add or update the contact so broadcast campaigns can reach them.
 * A 400 "Contact already exists" is the normal path and is not an error.
 */
async function addBrevoContact(env, email) {
  const listId = Number(env.BREVO_LIST_ID);
  if (!listId) {
    console.warn('BREVO_LIST_ID is not set: contact not added to a Brevo list.');
    return false;
  }
  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: brevoHeaders(env),
      body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
    });
    if (!res.ok && res.status !== 400) {
      console.error('brevo contact failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('brevo contact threw', err);
    return false;
  }
}

async function sendConfirmation(env, email, token) {
  const confirmUrl = `${SITE}/api/confirm?t=${token}`;
  const unsubUrl = `${SITE}/api/unsubscribe?t=${token}`;
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: brevoHeaders(env),
      body: JSON.stringify({
        sender: { name: 'absolut-CAS', email: env.MAIL_FROM || 'list@absolutcas.com' },
        to: [{ email }],
        subject: 'Confirm your address — absolut-CAS',
        htmlContent: confirmationEmail(confirmUrl, unsubUrl),
        headers: {
          // Gives Gmail/Apple a native unsubscribe affordance. Best practice, and it
          // measurably reduces "mark as spam" on list mail.
          'List-Unsubscribe': `<${unsubUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }),
    });
    if (!res.ok) {
      console.error('brevo send failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('brevo send threw', err);
    return false;
  }
}

function brevoHeaders(env) {
  return {
    'api-key': env.BREVO_API_KEY,
    'content-type': 'application/json',
    accept: 'application/json',
  };
}

/**
 * Take the contact out of Brevo entirely. Called only from the unsubscribe click.
 * A 404 means they were never added (they removed themselves before confirming) and is
 * the normal path, not an error.
 */
async function removeBrevoContact(env, email) {
  if (!env.BREVO_API_KEY) return false;
  try {
    const res = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: brevoHeaders(env),
    });
    if (!res.ok && res.status !== 404) {
      console.error('brevo remove failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('brevo remove threw', err);
    return false;
  }
}

/* ------------------------------------------------------------------ helpers */

async function verifyTurnstile(env, token, request) {
  if (!token) return false;
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) form.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const out = await res.json();
    return out.success === true;
  } catch (err) {
    console.error('turnstile verify threw', err);
    return false;
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/** Opaque, unguessable, and not derived from the address. 64 hex chars. */
function newToken() {
  return (
    crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  );
}

function html(title, message) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
     <meta name="viewport" content="width=device-width,initial-scale=1">
     <title>${title} — absolut-CAS</title><link rel="stylesheet" href="/assets/site.css"></head>
     <body class="layout-page"><main class="main-content"><div class="container" style="padding:4rem 0;">
     <h1 class="section-heading">${title}</h1><p class="prose-lead">${message}</p>
     <p><a class="btn primary-btn" href="${SITE}/">Back to the site</a></p>
     </div></main></body></html>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } }
  );
}

/* ------------------------------------------------------------------ /api/claim — NOT IMPLEMENTED
 *
 * Returning 501 above is deliberate. Before this can exist, four things must be true,
 * and none of them are code:
 *
 *   1. How the $5 is delivered. OpenRouter's management API can mint a key with a spend
 *      limit, but that key spends against the project's own OpenRouter balance — it is
 *      not a gift from OpenRouter. Either the project funds it out of Crowd Supply
 *      payouts, or OpenRouter agrees to sponsor a coupon campaign. Undecided.
 *
 *   2. Whether the credit is gated on backing the campaign. Crowd Supply does not release
 *      individual backer data, so an order is unverifiable from here. Either the credit
 *      is funding-tied (anyone consented, capped at the first 200 by created_at) or it
 *      needs a claim step with a self-reported order id that cannot be checked.
 *
 *   3. The cap. The banner says "first 200 people". created_at gives the ordering; the
 *      cap needs to be enforced here, and the copy needs to say what happens at 201.
 *
 *   4. The OpenRouter management key, stored the same way BREVO_API_KEY is.
 *
 * When those are settled the shape is: load the row by token, require consented_at,
 * require claimed_at IS NULL, count claimed rows against the cap, write order_id and
 * claimed_at, mint the key, set key_issued_at, mail it.
 */
