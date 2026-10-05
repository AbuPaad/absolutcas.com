#!/usr/bin/env node
/* Sync the built NumOS WASM package into the static site.
 *
 * Source of truth: AbsolutOS wasm/build.sh Release -> out/wasm/dist/release/.
 * That directory is content-addressed (numos-assets.json + hashed siblings),
 * which is why the site's loader reads the manifest instead of hardcoding a
 * filename. This script only copies; it never rewrites the package.
 *
 * Usage:
 *   node scripts/sync-numos-wasm.mjs [sourceDir]
 *
 * Default sourceDir:
 *   ../Absolut-CAS/firmware/AbsolutOS/out/wasm/dist/release
 */

import { cp, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destination = join(siteRoot, "public", "emulator", "numos");
const defaultSource = resolve(
  siteRoot, "..", "Absolut-CAS", "firmware", "AbsolutOS",
  "out", "wasm", "dist", "release",
);
const source = resolve(process.argv[2] || defaultSource);

async function main() {
  try {
    await stat(join(source, "numos-assets.json"));
  } catch {
    throw new Error(`no numos-assets.json in ${source} - build first: wasm/build.sh Release`);
  }

  await rm(destination, { recursive: true, force: true });
  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });

  const manifest = JSON.parse(
    await readFile(join(destination, "numos-assets.json"), "utf8"));
  const files = await readdir(destination);
  let total = 0;
  for (const file of files) {
    total += (await stat(join(destination, file))).size;
  }

  const wasm = manifest.assets?.wasm;
  if (!wasm) throw new Error("manifest has no wasm asset");
  if (wasm.bytes > 25 * 1024 * 1024) {
    throw new Error(`wasm is ${wasm.bytes} bytes, over the 25 MiB Workers limit`);
  }
  if (manifest.build?.pthreads) {
    throw new Error("pthreads build cannot be served without COOP/COEP");
  }

  console.log(JSON.stringify({
    source,
    destination,
    files: files.length,
    totalBytes: total,
    wasmBytes: wasm.bytes,
    buildIdentity: manifest.build?.identity,
    emscriptenVersion: manifest.build?.emscriptenVersion,
  }, null, 2));
}

main().catch((error) => {
  console.error(`[sync-numos-wasm] ${error.message}`);
  process.exit(1);
});
