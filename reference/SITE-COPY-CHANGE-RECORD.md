# CHANGE RECORD — 2026-10-04 — SITE-COPY.md rebuilt against the live site

Goal: make `SITE-COPY.md` match the content that is actually in `public/`, so it can be cited by
slot ID in prompts. The previous file documented a `public/mockup/` layout (`index.html`,
`demo.html`, `assets/fx82.jpg`) that no longer exists on disk.

## Files read (source of truth for the rewrite)

| Path | What it gave |
|---|---|
| `public/index.html` | landing page, all strings |
| `public/apps/index.html` | 11 plates, index order, coming-soon list |
| `public/emulator/index.html` | emulator page, all strings |
| `public/404.html` | 404 page, all strings |
| `public/assets/site.css` | responsive breakpoints, tokens, proof that 404 classes are absent |
| `public/assets/site.js` | waitlist writes to localStorage only; theme labels rewritten on load |
| `public/_headers` | cache policy, COOP/COEP deliberately off |
| `wrangler.jsonc` | asset dir, 404-page handling, routes commented out |
| `CHANGES.md` | hosting history (Cloudflare, prior mockup move) |
| `public/emulator/numos/*` (dir listing) | confirmed the WASM bundle is built and staged |
| `public/assets/img/` (dir listing) | confirmed which app captures exist and which do not |

## Files written

| Path | What changed |
|---|---|
| `~/musings/paadweb/SITE-COPY.md` | **full rewrite.** Slot IDs reissued per page: `L…` landing, `A…` apps, `E…` emulator, `N…` 404. Old `L1.x` numbering no longer lines up and is superseded. |
| `~/musings/paadweb/SITE-COPY-CHANGE-RECORD.md` | this file |

## Files NOT touched

No HTML, CSS, JS or config was edited. This session only reconciled the copy ledger.

## Findings recorded in the new file (all verified by reading the sources)

1. The waitlist form has no backend — `site.js` stores to `localStorage['acas-waitlist']` and shows
   a success message claiming an email will be sent. `Double opt-in.` describes a non-existent mechanism.
2. The `$5 / first 200 people` promo has no mechanism, expiry or definition.
3. `404.html` uses seven CSS classes/ids that do not exist in `site.css` and renders unstyled.
4. `/emulator/` nav has a dead anchor: `Features` → `/#features`, no such id exists.
5. Nav label for `#specs` differs across pages (`Hardware` vs `Specs`).
6. 5 of 32 app frames are text placeholders with no webp on disk (`equations-2`,
   `regression-1/2/3`, `settings-2`).
7. 404 body says "board is at V2" while its own ticker says "V1 board".
8. Two orphaned images still deploy: `assets/img/fx82.jpg` (2.87 MB), `assets/img/plate-ink-paper.jpg`.
9. No `og:image` / `twitter:card` on any page.

## Verified as already correct

- Display geometry: `320×240` glass / `320×156` fitted canvas, consistent across L1.37, L1.25, L1.47, A1.7.
- The WASM bundle is real: `numos-emulator.89750ec19dae.wasm` (6.5 MB) plus `.data` (72 KB) and the
  content-addressed JS/CSS are staged in `public/emulator/numos/`.
- App count is consistent: `22 Apps` tag + "eleven + eleven" prose + 11 plates + 11 coming-soon rows.
- Favicon is present on every page (inline SVG data URI).
