/**
 * absolutcas.com — mailing list email copy
 *
 * Every word that gets mailed lives here, not inline in the Worker, so the copy can be
 * edited without touching logic and so a reviewer can read the whole voice in one place.
 *
 * All of this is DRAFT pending the owner's edit. Flagged items:
 *   - the $5 line is written as CONTINGENT (it is only issued once Crowd Supply pays out).
 *     The site's waitlist banner still reads unconditional and needs the same correction.
 *   - no ship date is asserted, matching the site's own "no date is promised" stance.
 */

const SITE = 'https://absolutcas.com';

/** Wraps body HTML in the site's plain, no-image shell + the required footer. */
function shell(bodyHtml, unsubUrl) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f4ed;color:#161817;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 28px;font-size:15px;font-weight:700;letter-spacing:0.02em;">absolut-CAS</p>
    ${bodyHtml}
    <hr style="border:none;border-top:1px solid #d9d4c7;margin:32px 0 14px;">
    <p style="margin:0;font-size:12px;line-height:1.6;color:#6b6a63;">
      You are getting this because you asked for launch updates from absolutcas.com.<br>
      <a href="${unsubUrl}" style="color:#6b6a63;">Remove me from this list</a>
    </p>
  </div>
</body>
</html>`;
}

function btn(label, url) {
  return `<p style="margin:0 0 24px;"><a href="${url}" style="display:inline-block;padding:12px 20px;background:#161817;color:#f7f4ed;text-decoration:none;font-size:15px;font-weight:700;">${label}</a></p>`;
}

function p(text) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;">${text}</p>`;
}

/**
 * The confirmation mail. Sent immediately on signup.
 * Its one job: get the click that records consent.
 */
export function confirmationEmail(confirmUrl, unsubUrl) {
  const body = [
    p('You are on the list.'),
    p('One thing first: confirm your address so we know it is really you. That one click is also what marks you for the <strong>$5 OpenRouter credit</strong> the banner on the site mentions.'),
    btn('Confirm and get updates', confirmUrl),
    p('<strong>About the $5 credit.</strong> It is contingent on the campaign funding. If the campaign funds, the credit is issued once Crowd Supply pays out to the project — their own guide puts that at 4-5 weeks after the campaign closes, and up to two weeks more for a first campaign. So expect it roughly six to eight weeks after the campaign ends, not days. If the campaign does not fund, nobody is charged and there is nothing to issue.'),
    p('<strong>About timing.</strong> The v1 board is built and partly tested; the display connection is the known defect and the v2 board is the fix. We are not promising a ship date and will not pretend otherwise — you will get updates when there is something real to say, not on a schedule.'),
    p('That is everything. Nothing else will land in your inbox until there is actual news.'),
  ].join('\n    ');
  return shell(body, unsubUrl);
}

/**
 * The "you are confirmed" page shown after the confirm click.
 * Not an email — the Worker serves this as HTML.
 */
export function confirmedPage() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Confirmed — absolut-CAS</title>
<link rel="stylesheet" href="/assets/site.css"></head>
<body class="layout-page"><main class="main-content"><div class="container" style="padding:4rem 0;">
  <div class="section-label">// CONFIRMED</div>
  <h1 class="section-heading">You are on the list.</h1>
  <p class="prose-lead">Your address is confirmed and you will get the launch mail when there is something to send.</p>
  <p><a class="btn primary-btn" href="${SITE}/">Back to the site</a></p>
</div></main></body></html>`;
}

export function unsubscribedPage() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Removed — absolut-CAS</title>
<link rel="stylesheet" href="/assets/site.css"></head>
<body class="layout-page"><main class="main-content"><div class="container" style="padding:4rem 0;">
  <div class="section-label">// REMOVED</div>
  <h1 class="section-heading">You are off the list.</h1>
  <p class="prose-lead">No more mail from us. Nothing else to do.</p>
  <p><a class="btn primary-btn" href="${SITE}/">Back to the site</a></p>
</div></main></body></html>`;
}
