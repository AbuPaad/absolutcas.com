#!/usr/bin/env python3
"""
Sync emulator captures into the website.

Source:  <firmware>/out/shots-<slug>-<n>.ppm      (written by tests/emulator/scripts/screenshots/*.numos)
Target:  paadweb/public/assets/img/apps/<name>-<n>.webp   (the exact paths apps/index.html asks for)

The website is the source of truth for the filenames: this reads them out of
public/apps/index.html rather than hardcoding a list.

  ./sync-app-shots.py            # report only
  ./sync-app-shots.py --swap     # also rewrite the page so shots that exist render as <img>

Frames are 320x156 (the fitted LVGL canvas), upscaled 2x with nearest-neighbour to match the
emulator's own integer 2x window, then encoded lossless WebP.
"""
import argparse, hashlib, os, re, subprocess, sys, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
PAGE = os.path.join(SITE, 'public', 'apps', 'index.html')
IMGDIR = os.path.join(SITE, 'public', 'assets', 'img', 'apps')
FIRMWARE = os.environ.get('NUMOS_REPO', '/home/fih/musings/Absolut-CAS/firmware/AbsolutOS')
OUTDIR = os.path.join(FIRMWARE, 'out')

SLUG = {'Calculation':'calculation','Grapher':'grapher','Equations':'equations','Calculus':'calculus',
'Statistics':'statistics','Probability':'probability','Regression':'regression','Sequences':'sequences',
'Python':'python','Matrices':'matrices','Settings':'settings','Chemistry':'chemistry','Bridge':'bridge',
'Circuit':'circuit','Fluid 2D':'fluid2d','ParticleLab':'particlelab','Neural Lab':'neurallab',
'OpticsLab':'opticslab','NeoLang':'neolang','Fractals':'fractals','Game Boy':'gameboy','AI':'ai'}


def plates(html):
    """[(app name, [ (shot_index, website_relpath) ])] in page order."""
    out = []
    for b in re.findall(r'<article class="app-plate" id="[^"]+"[\s\S]*?</article>', html):
        name = re.search(r'<h2>(.*?)</h2>', b).group(1).strip()
        imgs = re.findall(r'class="shot-frame"[^>]*data-img="([^"]+)"', b)
        out.append((name, list(enumerate(imgs, 1))))
    return out


def encode(src, dst):
    tmp = os.path.join(os.path.dirname(dst), '.' + os.path.basename(dst) + '.tmp.webp')
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-i', src,
           '-vf', 'scale=640:312:flags=neighbor',
           '-c:v', 'libwebp', '-lossless', '1', '-compression_level', '6', tmp]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0 or not os.path.exists(tmp):
        if os.path.exists(tmp):
            os.remove(tmp)
        raise RuntimeError(f"ffmpeg failed for {os.path.basename(src)}: {r.stderr.strip()[:200]}")
    os.replace(tmp, dst)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--swap', action='store_true', help='rewrite the page to render existing shots as <img>')
    a = ap.parse_args()

    html = open(PAGE, encoding='utf-8').read()
    os.makedirs(IMGDIR, exist_ok=True)

    # Content-identity guard. A capture whose bytes also appear under a DIFFERENT app is not that
    # app's screen: it is a leftover from another session that got renamed into place. This has
    # already happened once (out/shots-neurallab-* matched ai_ask.ppm and a file literally named
    # particlelab-diag-blocked-launcher.ppm). Same-app repeats are fine; cross-app ones are not.
    seen = {}
    for name, shots in plates(html):
        s = SLUG.get(name)
        for n, rel in shots:
            p = os.path.join(OUTDIR, f'shots-{s}-{n}.ppm') if s else None
            if p and os.path.exists(p):
                seen.setdefault(hashlib.md5(open(p, 'rb').read()).hexdigest(), []).append(f'{name} #{n}')

    have, missing, failed, suspected = [], [], [], []
    for name, shots in plates(html):
        s = SLUG.get(name)
        for n, rel in shots:
            dst = os.path.join(SITE, 'public', rel.lstrip('/'))
            src = os.path.join(OUTDIR, f'shots-{s}-{n}.ppm') if s else None
            if os.path.exists(dst):
                have.append((name, n, rel, 'already built'))
                continue
            if not src or not os.path.exists(src):
                missing.append((name, n, rel, None if s else 'no slug'))
                continue
            dup = seen.get(hashlib.md5(open(src, 'rb').read()).hexdigest(), [])
            if len(dup) > 1:
                suspected.append((name, n, dup))
                continue
            try:
                encode(src, dst)
                have.append((name, n, rel, 'encoded'))
            except Exception as e:
                failed.append((name, n, rel, str(e)))

    print(f"{'app':14} {'#':>2}  {'status':13} file")
    for name, n, rel, how in have:
        print(f"{name:14} {n:>2}  {how:13} {os.path.basename(rel)}")
    print()
    print(f"have={len(have)}  missing={len(missing)}  failed={len(failed)}  suspected_fake={len(suspected)}")
    if suspected:
        print("\nREFUSED - same bytes also appear under another app (likely a renamed leftover):")
        for name, n, dup in suspected:
            print(f"  {name} shot {n}: identical to {', '.join(dup)}")
    if missing:
        print("\nnot captured yet:")
        for name, n, rel, why in missing:
            print(f"  {name:14} shot {n}  {os.path.basename(rel)}{'  ('+why+')' if why else ''}")
    if failed:
        print("\nencode failures:")
        for name, n, rel, err in failed:
            print(f"  {name} shot {n}: {err}")

    if a.swap:
        new = swap(html, have)
        if new != html:
            open(PAGE, 'w', encoding='utf-8').write(new)
            print(f"\npage rewritten: {len(have)} shots now render as <img>")
        else:
            print("\npage already in sync, nothing to rewrite")
    return 0 if not failed else 1


def swap(html, have):
    """Replace the placeholder inside each .shot-frame that has a real image."""
    ready = {(n, os.path.basename(r)) for _, n, r, _ in have}

    def do_plate(m):
        block = m.group(0)
        def do_frame(fm):
            frame = fm.group(0)
            img = re.search(r'data-img="([^"]+)"', frame)
            if not img:
                return frame
            base = os.path.basename(img.group(1))
            if not any(b == base for _, b in ready):
                return frame
            alt = re.search(r'class="shot-desc">(.*?)\s*<span class="shot-path">', frame, re.S)
            alt = re.sub(r'\s+', ' ', alt.group(1)).strip() if alt else base
            return (f'<div class="shot-frame" data-img="{img.group(1)}">'
                    f'<img src="{img.group(1)}" alt="{alt}" loading="lazy" decoding="async">'
                    f'</div>')
        return re.sub(r'<div class="shot-frame"[^>]*>[\s\S]*?</div>', do_frame, block)

    return re.sub(r'<article class="app-plate" id="[^"]+"[\s\S]*?</article>', do_plate, html)


if __name__ == '__main__':
    sys.exit(main())
