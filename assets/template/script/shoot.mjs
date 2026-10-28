// Takes sharp screenshots of a running website for the film, following
// script/shots.json, with the Chrome that Remotion downloads (no extra browser).
// Writes public/shots/<name>.png at twice the window size, and public/shots/index.json
// with each window size in CSS pixels, which src/components/screenshot.tsx reads.
// Usage: npm run shoot        (see references/screenshots.md)
import { ensureBrowser } from "@remotion/renderer";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { root, film } from "./load-timing.mjs";

const plan = JSON.parse(readFileSync(path.join(root, "script", "shots.json"), "utf8"));
if (!plan.sequences?.length) {
  console.log("script/shots.json has no sequences; nothing to shoot");
  process.exit(0);
}
let puppeteer;
try {
  puppeteer = (await import("puppeteer-core")).default;
} catch {
  throw new Error("puppeteer-core is missing; run npm install");
}

// The Chrome Remotion uses: download it if this is the first run, then find it.
await ensureBrowser();
const find = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) {
      const hit = find(p);
      if (hit) return hit;
    } else if (/^chrome-headless-shell(\.exe)?$/.test(f)) return p;
  }
  return null;
};
const exe = find(path.join(root, "node_modules", ".remotion"));
if (!exe) throw new Error("Chrome of Remotion not found under node_modules/.remotion");

const outDir = path.join(root, "public", "shots");
mkdirSync(outDir, { recursive: true });
const indexFile = path.join(outDir, "index.json");
const index = JSON.parse((() => { try { return readFileSync(indexFile, "utf8"); } catch { return "{}"; } })());
// The page shows in the film's spoken language (a Dutch film gets a Dutch page and overlay).
const lang = plan.language ?? film.languages?.[0] ?? "en";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const PHONE = { width: 390, height: 716 };
const PHONE_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: [`--lang=${lang}`] });
for (const seq of plan.sequences) {
  const page = await browser.newPage();
  const view = seq.phone ? PHONE : { width: seq.width ?? 1440, height: seq.height ?? 900 };
  await page.setViewport({ ...view, deviceScaleFactor: 2, isMobile: !!seq.phone, hasTouch: !!seq.phone });
  if (seq.phone) await page.setUserAgent(PHONE_AGENT);
  await page.setExtraHTTPHeaders({ "Accept-Language": lang });
  await page.evaluateOnNewDocument((l) => {
    Object.defineProperty(navigator, "language", { get: () => l });
    Object.defineProperty(navigator, "languages", { get: () => [l] });
  }, lang);
  // "load", not "networkidle": pages with a live connection (live reload, server events) are never idle.
  await page.goto(seq.url, { waitUntil: "load" });
  await wait(seq.settle ?? 1500);
  const at = async (selector) => {
    const el = await page.$(selector);
    if (!el) throw new Error(`${seq.url}: nothing matches "${selector}"`);
    const b = await el.boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };
  for (const step of seq.steps ?? []) {
    if (step.wait) await wait(step.wait);
    else if (step.key) await page.keyboard.press(step.key);
    else if (step.type) await page.keyboard.type(step.type, { delay: 10 });
    else if (step.hover) { const p = await at(step.hover); await page.mouse.move(p.x, p.y); }
    else if (step.click) { const p = await at(step.click); await page.mouse.click(p.x + (step.dx ?? 0), p.y + (step.dy ?? 0), { clickCount: step.count ?? 1 }); }
    else if (step.hide) await page.$$eval(step.hide, (els) => els.forEach((e) => (e.style.visibility = "hidden")));
    else if (step.show) await page.$$eval(step.show, (els) => els.forEach((e) => (e.style.visibility = "")));
    else if (step.eval) console.log("  eval:", JSON.stringify(await page.evaluate(step.eval)));
    else if (step.shot) {
      await wait(step.settle ?? 600);
      await page.screenshot({ path: path.join(outDir, `${step.shot}.png`) });
      index[step.shot] = { w: view.width, h: view.height, scale: 2 };
      console.log(`shot ${step.shot} (${view.width}x${view.height})`);
    } else throw new Error(`Unknown step ${JSON.stringify(step)}`);
    if (!step.wait && !step.shot) await wait(step.after ?? 300);
  }
  await page.close();
}
await browser.close();
writeFileSync(indexFile, JSON.stringify(index, null, 2));
