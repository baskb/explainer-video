// Prints the length and start time of every scene and the total length.
// Usage: node script/times.mjs          table
//        node script/times.mjs --json   scene starts and total in seconds (used by make-audio.py)
import { film, loadTiming } from "./load-timing.mjs";

const { SCENES, TOTAL_FRAMES } = await loadTiming();
const FPS = film.fps;
if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ total: TOTAL_FRAMES / FPS, starts: Object.fromEntries(SCENES.map((s) => [s.id, s.start / FPS])) }));
} else {
  for (const s of SCENES) {
    console.log(`${s.id.padEnd(5)} ${(s.frames / FPS).toFixed(1).padStart(5)} s  starts at ${(s.start / FPS).toFixed(1).padStart(6)} s  (${s.frames} frames, ${s.vo.length} clips)`);
  }
  const t = TOTAL_FRAMES / FPS;
  console.log(`total ${t.toFixed(1)} s = ${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, "0")} (${TOTAL_FRAMES} frames)`);
}
