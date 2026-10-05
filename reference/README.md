# absolutcas.com

Static site for [absolutcas.com](https://absolutcas.com), served by **Cloudflare Workers
Static Assets** out of the `AbuPaad/absolutcas.com` repo.

No build step, no framework, no server code. Plain HTML in `public/`, deployed with Wrangler.

## Layout

    public/                      <- the asset directory; everything here is served
      index.html                 <- the front page (v2 layout: left panel, right panel, ticker)
      404.html                   <- used for unknown paths (not_found_handling: 404-page)
      _headers                   <- custom response headers (Cloudflare-only feature)
      assets/
        site.css                 <- tokens, split layout, every section, both themes
        site.js                  <- theme toggle, panel scroll, reveal, ticker, waitlist form, devlog
        numos-loader.js          <- reads the WASM manifest and imports the shell
        fonts/                   <- Geist Mono 300/400/700 + Instrument Serif, self-hosted (OFL)
        img/plate-ink-paper.jpg  <- the S2 plate, 840px export
        img/fx82.jpg             <- donor photo, currently unreferenced
      emulator/index.html        <- /emulator/ - embeds the real <numos-emulator> WASM
      emulator/numos/            <- the built NumOS WASM package (generated, see below)
    wrangler.jsonc               <- Worker name, assets dir, routing
    scripts/sync-numos-wasm.mjs  <- copies the built WASM package into public/
    CNAME, .nojekyll             <- inert GitHub Pages leftovers, kept for rollback

## The WASM emulator

`/emulator/` runs the real NumOS firmware, compiled to WebAssembly, inside the
`<numos-emulator>` custom element. Nothing about it is a JavaScript stand-in.

The build lives in the firmware repo, not here:

    # Absolut-CAS/firmware/AbsolutOS
    source ~/emsdk/emsdk_env.sh
    wasm/build.sh Release          # -> out/wasm/dist/release/

Then sync it into the site and preview:

    node scripts/sync-numos-wasm.mjs     # copies out/wasm/dist/release -> public/emulator/numos
    npx wrangler@latest dev

The package is **content-addressed**: every asset filename carries a hash of
its own bytes, and `numos-assets.json` is the manifest. `numos-loader.js`
imports the shell the manifest points at, so no hashed filename is ever
hardcoded here. `_headers` caches the whole directory immutably.

The build boots the launcher in the **Casio** theme (`NUMOS_BOOT_THEME_CASIO=1`
in `wasm/CMakeLists.txt`). The calculator theme is switched *inside the
firmware*: both the component's own "Switch theme" button and the page button
call `toggleTheme()`, which sends the reserved `ALPHA`+`AC` hotkey through the
logical-key ABI — there is no CSS theme hack and no second code path.

The v1 landing page (`public/mockup/`) was deleted in the v2 build, which supersedes it.
Copy and slot ids for every string on the page live in
`~/musings/absolutcas-design/v2-mbd/SITE-COPY-v2.md`; the HTML carries the same ids in comments.

### Copy slot ids on the page

Every string from that file carries `data-slot="<ID>"` in the markup and CSS renders the id as a
brass badge beside it, so the page shows its own slot map. The `ids` button in the nav hides them
(persisted in localStorage) when you want a clean screenshot. To change one string: find its id on
the page, find the same id in `SITE-COPY-v2.md`, change it in both.

Assets deliberately live in `public/`, not the repo root. With the root as the asset directory,
Wrangler writes `.wrangler/` inside the directory it is watching and reload-loops forever, and
`.git/` stays excluded only by an ignore rule. A separate directory makes both moot.

## Deploy

    npx wrangler@latest deploy --dry-run     # validate; needs no auth
    npx wrangler@latest dev                  # local preview on 127.0.0.1:8787
    npx wrangler@latest deploy               # ship it

The first deploy serves on `absolutcas-com.<account>.workers.dev`. Pointing `absolutcas.com` at it
is a separate, deliberate step: uncomment the `routes` block in `wrangler.jsonc`, redeploy, then
remove the other Worker that currently owns the hostname.

## Behaviour that differs from GitHub Pages

- `/foo.html` **307-redirects to `/foo`** (Cloudflare HTML handling). Link the extensionless form.
- `/dir/` serves `dir/index.html`, same as before.
- Unknown paths serve `404.html`, but note it only applies to *navigation* requests.
- `_headers` is live: cache policy and security headers are set per path.
