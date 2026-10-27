"""Make the sounds and the background music with Python and numpy.

Everything is built from sine waves and noise, so there is no licensed audio.

Usage:
  python script/make-audio.py              sounds (public/audio/sfx/*.wav) and music (public/audio/music.wav)
  python script/make-audio.py --sfx        only the sounds
  python script/make-audio.py --music      only the music (run again after the film length changes)
  python script/make-audio.py --samples    30-second samples of every style (pad, a, b, c) in
                                           out/music-samples/, for a person to choose from

The music follows script/music-plan.json (style, sections with a mood from a
scene on, optional pulse and shimmer). Scene start times come from
script/times.mjs, so the music always matches the current timing.

The music level is set by average loudness (RMS), not by its loudest peak:
music with a beat would otherwise come out 6 to 8 dB louder than a quiet pad.
src/Video.tsx then turns it down while the voice speaks.
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100
ROOT = Path(__file__).resolve().parent.parent
SFX_DIR = ROOT / "public" / "audio" / "sfx"
MUSIC_FILE = ROOT / "public" / "audio" / "music.wav"
MUSIC_RMS = 10 ** (-17.2 / 20)  # about -16 LUFS for the music on its own
rng = np.random.default_rng(7)


# ------------------------------------------------------------------ basics
def t_axis(seconds: float) -> np.ndarray:
    return np.arange(int(seconds * SR)) / SR


def write(path: Path, data: np.ndarray, normalize: bool = True) -> None:
    data = np.asarray(data, dtype=np.float64)
    if data.ndim == 1:
        data = np.stack([data, data], axis=1)
    if normalize:
        data = data / (np.max(np.abs(data)) or 1.0) * 0.89
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(data, -1, 1) * 32767).astype("<i2").tobytes())


def lowpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    """Windowed-sinc low-pass filter."""
    taps = 255
    n = np.arange(taps) - (taps - 1) / 2
    h = np.sinc(2 * cutoff / SR * n) * np.hamming(taps)
    return np.convolve(x, h / h.sum(), mode="same")


def noise(seconds: float) -> np.ndarray:
    return rng.standard_normal(int(seconds * SR))


def bell(freq: float, seconds: float, decay: float = 6.0) -> np.ndarray:
    t = t_axis(seconds)
    env = np.exp(-t * decay) * np.minimum(1, t * 400)
    tone = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * 4)
    tone += 0.12 * np.sin(2 * np.pi * freq * 3.02 * t) * np.exp(-t * 9)
    return tone * env


def place(total: float, parts: list) -> np.ndarray:
    out = np.zeros(int(total * SR))
    for start, sig in parts:
        i = int(start * SR)
        n = min(len(sig), len(out) - i)
        out[i:i + n] += sig[:n]
    return out


NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def hz(name: str) -> float:
    pitch, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((12 * (octave + 1) + NOTE[pitch] - 69) / 12)


def pad_voice(freq: float, t: np.ndarray, detune: float) -> np.ndarray:
    a = np.sin(2 * np.pi * freq * (1 + detune) * t)
    b = np.sin(2 * np.pi * freq * (1 - detune) * t + 1.3)
    return (a + b) * 0.5 + 0.25 * np.sin(2 * np.pi * freq * 2 * t + 0.7)


def level(mix: np.ndarray) -> np.ndarray:
    """Set the average loudness, then round off only the peaks above 0.89."""
    mix = mix * (MUSIC_RMS / (np.sqrt(np.mean(mix ** 2)) or 1.0))
    over = np.abs(mix) > 0.89
    mix[over] = np.sign(mix[over]) * (0.89 + 0.1 * np.tanh((np.abs(mix[over]) - 0.89) / 0.1))
    return mix


# ------------------------------------------------------------------ sounds
def make_sfx() -> None:
    """Short interface sounds. A scene plays one with <Sfx name="pop" at={frame} volume={0.3} />."""
    d = SFX_DIR
    write(d / "notify.wav", place(0.9, [(0, bell(988, 0.8, 7)), (0.11, bell(1319, 0.8, 6))]))
    write(d / "check.wav", place(0.5, [(0, bell(1568, 0.45, 11) * 0.8), (0.03, bell(2093, 0.4, 14) * 0.3)]))
    write(d / "success.wav", place(1.4, [(0, bell(784, 1.2, 4)), (0.1, bell(988, 1.2, 4)), (0.2, bell(1175, 1.2, 3.5)), (0.3, bell(1568, 1.1, 3.5) * 0.6)]))
    t = t_axis(0.12)
    write(d / "pop.wav", np.sin(2 * np.pi * np.cumsum(500 + 700 * t / 0.12) / SR) * np.exp(-t * 32) * np.minimum(1, t * 800))
    t = t_axis(0.05)
    write(d / "click.wav", (np.sin(2 * np.pi * 2400 * t) * 0.6 + lowpass(noise(0.05), 6000) * 0.5) * np.exp(-t * 140))
    t = t_axis(0.04)
    write(d / "tick.wav", (lowpass(noise(0.04), 3500) * 0.7 + np.sin(2 * np.pi * 1400 * t) * 0.3) * np.exp(-t * 170))
    t = t_axis(0.35)
    write(d / "soft.wav", np.sin(2 * np.pi * np.cumsum(180 - 80 * t / 0.35) / SR) * np.exp(-t * 14) * np.minimum(1, t * 300))
    dur = 0.7
    t = t_axis(dur)
    mix = lowpass(noise(dur), 900) * (1 - t / dur) + (lowpass(noise(dur), 3200) - lowpass(noise(dur), 900)) * 0.6 * (t / dur)
    write(d / "whoosh.wav", mix * np.sin(np.pi * t / dur) ** 2)
    dur = 0.9
    t = t_axis(dur)
    rw = np.sin(2 * np.pi * np.cumsum(1400 * np.exp(-t * 2.5) + 120) / SR) * (1 + 0.5 * np.sin(2 * np.pi * 28 * t)) * np.exp(-t * 2) * 0.5
    write(d / "rewind.wav", rw + lowpass(noise(dur), 2500) * np.sin(np.pi * t / dur) * 0.6)
    t = t_axis(0.45)
    ring = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * np.minimum(1, t * 60) * np.minimum(1, (0.45 - t) * 60)
    write(d / "phone.wav", place(1.2, [(0, ring * 0.5), (0.6, ring * 0.5)]))
    dur = 3.5
    t = t_axis(dur)
    chord = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(146.8, 1), (220, 0.7), (293.7, 0.6), (370, 0.45), (440, 0.35), (659.3, 0.2)])
    write(d / "swell.wav", chord * np.minimum(1, t / 1.2) * np.exp(-np.maximum(0, t - 1.4) * 1.6))
    dur = 1.6
    t = t_axis(dur)
    chord = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(1318.5, 1), (1975.5, 0.6), (2637, 0.35), (3951, 0.15)])
    write(d / "freeze.wav", chord * np.exp(-t * 2.4) * np.minimum(1, t * 200) + (lowpass(noise(dur), 7000) - lowpass(noise(dur), 2500)) * np.exp(-t * 9) * 0.5)
    dur = 0.9
    t = t_axis(dur)
    buzz = np.sign(np.sin(2 * np.pi * 110 * t)) * np.exp(-t * 7) * 0.08
    write(d / "disconnect.wav", place(dur, [(0, bell(880, 0.5, 9)), (0.14, bell(587, 0.7, 7))]) + lowpass(buzz, 1500))
    write(d / "connect.wav", place(0.9, [(0, bell(659, 0.8, 6)), (0.1, bell(988, 0.8, 5))]))
    print(f"sounds: {len(list(d.glob('*.wav')))} files in {d.relative_to(ROOT)}")


# ------------------------------------------------------------------ music: pad style
# Chord sets per mood (a few chords that repeat, one every bar).
MOODS = {
    "calm": [["D2", "A2", "F#3", "A3", "E4"], ["B1", "F#2", "D3", "A3", "C#4"], ["G1", "D2", "B2", "F#3", "A3"], ["A1", "E2", "C#3", "E3", "B3"]],
    "grey": [["A1", "E2", "C3", "E3", "B3"], ["F1", "C2", "A2", "E3", "G3"], ["G1", "D2", "B2", "D3", "A3"], ["E1", "B1", "G2", "D3", "B3"]],
    "tense": [["B1", "F#2", "D3", "F#3", "C4"], ["G1", "D2", "A#2", "F3", "C4"], ["E2", "B2", "D3", "G3", "C4"], ["F#2", "C#3", "E3", "A3", "C4"]],
    "thin": [["E3", "B3", "E4"], ["A2", "E3", "A3"]],
    "bright": [["C2", "G2", "E3", "G3", "D4"], ["F1", "C2", "A2", "E3", "G3"], ["G1", "D2", "B2", "D3", "A3"], ["A1", "E2", "C3", "E3", "G3"]],
}
BAR = {"calm": 7.0, "grey": 7.0, "tense": 4.5, "thin": 7.5, "bright": 6.0}
RESOLVED = ["D2", "A2", "D3", "F#3", "A3", "E4"]


def resolve_time(key: str, starts: dict, total: float) -> float:
    if key == "end":
        return total
    if key not in starts:
        raise SystemExit(f"music-plan.json: unknown scene '{key}' (scenes: {', '.join(starts)})")
    return starts[key]


def sections_of(plan: dict, starts: dict, total: float) -> list:
    """[(start, end, mood)] from the plan, in time order, ending before the final chord."""
    secs = sorted(((resolve_time(s["from"], starts, total), s["mood"]) for s in plan["sections"]), key=lambda x: x[0])
    if not secs or secs[0][0] > 0:
        secs.insert(0, (0.0, secs[0][1] if secs else "calm"))
    out = []
    for i, (a, mood) in enumerate(secs):
        b = secs[i + 1][0] if i + 1 < len(secs) else total
        out.append((a, b, mood))
    return out


def pad_music(total: float, starts: dict, plan: dict) -> np.ndarray:
    t = t_axis(total)
    left, right = np.zeros_like(t), np.zeros_like(t)
    final_at = max(0.0, total - 14)
    events = []
    for a, b, mood in sections_of(plan, starts, total):
        chords = MOODS.get(mood)
        if chords is None:
            raise SystemExit(f"music-plan.json: unknown mood '{mood}' (moods: {', '.join(MOODS)})")
        pos, k = a, 0
        while pos < min(b, final_at) - 0.5:
            events.append((pos, chords[k % len(chords)]))
            pos += BAR[mood]
            k += 1
    events.append((final_at, RESOLVED))
    fade = 2.0
    for i, (start, chord) in enumerate(events):
        end = events[i + 1][0] if i + 1 < len(events) else total
        env = np.clip((t - start) / fade, 0, 1) * np.clip((end + fade - t) / fade, 0, 1)
        if i + 1 == len(events):
            env = np.clip((t - start) / fade, 0, 1) * np.clip((total - t) / 6.0, 0, 1)
        mask = env > 0
        if not mask.any():
            continue
        tm = t[mask]
        for j, n in enumerate(chord):
            amp = 0.55 if j == 0 else 0.32
            left[mask] += pad_voice(hz(n), tm, 0.0016) * amp * env[mask]
            right[mask] += pad_voice(hz(n), tm + 0.011, 0.0021) * amp * env[mask]

    # A low pulse that grows: tension while a problem is explained.
    pulse = np.zeros_like(t)
    for p in plan.get("pulse", []):
        a, b = resolve_time(p["from"], starts, total), resolve_time(p["to"], starts, total)
        beat = a + 2.0
        while beat < b - 0.5:
            i0 = int(beat * SR)
            tt = np.arange(min(int(0.5 * SR), len(t) - i0)) / SR
            grow = (beat - a) / max(0.1, b - a)
            pulse[i0:i0 + len(tt)] += np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 8) * (0.2 + 0.4 * grow)
            beat += 0.8 - 0.2 * grow
    # Soft high notes: openness, from the turning point on.
    shimmer = np.zeros_like(t)
    notes = ["A4", "D5", "F#5", "E5", "A5", "F#5"]
    for sh in plan.get("shimmer", []):
        s, b, idx = resolve_time(sh["from"], starts, total), min(resolve_time(sh["to"], starts, total), total - 8), 0
        while s < b:
            i0 = int(s * SR)
            tt = np.arange(min(int(3.0 * SR), len(t) - i0)) / SR
            shimmer[i0:i0 + len(tt)] += np.sin(2 * np.pi * hz(notes[idx % len(notes)]) * tt) * np.exp(-tt * 1.4) * np.minimum(1, tt * 20) * 0.08
            s += 2.1
            idx += 1
    lfo = 0.85 + 0.15 * np.sin(2 * np.pi * t / 9.0)
    left = lowpass(left * lfo, 2400) + shimmer + pulse
    right = lowpass(right * lfo, 2400) + np.roll(shimmer, int(0.018 * SR)) + pulse
    fade_in = np.clip(t / 2.0, 0, 1)
    return np.stack([left * fade_in, right * fade_in], axis=1)


# ------------------------------------------------------------------ music: beat styles a, b, c
BEAT_STYLES = {
    # Light and bright, C major, beat on 1 and 3, soft hi-hat between the beats.
    "a": {"bpm": 100, "kick": [0, 2], "clap": [], "hat": "offbeat", "arp": 2, "tone": "pluck",
          "chords": [["C4", "E4", "G4"], ["B3", "D4", "G4"], ["C4", "E4", "A4"], ["C4", "F4", "A4"]], "bass": ["C2", "G2", "A2", "F2"],
          "thin": [["C4", "E4", "A4"], ["C4", "F4", "A4"], ["C4", "E4", "G4"], ["B3", "D4", "G4"]], "thin_bass": ["A2", "F2", "C2", "G2"]},
    # More drive, D major, clap on 2 and 4, hi-hat on every half beat.
    "b": {"bpm": 112, "kick": [0, 2], "clap": [1, 3], "hat": "all", "arp": 2, "tone": "pluck",
          "chords": [["D4", "F#4", "A4"], ["C#4", "E4", "A4"], ["D4", "F#4", "B4"], ["D4", "G4", "B4"]], "bass": ["D2", "A2", "B2", "G2"],
          "thin": [["D4", "F#4", "B4"], ["D4", "G4", "B4"], ["D4", "F#4", "A4"], ["C#4", "E4", "A4"]], "thin_bass": ["B2", "G2", "D2", "A2"]},
    # Calmer but still bright, F major, no kick: a soft shaker and a marimba-like figure.
    "c": {"bpm": 92, "kick": [], "clap": [], "hat": "shaker", "arp": 4, "tone": "marimba",
          "chords": [["C4", "F4", "A4"], ["C4", "E4", "G4"], ["D4", "F4", "A4"], ["D4", "F4", "A#4"]], "bass": ["F2", "C2", "D2", "A#1"],
          "thin": [["D4", "F4", "A4"], ["D4", "F4", "A#4"], ["C4", "F4", "A4"], ["C4", "E4", "G4"]], "thin_bass": ["D2", "A#1", "F2", "C2"]},
}


def beat_music(total: float, starts: dict, plan: dict, style: str) -> np.ndarray:
    cfg = BEAT_STYLES[style]
    beat = 60.0 / cfg["bpm"]
    bar = 4 * beat
    n = int(total * SR)
    t = np.arange(n) / SR
    left, right = np.zeros(n), np.zeros(n)
    bars = int(np.ceil(total / bar))
    secs = sections_of(plan, starts, total)
    first_voice = min((v for k, v in starts.items() if k != "s00"), default=0) + 2
    section = []
    for b in range(bars):
        tb = b * bar
        mood = next((m for a, e, m in secs if a <= tb < e), "full")
        section.append("end" if tb >= total - 12 else "intro" if tb < first_voice else "thin" if mood == "thin" else "full")

    def add(sig, at, gl, gr):
        i = int(at * SR)
        if i >= n:
            return
        m = min(len(sig), n - i)
        left[i:i + m] += sig[:m] * gl
        right[i:i + m] += sig[:m] * gr

    def et(seconds):
        return np.arange(int(seconds * SR)) / SR

    def pluck(freq):
        tt = et(1.2)
        if cfg["tone"] == "marimba":
            return (np.sin(2 * np.pi * freq * tt) + 0.25 * np.sin(2 * np.pi * freq * 3.98 * tt) * np.exp(-tt * 18)) * np.exp(-tt * 6.5) * np.minimum(1, tt * 500)
        return (np.sin(2 * np.pi * freq * tt) + 0.3 * np.sin(2 * np.pi * freq * 2 * tt) * np.exp(-tt * 6)) * np.exp(-tt * 4.5) * np.minimum(1, tt * 300)

    tt = et(0.35)
    kick_s = np.sin(2 * np.pi * np.cumsum(48 + 70 * np.exp(-tt * 28)) / SR) * np.exp(-tt * 9)

    def hat(seconds, decay):
        x = rng.standard_normal(int(seconds * SR))
        return (x - lowpass(x, 7000)) * np.exp(-et(seconds) * decay)

    x = rng.standard_normal(int(0.2 * SR))
    tt = et(0.2)
    clap_s = (lowpass(x, 3500) - lowpass(x, 900)) * sum(np.exp(-np.clip(tt - d, 0, None) * 120) * (tt >= d) for d in (0, 0.01, 0.02)) * np.exp(-tt * 22)
    hat_s, shaker_s = hat(0.08, 45), hat(0.12, 30)

    def bass_note(freq, seconds):
        tt = et(seconds)
        return (np.sin(2 * np.pi * freq * tt) + 0.3 * np.sin(2 * np.pi * freq * 2 * tt)) * np.minimum(1, tt * 200) * np.minimum(1, (seconds - tt) * 30) * np.exp(-tt * 2.5)

    def pad(chord, seconds):
        tt = et(seconds + 0.6)
        env = np.minimum(1, tt / 0.25) * np.clip((seconds + 0.6 - tt) / 0.6, 0, 1)
        return sum(pad_voice(hz(c), tt, 0.0018) for c in chord) * env, sum(pad_voice(hz(c), tt + 0.011, 0.0023) for c in chord) * env

    end_from = next((b for b in range(bars) if section[b] == "end"), bars)
    for b in range(bars):
        tb, sec, k = b * bar, section[b], b % 4
        if sec == "end":
            if b > end_from:
                continue
            chord, root, length = cfg["chords"][0] + [cfg["chords"][0][0][:-1] + "5"], cfg["bass"][0], total - tb
        else:
            thin = sec == "thin"
            chord, root, length = cfg["thin" if thin else "chords"][k], cfg["thin_bass" if thin else "bass"][k], bar
        quiet = 0.6 if sec == "thin" else 1.0
        pl, pr = pad(chord, length)
        add(pl, tb, 0.10 * quiet, 0)
        add(pr, tb, 0, 0.10 * quiet)
        if sec == "full":
            for q in range(4):
                add(bass_note(hz(root), beat * 0.9), tb + q * beat, 0.30, 0.30)
        else:
            add(bass_note(hz(root), min(length, bar * 2)), tb, 0.26 * quiet, 0.26 * quiet)
        tones = [hz(c) * 2 for c in chord[:3]]
        figure = [tones[0], tones[1], tones[2], tones[1], tones[0] * 2, tones[2], tones[1], tones[2]]
        steps = cfg["arp"] * 4 if sec == "full" else 4
        for j in range(steps):
            f = figure[j % len(figure)]
            lvl = (0.12 if j % cfg["arp"] == 0 else 0.08) * quiet
            add(pluck(f), tb + j * bar / steps, lvl * 0.75, lvl)
            add(pluck(f), tb + j * bar / steps + 0.75 * beat, lvl * 0.3, lvl * 0.15)
        if sec != "full":
            continue
        for q in cfg["kick"]:
            add(kick_s, tb + q * beat, 0.55, 0.55)
        for q in cfg["clap"]:
            add(clap_s, tb + q * beat, 0.16, 0.2)
        for e in range(16):
            when = tb + e * beat / 4
            if cfg["hat"] == "offbeat" and e % 4 == 2:
                add(hat_s, when, 0.07, 0.05)
            elif cfg["hat"] == "all" and e % 2 == 0:
                add(hat_s, when, 0.07 if e % 4 == 2 else 0.04, 0.05 if e % 4 == 2 else 0.03)
            elif cfg["hat"] == "shaker":
                add(shaker_s, when, 0.03 if e % 2 else 0.05, 0.04 if e % 2 else 0.03)
    fade = np.clip(t / 2.0, 0, 1) * np.clip((total - t) / 6.0, 0, 1)
    return np.stack([left * fade, right * fade], axis=1)


def music(total: float, starts: dict, plan: dict, style: str) -> np.ndarray:
    mix = pad_music(total, starts, plan) if style == "pad" else beat_music(total, starts, plan, style)
    return level(mix)


def scene_times() -> dict:
    out = subprocess.run(["node", str(ROOT / "script" / "times.mjs"), "--json"], capture_output=True, text=True, check=True, stdin=subprocess.DEVNULL, cwd=ROOT)
    return json.loads(out.stdout)


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--music" not in args and "--samples" not in args:
        make_sfx()
    if "--sfx" in args:
        sys.exit(0)
    times = scene_times()
    plan = json.loads((ROOT / "script" / "music-plan.json").read_text(encoding="utf-8"))
    if "--samples" in args:
        out = ROOT / "out" / "music-samples"
        length = min(30.0, times["total"])
        for style in ["pad", "a", "b", "c"]:
            write(out / f"style-{style}.wav", music(length, {k: v for k, v in times["starts"].items() if v < length}, {**plan, "sections": [s for s in plan["sections"] if s["from"] == "end" or times["starts"].get(s["from"], 99) < length] or [{"from": "s00", "mood": "calm"}], "pulse": [], "shimmer": []}, style), normalize=False)
            print(f"sample {out.name}/style-{style}.wav ({length:.0f} s)")
        sys.exit(0)
    style = plan.get("style", "pad")
    write(MUSIC_FILE, music(times["total"], times["starts"], plan, style), normalize=False)
    print(f"music: {times['total']:.1f} s, style {style}, {MUSIC_FILE.relative_to(ROOT)}")
