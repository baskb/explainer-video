// After `npm run render`: burns the subtitles of the spoken language into the
// picture, for players that start muted or cannot load subtitle files (a web page,
// a social media post). Writes out/<name>-subtitled.mp4; with --web <width> also a
// smaller copy, out/<name>-web.mp4, for a place with a size limit.
// Usage: npm run burn [-- --web 1280] [--crf 25] [--font "Segoe UI Semibold"] [--lang en]
//        npm run burn -- --test 30     one still at 30 seconds, to check the style
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { root, film } from "./load-timing.mjs";

const args = process.argv.slice(2);
const opt = (name, def) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const out = path.join(root, "out");
const name = path.basename(film.output);
const lang = opt("--lang", film.languages[0]);
const srt = lang === film.languages[0] ? `${name}.srt` : `${name}.${lang}.srt`;
if (!existsSync(path.join(out, `${name}.mp4`))) throw new Error(`out/${name}.mp4 is missing; run npm run render first`);
if (!existsSync(path.join(out, srt))) throw new Error(`out/${srt} is missing; run npm run subs`);
if (!execFileSync("ffmpeg", ["-hide_banner", "-filters"]).toString().includes(" subtitles ")) {
  throw new Error("This ffmpeg cannot burn subtitles (it was built without libass). Use a full build of ffmpeg.");
}

// The subtitle font must be installed on this computer (ffmpeg cannot use the web font of the film).
const font = opt("--font", process.platform === "win32" ? "Segoe UI Semibold" : process.platform === "darwin" ? "Helvetica Neue" : "DejaVu Sans");
// Light text on a semi-transparent dark box, one line, low in the picture. Colours are &HAABBGGRR.
const style = `FontName=${font},FontSize=15,PrimaryColour=&H00FFFFFF,BorderStyle=3,OutlineColour=&H40000000,Outline=5,Shadow=0,MarginV=22`;
// ffmpeg runs inside out/ so the subtitle path has no drive letter: its colon breaks the filter on Windows.
const filter = `subtitles=${srt}:force_style='${style}'`;
const run = (a) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...a], { cwd: out, stdio: "inherit" });
const size = (f) => `${(statSync(path.join(out, f)).size / 1e6).toFixed(1)} MB`;

if (args.includes("--test")) {
  const t = opt("--test", "10");
  mkdirSync(path.join(out, "stills"), { recursive: true });
  run(["-ss", t, "-copyts", "-i", `${name}.mp4`, "-vf", filter, "-frames:v", "1", `stills/subtitles-${t}.png`]);
  console.log(`out/stills/subtitles-${t}.png`);
} else {
  run(["-i", `${name}.mp4`, "-vf", filter, "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", `${name}-subtitled.mp4`]);
  console.log(`out/${name}-subtitled.mp4: ${size(`${name}-subtitled.mp4`)}`);
  const web = opt("--web", null);
  if (web) {
    run(["-i", `${name}-subtitled.mp4`, "-vf", `scale=${web}:-2`, "-c:v", "libx264", "-preset", "slow", "-crf", opt("--crf", "25"), "-tune", "animation", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", `${name}-web.mp4`]);
    console.log(`out/${name}-web.mp4: ${size(`${name}-web.mp4`)} (raise --crf for a smaller file)`);
  }
}
