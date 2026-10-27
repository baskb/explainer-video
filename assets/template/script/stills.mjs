// Renders single frames of one or more compositions (one bundle, one browser) and
// one contact sheet per composition, for checking the picture without a full render.
// Usage: node script/stills.mjs "scene-s02:20,120,330" "scene-s03:60,200" [--scale 0.5] [--out out/stills]
//        node script/stills.mjs "Film:100,900,2400"      frames of the whole film
// Frame numbers of a scene composition count from the start of that scene.
import { bundle } from "@remotion/bundler";
import { ensureBrowser, openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { root } from "./load-timing.mjs";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  if (i < 0) return def;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const scale = Number(opt("--scale", "0.5"));
const outDir = path.resolve(root, opt("--out", "out/stills"));
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts"), webpackOverride: (c) => c });
await ensureBrowser(); // downloads the headless Chrome on first use
const browser = await openBrowser("chrome");
for (const spec of args) {
  const [id, list] = spec.split(":");
  const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
  const name = id.replace("scene-", "");
  const tmp = path.join(outDir, `_${name}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  let n = 0;
  for (const f of list.split(",")) {
    const frame = Math.min(Number(f), composition.durationInFrames - 1);
    const file = path.join(outDir, `${name}-${f}.png`);
    await renderStill({ composition, serveUrl, output: file, frame, scale, puppeteerInstance: browser });
    n++;
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", file, "-vf", `drawtext=text='${name} ${f}':x=12:y=10:fontsize=28:fontcolor=yellow:box=1:boxcolor=black@0.6`, path.join(tmp, `${String(n).padStart(3, "0")}.png`)]);
  }
  const cols = n <= 4 ? 2 : 3;
  const sheet = path.join(outDir, `${name}-sheet.png`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "1", "-i", path.join(tmp, "%03d.png"), "-vf", `tile=${cols}x${Math.ceil(n / cols)}:padding=6:color=black`, "-frames:v", "1", sheet]);
  rmSync(tmp, { recursive: true, force: true });
  console.log(`${id}: ${n} frames of ${composition.durationInFrames}, sheet ${path.relative(root, sheet)}`);
}
await browser.close({ silent: true });
