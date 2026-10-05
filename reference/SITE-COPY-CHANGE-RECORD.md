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

---

# CHANGE RECORD — 2026-10-05 — SITE-COPY.md applied to the HTML

Goal: take the updated `SITE-COPY.md` (inline `[delete]` / `[DELETE]` / `[CUT…]` marks) and apply it
to the live pages. Direction of truth this session is the opposite of 2026-10-04: the copy file
drove the HTML.

## Files read

| Path | What it gave |
|---|---|
| `SITE-COPY.md` | every slot string plus the delete marks |
| `public/index.html`, `public/apps/index.html`, `public/emulator/index.html`, `public/404.html` | current rendered strings |
| `public/assets/site.css` | confirmed the 404 classes were absent; located the orphan selectors |
| `public/assets/site.js` | waitlist success string now set client-side |

## Files written

| Path | What changed |
|---|---|
| `public/index.html` | L0.1/L0.2 title+desc (+ og aligned); hero pill/h1/subtitle deleted; telemetry label + 4 green items deleted; `$5 API Promo Credit` and its desc deleted; waitlist sub deleted; success string → `You're on the list!`; apps banner cut to the button only; concept h2/paras rewritten (Numos → El-EnderJ/NeoCalculator); hardware intro deleted; spec row 2 → BACK SHELL; DISPLAY copy updated; new `// HW Features` sub-head splits the spec list; software desc updated; footer → `Open Hardware Project`; theme label un-hardcoded |
| `public/apps/index.html` | meta description → `Every app on the board`; `A1.7` intro deleted; **all 32 `shot-cap` figcaptions cut**; theme label un-hardcoded |
| `public/emulator/index.html` | subtitle deleted; `What is running` h2 deleted; `AI, offline` and `Themes` info-rows deleted; theme label un-hardcoded |
| `public/404.html` | **restyled.** Dead classes (`err-wrap`, `err-body`, `err-code`, `r-footer`, `inverse-btn`, `cursor-default`) dropped; rebuilt on `#nav` / `.section` / `.site-footer`; ticker kept |
| `public/assets/site.css` | added `.spec-subhead`, `.err-actions`, `#ticker` / `.ticker-track`; removed 18 selectors orphaned by the cuts |
| `public/assets/site.js` | waitlist success message collapsed to `You're on the list!` |
| `reference/SITE-COPY-CHANGE-RECORD.md` | this entry |

## Decisions taken (clarified with the author)

1. Hero (L1.5/L1.6/L1.7): all three deleted; the hero is the two buttons over the pale ground.
2. Apps banner (L1.23–L1.27): tag, h2, paragraph and note deleted; only `Browse the Apps →` remains.
3. `[CUT EVERY CAPS/TAG THING]` → read as "cut the captions under every app screenshot": all 32
   `.shot-cap` figcaptions removed. The `APP nn` eyebrows and `//` section labels stay.
4. `$5` promo (L1.14/L1.15): amount and desc deleted; the `EARLY BACKER BONUS` badge stays.
5. `new head : // FEATURES` → a new `// HW Features` sub-head, placed where the mark sat: between
   the DISPLAY row and the POWER row. The spec list is now two `<ul>`s around it.

## Judgement calls, flagged for review

- **Typos in the copy were corrected on application**: `capabilies`→`capabilities`, `cancas`→`canvas`,
  `indetical`→`identical`. Nothing else was reworded.
- **L1.36 (`Back Shell` row) carried no h3.** Rendered as badge `BACK SHELL` / h3 `Back Shell` /
  p `A back shell to accommodate the new internals.` — the h3 is a guess.
- **L1.43's `(AI AGENT SKILLS COMING SOON)`** was not applied. Unclear whether it is a note-to-self
  or copy to render. Left as-is.
- **L1.38's `[delete]8** row 4`** was treated as a stray mark; the POWER row was kept.
- **og:title / og:description** are not slots in SITE-COPY.md but held the deleted hero line.
  Aligned to L0.1 / L0.2.
- Removing `Check your inbox to confirm your address` from the success message drops the only
  on-page mention of the double opt-in mail.

## Still open (not in scope this session)

- `/emulator/` nav `Features` → `/#features` is still a dead anchor (flagged in the copy, no instruction).
- 404 body says the board is at V2 while its ticker says V1 — carried over untouched.
- No `og:image` / `twitter:card` on any page.
- Orphaned images `assets/img/fx82.jpg` and `assets/img/plate-ink-paper.jpg` still deploy.

## Deployed (2026-10-05)

Committed `c248dab`, pushed to `origin/main`, then `npx wrangler deploy` from the repo root. Wrangler
reported 6 new/modified assets uploaded (54 unchanged) `[404.html, index.html, apps/index.html,
emulator/index.html, assets/site.css, assets/site.js]` — the same six files this record lists, with the
rebuilt NumOS WASM bundle going along in the same commit because `numos-assets.json` now points at the
new content hashes. Version ID `aa1e3020-9c93-44fe-8c57-9ec4055065b8`; both routes re-attached.

Verified against the live origin after the edge settled (a first pass read stale bytes for `/apps/` and
the 404 — Cloudflare asset propagation lag, not a failed upload; a cache-busted fetch already showed
the new content):

| URL | Result |
|---|---|
| `/` | 200, new title, **0 `<h1>`** (hero cut), no `$5`, `// HW Features` present |
| `/apps/` | 200, 39,612 B, **0 figcaptions** (was 32) |
| `/emulator/` | 200, 4,733 B, no subtitle |
| unknown path | 404, no `err-wrap`, serves the restyled page (nav/section/footer + ticker) |
