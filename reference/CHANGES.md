> **Location note.** This file lives in `reference/`. All paths written in it are relative to the
> repository root, one level up, and are left as written at the time — a change log records what
> happened, not where a file sits today. The only markdown kept at the repo root is `SITE-COPY.md`.

# CHANGE RECORD - 2026-10-03 - absolutcas.com: GitHub Pages -> Cloudflare Workers Static Assets

Session goal: switch the site's hosting to Cloudflare.
Status: **prepared and verified locally. Not deployed. Blocked on Cloudflare auth on this machine.**
> **Superseded 2026-10-04** — Cloudflare auth was sorted out and the cutover shipped; the
> `absolutcas-com` Worker now serves `absolutcas.com` and `www.absolutcas.com`. This line records the
> state *at the time of writing*, not today's.

## What the site actually was before this session

- `absolutcas.com` and `www` resolve to Cloudflare proxy IPs (172.67.172.79, 104.21.79.251);
  NS is `liv.ns.cloudflare.com` / `osmar.ns.cloudflare.com`. So the domain is *already* all-Cloudflare.
- The apex is served by a **Worker that returns 404** for `/`
  (`cf-worker-version: 3278e18a-0629-4d65-8448-be9402f68456`). Nothing is actually published:
  `https://absolutcas.com/` = `404 Not Found`, 13 bytes, `text/plain`.
- The Worker that 404s is **not** the scaffold in `~/musings/paadweb.cf-scaffold-unused/` - that
  one is an un-deployed hello-world (`icy-bird-45d3`, root-owned, no index content deployed).
- No Cloudflare credentials on this machine: no `~/.wrangler`, no `~/.config/.wrangler`,
  no `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` in the environment, no saved login in the
  Hermes vault. Wrangler 4.147.0 runs via `npx`, works unauthenticated for dev/dry-run only.

## Files created

| Path | What |
|---|---|
| `~/musings/paadweb/wrangler.jsonc` | Worker `absolutcas-com`, `assets.directory: ./public`, `not_found_handling: 404-page`, `observability`, and a commented-out `routes` block for the cutover |
| `~/musings/paadweb/public/_headers` | Custom response headers: nosniff, strict-origin-when-cross-origin, Permissions-Policy, per-path cache policy. COOP/COEP deliberately left commented out until the WASM bundle declares `pthreads: true` |
| `~/musings/paadweb/.gitignore` | `.wrangler/`, `node_modules/` |
| `~/musings/paadweb/CHANGES.md` | this file |

## Files modified

| Path | Change |
|---|---|
| `~/musings/paadweb/index.html` | moved `->` `public/index.html` (`git mv`, history preserved) |
| `~/musings/paadweb/404.html` | moved `->` `public/404.html` |
| `~/musings/paadweb/mockup/` (3 files: `index.html`, `demo.html`, `assets/fx82.jpg`) | moved `->` `public/mockup/` |
| `~/musings/paadweb/README.md` | rewritten: Cloudflare deploy flow + behaviour differences |
| `~/musings/paadweb/.gitignore` | (new, above) |

## Files deleted

| Path | Why |
|---|---|
| `~/musings/paadweb/.assetsignore` | created early in the session to keep `.git` out of the root asset directory; made unnecessary and misleading by the move to `public/` |

## Files left alone (deliberately)

`CNAME`, `.nojekyll` - inert GitHub Pages leftovers. Harmless, and they preserve a rollback path.
GitHub Pages on this repo will now serve a 404 for `/` (index.html moved) - it was already dead on
the live domain, so nothing regressed.

GitHub repo, Pages settings, and the DNS records themselves were **not touched**.

## Verified locally (wrangler dev on 127.0.0.1:8801, then dry-run)

| Check | Result |
|---|---|
| `wrangler deploy --dry-run` | passes, reads the assets dir, no auth needed |
| `GET /` | 200, `public/index.html` (1670 b) |
| `GET /mockup/` | 200, serves `mockup/index.html` (17923 b) |
| `GET /mockup/assets/fx82.jpg` | 200, `image/jpeg`, 2872323 b |
| `GET /nope-does-not-exist` | 404 serving `public/404.html` (1099 b) |
| `GET /.git/config` | 404 - not exposed |
| `GET /_headers`, `/wrangler.jsonc`, `/README.md`, `/CNAME` | 404 - not served |
| `_headers` rules | 4 valid rules parsed; `Cache-Control` + security headers present on responses |
| `GET /mockup/demo.html` | 307 `->` `/mockup/demo` (Cloudflare HTML handling), which then returns 200 |

## Known issue found and fixed during the session

With `assets.directory: "."` (repo root), `wrangler dev` entered an endless
`Reloading local server...` loop: Wrangler writes `.wrangler/` into the directory it watches, which
fires the file watcher. Confirmed in the dev log (~100 KB of loops in two minutes). Fixed by moving
assets into `public/`. Also: Wrangler's `Read N files from the assets directory` count is not a
reliable measure of what is uploaded (it reported 16 files for a 7-file tree), so asset exposure was
verified by actually requesting the paths, not by trusting the count.

## Later the same session - copy deck (no deploy)

Owner's instruction: do not deploy. Nothing was deployed; the Cloudflare auth is in place
(`wrangler whoami` returns the account and scopes) but no `wrangler deploy` was run, no `routes`
were attached, and the stray Worker still owns `absolutcas.com`.

Created:

| Path | What |
|---|---|
| `~/musings/paadweb/SITE-COPY.md` | Slot-by-slot port of every string on the site, with `[ART]` brackets saying which graphic or CSS construct sits in each slot, `[MISSING]` markers for art that does not exist, and a flagged list of the salesy sentences |

Also verified during this pass (all read, not assumed):

- No page references a favicon, an `og:image`, a `rel="canonical"` or a `twitter:card` - grep across
  all four pages returns nothing.
- `.nav ul{display:none}` under 860px in both mockup pages, with no replacement menu.
- `mockup/assets/fx82.jpg` is 2872323 bytes (2.87 MB / 2.74 MiB), the only image on the site.
- Banned em-dashes: `public/index.html` 2, `public/404.html` 1, both mockup pages 0.

## What is left

1. Get Cloudflare auth onto this machine (see below).
2. `npx wrangler@latest deploy` - serves on `absolutcas-com.<account>.workers.dev`, verify by curl.
3. Uncomment `routes` in `wrangler.jsonc`, redeploy, to attach the apex.
4. Delete or reroute the stray Worker currently owning `absolutcas.com`.
5. Decide `www`: currently resolves and 404s. Either attach it as a second custom domain or add a
   zone-level redirect rule `www -> apex`.
6. Size check before the WASM bundle lands: Workers static assets cap files at **25 MiB** each
   (GitHub Pages allowed 100 MB). A Giac-linked `.wasm` may exceed that; measure it before planning
   around this host.

---

# RECOVERY NOTE - 2026-10-04

`CHANGES.md` was found deleted from the working tree during the mailing-list session. Nothing
in that session's commands removed it. It has been restored with `git restore CHANGES.md`,
which brings back the last committed version (105 lines, the 2026-10-03 Cloudflare migration
record above).

**What was lost:** the file had uncommitted edits on disk beyond the committed version - the
sessions between 2026-10-03 and 2026-10-04, covering the v2 build and the app-capture work.
Those edits were never staged, so git did not hold them and they are not recoverable. The
records below were re-appended from their own source; the missing span is not reproduced here
and is not reconstructed by guesswork.

**Where that missing content largely still exists:**

- `BUILD-RECORD-v2.md` - the v2 site build
- `APP-SCREENSHOT-PLAN.md` - the app capture list and shot descriptions
- `WASM-BUILD-RECORD.md` - the WebAssembly publish pipeline
- `SITE-COPY-CHANGE-RECORD.md` - the copy-ledger reconciliation

Anything the owner wants to keep from the lost span should be re-appended from those.

---

# DEPLOY RECORD - 2026-10-04 - site went live on absolutcas.com

Session goal: deploy `public/` to the domain. **Done and verified against the live hostname.**

## What the domain was before

- `https://absolutcas.com/` -> **404**, `content-type: text/plain`, 13 bytes, with a
  `cf-worker-version` header. Something other than this repo owned the hostname.
- `https://www.absolutcas.com/` -> **530** (origin unreachable).
- Cloudflare API from the logged-in account reported: **0 Worker scripts, 0 Worker services,
  0 Pages projects, 0 Worker routes on the zone.** The old 404 responder lives outside what this
  account's token can see; it was never identified. It has now been superseded by a route.

## Auth

`npx wrangler whoami` -> OAuth token for `saadazfar2009@outlook.com`, account
`b614823f2dc7db64e839195751a39599`, credentials at `~/.config/.wrangler/config/default.toml`.
Scopes include `workers_scripts:write` and `workers_routes:write`, but **no `dns_records:*`** -
DNS is dashboard-only for this token.

## Files modified

| Path | Change |
|---|---|
| `wrangler.jsonc` | `routes` block enabled. First tried `custom_domain: true` for apex + www; **Cloudflare refused with code 100117** ("Hostname already has externally managed DNS records"). Switched to route patterns `absolutcas.com/*` and `www.absolutcas.com/*` with `zone_name`, which intercept on the zone without touching DNS. |
| `SITE-COPY.md` | Rewritten this session against the live files (see `SITE-COPY-CHANGE-RECORD.md`). |
| `SITE-COPY-CHANGE-RECORD.md` | New, the copy-ledger change record. |
| `WAITLIST-OPTIONS.md` | New, the waitlist/mailing backend research. |

## Deployed

Worker `absolutcas-com`. 54 assets uploaded. Both triggers attached:
`absolutcas.com/*` and `www.absolutcas.com/*` (zone `absolutcas.com`).

## Verified against the live domain (curl, not a local server)

| Check | Result |
|---|---|
| `GET https://absolutcas.com/` | **200**, 11794 b, `text/html`, title `absolut-CAS: It's your Casio. It does more now.` |
| `GET https://www.absolutcas.com/` | **200**, same body |
| `GET /apps/` | **200**, 43468 b |
| `GET /emulator/` | **200**, 5441 b |
| `GET /emulator/numos/numos-assets.json` | **200**, `application/json` |
| `GET /emulator/numos/numos-emulator.89750ec19dae.wasm` | **200**, `application/wasm`, 6748486 b, `max-age=31536000, immutable` |
| `GET /nope-does-not-exist` | **404** serving `public/404.html` |
| `GET /_headers` `/wrangler.jsonc` `/CNAME` `/.git/config` | all **404** |
| `GET /apps.html` | **307 -> /apps/** (expected; internal links are already extensionless) |

`_headers` rules confirmed applied on the live host: `x-content-type-options: nosniff`,
`referrer-policy: strict-origin-when-cross-origin`, `permissions-policy: geolocation=(), microphone=(), camera=()`
on every path; `/` and `/assets/*.css` `max-age=0, must-revalidate`; `/assets/img/*` `max-age=604800`;
`/emulator/numos/*` `max-age=31536000, immutable`.

## What is left from that session

1. The DNS records that blocked `custom_domain` are still there. The Worker now wins via route,
   but `custom_domain` stays unavailable until those A records are deleted in the dashboard.
2. `www` serves the same content rather than redirecting to the apex. That redirect is a
   zone-level Redirect Rule, not expressible in this repo.
3. The old 404 worker that previously owned the apex was never identified. It is now shadowed by
   the route; if the route is removed it comes back.

---

# CHANGE RECORD - 2026-10-04 - mailing list infrastructure (D1 + Brevo)

Session goal: build the mailing-list pipeline. Status: **built, deployed, verified live. Mail is
inert until a Brevo key is set.** Full description: `MAILING-LIST-INFRASTRUCTURE.md`.

The waitlist form no longer writes to `localStorage` and no longer lies about sending an email.
It stores to a database the owner controls and is wired to send a confirmation mail once a
provider is configured.

## Files created

| Path | What |
|---|---|
| `schema.sql` | The `subscribers` table + two indexes. Applied to remote and local D1. |
| `src/worker.js` | The API: `/api/waitlist`, `/api/confirm`, `/api/unsubscribe`, `/api/claim` (501). |
| `src/emails.js` | All mailed copy + the confirm and removed pages. Draft, pending review. |
| `MAILING-LIST-INFRASTRUCTURE.md` | Systems, routes, schema, guarantees, and what is left. |

## Files modified

| Path | Change |
|---|---|
| `wrangler.jsonc` | Added `main: src/worker.js`; `assets.binding: ASSETS`; `assets.run_worker_first: ["/api/*"]`; `d1_databases` binding `DB`; `vars.MAIL_FROM`. `BREVO_LIST_ID` left commented with a note. |
| `public/assets/site.js` | The submit handler now `fetch`es `/api/waitlist` and sends the honeypot. Removed the `localStorage` write. Success text is chosen from `email_sent` so it never claims a delivery that did not happen. |
| `public/index.html` | Added the hidden honeypot input. Success message changed from "We'll email you the moment launch goes live." to "Check your inbox to confirm your address." |
| `CHANGES.md` | Restored after being found deleted; see the recovery note above. |

## Infrastructure created

- D1 database `absolutcas-waitlist`, id `f8eb845a-6625-44a0-8bf6-73d3b5843f54`, region OC.
- Worker version `eebaab43-099d-453e-a9b8-624572d83c61`. Bindings live: `DB`, `ASSETS`, `MAIL_FROM`.
- Routes unchanged: `absolutcas.com/*`, `www.absolutcas.com/*`.

## Two bugs found in testing and fixed before deploy

1. **A removed address could never re-join.** The early return on `unsubscribed_at` meant a
   visitor who unsubscribed and later submitted the form again got "you're on the list" while
   being left off it. Fixed: re-signup clears `unsubscribed_at`, clears `consented_at` and issues
   a fresh token, so they get a real confirmation.
2. **The page claimed an email that was never sent.** With no provider configured the API returns
   `email_sent: false`, but the form still said "check your inbox". Fixed: the text branches on
   `email_sent`.

## Verified on the real runtime, then live

`npx wrangler dev --port 8801` (killed by PID afterwards), then the same matrix against
`https://absolutcas.com`:

| Check | Result |
|---|---|
| `GET /` `/apps/` `/emulator/` | 200, unchanged sizes |
| `GET /_headers`, `GET /nope` | 404 - the Worker does not leak repo files |
| `POST /api/waitlist` valid | 200 `{"ok":true,"email_sent":false}`, row written to real D1 |
| `POST /api/waitlist` duplicate | 200, identical body, no second row |
| `POST /api/waitlist` honeypot filled | 200, nothing stored |
| `POST /api/waitlist` bad email | 400 `bad_email` |
| `POST /api/waitlist` form-encoded | 200 (works as well as JSON) |
| `GET /api/waitlist` | 405 |
| `GET /api/unknown` | 404 |
| `POST /api/claim` | 501 `not_implemented` |
| `GET /api/confirm?t=` valid | 200, consent recorded |
| `GET /api/confirm?t=` twice | 200, idempotent |
| `GET /api/confirm?t=` stale token | 200, "not recognised", does **not** confirm |
| `GET /api/unsubscribe?t=` | 200, removal recorded |
| confirm after unsubscribe | does not resurrect the address |
| re-signup after unsubscribe | removal cleared, fresh token issued |
| em-dash scan on shipped html/js | clean |

Test rows were deleted from the production database afterwards; `SELECT COUNT(*)` is 0.

## What is left

1. **Nothing sends yet.** `BREVO_API_KEY` is unset, so `email_sent` is always `false`. Needs a
   Brevo account, sender verification for `list@absolutcas.com`, and DKIM/SPF records in
   Cloudflare DNS - without those the mail lands in spam.
2. **`BREVO_LIST_ID`** must be set in `wrangler.jsonc` or contacts never reach Brevo and
   broadcasts have nobody to reach.
3. **`src/emails.js` is a draft** and every mailed word is in it. Not reviewed by the owner.
4. **`public/index.html` still promises the $5 unconditionally**, which contradicts the email.
   Site copy left alone deliberately.
5. **`/api/claim` is a 501 stub.** Four non-code decisions block it; listed in the infra doc.
6. **Turnstile is not wired.** The honeypot is currently the only bot control and the endpoint
   is public.
7. Uncommitted. `git status` shows all of the above plus the previous sessions' files.
