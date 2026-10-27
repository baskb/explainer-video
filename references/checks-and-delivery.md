# Checks, delivery and feedback rounds

## Look before you render

The model does not see its output unless it renders it. After writing a scene (or two or three), render single frames and read the sheet with the Read tool as a reviewer would:

`npm run stills -- "scene-s02:20,180,400,700" "scene-s03:30,250"`

Frames count from the start of the scene; `npm run times` shows scene lengths in frames. Pick frames at the start, on each change, in the middle of every motion and at the end. Look for: text cut off or wrapped where it should not, labels on top of each other, an element that appears before its word, an empty half of the screen, a person in front of a screen, wrong numbers, a hard cut whose two sides do not match. Fix and render the stills again. Start the full render only when all sheets are clean.

## Render and finish

`npm run render` renders `out/render-raw.mp4` (H.264, CRF 18), sets the loudness (-16 LUFS, true peak -1.5 dB), writes `<output>.mp4` from `film.json`, builds the subtitles and prints length, size, frame rate and loudness. A five-minute film takes about 5 minutes on a fast desktop, 10 to 15 minutes on a laptop. `out/render-raw.mp4` can be deleted afterwards.

## Checks on the finished file

| Check | Command | Good result |
| --- | --- | --- |
| Length, size, loudness | printed by `npm run render` | as planned, 1920x1080, about -16 LUFS, peak -1.5 dB |
| Voice where the timing says (and so the subtitles) | `npm run check` | about +0.04 s for every clip (the delay of the audio format); more than 0.1 s is an error |
| Subtitle lines | `awk 'length>42' out/*.vtt out/*.srt` | prints nothing |
| Motion | `npm run stills -- "Film:100,105,110,115"` around a fast movement | smooth steps, nothing jumps |
| Other films unchanged (several films in one project) | `md5sum -c out/checksums/before.md5` | all OK |

Report what was checked and what was not. If something was not checked, say so.

## What a person still checks

- Watching the whole film with sound: tone, pace, music, pronunciation. The model cannot hear.
- Every number, date, name and arrow against the source. Example numbers (made up for the film) are listed in the README as examples.
- Subtitles in a second language, by a native speaker.
- Screenshots for internal information, before showing the film outside the company.
- Logo and colours against the brand rules, before showing it outside.

## README of the film

Write it during the work, not at the end. Sections:

1. What the film is, length, audience, made with which model on which date.
2. Files: the video, the subtitle files, the script, `voiceover.json`, the subtitle text, the scenes.
3. Commands to change and render it.
4. Length: words, minutes of speech, film length, sentences that can be cut.
5. Differences from the script: every change in the voice-over and every addition on screen, with the reason.
6. Check before showing outside a test: example numbers, screenshots, brand, computer voice.
7. Feedback rounds: per round, each point and what was done.
8. How it was made: questions asked, what the model did, what the checks found and fixed.

## Feedback rounds

- Ask for feedback as a list of points with the time in the video ("0:45, scene 3: …"), in one document per round. A meeting transcript works too.
- Before a large round, copy the current video, subtitles, `voiceover.json` and audio to `out/backup-<date>/`.
- Per point: change the script file first, then `voiceover.json` and the subtitle text, then `npm run voice -- --only <ids>`, the scenes, `npm run audio -- --music` if the length changed, stills, render, checks.
- If a point is unclear or has two reasonable readings, ask, offering the options. Do not guess at wording the person will have to say out loud to their audience.
- Write the round into the README and the script file.

## Several films in one project

Several films can live in one project with one folder per film (`src/film2/`, `script/film2/`, `public/audio/film2/`). That allows reuse of parts between films, but the template does not support it as is: every script then needs a film argument. For a new film, a copy of the template per film is simpler. If you do share a project: save checksums of all finished videos, subtitles and audio before the work (`find out public/audio -type f \( -name "*.mp4" -o -name "*.vtt" -o -name "*.srt" -o -name "*.mp3" -o -name "*.wav" \) -exec md5sum {} + > out/checksums/before.md5`) and check them after.
