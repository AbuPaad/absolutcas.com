# Mailing list infrastructure

> **Location note.** This file lives in `reference/`. Paths in it are relative to the repository
> root, one level up (`public/…`, `src/…`, `schema.sql`, `wrangler.jsonc`). The only markdown kept
> at the repo root is `SITE-COPY.md`.

`absolutcas.com` — built 2026-10-04. Worker version `eebaab43-099d-453e-a9b8-624572d83c61`.

This is not a waitlist form. It is a mailing list: a master record you own, a sender that
handles delivery, consent tracking, and a one-click removal path. Treat it as infrastructure.

## The two systems

| | Job | Owns | Free tier |
|---|---|---|---|
| **Cloudflare D1** `absolutcas-waitlist` | Remember things | Every address, consent state, removal state, claim ledger | 100k row writes/day, 5 GB |
| **Brevo** | Deliver mail | Contacts + sending. A copy, never the source of truth | 300 emails/day, 100k contacts |

D1 cannot send mail. Brevo is bad at queries. The pipeline needs both.

Region OC · database id `f8eb845a-6625-44a0-8bf6-73d3b5843f54`

## Files

| Path | Role |
|---|---|
| `schema.sql` | The one table + indexes. Applied to remote and local. |
| `src/worker.js` | The API. Routes, validation, D1 writes, Brevo calls. |
| `src/emails.js` | Every word that gets mailed, plus the confirm/removed pages. |
| `wrangler.jsonc` | `main`, `assets.binding`, `run_worker_first: ["/api/*"]`, D1 binding, `MAIL_FROM`. |
| `public/assets/site.js` | The form now POSTs to `/api/waitlist` instead of writing to `localStorage`. |
| `public/index.html` | Honeypot field added; success message now tells the visitor to check their inbox. |
| `tools/d1-csv-sync.py` | D1 -> CSV. The audit file and the Brevo import file. See `D1-CSV-SYNC.md`. |

## Routes

| Route | Method | Behaviour |
|---|---|---|
| `/api/waitlist` | POST | Validate, write to D1, add Brevo contact, send the confirmation mail |
| `/api/confirm?t=` | GET | Record consent, serve a confirmation page |
| `/api/unsubscribe?t=` | GET | Record removal, serve a removal page |
| `/api/claim` | any | **501 — not implemented.** See "Open decisions". |
| everything else | any | Falls through to the static assets untouched |

`run_worker_first: ["/api/*"]` is what keeps page requests off the Worker entirely: a
visitor loading the site never invokes this code.

## The table

`subscribers`

| Column | Meaning |
|---|---|
| `email` | unique, lowercased and trimmed on write |
| `created_at` | set on insert, never updated. **This is the ordering the "first 200" promise depends on.** |
| `source` | which form sent it |
| `token` | 64 hex chars, opaque, not derived from the address. Confirm + unsubscribe only. |
| `consented_at` | set by the confirm click. Consent record *and* the $5-interest flag. |
| `unsubscribed_at` | set by the removal click. **A non-NULL value wins over everything.** |
| `order_id`, `claimed_at`, `key_issued_at` | reserved for the claim flow. Unused today. |

There is deliberately no `email_sent` column. Send state belongs to Brevo; this table
answers "may this address be mailed", not "was it mailed".

## Guarantees this is built to

- **The write is first and unconditional.** Every Brevo call is wrapped; an outage there
  cannot lose a signup.
- **The response is identical for new and existing addresses.** Confirming that an address
  is on the list is a privacy leak, so neither the API nor the page reveals it.
- **Removal is absolute.** Confirming after unsubscribing does not resurrect the address.
- **Re-signing up after removal works.** It clears the removal, drops the old consent and
  issues a fresh token, so the visitor gets a real confirmation rather than a silent no-op.
- **The page never claims an inbox delivery that did not happen.** With no mail provider
  configured the server returns `email_sent: false` and the form falls back to a neutral
  "You're on the list."
- **Both links are idempotent.** Clicking twice is not an error.

## Live status — what works and what does not

Working and verified against the live domain:

- Pages, assets, custom 404, and `_headers` all still behave exactly as before.
- `POST /api/waitlist` writes to the real D1. Tested live, then the test rows were deleted.
- Honeypot discards silently. Bad email returns 400. Unknown `/api/*` returns 404.
- Wrong method on `/api/waitlist` returns 405.

**Not working yet, by design:**

- **No mail is sent.** `BREVO_API_KEY` is not set, so the confirmation email is skipped and
  the endpoint returns `email_sent: false`. Signups are still stored. This is the one thing
  standing between this and a working confirmation loop.

## What you have to do before mail flows

1. **Create the Brevo account** and a list to hold the contacts.
2. **Verify `list@absolutcas.com` as a sender** and add Brevo's DKIM + SPF records to the
   Cloudflare DNS for `absolutcas.com`. Not optional: you are sending as your own domain,
   and without these the confirmation mail lands in spam.
3. **Set the secret yourself**, in your own terminal. Never paste it anywhere else:
   `cd ~/musings/paadweb && npx wrangler secret put BREVO_API_KEY`
4. ~~**Set the list id** — uncomment `BREVO_LIST_ID` in `wrangler.jsonc` and put the numeric
   list id in.~~ **Done 2026-10-04: `BREVO_LIST_ID` is `"3"` in `vars`.** Without it contacts
   are not added to Brevo and broadcasts cannot reach them.
5. **Optional but recommended:** create a Turnstile widget and set
   `npx wrangler secret put TURNSTILE_SECRET`. The endpoint then requires a valid challenge
   and the honeypot becomes a second line rather than the only one.
6. **Redeploy:** `npx wrangler deploy`
7. **Confirm it actually sends.** Sign up with a real address you control and check
   `email_sent` in the response, then the inbox.

## Open decisions (blocking `/api/claim`)

`/api/claim` returns 501 on purpose. Four things must be settled first, and none are code:

1. **How the $5 is delivered.** OpenRouter's management API mints a key with a spend limit,
   but that key spends against *your* OpenRouter balance — it is not a gift from OpenRouter.
   Either you fund it from Crowd Supply payouts, or OpenRouter sponsors a coupon campaign.
2. ~~**Whether the credit is gated on backing.**~~ **Decided 2026-10-04:** the credit is
   **funding-tied, self-reported**. When the campaign payout lands the owner mails the list
   asking who backed it; ordering is `created_at` ascending, capped at 200. No `/api/claim`
   path is required for this — a reply to an email is the claim. Note what it does and
   does not establish: `order_id` from a self-report is unverifiable (Crowd Supply releases
   no backer data), so the check is honest-intent, not proof. Max exposure is 200 x $5.
3. **The cap.** The banner says "first 200". `created_at` gives the ordering; the cap must be
   enforced in the claim handler, and the copy must say what happens at 201.
4. **The OpenRouter management key**, stored the way `BREVO_API_KEY` is.

## Copy that still needs your edit

- **`src/emails.js` is a draft.** Every mailed word lives there. It currently writes the $5
  as *contingent* on the campaign funding, and refuses to assert a ship date.
- **`public/index.html` still reads unconditionally:** "The first 200 people to join the
  waitlist get a $5 credit on the API tool bridge." That contradicts the email. Not changed,
  because site copy is yours to approve.
- **"Double opt-in."** under the form was **cut 2026-10-04** (`public/index.html`, and the
  ledger's `L1.20` already carried `[DELETE]`). It stopped being true once the confirm click
  was no longer what puts someone on the mailing list: `brevo-import.csv` carries every
  address in D1, confirmed or not. The confirm mail and the confirm click still exist and
  still record `consented_at` — they are just no longer the gate.
- **How the list reaches Brevo:** `tools/d1-csv-sync.py` (documented in `D1-CSV-SYNC.md`).
  Run `brevo` every other day, upload the file to Brevo list #3. The Worker's own Brevo
  add/remove on the confirm/remove clicks still runs and does not conflict with it.

## Verifying it by hand

```
# pages and fallthrough
curl -s -o /dev/null -w '%{http_code}\n' https://absolutcas.com/
curl -s -o /dev/null -w '%{http_code}\n' https://absolutcas.com/_headers   # expect 404

# a signup
curl -s -X POST https://absolutcas.com/api/waitlist \
  -H 'content-type: application/json' -d '{"email":"you@example.com"}'

# what landed
npx wrangler d1 execute absolutcas-waitlist --remote \
  --command "SELECT email, created_at, consented_at FROM subscribers ORDER BY id DESC LIMIT 5;"
```
