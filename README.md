# absolutcas.com

Static site for [absolutcas.com](https://absolutcas.com), served by GitHub Pages.

Plain HTML — no build step, no framework, no server code. Push to `main` and GitHub Pages serves the repository root.

## Files

- `index.html` — the front page
- `404.html` — custom not-found page
- `CNAME` — tells GitHub Pages this repo owns `absolutcas.com`

## DNS

`absolutcas.com` must resolve to GitHub Pages:

- `A` records for the apex (GitHub's four IPs), and
- `CNAME` `www` → `abupaad.github.io`

If the domain is proxied through Cloudflare, the records must be **DNS only** (grey cloud) or Pages cannot validate the domain.
