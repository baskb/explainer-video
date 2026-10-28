// Runs before `npm run render` (npm's "prerender" step): notes the start time, so
// finish.mjs can print how long the render took.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { root } from "./load-timing.mjs";

mkdirSync(path.join(root, "out"), { recursive: true });
writeFileSync(path.join(root, "out", ".render-start"), String(Date.now()));
