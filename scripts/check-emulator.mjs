#!/usr/bin/env node
/* Headless smoke check for the /emulator/ page.
 *
 * Loads the page in headless Chrome, waits for the real NumOS runtime, checks
 * the boot theme and the launcher, optionally clicks Restart, and captures a
 * screenshot. Exits non-zero on failure so it can gate a deploy.
 *
 * Usage:
 *   node scripts/check-emulator.mjs [--url http://127.0.0.1:8848/emulator/]
 *
 * Environment:
 *   CHROME   path to a Chrome/Chromium binary (auto-detected otherwise)
 *   URL      page under test (default: http://127.0.0.1:8848/emulator/)
 *   SHOT     screenshot output path (default: ./emulator-check.png)
 *   RESTART  set to 1 to click Restart after boot and wait for ready again
 *
 * The site must already be served (python3 -m http.server, wrangler dev, ...).
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const URL = flag("--url") || process.env.URL || "http://127.0.0.1:8848/emulator/";
const SHOT = process.env.SHOT || resolve(process.cwd(), "emulator-check.png");
const PORT = Number(process.env.PORT || 10900);
const PROFILE = process.env.PROFILE || "/tmp/opencode/paadweb-check-profile";
const RESTART = process.env.RESTART === "1";

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const candidates = [
    `${process.env.HOME}/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`,
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  const found = candidates.find((p) => p && existsSync(p));
  if (!found) throw new Error("no Chrome found; set CHROME=/path/to/chrome");
  return found;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(findChrome(), [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  "--window-size=1920,1080", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`, "about:blank",
], { stdio: "ignore" });

async function devtools() {
  for (let i = 0; i < 100; i += 1) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) return r.json(); } catch {}
    await sleep(100);
  }
  throw new Error("Chrome devtools endpoint never came up");
}

const version = await devtools();
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let nextId = 0; const pending = new Map(); const consoleLines = []; let sessionId = null;
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve: rs, reject } = pending.get(msg.id); pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : rs(msg.result); return;
  }
  if (msg.method === "Runtime.consoleAPICalled") {
    const text = msg.params.args.map((a) => a.value ?? a.description ?? "").join(" ");
    consoleLines.push(text);
  }
  if (msg.method === "Runtime.exceptionThrown") {
    consoleLines.push("[exception] " + (msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text));
  }
};
function send(method, params = {}, secure = true) {
  const id = ++nextId; const payload = { id, method, params };
  if (secure) payload.sessionId = sessionId;
  return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); ws.send(JSON.stringify(payload)); });
}
async function evaluate(expression) {
  const res = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.text + " " + (res.exceptionDetails.exception?.description || ""));
  return res.result.value;
}
async function waitReady(timeout = 90000) {
  const end = Date.now() + timeout; const seen = [];
  while (Date.now() < end) {
    const state = await evaluate(`document.querySelector('numos-emulator')?.state || 'missing'`);
    seen.push(state);
    if (state === "ready") return { ok: true, seen };
    if (state === "error") return { ok: false, seen };
    await sleep(400);
  }
  return { ok: false, seen, reason: "timeout" };
}

const { targetId } = await send("Target.createTarget", { url: URL }, false);
({ sessionId } = await send("Target.attachToTarget", { targetId, flatten: true }, false));
await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });

try {
  const boot = await waitReady();
  const diagnostic = await evaluate(
    `(() => { try { return document.querySelector('numos-emulator')?.diagnosticState() ?? null; } catch (e) { return null; } })()`);
  const layout = await evaluate(`(() => {
    const sr = document.querySelector('numos-emulator').shadowRoot;
    const c = sr.querySelector('canvas');
    const r = (el) => { const b = el.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height) }; };
    return { canvasBacking: c ? [c.width, c.height] : null, canvasCss: c ? r(c) : null, shell: r(sr.querySelector('.shell')), docH: document.documentElement.scrollHeight };
  })()`);
  const shot = await send("Page.captureScreenshot", { format: "png" });
  await writeFile(SHOT, Buffer.from(shot.data, "base64"));

  let restart = null;
  if (RESTART && boot.ok) {
    await evaluate(`(() => { const sr=document.querySelector('numos-emulator').shadowRoot; sr.querySelector('[data-action="restart"]').click(); return true; })()`);
    restart = await waitReady();
  }

  const themeLine = consoleLines.find((l) => l.includes("[THEME]")) || null;
  const errors = consoleLines.filter((l) => l.includes("[exception]"));
  const aspectOk = layout.canvasBacking?.[0] === 320 && layout.canvasBacking?.[1] === 156;
  const ok = boot.ok && diagnostic?.ctxSlug === "menu" && aspectOk && errors.length === 0 && (!restart || restart.ok);

  console.log(JSON.stringify({
    ok,
    boot,
    restart,
    theme: themeLine,
    app: diagnostic?.app,
    ctxSlug: diagnostic?.ctxSlug,
    logical: diagnostic ? [diagnostic.logicalWidth, diagnostic.logicalHeight] : null,
    layout,
    aspectOk,
    errors,
    screenshot: SHOT,
  }, null, 2));
  chrome.kill("SIGKILL");
  process.exit(ok ? 0 : 1);
} catch (error) {
  chrome.kill("SIGKILL");
  console.error(String(error?.stack || error));
  process.exit(1);
}
