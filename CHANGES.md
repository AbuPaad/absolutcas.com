# CHANGE RECORD - 2026-10-03 - absolutcas.com: GitHub Pages -> Cloudflare Workers Static Assets

Session goal: switch the site's hosting to Cloudflare.
Status: **prepared and verified locally. Not deployed. Blocked on Cloudflare auth on this machine.**

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
