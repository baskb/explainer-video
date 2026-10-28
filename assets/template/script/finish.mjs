// After `remotion render`: sets the sound to the usual level for spoken video
// (-16 LUFS, true peak -1.5 dB), writes <output>.mp4, rebuilds the subtitles and
// prints length, picture size and loudness of the finished file.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { root, film } from "./load-timing.mjs";

const raw = path.join(root, "out", "render-raw.mp4");
const out = path.join(root, `${film.output}.mp4`);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-c:v", "copy", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", out], { stdio: "inherit" });
execFileSync("node", [path.join(root, "script", "build-subtitles.mjs")], { stdio: "inherit" });

const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=width,height,r_frame_rate,codec_type", "-of", "json", out]).toString());
const video = probe.streams.find((s) => s.codec_type === "video");
const seconds = Number(probe.format.duration);
const loud = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", out, "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const lufs = [...loud.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop()?.[1];
const peak = [...loud.matchAll(/Peak:\s+(-?[\d.]+) dBFS/g)].pop()?.[1];
console.log(`${path.relative(root, out)}: ${Math.floor(seconds / 60)}:${(seconds % 60).toFixed(1).padStart(4, "0")}, ${video.width}x${video.height}, ${video.r_frame_rate} fps, ${lufs} LUFS, true peak ${peak} dB`);
// How long the render took (start time noted by script/render-start.mjs).
const startFile = path.join(root, "out", ".render-start");
if (existsSync(startFile)) {
  const took = (Date.now() - Number(readFileSync(startFile, "utf8"))) / 1000;
  console.log(`render and finish took ${Math.floor(took / 60)} min ${Math.round(took % 60)} s`);
  rmSync(startFile);
}
