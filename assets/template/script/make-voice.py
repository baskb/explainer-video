"""Make all voice clips with edge-tts (Microsoft neural voices) and measure them.

Reads script/voiceover.json. Writes one MP3 per line to public/audio/vo/ and
public/audio/durations.json with, per clip: its length, the start and end time
of every sentence (to time pictures) and of every word (to time pictures on one
word and to build the subtitles).

Usage:
  python script/make-voice.py                       all lines
  python script/make-voice.py --only s02a,s02b      make only these lines again
  python script/make-voice.py --words-only          add word timings to existing clips, audio unchanged
  python script/make-voice.py --samples             the first two lines in every voice listed under
                                                    "samples", in out/voice-samples/, for a person to choose
  python script/make-voice.py --pronounce Siobhan "Shi-vawn,Shiv-awn,Sho-vawn"
                                                    the first line that holds the word, once per spelling,
                                                    in out/voice-samples/, for a person to choose

A "pronounce" list in voiceover.json, for example {"Siobhan": "Shi-vawn"},
changes how a word is spoken. Only the voice gets the other spelling; the word
timings keep the written word, so subtitles and scenes still find "Siobhan".

The voice service decides its own pauses inside a clip. To control a pause,
split the sentence into two clips and set the gap in src/timing.ts.
"""
import asyncio
import json
import re
import subprocess
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
SCRIPT_FILE = ROOT / "script" / "voiceover.json"
AUDIO_DIR = ROOT / "public" / "audio"
VO_DIR = AUDIO_DIR / "vo"
SAMPLE_DIR = ROOT / "out" / "voice-samples"


def arg(name: str) -> str | None:
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else None


def ticks_to_s(ticks: int) -> float:
    return round(ticks / 10_000_000, 3)


def clip_length(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True, check=True)
    return round(float(out.stdout.strip()), 3)


async def speak(text: str, voice: str, rate: str, mp3: Path) -> list[dict]:
    """Write the clip and return its sentences with start and end times. The free
    service now and then returns no audio; then it is asked again, up to three times."""
    for attempt in range(3):
        try:
            return await _speak(text, voice, rate, mp3)
        except edge_tts.exceptions.NoAudioReceived:
            if attempt == 2:
                raise
            print(f"  no audio for {mp3.name}, trying again")
            await asyncio.sleep(2 + 3 * attempt)


async def _speak(text: str, voice: str, rate: str, mp3: Path) -> list[dict]:
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="SentenceBoundary")
    sentences = []
    with open(mp3, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "SentenceBoundary":
                start = ticks_to_s(chunk["offset"])
                sentences.append({"text": chunk["text"], "start": start, "end": round(start + ticks_to_s(chunk["duration"]), 3)})
    return sentences


def _envelope(data: bytes):
    """Loudness per 10 ms of an MP3, to compare the timing of two clips."""
    import numpy as np
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "-", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         input=data, capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, dtype="<i2").astype(float)
    n = len(x) // 160
    return np.sqrt((x[: n * 160].reshape(n, 160) ** 2).mean(axis=1))


async def word_timings(text: str, voice: str, rate: str, mp3: Path) -> list[dict]:
    """Ask the service again, this time for word timings. The service gives either
    sentence or word timings per request, not both. A fresh request gives audio
    with the same timing but not always the same bytes, so the word timings are
    only used when the length is equal and the loudness over time lines up with
    the saved clip (correlation above 0.999)."""
    import numpy as np
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    audio = bytearray()
    words = []
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio += chunk["data"]
        elif chunk["type"] == "WordBoundary":
            start = ticks_to_s(chunk["offset"])
            words.append({"text": chunk["text"], "start": start, "end": round(start + ticks_to_s(chunk["duration"]), 3)})
    saved = mp3.read_bytes()
    if len(audio) != len(saved):
        print(f"  warning: {mp3.name}: fresh audio has another length; word timings not used (run --only {mp3.stem} again)")
        return []
    e1, e2 = _envelope(saved), _envelope(bytes(audio))
    n = min(len(e1), len(e2))
    if np.corrcoef(e1[:n], e2[:n])[0, 1] < 0.999:
        print(f"  warning: {mp3.name}: speech does not line up with the saved clip; word timings not used")
        return []
    return words


def spoken_text(text: str, pronounce: dict) -> str:
    """The text as sent to the voice: each word in `pronounce` replaced by its spelling."""
    for word, say in pronounce.items():
        text = re.sub(rf"\b{re.escape(word)}\b", say, text)
    return text


def written_words(items: list[dict], pronounce: dict) -> list[dict]:
    """Put the written word back in place of the spoken spelling."""
    for w in items:
        for word, say in pronounce.items():
            w["text"] = w["text"].replace(say, word)
    return items


def voice_of(cfg: dict, line: dict) -> tuple[str, str]:
    if line.get("voice", "narrator") == "narrator":
        return cfg["narrator"], cfg.get("narratorRate", "+0%")
    return line["voice"], line.get("rate", "+0%")


async def main() -> None:
    cfg = json.loads(SCRIPT_FILE.read_text(encoding="utf-8"))
    pronounce = cfg.get("pronounce", {})

    if "--samples" in sys.argv:
        SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
        text = spoken_text(" ".join(l["text"] for l in cfg["lines"][:2]), pronounce)
        for voice in cfg.get("samples", []):
            mp3 = SAMPLE_DIR / f"narrator-{voice}.mp3"
            await speak(text, voice, cfg.get("narratorRate", "+0%"), mp3)
            print(f"sample {mp3.name}: {clip_length(mp3):.2f}s")
        return

    if "--pronounce" in sys.argv:
        i = sys.argv.index("--pronounce")
        word, spellings = sys.argv[i + 1], sys.argv[i + 2].split(",")
        line = next((l for l in cfg["lines"] if re.search(rf"\b{re.escape(word)}\b", l["text"])), None)
        text = line["text"] if line else f"This is {word}."
        voice, rate = voice_of(cfg, line or {"voice": "narrator"})
        SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
        for k, say in enumerate([word] + spellings):
            mp3 = SAMPLE_DIR / f"{word}-{k:02d}-{re.sub(r'[^A-Za-z0-9-]', '_', say)}.mp3"
            await speak(re.sub(rf"\b{re.escape(word)}\b", say, text), voice, rate, mp3)
            print(f"{mp3.name}")
        return

    VO_DIR.mkdir(parents=True, exist_ok=True)
    durations_file = AUDIO_DIR / "durations.json"
    words_only = "--words-only" in sys.argv
    only = set(arg("--only").split(",")) if arg("--only") else None
    previous = json.loads(durations_file.read_text(encoding="utf-8")) if (words_only or only) and durations_file.exists() else {}
    result = {}
    for line in cfg["lines"]:
        lid = line["id"]
        if only and lid not in only:
            if lid not in previous:
                raise SystemExit(f"{lid} has no clip yet; run without --only first")
            result[lid] = previous[lid]
            continue
        voice, rate = voice_of(cfg, line)
        mp3 = VO_DIR / f"{lid}.mp3"
        text = spoken_text(line["text"], pronounce)
        if words_only:
            result[lid] = previous[lid]
        else:
            sentences = written_words(await speak(text, voice, rate, mp3), pronounce)
            result[lid] = {"voice": voice, "duration": clip_length(mp3), "sentences": sentences}
        result[lid]["words"] = written_words(await word_timings(text, voice, rate, mp3), pronounce)
        print(f"{lid:6} {result[lid]['duration']:6.2f}s  {voice}  {len(result[lid]['words'])} words")
    durations_file.write_text(json.dumps(result, indent=2), encoding="utf-8")
    total = sum(v["duration"] for v in result.values())
    words = sum(len(l["text"].split()) for l in cfg["lines"])
    print(f"total speech: {total:.1f}s, {words} words ({words / total * 60:.0f} words per minute)")


asyncio.run(main())
