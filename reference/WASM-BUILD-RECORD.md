# CHANGE RECORD - 2026-10-03 - absolutcas.com: real NumOS WASM on /emulator/

Session goal: replace the JavaScript stand-in on `/emulator/` with the real NumOS
firmware compiled to WebAssembly, booting the launcher in the Casio theme.

Source of truth for the bundle: `Absolut-CAS/firmware/AbsolutOS`, built by
`wasm/build.sh Release`, packaged by `wasm/package.mjs`. This repo only consumes
`out/wasm/dist/release/`.

## Files created

| Path | What |
|---|---|
| `public/assets/numos-loader.js` | Reads `numos-assets.json`, imports the content-addressed shell module. Never hardcodes a hashed filename. |
| `scripts/sync-numos-wasm.mjs` | Copies `out/wasm/dist/release/` into `public/emulator/numos/`; validates the 25 MiB Workers limit and asserts `pthreads: false`. |
| `public/emulator/numos/` | The generated WASM package (13 files, ~7.2 MB). Not hand-edited. |
| `WASM-BUILD-RECORD.md` | this file. |

## Files modified

| Path | Change |
|---|---|
| `public/emulator/index.html` | The stand-in device/keypad is gone. The page now hosts `<numos-emulator autostart controls="auto" persistence="disabled">`, a status line, and a page-level "Switch calculator theme" button. |
| `public/assets/site.css` | Removed the dead stand-in rules (`.calc-device`, `.fx991es-keypad`, `.k-btn`, `.screen-*`). Added `.emulator-app` / `.emulator-status`. |
| `public/assets/emulator.js` | Deleted (the JavaScript evaluator stand-in). |
| `public/_headers` | `/emulator/numos/*` immutable; `numos-assets.json` revalidate. |
| `README.md` | New layout + a "The WASM emulator" section with the sync/build flow. |

## Changed in the firmware repo this session

| Path | Change |
|---|---|
| `wasm/CMakeLists.txt` | Dropped `NUMOS_NEO_APP_SMOKE=1`; added `NUMOS_BOOT_THEME_CASIO=1`. **Fixed the preload mount**: `tests/emulator/fs@/numos` instead of `@/`. |
| `src/hal/NativeHal.cpp` | `setting_theme` initialises to `1` (Casio) under `NUMOS_BOOT_THEME_CASIO`, `0` otherwise. |
| `tests/emulator/fs/roms/Petris.gbc` | Added. MIT licence, bbbbbr's Petris (`release_1.1_gbdk2020`). The free, playable ROM for the Game Boy app demo. |
| `tests/emulator/fs/roms/README.txt` | Licence notes for both fixtures. |
| `THIRD_PARTY_NOTICES.md` | Petris + dmg-acid2 runtime-fixture entries; Walnut-CGB vendored entry. |

## The one gotcha that mattered

`NativeHal` fixes the browser LittleFS root to `/numos`, and
`FileSystem.cpp::fullPath()` prefixes every app path with it. But the link
mounted the fixture image at `/`, so files landed at `/ai/config.json` while the
AI app read `/numos/ai/config.json`. The AI replay fixture and the Game Boy ROMs
were **invisible to the apps**. The mount is now `@/numos`.

`numos-persistence.js` mounts IDBFS at `/numos`. On a fresh profile that mount
is empty and **shadows** the preloaded `/numos` tree. The demo element therefore
runs with `persistence="disabled"` (a supported explicit-MEMFS mode), which
keeps the preload visible and, as a side effect, makes every visit boot the
launcher in the Casio theme.

## The theme button

The calculator theme is switched *inside the firmware*, not with CSS. Both the
component's own "Switch theme" button and the page button call
`toggleTheme()`, which sends the reserved `ALPHA`+`AC` hotkey as four explicit
edges (`ALPHA press → AC press → AC release → ALPHA release`) through the same
`_numos_send_logical_key` ABI the on-screen keypad uses. Documented in
`sserialprintthing/theme-system/10-runtime-toggle.md` and
`docs/WASM_HOW_IT_WORKS.md` §7. A full ALPHA press+release would drop the
modifier before AC arrives, which is why the edges are explicit.

## Game Boy ROM options (licence-clear)

- **Petris** — bbbbbr, MIT. ROM committed in the upstream repo, so it is
  turnkey and redistributable. Used here.
- **Tobu Tobu Girl / Deluxe** — Tangram Games, code MIT, assets CC-BY-4.0.
  No prebuilt ROM committed; must be built with GBDK. Good second fixture if a
  platformer is wanted; the CC-BY assets need attribution.
- **dmg-acid2** — Matt Currie, MIT. Already present as the PPU accuracy fixture,
  not a game.

No commercial ROM is distributed; the rule is in
`GAMEBOY_APP_PLAN.md` §7 and `tests/emulator/fs/roms/README.txt`.

## Verified (headless Chrome 153 against `python3 -m http.server`, 2026-10-03)

| Check | Result |
|---|---|
| `numos-loader.js` imports the shell from the manifest | pass; no hashed filename hardcoded |
| manifest + `.wasm` + `.data` served | 200; `.wasm` is `application/wasm` |
| element reaches `ready` | pass |
| boot target | launcher: `app=Menu`, `ctxSlug=menu` |
| boot theme | `[THEME] active theme id=1` (Casio), screenshot shows the `1:COMP 2:STAT …` MenuList |
| preloaded fixture reachable | `[AI] load: transport=replay model=google/gemini-2.5-flash-lite key=none` — the config came from `/numos/ai/config.json` |
| AI app opens | `[APP] AiApp activa`, `ctxSlug=ai`; screenshot shows the Ask/Capture/Recent/Settings UI |
| AI replay streams end to end | `[AI] run started (image=-, transport=replay)` then `[AI] committed -> /ai/results/quadratic-roots.md`; the rendered answer is the paginated `AI 1/8 · Solving x^2 - 5x + 6 = 0` page |
| Game Boy app opens | `ctxSlug=gameboy`; `[GB] scan: 2 rom(s)` / `[GB] load: 2 rom(s) in /roms` — both preloaded ROMs visible, `Petris.gbc` first and focused |
| console/page errors | none fatal |

Screenshots (session scratch): `paadweb-emulator.png` (Casio launcher),
`paadweb-ai.png` (AI menu), `paadweb-ai-answer.png` (streamed answer),
`paadweb-gb.png` (Game Boy ROM picker).

## NOT verified

- Actually playing Petris to a frame (the picker lists it; the core was not
  stepped through a game).
- `npx wrangler deploy` (no Cloudflare credentials on this machine, as before).

## Open, for you

1. If you want persistence (settings/variables surviving reload), the preload
   has to seed IDBFS before the mount instead of using `persistence="disabled"`.
   That is a `wasm/numos-persistence.js` change and a rebuild.
2. `NUMOS_NEO_APP_SMOKE` is now off, so the Casio page-3 `NEOLG` slot prints
   "no implementada". Keeping the define would make it work; the launcher still
   boots either way.
3. `public/emulator/numos/` is committed. If you would rather not track ~7 MB,
   gitignore it and run `scripts/sync-numos-wasm.mjs` before every deploy.

---

# 2026-10-03 (later) — layout fix: aspect, single-screen fit, restart

## The screen was the wrong shape

The firmware's logical display is **320×156** (`NativeHal` SCREEN_W/H, derived
from `Config.h`; the panel is 240 rows but the fx-82 shell exposes 156). The
element hardcoded `LOGICAL_HEIGHT = 240`, so the canvas backing store (SDL sets
it to 320×156) was CSS-stretched to 240/156 = 1.54× vertically — the "compacted,
aspect off" look.

Fixed in `wasm/numos-emulator-element.js`:

- `LOGICAL_HEIGHT` is 156 (pre-boot default).
- `#fitCanvas` derives the CSS box from `canvas.width`/`canvas.height` (the real
  backing store), not a constant.
- A `MutationObserver` on the canvas width/height re-fits when SDL sets them.
- `#scheduleCanvasFit()` runs right after the launcher is ready.

Result: backing `320×156` → CSS `640×312` (integer 2×), correct aspect, crisp.

## The keypad did not fit

With controls shown the shell was **1307px** tall (10 rows × 68px keys = 793px
keypad). `wasm/numos-component.css` is now compact: 20px keys, 37px topbar,
tighter status/context/details. `paadweb/public/assets/site.css` widens the
emulator container to 1240px (so the 2× screen fits) and trims the header and
the emulator-page footer.

At 1920×1080 with the keypad visible: shell **720×679**, page `scrollHeight`
**1080** — no scroll. The SHIFT/ALPHA legends do not fit at 20px; they are
revealed on hover/focus and remain in each key's `aria-label`.

The launcher's context dimming also had to change: the `menu` context marks only
the five navigation keys `primary`, so every other key was `disabled` and the old
rule forced it to a dark background at 34% opacity — legible at 68px, empty at
20px. Disabled keys now keep their own category surface at 62% opacity, so the
keypad reads as a keypad instead of half-blank.

## Restart

`restart()` now tries to start even if `shutdown()` reports an error, so a flush
failure can no longer leave the element stuck. Verified in headless Chrome:
initial boot, two consecutive restarts, and a restart from inside the AI app all
reach `ready`, with no console errors. (The bug was **not reproducible** on this
machine; if it persists, capture the console output when it fails.)

## New tooling

- `paadweb/scripts/check-emulator.mjs` — headless smoke check: asserts the
  launcher, Casio theme, and 320×156 aspect; `RESTART=1` also exercises the
  restart path; exits non-zero on failure.
- `sserialprintthing/acc-numos-wasm-ops.md` — build / check / deploy runbook.

## Verified after the change

`node scripts/check-emulator.mjs` with `RESTART=1`: `ok: true`, `app: Menu`,
`ctxSlug: menu`, `theme id=1`, backing `[320,156]`, CSS `640×312`, `docH 1080`,
no errors.
