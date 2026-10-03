# CHANGE RECORD - 2026-10-03 - absolutcas.com v2 site built from SITE-COPY-v2.md

Session goal: turn the filled copy file into the actual site. The landing page is no longer a
mockup; `public/index.html` is the v2 layout, and `/emulator/` is its own page.

Source of truth: `~/musings/absolutcas-design/v2-mbd/SITE-COPY-v2.md` (filled this session with
`fill-copy.py`). Every slot id from that file is present in the HTML as a comment, so a string can
be traced back to its slot.

Status: **built and verified locally in a real browser. Committed to main. NOT deployed** -
wrangler has no credentials on this machine, `deploy --dry-run` passes, `deploy` needs the login.

Commit: `ac54e2d` (28 files, +1880 / -831).

## Files created

| Path | What |
|---|---|
| `public/assets/site.css` | tokens, split layout, all sections, both themes, responsive, reduced-motion |
| `public/assets/site.js` | theme toggle + persistence, right-panel scroll nav, block cursor, ticker duplication, reveal observer, waitlist form, devlog fetch |
| `public/assets/emulator.js` | keypad + screen stand-in, ported from the deleted v1 `mockup/demo.html`; `?app=` handling, all EM.9 runtime strings |
| `public/emulator/index.html` | `/emulator/` - the emulator page (PART 4) |
| `public/assets/fonts/*.woff2` (10 files) | Geist Mono 300/400/500/700 + Instrument Serif, latin + latin-ext, self-hosted. Both OFL. No CDN |
| `public/assets/img/plate-ink-paper.jpg` | the S2 Gutenberg plate, 840x596, 114 KB |
| `public/assets/img/fx82.jpg` | donor photo, moved out of the deleted mockup. Currently unreferenced |
| `BUILD-RECORD-v2.md` | this file |

## Files modified

| Path | Change |
|---|---|
| `public/index.html` | was the `Hello, World!` placeholder. Now the v2 landing page: fixed left panel (nav, hero, held-empty showreel slot, 2-line overview), scrolling right panel (capture band, S1, S2 + plate, S3, interlude, S4 index + devlog), 34px ticker, footer |
| `public/404.html` | rebuilt on the shared stylesheet: same nav, grain, ticker, a real link back, no dead end |
| `public/_headers` | dropped the `/mockup/assets/*` rule; added long-cache for `/assets/fonts/*` (immutable) and `/assets/img/*`, revalidate for `/assets/*.css` and `/assets/*.js` |
| `README.md` | layout tree rewritten for `assets/` + `emulator/`; notes that the v1 landing was deleted and where the copy file lives |

## Files deleted

| Path | Why |
|---|---|
| `public/mockup/index.html`, `public/mockup/demo.html` | v1 landing page and its stand-in. Superseded; PART 5 item 7 answer was "this is gona be the actual thing so cut the v1". The stand-in's logic lives on in `assets/emulator.js` |

`public/mockup/assets/fx82.jpg` was moved to `public/assets/img/fx82.jpg`, not deleted.

## Decisions taken while building (each one reversible)

1. **One shared stylesheet, not three inline pages.** `/`, `/emulator/` and `/404` share tokens,
   the ticker and the nav. `body.layout-split` owns the viewport (never scrolls); `layout-page`
   pages scroll normally. Without that split the emulator page could not scroll at all.
2. **`--hazard` deleted.** Your PART 5 item 5 answer was "display works so delete this thing", so
   there is no red anywhere. The DOA line in the ticker is gone with it. The emulator's flag pill
   (EM.1) is brass-bordered instead of red.
3. **Glyphs are the LCD block `▮` with ids** (`#glyph-1..3`, `#ticker-sep`) because H.8 asked for
   a reachable default. Your PART 5 item 4 answer was the farad symbol, so those four spans are
   where you change the character.
4. **The waitlist form does not pretend.** CAP.10 is still "ill lyk", so the form validates the
   address and then says, in its own line: "Not wired to a list yet, so nothing was sent." CAP.11
   and CAP.12 are in the markup for the day it is wired. To wire it: put `data-endpoint="..."` on
   `#waitlist-form` and delete the not-wired branch in `site.js`.
5. **Apps cell (S3.7) lists the real app set** read off the firmware tree, 26 entries, each
   linking to `/emulator/?app=<slug>`. The emulator shows the app name in front with a back
   button, and says plainly that the stand-in does not run it yet. Opening the page is real;
   running the app is not.
6. **Devlog (S4.5) is a live pull, not a webhook.** The page asks the public GitHub API on load
   for the last 6 commits and the PR list of `AbuPaad/Absolut-CAS`. A webhook needs a backend;
   this needs nothing. Rate limit is 60/hour per IP, unauthenticated.
7. **Feature cells are not square.** The copy file specified the reference's `aspect-ratio: 1/1`
   grid; with text-only cells that would be ~576px tall per cell. They are `min-height: 150px`
   with the same hairline geometry. The one deliberate deviation from PART 0.
8. **Strings I wrote** (your answers there were instructions, not copy - overrule any of them):
   - **S1.4** software paragraph - fork lineage, real OS, apps, inherited CAS.
   - **S2.2** why paragraph - built from your note: the $300 regulatory moat, AI calc mods as exam
     aids, and the plate's argument. Slurs dropped; the claim is yours.
   - **S2.8** caption - your sentence, cleaned for a caption line.
   - **H.11** GIF alt text ("ye js alt text") - described as the device with its LCD running.
   - **EM.3** emulator intro ("ill put smth in") - the stand-in vs the WASM build, honestly.
   - **S4.5** closing line - newsletter, emulator, devlog, no account.
   - **S3.8** keeps your abbreviation **WA** because nothing in the AI docs on disk says what it
     stands for. Say the word and I will expand it.
9. **H.4 is `aljabr`** in Latin letters at 13% opacity, per your answer. The Arabic script version
   is a one-line change if you want it.

## Copy slot ids are on the page, not just in comments

Every element that carries a string from the copy file has `data-slot="<ID>"` in the markup, and
CSS renders that id as a small brass badge beside the string. So the live page tells you which
slot you are looking at. `/emulator/` does the same with the `EM.*` ids.

- 65 labelled elements on the landing page, 9 on `/emulator/`, ids exactly matching the copy file.
- Only `T.2`, `FT.1` and `FT.2` are absent, because your PART 5 answers deleted those strings.
- `.slot-only` is an empty marker span for the two cases where an element cannot render its own
  badge: the email `input` (CAP.5, inputs ignore pseudo-elements) and the three ghost elements
  (`CAP.1`, `H.4`, `IL.1`, whose 5-13% opacity would swallow the badge). `EM.9` sits outside the
  status div on purpose: the stand-in rewrites that div's text on every keypress.
- The nav gained an `ids` button. It toggles the badges for the whole page and the choice persists
  in localStorage, so you can screenshot the page with them off without editing anything.
- `P5.*` flags are not on the page; they are decisions in the copy file, not strings.

## Verified (headless Chromium against `wrangler dev` on 127.0.0.1:8787)

| Check | Result |
|---|---|
| panel geometry at 1440x900 | left 576px (40vw), right 864px (60vw), ticker 34px, left panel scrollHeight == clientHeight (never scrolls) |
| right panel scrolls | 4055px of content, nav link click moves it to 1800px |
| fonts | Geist Mono 300/400/700 + Instrument Serif all `status: loaded`, self-hosted |
| sections | all `min-height: 100vh` (900/900/900/920), interlude 198px (22vh) |
| plate | displays at 420px, 840px export, `naturalWidth` 840 |
| theme toggle | flips `data-theme`, label switches, choice stored in localStorage, no flash |
| waitlist form | bad address -> "does not look complete"; good address -> "not wired, nothing was sent" |
| devlog | 6 real commits pulled live (newest "cleaned up repo" 2026-09-26); PR list empty and says so |
| emulator | 42 keys in a 6-column grid, `7*8` -> `56`, `SHIFT` -> "Not built in the stand-in: SHIFT." |
| mobile 390x844 | panels stack full width, one-column grids, page scrolls, cursor hidden, hero 46.8px |
| console | no page errors, no console errors or warnings on any page |
| routes | `/` 200, `/emulator/` 200, `/assets/*` 200, unknown path 404 with the new page |
| `wrangler deploy --dry-run` | 25 files read from `public/`, passes |

Screenshots from the pass: `~/.hermes/cache/scratch/l1-light-top.png`, `l2-why.png`,
`l2-features.png`, `l2-index.png`, `e1-emulator.png`, `p1-404.png`, `shot-mobile.png`.

## Open, for you

1. `wrangler deploy` - no Cloudflare credentials on this machine, so nothing shipped. Same blocker
   the Cloudflare session recorded.
2. The showreel GIF. The slot is held empty on purpose; the left panel is capped so it cannot
   overflow when the file lands.
3. The hero's board render slot is still empty (per the copy file), so the left panel shows no
   product image at all yet.
4. H.5's quote is live (Cantor) but PART 5 item 2 said you would send the line you actually want.
5. CAP.3's $5 offer is on the page as written, and it is still an unenforceable promise until the
   terms from PART 5 item 3 are written down somewhere a customer can read.
