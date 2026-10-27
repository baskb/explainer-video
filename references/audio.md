# Voice, music and sounds

## The model cannot hear

Claude cannot listen to audio. Everything that depends on hearing is made as samples for a person to choose: the narrator, the pronunciation of a name, the music style. Say this to the person at the start, and offer samples instead of guessing.

## Voice

- Made with `edge-tts` (Python package), which uses the free read-aloud service of Microsoft Edge with Microsoft's neural voices. No key needed. It is not an official service for this use: for a public or production film, the same voices are available through Azure AI Speech with a key.
- Default narrator: `en-US-AvaNeural` at `+5%`. Others to offer: `en-US-EmmaNeural`, `en-GB-SoniaNeural` (British), `en-US-AndrewNeural` and `en-US-BrianNeural` (men). Dutch: `nl-NL-FennaNeural`, `nl-NL-ColetteNeural`, `nl-NL-MaartenNeural`. German: `de-DE-KatjaNeural`, `de-DE-ConradNeural`. List all: `edge-tts --list-voices`.
- `npm run voice -- --samples` reads the first two lines in every voice under `samples` in `voiceover.json`, into `out/voice-samples/`.
- Characters can speak with their own voice: `"voice": "en-US-AndrewNeural"` on a line.
- Pronunciation: if the voice says a name wrong, make samples with `python script/make-voice.py --pronounce Siobhan "Shi-vawn,Shiv-awn,Sho-vawn"`, let the person pick, and put it in `voiceover.json`: `"pronounce": {"Siobhan": "Shi-vawn"}`. Only the voice gets the spelling; subtitles and `wordFrame` keep the written word. The service accepts plain text only, so respelling is the way to change pronunciation.
- After changing text: `python script/make-voice.py --only s02c,s03a` remakes only those clips; the timing follows by itself.
- Word timings come from a second request to the service. If it prints "word timings not used", run `--only` for that clip again; without word timings the subtitles share the sentence time over the words by length, and `wordFrame` fails for that clip.

## Music

- `script/make-audio.py` builds the music from sine waves and noise: no licence questions.
- `script/music-plan.json` sets the style and which mood starts at which scene. Moods (pad style): `calm` (open, major), `grey` (muted, for "today" or a problem), `tense` (faster, unresolved), `thin` (a few open notes, for a question or a pause), `bright` (warm and moving). `pulse` adds a low pulse that grows (while a risk is explained); `shimmer` adds soft high notes (from the turning point on). The film always ends on one resolved chord.
- Beat styles `a`, `b`, `c` (major key, steady tempo, soft beat) suit cheerful films (a role, a launch, a community). Pad suits serious films (risk, architecture, decisions). In beat styles, a `thin` section drops the beat (for example while questions appear).
- `python script/make-audio.py --samples` writes about 30 seconds of each style to `out/music-samples/`. Let the person choose; the first choice is often too gloomy or too busy, and hearing three samples settles it quickly.
- Run `npm run audio -- --music` again after the length of the film changes; the sections follow the scene times.
- Level: the music file is set by average loudness (RMS), so a beat style sits as loud as a pad. `src/Video.tsx` plays it at 0.26 and turns it down to 0.1 while the voice speaks.
- A chosen track (for example from a royalty-free library) at `public/audio/music.mp3` replaces the generated music without other changes. Check its licence.

## Sounds

`npm run audio -- --sfx` makes: notify, check, success, pop, click, tick, soft, whoosh, rewind, phone, swell, freeze, disconnect, connect. In a scene: `<Sfx name="pop" at={frame} volume={0.2} />`. Keep them quiet and few; one per arriving element at most, none under important sentences.

## Final loudness

`npm run render` ends with ffmpeg `loudnorm=I=-16:TP=-1.5:LRA=11`: -16 LUFS and a true peak of -1.5 dB, the usual level for spoken video on the web and in Teams or Stream.
