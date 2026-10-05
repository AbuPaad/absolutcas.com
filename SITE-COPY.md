# SITE COPY — absolutcas.com

Source of truth for every word on the site, plus the graphic or layout that sits with it.
**Regenerated 2026-10-05 from the deployed HTML**, after the `[delete]` / `[CUT]` marks in the previous
revision were applied to the pages. Every string below was read out of `public/`, not from memory.

Live: `https://absolutcas.com` (Cloudflare Worker `absolutcas-com`, static assets from `./public`,
routes on apex + `www`). Deployed 2026-10-05, version `aa1e3020-9c93-44fe-8c57-9ec4055065b8`.

---

## How to use this file

**Slot IDs.** One per string. Prefix says which page it is on:

- `L…` landing page (`public/index.html`, served at `/`)
- `A…` app gallery (`public/apps/index.html`, `/apps/`)
- `E…` emulator (`public/emulator/index.html`, `/emulator/`)
- `N…` not-found (`public/404.html`)

To change one string, say the ID. **IDs are stable** — surviving IDs were re-used verbatim from the
previous revision and are *not* renumbered, so gaps in a sequence are expected. An ID listed under
**Retired** no longer exists on the page: do not cite it, and do not re-use the number.

**[ART] lines.** What graphic or layout sits in that slot, and how CSS treats it.

**[MISSING] / [PLACEHOLDER].** A graphic that is not on disk. Nothing renders there yet.

**EDIT: lines.** Add one under a slot and it is treated as a direct instruction for that slot.

I do not rewrite your copy unprompted. Anything that reads badly is flagged in PART 5, not changed.

---

## PART 0 — What is on disk

| Path | Lines | Role | Served at |
|---|---|---|---|
| `public/index.html` | 255 | **the live landing page** | `/` |
| `public/apps/index.html` | 684 | the app gallery, 11 capturable apps + 11 coming-soon | `/apps/` |
| `public/emulator/index.html` | 112 | the WebAssembly emulator | `/emulator/` |
| `public/404.html` | 59 | not-found page | unknown paths (`not_found_handling: 404-page`) |
| `public/assets/site.css` | 442 | all site styling | — |
| `public/assets/site.js` | 95 | theme toggle, smooth anchors, waitlist form | — |
| `public/assets/numos-loader.js` | — | reads the content-addressed manifest and loads the emulator | — |
| `public/assets/fonts/` | — | local faces (Geist Mono 300/400/500/700, Instrument Serif 400) | — |
| `public/assets/img/apps/*.webp` | — | **28 device captures** | — |
| `public/emulator/numos/*` | — | the staged WASM bundle (7.0 MB) | — |
| `public/_headers` | — | cache + security headers | config |
| `wrangler.jsonc` | — | Cloudflare Worker + static assets config | config |

The old `public/mockup/` directory and its `demo.html` are **gone**. Do not reference them.

### Asset inventory

| Asset | Details |
|---|---|
| `public/emulator/numos/numos-emulator.989b4ee722b0.wasm` | **6,761,032 bytes (~6.5 MiB)**, the real firmware compiled to WebAssembly. The bundle is built and staged, not a stub. |
| `public/emulator/numos/numos-emulator.2563b2ec8de5.data` | 72,512 bytes. Preloaded MEMFS image (the AI replay fixture and the Game Boy ROMs live here). |
| `public/emulator/numos/*.js` | `numos-runtime` (228 KB), `numos-component` (79 KB), `numos-keycontext`, `numos-keypad`, `numos-persistence`, `numos-shell` — all content-addressed. |
| `public/emulator/numos/numos-component.*.css` | 13,450 bytes, content-addressed. |
| `public/emulator/numos/numos-assets.json` | 3,047 bytes. **The one mutable file in that directory** — the only one not served immutably. |
| `public/assets/img/apps/*.webp` | **28 files, 132 KB total.** Four frames still have no capture and render as text placeholders (see A-section notes). |
| `public/assets/img/fx82.jpg` | **Orphaned — no page references it.** The old hero photo; the hero is text-free now. |
| `public/assets/img/plate-ink-paper.jpg` | **Orphaned — no page references it.** |
| favicon | present on every page as an inline SVG data URI (sage field + ink bar). Not a file. |
| **og:image / twitter:card** | **MISSING** — no page sets either, and only the landing page sets `og:title` / `og:description` at all. Links shared to chat/social render with no card. |
| **board render or photo** | **MISSING** by design (holding to software stills + donor front) |

### Cache policy (`public/_headers`)

- `/assets/fonts/*` and `/emulator/numos/*` — `max-age=31536000, immutable` (every name is content-addressed).
- `/emulator/numos/numos-assets.json` — `max-age=0, must-revalidate`.
- `/assets/img/*` — `max-age=604800`.
- `/assets/*.css`, `/assets/*.js`, `/index.html`, `/404.html` — `max-age=0, must-revalidate`.
- `COOP` / `COEP` are **deliberately off** until the emulator bundle declares `pthreads: true`.

---

## PART 1 — Landing page

File: `public/index.html`

### Head

- **L0.1** title: `absolut-CAS: Your Casio does more now`
- **L0.2** meta description: `A drop-in upgrade for casio scientific calculators: Wi-Fi, CAS math, graphing, Game Boy core, and AI tools in your original shell.`
- **L0.3** og:title: same string as L0.1 (this page only)
- **L0.4** og:description: same string as L0.2
- og:type `website`, og:url `https://absolutcas.com/`. No `og:image`, no `twitter:card`.

### Nav

[ART: none. Sticky bar, brand left, 6 items right. At 640px the bar stacks and the links wrap; there is no hidden menu.]

- **L1.1** brand: `absolut-CAS` (bold) + `Open Hardware Project` (small)
- **L1.2** links: `Overview` → `#overview` · `Hardware` → `#specs` · `Capabilities` → `#capabilities` · `Apps` → `/apps/` · `Emulator` → `/emulator/`
- **L1.3** cta: `See the apps →` → `/apps/`
- **L1.4** theme button: **empty in the HTML by design.** `site.js` fills it with `Light Mode` (dark theme) or `Dark Mode` (light theme) on load. It must stay `<button id="theme-btn" type="button" aria-live="polite"></button>` — no hardcoded label anywhere.

### Hero

[ART: none. The hero is now **two buttons on the pale ground** — the donor pill, the `<h1>` and the
subtitle were deleted 2026-10-05. There is no `<h1>` anywhere on this page; `/` is the only page
without one.]

- **L1.8** button 1 (solid): `Join the Launch Waitlist` → `#waitlist`
- **L1.9** button 2: `See the Apps →` → `/apps/`

**Retired:** `L1.5` donor pill · `L1.6` h1 · `L1.7` subtitle.

### Telemetry strip

[ART: none. Full-width band inside the hero. One brass star, pulled right by `margin-left:auto`.]

- **L1.12** brass item: `★ 100% Free & Open Source`

**Retired:** `L1.10` label `Status Log:` · `L1.11` the four green tick items.

### Waitlist (the primary action; sits **above** the concept section)

[ART: brass promo banner, now **badge-only**, above the form. Form = one email field (16px so iOS does
not zoom) + solid button. An off-screen honeypot `<input name="hp">` sits inside the form; the server
accepts-and-discards anything that arrives with it filled.]

- **L1.13** promo badge: `EARLY BACKER BONUS`
- **L1.16** h2: `Get the Launch Notification`
- **L1.18** placeholder: `you@example.com`
- **L1.19** button: `Join Waitlist`
- **L1.21** success message (hidden until submit): `You're on the list!`
- **L1.22** error message: `Please enter a valid email address.`

**Retired:** `L1.14` promo amount `$5 API Promo Credit` · `L1.15` promo desc · `L1.17` waitlist sub
`No spam, no marketing noise.` · `L1.20` helper `Double opt-in.` (was never in the HTML).

Note on L1.21: `site.js` owns the runtime text and now writes this same short string. The previous
longer variant (`…Check your inbox to confirm your address.`) is gone, so **the page no longer mentions
the confirmation mail anywhere.** See PART 5.

### Apps banner

[ART: none. A bare `Browse the Apps →` button on the card background; the accent tag, heading,
paragraph and note line were all deleted 2026-10-05.]

- **L1.26** button: `Browse the Apps →` → `/apps/`

**Retired:** `L1.23` tag `22 Apps` · `L1.24` h2 · `L1.25` paragraph · `L1.27` note + link.

### Concept

[ART: none. Section label, heading, two lead paragraphs.]

- **L1.28** label: `// CONCEPT`
- **L1.29** h2: `A port of Numos for casio scientific calcs.` — the word **`Numos` is a link** to
  `https://github.com/El-EnderJ/NeoCalculator` (`target="_blank" rel="noopener"`).
- **L1.30** paragraph 1: `absolut-CAS gives your Casio flagship graphing calculator capabilities while preserving the form factor and UX that you know and love.` (first two words bold)
- **L1.31** paragraph 2: `Everything is open, hackable, and free to modify. Zero cloud dependencies, zero subscription.`

### Hardware specifications

[ART: none. **Two** lists of rows; each row = a badge chip, an h3 and a paragraph. A second section
label splits them. Collapses to one column at 860px.]

- **L1.32** label: `// HARDWARE SPECIFICATIONS`
- **L1.33** h2: `What's in the Drop-In Kit`
- **L1.52** second label (new 2026-10-05): `// HW Features` — renders as a `section-label` with
  `.spec-subhead`, between the DISPLAY row and the POWER row. It closes the first
  `<ul class="spec-list">` and opens a second one, so **the list is two `<ul>`s, not one.**

Rows, top list:

- **L1.35** badge `DROP-IN PCB` / h3 `No-Solder Motherboard Swap` / `Four screws, one connector. Swap out the OEM board without any cutting or soldering. 100% reversible back to stock anytime.`
- **L1.36** badge `BACK SHELL` / h3 `Back Shell` / `A back shell to accommodate the new internals.`
  *(This row replaced the old `COMPUTE & MEMORY` / ESP32-S3 row on 2026-10-05. **The ESP32-S3 spec no
  longer appears anywhere on the site.** See PART 5.)*
- **L1.37** badge `DISPLAY` / h3 `2.4" Color IPS LCD Screen` / `ILI9341 panel with 320×240 physical resolution and a 320×156 fitted canvas to look identical to stock. No major cutting necessary.`

Rows, bottom list:

- **L1.38** badge `POWER` / h3 `Rechargeable Battery & USB-C` / `Internal Li-ion battery charging right through the shell's USB-C port. Completely untethered operation.`
- **L1.39** badge `STORAGE` / h3 `microSD Card Slot` / `Load Game Boy ROMs, text notes, markdown cheat sheets, calculation logs, and custom environment settings.`
- **L1.40** badge `CONNECTIVITY & HARDWARE` / h3 `Wi-Fi & Camera Header` / `Device-hosted AP for phone setup portal. Carry onboard pogo-pin header for optional magnetic OV2640 camera add-on. (OTA Wi-Fi updates landing in upcoming release).` — the `(OTA Wi-Fi updates landing in upcoming release)` is in italics.

**Retired:** the section intro `Designed as a clean swap for the ~350 million Casio fx-82 and fx-991
family calculators in circulation.` (deleted 2026-10-05, so `L1.34` is unused).

### Software and firmware

[ART: none. One brass-bordered promise box, then 5 numbered capability rows.]

- **L1.41** label: `// SOFTWARE & FIRMWARE`
- **L1.42** desc: `Powered by NumOS. Built on high-performance C++ and open-source engines.`
- **L1.43** promise box h3: `100% Open & Free to Modify`
- **L1.44** promise box p: `All schematics, PCB designs, firmware, and tools are open-source. Fork the codebase, write your own LVGL apps, or flash custom firmware whenever you want.`
- **L1.45** cap 01 — `Exact Symbolic CAS Math (Giac / KhiCAS)` / `Real computer algebra system: exact fractions, symbolic calculus, integrals, derivatives, matrix algebra, and equation solving rendered in STIX and Casio math typography.`
- **L1.46** cap 02 — `Game Boy & GBC Emulation Core` / `Integrated Walnut-CGB header-only emulator. Play classic Game Boy & Game Boy Color games directly on the display using your calculator's physical keypad.`
- **L1.47** cap 03 — `Interactive 2D Function Grapher` / `Plot expressions, analyze roots, find extremums, inspect intersections, and trace function curves at native 320×156 canvas resolution.`
- **L1.48** cap 04 — `Markdown Notes & Document Reader` / `Read text notes, formula sheets, and markdown documents directly off the microSD card with on-device rendering.`
- **L1.49** cap 05 — `BYOK AI Tool Integration` / `Connect over Wi-Fi to a self-hosted open-source MCP server. Bring your own API keys for AI tool explanations and Wolfram|Alpha queries, with zero locked subscriptions.`

Note: there is still no heading for this block — it goes label → desc → promise box. (The
`// SOFTWARE & FIRMWARE` label stands in for a heading. Recorded as the shape, not flagged as a fault.)

### Footer

- **L1.50** brand: `absolut-CAS` + `© 2026 • Open Hardware Project`
- **L1.51** links: `GitHub Repo` (github.com/AbuPaad/Absolut-CAS, `target="_blank"`) `Apps` → `/apps/` `Browser Emulator` → `/emulator/` `Waitlist` → `#waitlist`

---

## PART 2 — App gallery

File: `public/apps/index.html`

### Head + nav

- **A0.1** title: `Apps at absolut-CAS / NumOS`
- **A0.2** meta description: `Every app on the board`
- **A1.1** brand: `absolut-CAS` + `App Gallery`
- **A1.2** links: `Overview` → `/#overview` · `Hardware` → `/#specs` · `Emulator` → `/emulator/`
- **A1.3** cta: `Join the Waitlist` → `/#waitlist`
- **A1.4** theme button: **empty in the HTML by design**, same contract as L1.4.

### Header

- **A1.5** label: `// THE APPS`
- **A1.6** h1: `Everything it can do, on the real screen.`

**Retired:** `A1.7` intro paragraph (deleted 2026-10-05).

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

**The jump-list rule.** Each plate carries a `<details>` "App index" holding the **next five apps in
page order, wrapping at the end**, plus one link `See all 11 apps` back to the top index. This markup is
generated from the table above — do not hand-edit one plate's list.

**Shared per-plate strings.** Every plate repeats these verbatim:

- **A2.1** jump summary: `App index`
- **A2.2** jump tail link: `See all 11 apps`
- **A2.3** CTA on every plate: `Join the Launch Waitlist` → `/#waitlist`
- **A2.4** eyebrow format: `APP nn` (the launcher id, not the page position)

### Shot captions — retired 2026-10-05

**All 32 screenshot captions were deleted.** A shot is now the title bar (two dots + an `n/m` counter)
and the frame only — `.shot-cap` is dead CSS. Do not re-add a caption under a frame without saying so
explicitly.

Four of the 32 frames carry no webp: they hold a `.shot-desc` sentence plus a `.shot-path` brass line
naming the path the capture should be dropped at. (28 webp on disk + 4 placeholders = 32 frames.)

| Plate | Frame | Placeholder text |
|---|---|---|
| Equations (7) | `equations-2` | `The steps view showing the factored form, with the factor highlighted as the step that just changed.` |
| Regression (9) | `regression-1` | `The equation tab after a quadratic fit: the equation, each coefficient, the coefficient of determination and the point count.` |
| Regression (9) | `regression-3` | `The same graph after switching the model, the quadratic curve replaced by a straight line.` |
| Settings (10) | `settings-2` | `The Wi-Fi sub-screen with the setup portal running: the network name, the address to open, and how many devices have joined.` |

Note: `regression-2.webp` **does** exist, so the Regression plate shows one real image between two
placeholders. The previous revision of this file claimed all three Regression shots were placeholders —
that was wrong.

### Plates

**1 — Calculation** (id `app-calculation`, accent `#FF8000`, `APP 00`)
- **A3.1** sub: `The scientific calculator, exact. Fractions stay fractions, results are typeset rather than printed, and the last fifty calculations are one key away.`
- shots (3, all present): `calculation-1` · `calculation-2` · `calculation-3`
- caps: `Exact symbolic and decimal evaluation via the CAS` / `Stacked fractions, roots, powers and trig, typeset` / `Fifty-entry history with expression recall` / `Variables A to F stored to flash` / `Prime factorisation`

**2 — Grapher** (id `app-grapher`, accent `#50B849`, `APP 01`)
- **A4.1** sub: `Plot several relations at once including implicit curves and shaded inequalities, then trace them and snap to the points that matter.`
- shots (3, all present): `grapher-1` · `grapher-2` · `grapher-3`
- caps: `y = f(x), x = f(y), implicit relations and inequalities` / `Roots, minima, maxima, y-intercepts and intersections` / `Tangent and integral overlays drawn on the curve` / `Casio split view with numbered slots and a value table`

**3 — Game Boy** (id `app-gameboy`, accent `#8E24AA`, `APP 21`) — flagged motion
- **A5.1** head flag: `Motion: ship as MP4` (rendered in the plate head as `.app-motion`; still present)
- **A5.2** sub: `A Game Boy and Game Boy Color core, driven by the calculator keypad. Load a ROM from the card and the saves go back to the card.`
- shots (3, all present): `gameboy-1` · `gameboy-2` · `gameboy-3`
- caps: `Game Boy and Game Boy Color` / `MBC1, MBC2, MBC3 and MBC5 mappers, plus RTC` / `Cartridge save files written back to the card` / `Homebrew ROMs only: no commercial titles can ship with the site`

**4 — AI** (id `app-ai`, accent `#00897B`, `APP 23`)
- **A6.1** sub: `An assistant that lives on the device and answers in markdown: watch it stream, then page through the answer with the same keys you use everywhere else.`
- shots (3, all present): `ai-1` · `ai-2` · `ai-3`
- caps: `Markdown rendered and paginated on the device` / `Answers stream in token by token` / `Every answer saved as a .md file on the card` / `Prompts typed on the calculator keypad`

**5 — Statistics** (id `app-statistics`, accent `#E65100`, `APP 04`)
- **A7.1** sub: `Type in values and their frequencies, and get the descriptive statistics and a histogram back.`
- shots (3, all present): `statistics-1` · `statistics-2` · `statistics-3`
- caps: `Twenty-row value and frequency table` / `Mean, median, standard deviation, min, max, sum, n` / `Live histogram on the graph tab`

**6 — Calculus** (id `app-calculus`, accent `#6A1B9A`, `APP 03`)
- **A8.1** sub: `Derivatives and indefinite integrals, with the working shown when the native solver can prove it agrees with the CAS.`
- shots (3, all present): `calculus-1` · `calculus-2` · `calculus-3`
- caps: `Symbolic differentiation and indefinite integration` / `Results typeset with real fraction bars and radicals` / `Step-by-step view, shown only when it verifies against the CAS`

**7 — Equations** (id `app-equations`, accent `#1565C0`, `APP 02`) — one placeholder
- **A9.1** sub: `Solve one equation or a system of up to three, exactly, with the steps laid out when the solver can justify them.`
- shots: `equations-1` (image) · **placeholder** `equations-2` · `equations-3` (image)
- caps: `Up to three equations, solved exactly` / `Polynomial, exponential and logarithmic templates` / `Quadratic and cubic step-by-step solving` / `Complex roots when the domain is switched on`

**8 — Probability** (id `app-probability`, accent `#00897B`, `APP 05`)
- **A10.1** sub: `Set the mean, the spread and a boundary, and read the probability straight off the curve.`
- shots (3, all present): `probability-1` · `probability-2` · `probability-3`
- caps: `Normal density and cumulative probability` / `Shaded area up to the boundary` / `Values shown to six decimal places`

**9 — Regression** (id `app-regression`, accent `#BF360C`, `APP 06`) — two placeholders
- **A11.1** sub: `Enter paired data and fit a straight line or a parabola, with the fit judged in front of you.`
- shots: **placeholder** `regression-1` · `regression-2` (image — the only frame whose `alt` is a
  sentence rather than the filename: `The graph tab: the entered points as scatter and the fitted curve passing through them.`) · **placeholder** `regression-3`
- caps: `Linear and quadratic least squares` / `Coefficient of determination shown for both` / `Scatter plot with the fitted curve`

**10 — Settings** (id `app-settings`, accent `#546E7A`, `APP 10`) — one placeholder
- **A12.1** sub: `Angle mode, precision, the theme, and the Wi-Fi setup that runs on the device itself.`
- shots: `settings-1` (image) · **placeholder** `settings-2` · `settings-3` (image)
- caps: `Degrees and radians` / `Six to twelve significant figures` / `NumOS and Casio themes` / `Wi-Fi provisioning from the device` / `Settings persist to flash`

**11 — Sequences** (id `app-sequences`, accent `#1B5E20`, `APP 07`) — 2 shots, no-claim block
- **A13.1** sub: `A two-sequence table.`
- shots (2, both present): `sequences-1` · `sequences-2`
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
- **A15.2** links: `Back to Home` → `/` `Browser Emulator` → `/emulator/` `Waitlist` → `/#waitlist`

---

## PART 3 — Emulator page

File: `public/emulator/index.html`

### Head + nav

- **E0.1** title: `WASM Emulator at absolut-CAS / NumOS`
- **E0.2** meta description: `Run NumOS in your browser: the real firmware compiled to WebAssembly, with the launcher, apps, CAS math and the Game Boy core.`
- **E1.1** brand: `absolut-CAS` + `WASM Emulator`
- **E1.2** links: `Overview` → `/#overview` · `Specs` → `/#specs` · `Features` → `/#features` **(dead anchor: no element on the landing page has `id="features"`)** · `Apps` → `/apps/`
- **E1.3** cta: `Back to Site` → `/`
- **E1.4** theme button: **empty in the HTML by design**, same contract as L1.4.

### Header

- **E1.5** label: `// INTERACTIVE BROWSER BUILD`
- **E1.6** h1: `NumOS Emulator`

**Retired:** `E1.7` subtitle (deleted 2026-10-05).

### Stage

[ART: the real `<numos-emulator>` custom element. It owns the canvas and the keypad;
`/assets/numos-loader.js` reads `emulator/numos/numos-assets.json` and imports the bundle.
`persistence="disabled"` so the preloaded MEMFS image (AI fixture + Game Boy ROMs) is not shadowed by
IDBFS. Nothing here is faked.]

- **E1.8** status line, while loading: `Loading NumOS…`
- **E1.9** status line, on ready: `NumOS is running in this browser.`

### Side card

[ART: card with **no heading** — the `What is running` h2 was deleted 2026-10-05, leaving two info
rows, the theme button and the waitlist link.]

- **E1.11** `Real firmware` / `The same C++ that runs on the board, compiled to WebAssembly. Not a JavaScript re-implementation.`
- **E1.12** `Launcher + apps` / `Calculation, Grapher, Equations, Statistics, Notes, the AI wrapper and more, all reachable from the launcher.`
- **E1.15** button: `Switch calculator theme` (disabled until the `numos-ready` event fires; calls the
  firmware's own theme toggle, not CSS)
- **E1.16** link button: `Join the Waitlist` → `/#waitlist`

**Retired:** `E1.10` h2 `What is running` · `E1.13` `AI, offline` row · `E1.14` `Themes` row.

### Footer

- **E1.17** brand: `absolut-CAS` + `© 2026 • Open Hardware Project`
- **E1.18** links: `Back to Home` → `/` `Waitlist` → `/#waitlist`

---

## PART 4 — 404 page

File: `public/404.html`

[ART: **restyled 2026-10-05.** The old markup used seven classes that did not exist in `site.css` and
rendered unstyled; it now uses the real site components (`#nav`, `.container`, `.section`,
`.section-heading`, `.prose-lead`, `.btn`, `.site-footer`) plus a brass `#ticker` bar. `_headers` serves
it with `max-age=0, must-revalidate`, and Cloudflare returns it for unknown paths with a real 404
status.]

- **N0.1** title: `404 at absolut-CAS` (`<meta name="robots" content="noindex">`)
- **N1.1** brand: `absolut-CAS` + `free | connected`
- **N1.2** links: `Front page` → `/`, `Emulator` → `/emulator/`
- **N1.3** theme button: **empty in the HTML by design**, same contract as L1.4.
- **N1.4** code: `404` (rendered as the `.section-heading`)
- **N1.5** body: `That path does not exist here. The front page is the whole site; the app gallery and the emulator are the two other pages. Nothing was lost: the board is at V2 and the copy is at launch, not at this address.`
- **N1.6** button: `Back to the front page` → `/`
- **N1.7** footer: brand `absolut-CAS` + `the people • 2026`; links `Front page`, `Emulator`
- **N1.8** ticker: `V1 board: keypad, math, boot, Wi-Fi, camera header all live`

---

## PART 5 — Open questions and flagged items

1. **The hero has no `<h1>` and no headline.** `/` is now the only page without an `<h1>` — a real
   SEO/accessibility gap. Say the word and I will draft one, or name the slot that should carry it.
2. **The ESP32-S3 spec vanished** with the old `COMPUTE & MEMORY` row. The landing page now names no
   processor, RAM or flash size anywhere, and L1.36 is a back-shell row carrying no technical claim.
3. **`(AI AGENT SKILLS COMING SOON)`** was marked against L1.43 in the previous revision and was *not*
   applied — I could not tell a note-to-self from copy to render. Still unresolved.
4. **`microSD Card Slot` (L1.39) contradicts the board.** The SD slot is DOA on v1 and everything
   user-writable lives in internal flash; the slot is a **v2** fix. Either the row gets a v2 qualifier or
   the page is making a claim the hardware cannot support at launch.
5. **The `$5` promo mechanism is undefined.** The banner is badge-only; the amount, the desc and the
   "first 200 people" cap are gone, so `EARLY BACKER BONUS` currently promises nothing specific. You
   said you would handle the mechanism.
6. **The 404 body says the board is at V2 while its own ticker says V1.** Carried over untouched.
7. **No `og:image` / `twitter:card`.** With no hero image on the landing page there is nothing obvious
   to point one at either.
8. **`Features` → `/#features` (E1.2) is a dead anchor.** The landing capability section is
   `#capabilities`, and the new `// HW Features` sub-head has no id of its own.
9. **Two orphaned images still deploy** and are fetched by nobody: `assets/img/fx82.jpg`,
   `assets/img/plate-ink-paper.jpg`.
10. **The success message no longer mentions the confirmation email** (L1.21), though the backend still
    performs a double opt-in.
11. **The nav label for `#specs` differs across pages** — `Hardware` on `/` and `/apps/`, `Specs` on
    `/emulator/`.
