"""After a render: check that every voice clip sits in the finished film where
the timing says, by matching the loudness curve of each clip against the film's
sound. The subtitles use the same timing, so this checks them too.

Usage: python script/check-sync.py
Prints the offset per clip. About +0.04 s everywhere is the delay the audio
format adds and is fine. More than 0.1 s means something is wrong.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FILM = json.loads((ROOT / "film.json").read_text(encoding="utf-8"))
VIDEO = ROOT / f"{FILM['output']}.mp4"
FPS = FILM["fps"]
SR, HOP = 16000, 160  # 10 ms steps


def pcm(path: Path) -> np.ndarray:
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype="<i2").astype(float)


def env(x: np.ndarray) -> np.ndarray:
    n = len(x) // HOP
    return np.log1p(np.sqrt((x[: n * HOP].reshape(n, HOP) ** 2).mean(axis=1)))


code = "import('./script/load-timing.mjs').then(async (m) => { const t = await m.loadTiming(); console.log(JSON.stringify(t.VO_CUES)); })"
cues = json.loads(subprocess.run(["node", "-e", code], capture_output=True, text=True, check=True, cwd=ROOT).stdout)
film = env(pcm(VIDEO))
worst = 0.0
for c in cues:
    clip = env(pcm(ROOT / "public" / "audio" / "vo" / f"{c['clip']}.mp3"))
    expected = round(c["from"] / FPS * 100)
    best, best_lag = -2.0, 0
    for lag in range(-30, 31):
        a = expected + lag
        seg = film[a: a + len(clip)]
        if a < 0 or len(seg) < len(clip):
            continue
        r = np.corrcoef(seg, clip)[0, 1]
        if r > best:
            best, best_lag = r, lag
    worst = max(worst, abs(best_lag) / 100)
    print(f"{c['clip']:6} expected {c['from'] / FPS:7.2f}s  offset {best_lag / 100:+.2f}s  match {best:.2f}")
print(f"largest offset: {worst:.2f}s")
sys.exit(1 if worst > 0.1 else 0)
