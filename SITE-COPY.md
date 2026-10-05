# SITE COPY — absolutcas.com

Source of truth for every word on the site, plus the graphic or layout that sits with it.
Rewritten 2026-10-04 to match the files that are actually in `public/` right now.

The previous version of this file described a `public/mockup/` layout that no longer exists.
Everything below was read out of the live HTML, not from memory.

---

## How to use this file

**Slot IDs.** One per string. Prefix says which page it is on:

- `L…` landing page (`public/index.html`, served at `/`)
- `A…` app gallery (`public/apps/index.html`, `/apps/`)
- `E…` emulator (`public/emulator/index.html`, `/emulator/`)
- `N…` not-found (`public/404.html`)

To change one string, say the ID. IDs are stable; line numbers are not.

**[ART] lines.** What graphic or layout sits in that slot, and how CSS treats it.

**[MISSING] / [PLACEHOLDER].** A graphic that is not on disk. Nothing renders there yet.

**EDIT: lines.** Add one under a slot and it is treated as a direct instruction for that slot.

I do not rewrite your copy unprompted. Anything that reads badly is flagged in PART 5, not changed.

---

## PART 0 — What is on disk

| Path | Role | Served at |
|---|---|---|
| `public/index.html` | **the live landing page** | `/` |
| `public/apps/index.html` | the app gallery, 11 capturable apps + 11 coming-soon | `/apps/` |
| `public/emulator/index.html` | the WebAssembly emulator | `/emulator/` |
| `public/404.html` | not-found page | unknown paths |
| `public/assets/site.css` | all site styling (453 lines) | — |
| `public/assets/site.js` | theme toggle, smooth anchors, waitlist form | — |
| `public/assets/numos-loader.js` | reads the content-addressed manifest and loads the emulator | — |
| `public/assets/fonts/` | local faces | — |
| `public/assets/img/apps/*.webp` | 27 device captures | — |
| `public/emulator/numos/*` | the staged WASM bundle (6.9 MB) | — |
| `public/_headers` | cache + security headers | config |
| `wrangler.jsonc` | Cloudflare Worker + static assets config | config |

The old `public/mockup/` directory and its `demo.html` are **gone**. Do not reference them.

### Asset inventory

| Asset | Details |
|---|---|
| `public/emulator/numos/numos-emulator.89750ec19dae.wasm` | **6.5 MB**, the real firmware compiled to WebAssembly. The bundle is built and staged, not a stub. |
| `public/emulator/numos/numos-emulator.fa9f8064c46a.data` | 72 KB preloaded MEMFS image (the AI replay fixture and the Game Boy ROMs live here) |
| `public/assets/img/apps/*.webp` | 27 files, 3.0 MB total. **Three shots are missing** and render as text placeholders (see A-section notes) |
| `public/assets/img/fx82.jpg` | 2.87 MB. **Orphaned — no page references it.** The old hero photo; the current hero is text-only. |
| `public/assets/img/plate-ink-paper.jpg` | 116 KB. **Orphaned — no page references it.** |
| favicon | present on every page as an inline SVG data URI (sage field + ink bar). Not a file. |
| **og:image / twitter:card** | **MISSING** — no page sets either. Links shared to chat/social render with no card. |
| **board render or photo** | **MISSING** by design (holding to software stills + donor front) |

---

## PART 1 — Landing page

File: `public/index.html`

### Head

- **L0.1** title: `absolut-CAS: Your Casio does more now`
- **L0.2** meta description: `A drop-in upgrade for casio scientific calculators: Wi-Fi, CAS math, graphing, Game Boy core, and AI tools in your original shell.`

### Nav

[ART: none. Sticky bar, brand left, 6 items right. At 640px the bar stacks and the links wrap; there is no hidden menu.]

- **L1.1** brand: `absolut-CAS` (bold) + `Open Hardware Project` (small)
- **L1.2** links: `Overview` `Hardware` `Capabilities` `Apps` `Emulator`
- **L1.3** cta: `See the apps →` → `/apps/`
- **L1.4** theme button. Hardcoded `Light` in the HTML; `site.js` overwrites it to `Light Mode` (dark theme) or `Dark Mode` (light theme) on load. **The hardcoded label is dead copy** — it never survives first paint.

### Hero

[ART: none. The old right-column fx82 photo is gone. Text-only, centred, on the pale ground.]

- **L1.5** donor pill: `Donor Shell: Casio fx-82 & fx-991 Family` [delete]
- **L1.6** h1: `It's your Casio.` / `It does more now.` (second line in brass italic) [delete]
- **L1.7** [delete] subtitle: `A drop-in, no-solder PCB & IPS display replacement for the Casio calculator you already own. Keep the original shell and keypad muscle memory, and upgrade the computer inside.`
- **L1.8** button 1 (solid): `Join the Launch Waitlist` → `#waitlist`
- **L1.9** button 2: `See the Apps →` → `/apps/`

### Telemetry strip

[ART: none. Full-width band. Green ticks, one brass star pulled right.]

- **L1.10** [delete] label: `Status Log:`
- **L1.11**[delete] green items: `✓ Keypad Matrix` `✓ Giac CAS Engine` `✓ Game Boy Core` `✓ Wi-Fi & AI Bridge`
- **L1.12** brass item: `★ 100% Free & Open Source`

### Waitlist (this is the primary action, and it sits ABOVE the concept section)

[ART: brass promo banner above the form. Form = one email field (16px so iOS does not zoom) + solid button + helper line.]

- **L1.13** promo badge: `EARLY BACKER BONUS`
- **L1.14** promo amount: `$5 API Promo Credit` [delete]
[DELEYE]- **L1.15** promo desc: `Get $5 openrouter credits if you're on the waitlist buy a calc.`
- **L1.16** h2: `Get the Launch Notification`
[DELETE]- **L1.17** sub: `No spam, no marketing noise.`
- **L1.18** placeholder: `you@example.com`
- **L1.19** button: `Join Waitlist`
[DELETE]- **L1.20** helper: `Double opt-in.`
- **L1.21** success message (hidden until submit): `You're on the list!`
- **L1.22** error message: `Please enter a valid email address.`

### Apps banner

[ART: none. Accent tag, heading, paragraph, button, one note line.]

- **L1.23** tag: `22 Apps`  [delete]
- **L1.24** h2: `See what it actually runs` [DELETE]
[DELETE]- **L1.25** paragraph: `statistics, a Game Boy core and more. Eleven more are listed as coming soon. Nothing is a mockup.`
- **L1.26** button: `Browse the Apps →` → `/apps/`
[DELETE]- **L1.27** note: `Prefer to poke at it?` + link `The browser build still works.` → `/emulator/`

### Concept

[ART: none. Section label, heading, two lead paragraphs.]

- **L1.28** label (renders as `// CONCEPT`): `// CONCEPT`
- **L1.29** h2: `A port of Numos(link to numos repo) for casio scientific calcs.`
- **L1.30** paragraph 1: `absolut-CAS gives your Casio flagship graphing calculator capabilies while preserving the form factor and UX that you know and love.`
- **L1.31** paragraph 2: `Everything is open, hackable, and free to modify. Zero cloud dependencies, zero subscription`

### Hardware specifications

[ART: none. List of 6 rows; each row = a badge chip, an h3 and a paragraph. Collapses to one column at 860px.]

- **L1.32** label: `// HARDWARE SPECIFICATIONS`
- **L1.33** h2: `What's in the Drop-In Kit`
-[delete]** intro: `Designed as a clean swap for the ~350 million Casio fx-82 and fx-991 family calculators in circulation.`

- **L1.35** row 1 — badge `DROP-IN PCB` / h3 `No-Solder Motherboard Swap` / `Four screws, one connector. Swap out the OEM board without any cutting or soldering. 100% reversible back to stock anytime.`
- **L1.36** row 2 — badge `Back Shell` / back shell to accomodate new internals
- **L1.37** row 3 — badge `DISPLAY` / h3 `2.4" Color IPS LCD Screen` / `ILI9341 panel with 320×240 physical resolution and a 320×156 fitted cancas to look indetical to stock. no major cutting necessary`
new head : //` FEATURES`
[delete]8** row 4 — badge `POWER` / h3 `Rechargeable Battery & USB-C` / `Internal Li-ion battery charging right through the shell's USB-C port. Completely untethered operation.`
- **L1.39** row 5 — badge `STORAGE` / h3 `microSD Card Slot` / `Load Game Boy ROMs, text notes, markdown cheat sheets, calculation logs, and custom environment settings.`
- **L1.40** row 6 — badge `CONNECTIVITY & HARDWARE` / h3 `Wi-Fi & Camera Header` / `Device-hosted AP for phone setup portal. Carry onboard pogo-pin header for optional magnetic OV2640 camera add-on. (OTA Wi-Fi updates landing in upcoming release).`

### Software and firmware

[ART: none. One brass-bordered promise box, then 5 numbered capability rows.]

- **L1.41** label: `// SOFTWARE & FIRMWARE`
- **L1.42** desc: `Powered by NumOS. Built on high-performance C++ and open-source engines.`
- **L1.43** promise box h3: `100% Open & Free to Modify` (AI AGENT SKILLS COMING SOON)
- **L1.44** promise box p: `All schematics, PCB designs, firmware, and tools are open-source. Fork the codebase, write your own LVGL apps, or flash custom firmware whenever you want.`
- **L1.45** cap 01 — `Exact Symbolic CAS Math (Giac / KhiCAS)` / `Real computer algebra system: exact fractions, symbolic calculus, integrals, derivatives, matrix algebra, and equation solving rendered in STIX and Casio math typography.`
- **L1.46** cap 02 — `Game Boy & GBC Emulation Core` / `Integrated Walnut-CGB header-only emulator. Play classic Game Boy & Game Boy Color games directly on the display using your calculator's physical keypad.`
- **L1.47** cap 03 — `Interactive 2D Function Grapher` / `Plot expressions, analyze roots, find extremums, inspect intersections, and trace function curves at native 320×156 canvas resolution.`
- **L1.48** cap 04 — `Markdown Notes & Document Reader` / `Read text notes, formula sheets, and markdown documents directly off the microSD card with on-device rendering.`
- **L1.49** cap 05 — `BYOK AI Tool Integration` / `Connect over Wi-Fi to a self-hosted open-source MCP server. Bring your own API keys for AI tool explanations and Wolfram|Alpha queries, with zero locked subscriptions.`

Note: the section heading for this block is absent — it goes straight from the label to the desc. (The `// SOFTWARE & FIRMWARE` label stands in for a heading.)

### Footer

- **L1.50** brand: `absolut-CAS` + `© 2026 • Open Hardware Project`
- **L1.51** links: `GitHub Repo` (github.com/AbuPaad/Absolut-CAS) `Apps` `Browser Emulator` `Waitlist`

---

## PART 2 — App gallery

File: `public/apps/index.html`

### Head + nav

- **A0.1** title: `Apps at absolut-CAS / NumOS`
- **A0.2** meta description: `Every app on the board`
- **A1.1** brand: `absolut-CAS` + `App Gallery`
- **A1.2** links: `Overview` `Hardware` `Emulator`
- **A1.3** cta: `Join the Waitlist` → `/#waitlist`
- **A1.4** theme button: hardcoded `Light Mode` [DONT HARDCODE] (again overwritten by JS on load)

### Header

- **A1.5** label: `// THE APPS`
- **A1.6** h1: `Everything it can do, on the real screen.`
[delete]- **A1.7** intro: `Eleven apps, each captured from the real firmware at 320 by 156. Eleven more run on the device but cannot be captured from the emulator yet, so they are listed at the bottom instead of being faked. No image on this page is a mockup.`

### Index (11 cells, each = colour dot + name + launcher id)

Page order, and this order drives everything else on the page:

| # | Name | Dot | Launcher id |
|---|---|---|---|
| 1 | Calculation | `#FF8000` | 00 |
| 2 | Grapher | `#50B849` | 01 |
| 3 | Game Boy | `#8E24AA` | 21 |
| 4 | AI | `#00897B` | 23 |
| 5 | Statistics | `#E65100` | 04 |
| 6 | Calculus | `#6A1B9A` | 03 |
| 7 | Equations | `#1565C0` | 02 |
| 8 | Probability | `#00897B` | 05 |
| 9 | Regression | `#BF360C` | 06 |
| 10 | Settings | `#546E7A` | 10 |
| 11 | Sequences | `#1B5E20` | 07 |

**The jump-list rule.** Each plate carries a `<details>` "App index" holding the **next five apps in page order, wrapping at the end**, plus one link `See all 11 apps` back to the top index. This markup is generated from the table above — do not hand-edit one plate's list.

**Shared per-plate strings.** Every plate repeats these verbatim:
[CUT EVERY CAPS/TAG THING]
- **A2.1** jump summary: `App index`
- **A2.2** jump tail link: `See all 11 apps`
- **A2.3** CTA on every plate: `Join the Launch Waitlist` → `/#waitlist`
- **A2.4** eyebrow format: `APP nn` (the launcher id, not the page position)

### Plates

**1 — Calculation** (id `app-calculation`, accent `#FF8000`, `APP 00`)
- **A3.1** sub: `The scientific calculator, exact. Fractions stay fractions, results are typeset rather than printed, and the last fifty calculations are one key away.`
- shots (3):
  1. `/assets/img/apps/calculation-1.webp` — `Enter 1/3 + 1/6, get a real fraction: 1/2, typeset.`
  2. `/assets/img/apps/calculation-2.webp` — `One key flips exact, to periodic, to a 200-digit decimal.`
  3. `/assets/img/apps/calculation-3.webp` — `Step-by-step mode breaks the arithmetic into atomic transformations.`
- caps: `Exact symbolic and decimal evaluation via the CAS` / `Stacked fractions, roots, powers and trig, typeset` / `Fifty-entry history with expression recall` / `Variables A to F stored to flash` / `Prime factorisation`

**2 — Grapher** (id `app-grapher`, accent `#50B849`, `APP 01`)
- **A4.1** sub: `Plot several relations at once including implicit curves and shaded inequalities, then trace them and snap to the points that matter.`
- shots (3):
  1. `grapher-1.webp` — `An explicit curve, a line, an implicit circle and a shaded region on one grid.`
  2. `grapher-2.webp` — `Trace an implicit curve: the readout follows, the curve stays put.`
  3. `grapher-3.webp` — `Roots, extrema and intersections found for you and marked on the curve.`
- caps: `y = f(x), x = f(y), implicit relations and inequalities` / `Roots, minima, maxima, y-intercepts and intersections` / `Tangent and integral overlays drawn on the curve` / `Casio split view with numbered slots and a value table`

**3 — Game Boy** (id `app-gameboy`, accent `#8E24AA`, `APP 21`) — flagged motion
- **A5.1** head flag: `Motion: ship as MP4` (rendered in the plate head; see PART 5)
- **A5.2** sub: `A Game Boy and Game Boy Color core, driven by the calculator keypad. Load a ROM from the card and the saves go back to the card.`
- shots (3):
  1. `gameboy-1.webp` — `Pick a ROM from the card; the list wears the same theme as the OS.`
  2. `gameboy-2.webp` — `Colour titles run at the right palette, not the four-shade grey.`
  3. `gameboy-3.webp` — `DMG and CGB cores, the calculator keypad as a controller.`
- caps: `Game Boy and Game Boy Color` / `MBC1, MBC2, MBC3 and MBC5 mappers, plus RTC` / `Cartridge save files written back to the card` / `Homebrew ROMs only: no commercial titles can ship with the site`

**4 — AI** (id `app-ai`, accent `#00897B`, `APP 23`)
- **A6.1** sub: `An assistant that lives on the device and answers in markdown: watch it stream, then page through the answer with the same keys you use everywhere else.`
- shots (3):
  1. `ai-1.webp` — `The answer arrives as markdown and is laid out, not dumped as plain text.`
  2. `ai-2.webp` — `Long answers paginate; left and right walk the pages.`
  3. `ai-3.webp` — `Pick the model on the device; the choice persists.`
- caps: `Markdown rendered and paginated on the device` / `Answers stream in token by token` / `Every answer saved as a .md file on the card` / `Prompts typed on the calculator keypad`

**5 — Statistics** (id `app-statistics`, accent `#E65100`, `APP 04`)
- **A7.1** sub: `Type in values and their frequencies, and get the descriptive statistics and a histogram back.`
- shots (3):
  1. `statistics-1.webp` — `A value column and a frequency column, twenty rows deep.`
  2. `statistics-2.webp` — `Seven frequency-weighted statistics, recomputed as you type.`
  3. `statistics-3.webp` — `The distribution drawn from the same numbers in the table.`
- caps: `Twenty-row value and frequency table` / `Mean, median, standard deviation, min, max, sum, n` / `Live histogram on the graph tab`

**6 — Calculus** (id `app-calculus`, accent `#6A1B9A`, `APP 03`)
- **A8.1** sub: `Derivatives and indefinite integrals, with the working shown when the native solver can prove it agrees with the CAS.`
- shots (3):
  1. `calculus-1.webp` — `A chain of derivatives, typeset properly with a fraction bar.`
  2. `calculus-2.webp` — `Integration by parts, worked out symbolically.`
  3. `calculus-3.webp` — `When there is no closed form, it says so and shows the integral.`
- caps: `Symbolic differentiation and indefinite integration` / `Results typeset with real fraction bars and radicals` / `Step-by-step view, shown only when it verifies against the CAS`

**7 — Equations** (id `app-equations`, accent `#1565C0`, `APP 02`) — one placeholder
- **A9.1** sub: `Solve one equation or a system of up to three, exactly, with the steps laid out when the solver can justify them.`
- shots (3):
  1. `equations-1.webp` — `Exact roots, not decimal approximations.`
  2. **PLACEHOLDER** — no `equations-2.webp` on disk. Frame carries `The steps view showing the factored form, with the factor highlighted as the step that just changed.` Caption: `Each step highlights exactly what changed.`
  3. `equations-3.webp` — `Systems up to three equations in x, y and z.`
- caps: `Up to three equations, solved exactly` / `Polynomial, exponential and logarithmic templates` / `Quadratic and cubic step-by-step solving` / `Complex roots when the domain is switched on`

**8 — Probability** (id `app-probability`, accent `#00897B`, `APP 05`)
- **A10.1** sub: `Set the mean, the spread and a boundary, and read the probability straight off the curve.`
- shots (3):
  1. `probability-1.webp` — `A shaded tail and both numbers, read off the same curve.`
  2. `probability-2.webp` — `Any mean and spread, redrawn as you change them.`
  3. `probability-3.webp` — `Three parameters, edited in place.`
- caps: `Normal density and cumulative probability` / `Shaded area up to the boundary` / `Values shown to six decimal places`

**9 — Regression** (id `app-regression`, accent `#BF360C`, `APP 06`) — all three placeholders
- **A11.1** sub: `Enter paired data and fit a straight line or a parabola, with the fit judged in front of you.`
- shots (3), **no webp files on disk**:
  1. `The fitted equation and its coefficients, spelled out.`
  2. `The data and the fit on the same axes.`
  3. `Switch models and watch the fit change.`
- caps: `Linear and quadratic least squares` / `Coefficient of determination shown for both` / `Scatter plot with the fitted curve`

**10 — Settings** (id `app-settings`, accent `#546E7A`, `APP 10`) — one placeholder
- **A12.1** sub: `Angle mode, precision, the theme, and the Wi-Fi setup that runs on the device itself.`
- shots (3):
  1. `settings-1.webp` — `Angle mode, complex numbers, precision, theme: all in one list.`
  2. **PLACEHOLDER** — no `settings-2.webp`. Frame text: `The Wi-Fi sub-screen with the setup portal running: the network name, the address to open, and how many devices have joined.` Caption: `The calculator hosts its own setup network for your phone.`
  3. `settings-3.webp` — `Two full themes, switched on the device.`
- caps: `Degrees and radians` / `Six to twelve significant figures` / `NumOS and Casio themes` / `Wi-Fi provisioning from the device` / `Settings persist to flash`

**11 — Sequences** (id `app-sequences`, accent `#1B5E20`, `APP 07`) — 2 shots, no-claim block
- **A13.1** sub: `A two-sequence table.`
- shots (2):
  1. `sequences-1.webp` — `Two sequences, defined as short formulas.`
  2. `sequences-2.webp` — `A table of the first twenty terms.`
- **A13.2** no-claim bold: `No claim is made about this app on this page.`
- **A13.3** no-claim body: `The formula reader only understands a handful of shapes (n, n squared, a times n plus b, or a constant) and silently mis-reads anything else, so it cannot honestly be shown doing more than the two rows above.`
- No capability list on this plate, and no accent-coloured claims.

### Coming soon

[ART: none. Heading + note + 11 rows (dot, name, description, launcher id).]

- **A14.1** h2: `Coming soon`
- **A14.2** note: `These run on the device. They cannot be captured from the emulator yet, so they are listed here without screenshots rather than shown as something they are not.`
- **A14.3** rows (name / dot / description / id):
  - `Python` `#F57F17` `A script editor and a console, on the device.` 08
  - `Matrices` `#7B1FA2` `Three matrix slots up to five by five: add, multiply, determinants and inverses.` 09
  - `Chemistry` `#2E7D32` `All 118 elements with a deep-dive profile, a molar-mass calculator that understands real formulae, and an equation balancer that works in exact fractions.` 11
  - `Bridge` `#455A64` `Build a truss out of wood, steel and cable, then drive a truck across it and watch which beams give up first.` 12
  - `Circuit` `#F9A825` `Place components on a grid, run it, and watch the voltages and currents actually happen.` 13
  - `Fluid 2D` `#1E88E5` `A real incompressible fluid solver: drag the cursor through it, inject dye, and watch the eddies hold together.` 14
  - `ParticleLab` `#FF9800` `A falling-sand sandbox with thirty-one materials, real heat, phase changes and a working little electrical system.` 15
  - `Neural Lab` `#9C27B0` `Train a small neural network on the calculator itself and watch the decision boundary take shape while the loss drops.` 16
  - `OpticsLab` `#00BCD4` `A two-lens optical bench with genuine ray tracing on the screen and the paraxial numbers printed alongside it.` 17
  - `NeoLang` `#4CAF50` `A small scripting language with the CAS wired into it: differentiation, solving, plotting and linear algebra in a few lines.` 18
  - `Fractals` `#3F51B5` `Four fractals with deep zoom, drawn in passes so the picture sharpens instead of stalling.` 19

### Footer

- **A15.1** brand: `absolut-CAS` + `© 2026 • Open Hardware Project`
- **A15.2** links: `Back to Home` `Browser Emulator` `Waitlist`

---

## PART 3 — Emulator page

File: `public/emulator/index.html`

### Head + nav

- **E0.1** title: `WASM Emulator at absolut-CAS / NumOS`
- **E0.2** meta description: `Run NumOS in your browser: the real firmware compiled to WebAssembly, with the launcher, apps, CAS math and the Game Boy core.`
- **E1.1** brand: `absolut-CAS` + `WASM Emulator`
- **E1.2** links: `Overview` → `/#overview`, `Specs` → `/#specs`, `Features` → `/#features` **(dead anchor, see PART 5)**, `Apps` → `/apps/`
- **E1.3** cta: `Back to Site` → `/`
- **E1.4** theme button: hardcoded `Dark` [DONT HARDCODE THEMES ANYWHERE](overwritten by JS on load)

### Header

- **E1.5** label: `// INTERACTIVE BROWSER BUILD`
- **E1.6** h1: `NumOS Emulator`
- **E1.7** subtitle:[delete] `The real firmware compiled to WebAssembly, running in this tab. Boots the launcher in the Casio theme; open Calculation, Grapher, the AI app and the Game Boy core from there.`

### Stage

[ART: the real `<numos-emulator>` custom element. It owns the canvas and the keypad; `/assets/numos-loader.js` reads `emulator/numos/numos-assets.json` and imports the bundle. `persistence="disabled"` so the preloaded MEMFS image (AI fixture + Game Boy ROMs) is not shadowed by IDBFS. Nothing here is faked.]

- **E1.8** status line, while loading: `Loading NumOS…`
- **E1.9** status line, on ready: `NumOS is running in this browser.`

### Side card — "What is running"

- **E1.10** [delete] h2: `What is running`
- **E1.11**  / `The same C++ that runs on the board, compiled to WebAssembly. Not a JavaScript re-implementation.`
- **E1.12** `Launcher + apps` / `Calculation, Grapher, Equations, Statistics, Notes, the AI wrapper and more, all reachable from the launcher.`
- **E1.13**[delete] `AI, offline` / `The AI app reads a recorded answer from the filesystem, so it works with no network and no API key.`
- **E1.14**[delete] `Themes` / `Boots in the Casio skin. Use the emulator's own Switch theme button, or the one below, to flip to NumOS.`
- **E1.15** button: `Switch calculator theme` (disabled until the `numos-ready` event fires)
- **E1.16** link button: `Join the Waitlist` → `/#waitlist`

### Footer

- **E1.17** brand: `absolut-CAS` + `© 2026 • Open Hardware Project`
- **E1.18** links: `Back to Home` `Waitlist`

---

## PART 4 — 404 page

File: `public/404.html`

[ART: **the markup does not match the stylesheet.** See PART 5, item 3. These strings render but the layout classes around them have no CSS.]

- **N0.1** title: `404 at absolut-CAS`
- **N1.1** brand: `absolut-CAS` + `free | connected`
- **N1.2** links: `Front page` → `/`, `Emulator` → `/emulator/`
- **N1.3** theme button: `Dark`
- **N1.4** code: `404`
- **N1.5** body: `That path does not exist here. The front page is the whole site; the app gallery and the emulator are the two other pages. Nothing was lost: the board is at V2 and the copy is at launch, not at this address.`
- **N1.6** button: `Back to the front page`
- **N1.7** footer: `the people` / `2026`
- **N1.8** ticker: `V1 board: keypad, math, boot, Wi-Fi, camera header all live`

---

## Open questions for you

1. Does the waitlist get a real backend before this page goes public, or does the form change to something honest without one?
  THERES A BACKEND NOW
2. The `$5 / first 200` promo: define the mechanism, or cut it?
   1. ILL HANDLE IT 
3. The 404 page: restyle it to match the site, or cut it back to a plain "not found" with a link home?
  RESTYLE