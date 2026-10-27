// Loads src/timing.ts in Node (bundled with esbuild), so the scripts use exactly
// the same scene and voice timing as the video.
import { buildSync } from "esbuild";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const film = JSON.parse(readFileSync(path.join(root, "film.json"), "utf8"));

export const loadTiming = async () => {
  const out = buildSync({ entryPoints: [path.join(root, "src", "timing.ts")], bundle: true, platform: "node", format: "esm", write: false });
  return import("data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64"));
};
