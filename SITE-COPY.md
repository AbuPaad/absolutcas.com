# SITE COPY — absolutcas.com

Source of truth for every word that appears on the site, plus a slot-by-slot note of what graphic or
layout sits with it. Edit the prose freely in here; this file is what I regenerate the HTML from.

Created 2026-10-03. Companion to `DESIGN.md` and `PLAN.md` in `~/musings/absolutcas-design/`.

---

## How to use this file

**Slot IDs.** Every piece of copy has one (L1.1, L2.3, E1.4 …). If you just want one string changed,
say the ID. IDs are stable; line numbers are not.

**[ART] lines.** These say what graphic sits in that slot, where it comes from, and how it is treated
in CSS. If you want the graphic changed, write your instruction **inside** the bracket. If you want a
graphic *added* where there is none, the slot already exists and says `none` or `MISSING`.

**[MISSING].** A graphic that does not exist on disk yet. Nothing will appear there until you supply
it or ask for one. These are the real art gaps on the site.

**EDIT: lines.** Add one anywhere and I will treat it as a direct instruction for the slot above it.

I will not rewrite your copy unprompted. If a sentence reads badly I will flag it in PART 6, not
silently fix it.

---

## PART 0 — What is on disk

| Path | Role | Served? |
|---|---|---|
| `public/index.html` | **the file that is actually served at `/`** — still the "Hello, World!" placeholder | yes |
| `public/mockup/index.html` | the real landing page, full copy, currently living at `/mockup/` | at `/mockup/` |
| `public/mockup/demo.html` | the emulator page, JS stand-in, working buttons | at `/mockup/demo.html` |
| `public/404.html` | not-found page | on unknown paths |
| `public/_headers` | cache + security headers | config |
| `wrangler.jsonc` | Cloudflare Worker + asset config | config |

So: **the landing copy in PART 1 is not the page at your domain.** It is one directory down. The
swap is a one-line move once the copy is settled, and that is deliberate — no point publishing the
current wording.

### Art inventory

| Asset | Details |
|---|---|
| `public/mockup/assets/fx82.jpg` | 2300x3800 JPEG, 300 dpi, **2.87 MB**. The only image file on the whole site. CSS filter: `grayscale(1) invert(1) contrast(1.14) brightness(1.04)` + `mix-blend-mode: screen`. |
| keypad seal / 6x9 grid | **not an image** — drawn in CSS (`.padshell`, 36 divs). |
| LCD readout block | CSS (`.lcdblock` landing, `.screen` emulator). |
| scanline overlay | CSS, `body::after`, fixed, `pointer-events: none`. |
| **favicon** | MISSING — every visit 404s `/favicon.ico` |
| **social/OG image** | MISSING — no og:image, no twitter:card on any page |
| **board render or photo** | MISSING — nothing shows the actual v1 or v2 PCB anywhere on the site |
| **camera module photo** | MISSING — the OV2640 add-on is described in text only |

---

## PART 1 — Landing page

File: `public/mockup/index.html`

### Nav

[ART: none. Sticky bar, 56px, 2px solid paper bottom border, brand left / 5 links right. Links: Overview / Hardware / Emulator / Timeline / Waitlist. On mobile the whole link list is hidden — there is no menu behind it, so mobile has no navigation at all.]

- **L1.1** brand wordmark: `Absolut CAS **/ NUMOS**` — the `NUMOS` half is the green (`--lcd`) part
- **L1.2** link labels: `Overview` `Hardware` `Emulator` `Timeline` `Waitlist`

### Hero

[ART: right column, 0.9fr of a 1.35fr/0.9fr grid. `public/mockup/assets/fx82.jpg`, filtered to a floating object on ink. Capped at `min(44vh, 400px)`, `object-fit: contain`. Framed by a 1px rule with 10px padding.]
[ART-MISSING: this is the hero. A stock product photo of the donor is the weakest possible hero for a hardware project — no v1 board exists in any frame on this site.]

- **L1.3** eyebrow: `Donor: Casio fx-82`
- **L1.4** h1: `It's your Casio. It does more now.`
- **L1.5** lede: `A drop-in replacement board for the fx-82. Same shell, same keys, a computer inside.`
- **L1.6** button 1 (solid): `Join the waitlist`
- **L1.7** button 2: `Run the emulator`
- **L1.8** caption left: `Donor unit`
- **L1.9** caption right: `fx-82 / fx-991 family`
- **L1.10** image alt text: `A Casio fx-82 scientific calculator, the donor device for NumOS`

### Telemetry strip

[ART: none. Full-bleed dark band, 2px paper borders, 11px uppercase. `+` prefixes in LCD green, `!` prefix in hazard red. This is the one place red is allowed and it means the dead screen.]

- **L1.11** `V1 BOARD`
- **L1.12** green: `Keypad` `Math` `Boot` `Wi-Fi` `Camera header`
- **L1.13** red: `Display`

### What it is

[ART: two-column split, 1.3fr/0.9fr, 1px gap showing the line colour through, bordered. Left = big statement + paragraph. Right = 4-row definition list, label column 78px.]

- **L1.14** section label (renders as `[ What it is ]`): `What it is`
- **L1.15** big statement: `Exam-legal machines are slow by rule, not by physics.`
- **L1.16** paragraph: `An exam-approved calculator is deliberately held back, because the rules require it. NumOS sits in the gap: the ergonomics and muscle memory of a calculator, without the artificial ceiling. You keep the device you already know and swap the board underneath it.`
- **L1.17** row 1 — label `Shell` / `Stock Casio. The board and the screen come out, the shell stays.`
- **L1.18** row 2 — label `Keypad` / `6 by 9 matrix on a TCA9555 over I2C. The legend follows the fx-82 closely on purpose.`
- **L1.19** row 3 — label `Firmware` / `A fork of NeoCalculator that diverges freely. On-device OTA is the target.`
- **L1.20** row 4 — label `Promise` / `No date is promised. The hardware is not finished and will not be rushed.`

### Hardware

[ART: none. 3x2 card grid, 1px gaps, featherweight borders. Each card: 10.5px uppercase key, then a grotesque value, then a small description. On mobile 2 columns, then 1 below 520px.]
[ART-MISSING: a pinout diagram, a board layout shot, or the 6x9 keypad legend scan would all fit here and none exist.]

- **L1.21** label `Hardware`
- **L1.22** card 1: `Processor` / `ESP32-S3` / `N16R8 module. 16 MB flash, 8 MB PSRAM.`
- **L1.23** card 2: `Keypad` / `6 x 9 matrix` / `Scanned through a TCA9555 I2C expander.`
- **L1.24** card 3: `Display` / `ILI9341` / `320 x 240 glass. Fitted canvas 320 x 156 at offsetY +54.`
- **L1.25** card 4: `Power` / `Li-ion + USB-C` / `Charges in the shell. Runs untethered.`
- **L1.26** card 5: `Storage` / `microSD` / `For ROMs, notes and settings.`
- **L1.27** card 6: `Radio` / `Wi-Fi` / `Device-hosted hotspot for setup. OTA over the air.`

### Emulator

[ART: right column 1.15fr of a 0.85fr/1.15fr row. Left = heading + paragraph + button. Right = a CSS LCD bar (`NUMOS 320x156` / `READY`) above a 6-column CSS keypad of 36 fake keys, non-interactive, three keys tinted green (SHIFT, ALPHA, AC).]
[ART: the keypad here is decorative only — it is not wired to anything and is not the demo. The working keypad is on the demo page.]

- **L1.28** label `Emulator`
- **L1.29** h2: `The whole device, in a browser.`
- **L1.30** paragraph: `The device core compiles to WebAssembly and runs on a canvas, with the keypad as real buttons beside it. Nothing to install, no account, no key.`
- **L1.31** button: `Open the emulator`
- **L1.32** LCD bar left: `NUMOS 320x156`
- **L1.33** LCD bar right: `READY`
- **L1.34** the 36 decorative key labels (row by row): `SHIFT ALPHA MODE ON DEL AC` / `x y sin cos tan log` / `7 8 9 ( ) ANS` / `4 5 6 x / %` / `1 2 3 + - =` / `0 . , pi e 10^x`. **Note these do not match the real working keypad on the demo page** — different keys, different order, and `x` appears twice in different meanings.

### Where it goes

[ART: same two-column split as "What it is". No graphic.]

- **L1.35** label `Where it goes`
- **L1.36** big statement: `One board fits the whole family.`
- **L1.37** paragraph: `Casio streamlined and regionalised its line, so the fx-82 and fx-991 variants are close enough mechanically and electrically that a single board covers them. That is where the drop-in claim gets its leverage.`
- **L1.38** row `Family` / `fx-82 and fx-991 variants share the board.`
- **L1.39** row `Installed` / `Roughly 350 million devices in the serviceable market.`
- **L1.40** row `Build cost` / `About $25 per unit at a 50 unit order.`
- **L1.41** row `Kit target` / `Around $65, donor device not included.`
- **L1.42** row `Channel` / `CrowdSupply runs the campaign, the payment and the shipping.`

### Timeline

[ART: none. Rows, 150px / 1fr / 210px. Phase name left in grotesque caps, paragraph middle, status right in uppercase (green = done, red = alert, silver = plain).]

- **L1.43** label `Timeline`
- **L1.44** row `V1 board` / `Ordered, built and partly tested. Keypad, math, boot, Wi-Fi and the camera header all work. The display connection is dead on arrival. That is the one defect that matters.` / status `Built / display DOA` (green)
- **L1.45** row `V2 board` / `The display fix. Paadshi's own estimate is about a month, and it is an estimate, not a commitment. The v2 bar for done is narrow: screen works, keypad works, it boots, the camera header is sound.` / status `About a month, estimated`
- **L1.46** row `Camera` / `An OV2640 over SCCB on a magnetic pogo-pin header, so the module can only mate the right way. Sold as an add-on, never bundled.` / status `Header already on v1`
- **L1.47** row `Campaign` / `CrowdSupply, pre-launch. This list exists to get you the launch mail, nothing else.` / status `Not scheduled`
- **L1.48** row `Ship` / `Measured against the closest funded play, OpenMote, which raised about $125k from roughly 885 backers and ships in February 2027.` / status `No date promised`

### Waitlist

[ART: none. Two columns 0.9fr/1.1fr in a 2px paper border — the heaviest frame on the page, so it reads as the primary action. Form: email field (16px font so iOS does not zoom) + solid button + helper line. Also the only `input` on the site.]

- **L1.49** label `Waitlist`
- **L1.50** h2: `Get the launch mail.`
- **L1.51** paragraph: `One field. No account, no payment, no newsletter. CrowdSupply handles checkout when the campaign opens, and this list only tells you it opened.`
- **L1.52** field label: `Email address`
- **L1.53** placeholder: `you@example.com`
- **L1.54** button: `Join the waitlist`
- **L1.55** helper: `Double opt-in. One mail to confirm, then nothing until launch.`
- **L1.56** the form does not submit anywhere. On submit it replaces the helper text with `Static mockup. This form is not wired to a backend yet.` — **that string must not ship.**

### Footer

[ART: none. Dark band, three spans spaced out.]

- **L1.57** `Absolut CAS / NumOS`
- **L1.58** `Static mockup, not the live site` — **must not ship**
- **L1.59** link `Emulator`

---

## PART 2 — Emulator page

File: `public/mockup/demo.html`

### Header

[ART: none. A red-bordered flag pill above the h1 — the only hazard-red element on this page.]

- **E1.1** flag: `JS stand-in. WASM build pending.`
- **E1.2** h1: `Emulator`
- **E1.3** paragraph: `The shipping build is the device core (SDL2 and LVGL) compiled to WebAssembly and drawn to a canvas, with the keypad as real buttons beside it. What runs here is a plain JavaScript stand-in of the same interface, so the layout and the key map can be judged before the WebAssembly port lands. The buttons really work.`

### Stage — the device

[ART: left column 1.15fr. A CSS LCD screen at `aspect-ratio: 320/156`, LCD green fill, 2px darker border, expression right-aligned and small above a huge result. Below it a status line, then a real 6-column / 6-row keypad of **working** buttons. 46px tall, 44px on mobile. Below the whole thing a status text line.]
[ART-MISSING: the screen is a CSS div, not a canvas. When the real build lands this is a `<canvas>`; nothing about the current look is a rendering of the actual device output.]

- **E1.4** screen top left: `NUMOS`
- **E1.5** screen top right (dynamic): `READY`
- **E1.6** the expression line (dynamic, starts blank)
- **E1.7** the result line (dynamic, starts at `0`)
- **E1.8** status line, default: `Canvas 320 x 156. Transport: replay fixture.`

**The real keypad labels, in order** (these are the true 6x9 legend, unlike the decorative grid on the landing page):

    SHIFT  ALPHA  MODE   ON     DEL    AC
    sin(   cos(   tan(   log(   ln(    x^y
    x^2    sqrt(  (      )      pi     e
    7      8      9      /      1/x    nCr
    4      5      6      *      x!     M+
    1      2      3      -      ,      S-D
    0      .      +/-    +      ANS    =

- **E1.9** SHIFT, ALPHA, MODE, ON, nCr, x!, M+ and S-D are **not implemented** — pressing one prints `Not built in the stand-in: <KEY>.`

### Stage — the side panel

[ART: none. Right column 0.85fr. Heading + 5 label/value rows + a closing note paragraph.]

- **E1.10** heading: `What this is`
- **E1.11** `Screen` / `320 x 156 fitted canvas, the same geometry the device draws into.`
- **E1.12** `Keypad` / `6 by 9 matrix. Keyboard works on desktop: digits, operators, Enter, Backspace, Escape.`
- **E1.13** `Math` / `Handled by a small local evaluator. The device routes this to the CAS.`
- **E1.14** `AI arm` / `Runs on a recorded fixture. No key, no network, no cost.`
- **E1.15** `Not built` / `SHIFT, ALPHA, MODE, ON, nCr, x!, M+ and S-D are placeholders in the stand-in.`
- **E1.16** note: `The real page lazy-loads the WebAssembly bundle only when you reach this section, and it runs the emulator loop in a worker so the page never stutters. Neither is wired up in the stand-in.`

### Footer

- **E1.17** `Absolut CAS / NumOS`
- **E1.18** `Static mockup, not the live site` — **must not ship**
- **E1.19** link `Back to overview`

### Runtime strings (printed into the status line, not in the layout)

These appear only after interaction:

- `Cleared.`
- `That expression is not handled by the stand-in evaluator.`
- `Syntax error. Check the brackets.`
- `Result is not a finite number.`
- `Evaluated locally. On the device this goes to the CAS.`
- `Not built in the stand-in: <KEY>.`

---

## PART 3 — 404 page

File: `public/404.html`

[ART: none. Centred, minimal, different visual language from the rest of the site.]

- **L3.1** page title: `404 — Absolut CAS` *(contains a banned em-dash)*
- **L3.2** h1: `404`
- **L3.3** paragraph: `That page doesn't exist here.` — and nothing else. **No link back to the site.** That is a dead end for a visitor and a broken error state.

---

## PART 4 — The placeholder actually at the root

File: `public/index.html`

Still the scaffold. Everything on it goes away:

- `Hello, World!`
- `This is absolutcas.com — a static site served from GitHub Pages.` *(contains a banned em-dash, and it is now a lie — the host is Cloudflare)*
- footer `Absolut CAS`
- meta description `Absolut CAS — hello, world.` *(banned em-dash)*

**Recommendation:** this file should become the content of PART 1, and the mockup copy should stop
living under `/mockup/`. Say the word and I will do the move once you are happy with the wording.

---

## PART 5 — Problems independent of tone

These are mechanical, not taste:

1. **Three names for one product on one page**: `Absolut CAS`, `NUMOS`/`NumOS`, and `absolutcas.com`. The nav brand reads `Absolut CAS / NUMOS`. Pick one wordmark and one project name and I will apply it everywhere.
2. **The keypad is described two different ways.** The landing page draws 36 keys; the demo page draws a different 36. The landing one is wrong.
3. **`The device core compiles to WebAssembly…` is present tense about something not built.** `emcc` is not installed on this machine and `out/wasm` does not exist, so the bundle has never been produced, let alone run in a browser. On a page whose whole credibility is "we tell you the truth about the v1 display", this is the sentence that costs you. It is the same class of error as a wrong number in a spec table.
4. **Banned em-dashes** in `public/index.html` (2) and `public/404.html` (1). The mockup pages are clean. Your own rule; one grep catches it.
5. **`Installed: roughly 350 million devices`** is the one number on the page with no visible source. Everything else is a spec or your own cost figure.
6. **`$25 build cost` and `$65 kit target`** are your numbers and they move with order size. Fine on the page, but they are the two that will be quoted back at you.
7. **The `OpenMote raised about $125k from roughly 885 backers` line** sits on a row labelled `Ship`, where it does not answer the question the row asks.
8. **No mobile navigation.** Below 860px the nav list is `display: none` with no replacement.
9. **The hero image is 2.87 MB** and then gets inverted in CSS. It is by far the heaviest thing on the site and it is a photo of a stock calculator.
10. **No favicon, no og:image, no canonical, no `twitter:card`.** Shape: every page currently shares no card when someone pastes the link.
11. **Page titles are inconsistent**: `NUMOS / ABSOLUT CAS` vs `Emulator / NUMOS` vs `404 — Absolut CAS`.

---

## PART 6 — Sentences I would cut, and why

You asked for the salesy ones. These are the specific offenders, quoted, with the reason. Judge them
yourself; I am not touching any of them until you say so.

| Slot | Text | Why it reads fake |
|---|---|---|
| L1.15 | `Exam-legal machines are slow by rule, not by physics.` | An aphorism. Nobody sells a calculator by explaining the exam regulations back to the person who is subject to them. Also it is an argument, not a fact. |
| L1.16 | `NumOS sits in the gap…` / `without the artificial ceiling` | "Sits in the gap" is consultancy language. "Artificial ceiling" restates L1.15 more grandly. The last sentence (`You keep the device you already know and swap the board underneath it.`) does the whole job on its own. |
| L1.20 | label `Promise` + `will not be rushed` | A row labelled Promise whose content is a disclaimer. "Will not be rushed" is you arguing with a customer who has not complained yet. |
| L1.37 | `That is where the drop-in claim gets its leverage.` | "Leverage" is a business word. You are describing your marketing position to the reader. |
| L1.39 | `Roughly 350 million devices in the serviceable market.` | "Serviceable market" is a deck word on a product page. |
| L1.44 | `That is the one defect that matters.` | The honesty is good and rare. The editorialising is not needed; `the display connection is dead on arrival` already lands. |
| L1.47 | `This list exists to get you the launch mail, nothing else.` | Protesting too much. Same as L1.51's `No account, no payment, no newsletter` — pick one place for that reassurance, not two. |
| L1.58 / E1.18 | `Static mockup, not the live site` | Fine as a working note, fatal as shipped copy. It tells a first visitor the site is fake. |
| E1.3 | `so the layout and the key map can be judged before the WebAssembly port lands` | Internal process. The reader does not need your build order. |
| E1.3 | `The buttons really work.` | Defensive. Implies you expected them not to. Just let them work. |
| E1.13 | `Handled by a small local evaluator.` | "Small" undersells the one thing that page is demonstrating. |
| E1.14 | `No key, no network, no cost.` | "No cost" is about your bill, not the reader's. |
| E1.16 | whole paragraph | Build-process narration (lazy-loading, workers) on a public page. It is an engineering note, not copy. |

What is already working and I would leave alone: L1.4 (`It's your Casio. It does more now.`), the
telemetry strip, L1.44's first half, L1.46 (the pogo-pin detail is real and specific), L1.30's
`Nothing to install, no account, no key.`, and the whole `Not built` row on the demo page. Those read
like a person wrote them.

---

## Open questions for you

1. One wordmark: `NumOS` or `Absolut CAS`?
   1. Its absolut-CAS for now. 
2. `www` — is it redirecting to the apex, or its own thing?
   1. www.absolutcas.com is the landing page 
3. Is the OpenMote comparison staying at all, or was that a note to yourself that escaped into the page?
   1. note to myself. to the end user its completely irrelevant
4. Do you want the landing page to carry a board photo/render before launch, or is that deliberately held?
   1. for now ima keep strictly to gifs/screenshots of the software and the front side of da casio
