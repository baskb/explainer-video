---
name: explainer-video
description: Make a finished animated explainer video (MP4, 1920x1080, 3 to 5 minutes) from a script or from a document about the subject, in the style and brand of the company website. The film is made as code with Remotion, with a Microsoft neural voice-over, generated licence-free music and sounds, a title page, a clear opening, middle and closing, and one-line subtitle files in one or more languages. Use this skill whenever someone asks for an animation, animated video, explainer, motion graphic, training or communication film, "a movie about" a project, a change, a role or a decision, or wants to turn a document, script or slide story into a video with voice-over, even if they do not name Remotion. Also use it to change, shorten, re-voice, translate or process feedback on a film made this way.
---

# Explainer video

This skill makes a film with scenes drawn in code that move on the spoken word, a calm professional computer voice, music made from code, the company's colours, font and logo, and subtitle files that fit on one line. A first version takes one working session; a feedback round takes minutes of change plus a render.

The working project is in `assets/template/` (copy it, it runs as is). Details are in `references/`; read each when you reach that step.

## How to run this as an agent

- **Model.** Run the main session on the strongest model you have. If an advisor or reviewer model is available, consult it at least twice: after you have read the input and before you write the script, and before you report the film as done.
- **Do the work in the main session.** The steps depend on each other (script, voice, timing, scenes), so subagents add little. Use one or two only for independent side work (for example reading a long source document), on a cheaper model.
- **You cannot hear.** Narrator, pronunciation and music are chosen by the person from samples you make. Say so early.
- **Plain language.** Script, labels and README in short sentences with plain words.
- **Report checks honestly.** Say what you checked (frames looked at, sync measured, loudness) and what you could not check (sound, tone).

## Step 0: ask once, then work

Ask only what the input does not answer, in one round (use the question tool with options). Defaults in brackets:

1. Audience and the one message or decision they must take away.
2. Maximum length [5 minutes; 3 to 4 is better for most audiences].
3. Spoken language and voice [English, `en-US-AvaNeural` at +5%; offer samples].
4. Subtitle languages [the spoken language plus the audience's own language].
5. Company website for colours, font and logo, or brand files.
6. If a script is supplied: read word for word, or may it be shortened? If a document is supplied: which parts matter most?
7. Real material the audience will recognise (screenshots, diagrams, real names of systems) [illustrated pictures, no real names of people].

Then work without further questions until the script is ready for review.

## Step 1: set up the project

Copy `assets/template/` to a new folder with a short path (Windows cannot start the downloaded Chrome when the path is longer than 260 characters), then install:

```
cp -r <skill>/assets/template "<projects>/<film-name>" && cd "<projects>/<film-name>" && npm install
```

Needs Node.js 20+, ffmpeg with ffprobe on the PATH, Python 3 with `pip install edge-tts numpy`, and an internet connection (voices, fonts, first-time Chrome download). On Linux or macOS without a `python` command, make a virtual environment (`python3 -m venv .venv && .venv/bin/pip install edge-tts numpy`) and run the Python scripts with `.venv/bin/python`. Set `title` and `output` in `film.json`. Then run the example once: `npm run voice && npm run audio && npm run times`. The example film now works; `npm run studio` plays it in the browser, and `npm run stills` can show a title page with the new brand.

Project layout: `film.json` (settings), `script/` (spoken text, subtitle text, music plan, the tools), `src/timing.ts` (scene order and lengths), `src/scenes/` (one file per scene), `src/parts/` (parts shared by scenes), `src/components/` (background, cards, icons, sounds), `src/brand/` (colours, font, logo), `public/` (logo files, audio), `out/` (video, subtitles, stills).

## Step 2: brand from the website

`python -I <skill>/scripts/extract-brand.py https://www.company.com --out brand-candidates` collects colours, fonts and logo files. Choose, fill `src/brand/theme.ts` and `public/brand/`, and show the person a still of the title page. Read `references/brand-from-website.md`.

## Step 3: the script

Write or improve the script per scene (what is seen, text on screen, voice-over, key sentences), with a title page, a short opening the audience recognises, one idea per scene in the middle, and a closing that gives the message or decision time. Read `references/script-writing.md` before writing; it holds the rules that came out of feedback on earlier films (do not read what the screen shows, counts from the source, check every reason, tone through wording).

Split the voice-over into clips in `script/voiceover.json` (`s02a`, `s02b`, …), run `npm run voice`, and check the printed total against the maximum length (film ≈ 1.15 × speech + title page). Shorten now if needed.

**Show the script and the measured length to the person and wait for approval.** This is the cheapest moment for changes.

## Step 4: voice and timing

- `npm run voice` makes every clip and measures every sentence and word (`public/audio/durations.json`). `--samples` for narrator samples, `--pronounce Word "spelling1,spelling2"` for pronunciation samples, `--only s02a,s02b` to remake changed lines.
- Edit `SPECS` in `src/timing.ts`: one entry per scene with `min`, the clips with `at` or `gap`, `tail`, and `fadeOut` (18 for a cross-fade, 0 for a hard cut). Keep `s00` (title page) first and the end card last.
- `npm run times` prints scene lengths and the total.

## Step 5: scenes

- Decide the shared parts first (a picture that returns or continues across a hard cut) and write them in `src/parts/`.
- Write one file per scene in `src/scenes/`, register it in `src/scenes/index.ts`. Start from `S01Example.tsx`: `prog`/`pop` from `anim.ts`, building blocks from `components/kit.tsx`, and every appearance timed with `clipFrame`, `sentenceFrame` or `wordFrame` from `timing.ts`, a few frames before the word.
- Change the texts of `S00Title.tsx` and `S99End.tsx` (to rename `s99`, change it in every file that names it: `timing.ts`, `scenes/index.ts`, `voiceover.json`, the subtitle files and the `clipFrame` calls in `S99End.tsx`).
- After every two or three scenes: `npm run stills -- "scene-s02:20,200,450" "scene-s03:30,300"` and read the sheets in `out/stills/`. Fix what a reviewer would mark.

Read `references/scenes-and-motion.md` for the API, the readability rules and what makes it look good.

## Step 6: music and sounds

Fill `script/music-plan.json` (style and the mood per part of the story), then `npm run audio`. For a cheerful film offer the beat styles: `npm run audio -- --samples` and let the person choose. Run `npm run audio -- --music` again whenever the length changes. Read `references/audio.md`.

## Step 7: subtitles

Write `script/subtitles-<lang>.json` for every extra language (one entry per spoken sentence). The spoken language needs no file. Read `references/subtitles.md`.

## Step 8: render and check

- `npm run render`: video, loudness (-16 LUFS, peak -1.5 dB), subtitles, and a printed summary.
- `npm run check`: every voice clip within 0.1 s of its place (about +0.04 s is normal).
- `awk 'length>42' out/*.vtt out/*.srt` prints nothing.
- A few stills of the finished film around fast motion.

Read `references/checks-and-delivery.md`.

## Step 9: deliver

- The video `out/<name>.mp4`, the subtitle files (`.vtt`, `.srt`, `.<lang>.vtt`, `.<lang>.srt`), the script file, and a README written during the work (template in `references/checks-and-delivery.md`).
- Tell the person what to watch and listen for (the parts you could not judge: pronunciation, tone, music), what is example content, and what to check before the film goes outside the company.
- Process feedback rounds as described in the same reference. Ask for feedback per point with the time in the video.

## Limits to tell the person

- People and places are illustrated, not photorealistic; real photos, footage or screenshots can be added.
- The free voice service is fine for internal films; for production use Azure AI Speech (same voices) or a human voice. Generated music is fine for internal use.
- Remotion is free for individuals and companies with up to 3 employees; larger companies need a Remotion company licence.

## References

| File | Read when |
| --- | --- |
| `references/script-writing.md` | writing or improving the script, structure, length, tone |
| `references/brand-from-website.md` | setting colours, font and logo |
| `references/scenes-and-motion.md` | writing scenes: timing API, transitions, readability, style |
| `references/audio.md` | voices, pronunciation, music styles and moods, sounds |
| `references/subtitles.md` | subtitle rules and other languages |
| `references/checks-and-delivery.md` | stills, render, checks, README, feedback rounds, several films in one project |
| `references/lessons.md` | what went wrong in earlier films and what the skill does about it |
