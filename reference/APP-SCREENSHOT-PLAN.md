# NumOS website: app screenshot plan

Status: draft plan, unsaved decisions marked `[[ ]]`.
Supersedes the interactive-WASM-emulator section of the site: the browser demo is
being dropped (the WASM bundle is clunky), and the right panel of the split-panel
layout will carry still captures (and a few short MP4s) of the apps instead.

Basis: read-only source recon of the firmware repo
(`~/musings/Absolut-CAS/firmware/AbsolutOS`), 2026-10-04, five OpenCode agents on a
free model. Raw reports: `/home/fih/.hermes/cache/scratch/numos-apprecon/report-g{1..5}.md`
(the scratch dir is pruned after 24h, so the claims that matter are restated below).

## Scope split (read this first)

- **This document is a text plan.** The audit here is of *copy and capability
  claims*: what each app can honestly be shown doing, what the on-screen strings
  are, and which claims are unsafe to print.
- **Capturing the images is not the job here.** Someone (Paadshi, or a later
  pass) produces the `.numos` scripts and the PNG/MP4 files. This plan only
  specifies what each shot must contain.
- Every screenshot must come from a reproducible `.numos` script, so the site
  rule "any sample output on the page must be verifiably correct" still holds.

## The table

Format: app | what each screenshot will have. Hard cap: 3 screenshots per app.

| App | Screenshot 1 | Screenshot 2 | Screenshot 3 |
|---|---|---|---|
| Calculation | `1/3+1/6` entered, result as a true stacked fraction `1/2` with vinculum | Same expression cycled by S⇔D to the 200-digit Extended decimal, scrolled mid-number | F2 step viewer for `2+3*4`, showing "2 + 12" then "14" as rendered 2D steps (needs `setting_edu_steps` ON) |
| Grapher | Four slots live at once: `y=x^2-4`, `y=2x+3`, implicit `x^2+y^2=9`, shaded inequality `y<sin(x)` | Trace cursor walking the implicit circle, x/y pill visible, camera locked to cursor | Calculate → Intersection, purple POI markers where the line cuts the parabola |
| Equations | `x^2-5x+6=0` solved, `x1=2, x2=3` as two rendered rows | STEPS screen: "Factor: (x-2)(x-3)=0" with the orange highlight on the factor | 2x2 system `2x+3y=7`, `x-y=1` giving x=2, y=1 |
| Calculus | d/dx of `sin(x)/x` giving `(x·cos x - sin x)/x²` with a real fraction bar | ∫dx of `x^2*sin(x)` giving `-x²cos x + 2x sin x + 2cos x + C` | `e^(-x^2)` returning "Unevaluated Giac Integral" showing `∫e^(-x²)dx` |
| Integral | `2*x*cos(x^2)` giving `sin(x²)+C` with u-substitution steps | `x*e^x` giving `e^x(x-1)+C` with by-parts steps | `sin(x)/x` showing the unevaluated state |
| Statistics | Data tab: 6-row table, one cell in blue focus, hint bar "Nav ENTER Edit DEL Clear AC New row" | Stats tab: all 7 readouts populated (Mean, Median, Std Dev, Min, Max, Sum, n) | Graph tab: frequency histogram |
| Probability | Standard normal μ=0 σ=1 x=1.0, shaded left tail, "PDF: 0.241971 / P(X<x): 0.841345" | Shifted wide curve μ=50 σ=15 x=65 (IQ-scale, relatable) | Mid-edit state with the yellow edit field on the σ row |
| Regression | Equation tab: quadratic fit with coefficients and R² | Graph tab: scatter plus the fitted purple curve | Same graph after SHIFT toggles to linear (blue line), showing the model switch |
| Sequences | Define tab: `u(n)=2*n^2+3`, `v(n)=5*n-1` | Table tab, 20 computed terms | (none - see cut list) |
| Python | Editor with the autocomplete popup open over `pr` | Console after running hello.py, printing 0..4 and "Hello NumOS!" | An f-string example in the editor |
| NeoLang | `diff(x^3+2*x^2, x)` giving `3*x^2 + 4*x` in the console | `solve([x+y=3, x-y=1],[x,y])` giving x=2, y=1 | Full-screen `plot(sin(x)/x, -10, 10)` graphics overlay |
| Notes | A rendered markdown page (heading, bullet list, code fence) | The 20px large-text view | (none) |
| Tutor | `2x+6=0` giving three steps with the affected term highlighted blue, final in orange | (none) | (none) |
| Settings | Main list, Angle mode = Degrees | Wi-Fi sub-screen with the AP portal strip (SSID, http://192.168.4.1, station count) | Theme row toggled to Casio |
| Chemistry | Table with the gold cursor on W(74), detail panel showing `[Xe] 4f14 5d4 6s2` | Deep Dive on Hg, all 13 rows including the Fun Fact line | Balancer: `Fe+O2=Fe2O3` giving `4Fe + 3O2 = 2Fe2O3` in exact rationals |
| Bridge | Edit mode mid-build: wood/steel/cable beams, toolbar highlighted | Sim: truck crossing, beams graded green→red by stress, deck visibly sagging | Failure frame: a wood beam snapped dim-grey, truck dropping through |
| Circuit | Edit mode: mixed analog+digital (VCC→res→BJT→LED, coin cell→AND→7-seg, MCU) | Sim: voltage heatmap on, dual-trace scope, current arrows, multimeter reading | MCU Lua IDE open on `setPin(0, math.sin(t)*3.3)` |
| OpticsLab | Two-lens bench, 7 gold rays converging onto the screen, EFL/BFL/M telemetry | Total internal reflection: red TIR segments with X glyphs inside the glass | Galilean (afocal): rays exit parallel, telemetry reads EFL:N/A |
| Fluid 2D | Wind-tunnel preset in the VELOCITY palette, cyan→magenta flow wrapping the obstacle | Convection cell in THERMAL palette, Rayleigh-Benard plumes | MIXED palette, red and blue ink streams colliding into purple |
| ParticleLab | Chemical volcano: lava + water giving steam and stone, with black-body glow | Electronics demo: wire → heater at 2000 C, cooler, C4 detonation, thermometer readout | Plant growth, then burning down to coal |
| Neural Lab | XOR converged: clean diagonal decision boundary, pulsing network graph, green 100% accuracy gauge | Spiral separation at ~2000 epochs, log-scale loss curve falling | Topology surgery mid-training: F1 adds a neuron, loss spikes then resumes |
| Fractals | Mandelbrot deep-zoomed into Seahorse Valley, filaments sharp | The 2x2 atlas launcher with its four 64x64 previews | Mandelbulb 3D cross-section |
| Game Boy | ROM picker in the Casio theme, digit-launch hint visible | A CGB title screen at correct colour | A DMG game mid-play in 4-shade green |
| AI | Multi-page markdown answer to the redox prompt, page 1 (oxidation-state table) | The same answer's page 5 (final balanced equation) | Model picker with provider icons |

Notes on the motion rows (Bridge, Fluid 2D, ParticleLab, Fractals, Neural Lab, and
Circuit's sim view, Game Boy's play view): a still is weak for all of these. Ship a
3-second muted looping MP4 in the same Mac-window chrome
(`<video autoplay muted loop playsinline>` with an H.264 MP4 fallback) rather than a PNG.

## Page structure (right scroll container only)

The live layout is the split panel: fixed 40vw left panel (nav + hero + ghost board
image), a separate 60vw scroll container on the right, fixed 34px ticker. All
screenshots live in the right container; the left panel never scrolls.

1. Hero plus positioning copy. No screenshot. ("It's your Casio. It does more now.")
2. App index: the fx-82 keypad-grid seal doubles as a table of contents. Each cell
   is an app, tinted with its real launcher colour (Calculation 0xFF8000 orange,
   Grapher 0x50B849 green, and so on from `MainMenu::APPS[]`). Click a cell and the
   right panel scrolls to that app's plate.
3. The app plates, in launcher order, tiered (below).
4. AI plate last, framed as one arm and not the pitch.
5. Waitlist System 7 dialog, then the CTA to CrowdSupply.

Anatomy of one plate:

```
[APP 07]                     <- eyebrow: bracketed ASCII label plus slot id badge
Sequences                    <- display face, positive tracking (~+0.04em, never negative)
generate a rule, watch it     <- one-line monospace subtitle
[ 1 to 3 Mac-window frames ]  <- 1px black border, 0 radius, pinstripe title bar
captions (monospace, micro)   <- "entered X -> shows Y" per shot
capability strip              <- 3 to 5 hairline-separated bullets in monospace micro type
----------------------------- hairline to the next plate
```

Shot layout per plate:

- 1 shot: full width, height capped `min(44vh, 400px)`, `object-fit: contain`.
- 2 shots: two columns.
- 3 shots: three columns, dividers via `grid; gap:1px` on a line-coloured parent,
  no borders on the children.
- The device is 320x240, so text at 3-up is tiny. Rule: the legible money shot goes
  full-width; the 3-up row is only for shots whose subject reads at thumbnail size.

## Tiering (22 launcher apps; up to 3 shots each would be ~66 images)

- Tier A, full plate, up to 3 shots: Circuit, Grapher, Chemistry, NeoLang,
  Calculation, Neural Lab.
- Tier B, 1 to 2 shots, compact: the rest, or collapsed into an "and N more"
  thumbnail strip that expands on click.
- Target: roughly 35 to 45 assets, lazy-loaded below the fold (`loading="lazy"`).

## Cut list and copy hazards (the part that must not be ignored)

- **Sequences** - parser only understands `n`, `n^2`, `a*n+b` and a constant; `2^n`
  silently returns 2. Any richer sequence on screen would be a fabrication. Cut it,
  or demote to a small "also included" thumbnail with no claim attached.
- **Python** - a mock interpreter, not MicroPython: no functions, classes, lists or
  real imports. Never write "runs Python". Safe wording: "a script editor".
- **Notes** - not in the launcher, and locked to one hardcoded `/notes/demo.md`. It
  is an mdrender demo, not a user feature. Do not present it as a Notes app.
- **Tutor** - dead code, never constructed in `SystemApp`. Fold the step-by-step
  story into the Equations plate instead of giving it its own.
- **Game Boy** - only original homebrew ROMs may appear (Nintendo/third-party ROMs
  cannot be bundled). No audio and no save states; do not imply either.
- **AI** - input is keypad characters only, no prose typing, and the transport
  backend is not in this repo. Do not show or imply a free-text prompt.

## Corrections applied to the recon

- The g3 agent claimed NeoLang is not in the launcher. Wrong: `SystemApp.cpp:1349`
  maps launcher id 18 to `Mode::APP_NEO_LANGUAGE` and the app is constructed at
  `SystemApp.cpp:186`. NeoLang is launchable and is the strongest maths-wow app.
- The g3 agent was right that Notes and Tutor are not launchable: neither is
  constructed in `SystemApp`.
- Circuit's MNA solver and Lua VM, and NeoLang's `diff`/`solve`, were spot-checked
  in source and are real, not stubs.
- The reports' on-screen pixel numbers assume the old 180/240 canvas. The fitted
  canvas is 320x156 at offsetY +54, which changes the aspect ratio of every
  capture. Capability claims are unaffected; capture staging is.

## Unverified numbers (must be regenerated, not typeset)

- Statistics' seven readout values and Regression's R² in the recon are the
  agent's own arithmetic, not engine output. Regenerate them from the emulator
  before any of them appears in copy.

## Open decisions

- `[[ whether Sequences / Notes / Tutor appear at all ]]` — resolved in the skeleton: all 22
  launcher apps get a plate, Python and Sequences carry an explicit no-claim block, and Notes and
  Tutor are absent entirely (they are not in the launcher).
- `[[ how many MP4s vs stills, and total asset budget ]]` — still open. Seven plates are flagged
  motion on the page: Game Boy, Circuit, Bridge, Neural Lab, Fluid 2D, ParticleLab, Fractals.
- `[[ whether NeoLang is re-launched into the main menu grouping ]]` — not needed; it is id 18 and
  launchable, so it has a plate at position 8.

## Built (2026-10-04)

The skeleton is live in the working tree at `public/apps/index.html`, verified on `wrangler dev`:
22 plates, 22 TOC links, 64 labelled shot placeholders (path in `data-img` and printed in-frame),
20 capability strips, 2 no-claim blocks. Page structure follows the answers above: its own route,
emulator demoted, curated order. The WASM demo keeps its page at `/emulator/` and is linked from
the nav and the gallery footer, but it is no longer the primary call to action.

Plate anatomy, as built (the earlier sketch in this file is superseded on two points):

```
[APP 01]  Grapher                        [App index v]  <- next 5 apps + "See all 22 apps"
Plot several relations at once...
[ 1/3 ] [ 2/3 ] [ 3/3 ]                     <- frames carry a counter, not the app name
captions
capability strip
[ Join the Launch Waitlist ]                <- CTA on every plate
----------------------------- hairline to the next plate
```

Two deliberate deviations from the original sketch: the app name is **not** repeated inside each
shot frame (it read as the same word four times per plate and flattened the page), and every plate
ends with a waitlist button rather than only the page-level one.

