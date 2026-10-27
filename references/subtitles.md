# Subtitles

`npm run subs` (also run by `npm run render`) builds them from the measured voice and `src/timing.ts`, so they always match the video.

## Rules and why

- **One line per subtitle, at most 42 characters.** Some players, for example Stream in SharePoint, draw two-line subtitles so large that the lines overlap. So no subtitle has a line break; a long sentence becomes several one-line subtitles in a row.
- **The spoken language is timed per line by its own words.** Each line appears on its first spoken word and stays 0.35 s after its last, at least 0.9 s on screen, never over the next line.
- **Good break points.** The splitter tries every way to break a sentence and prefers breaks after a comma or before words like "and", "with", "because", and avoids ending a line on "the", "a", "our". English, Dutch, German and French lists are in `script/build-subtitles.mjs`; add a language by adding its two lists.
- **Separate files, not burned into the picture.** `.vtt` (web players, Stream, SharePoint, PowerPoint) and `.srt` (other players). The viewer can switch them off, and a translation can be added later without a new render.

## Other languages

- Add the language to `languages` in `film.json` and write `script/subtitles-<lang>.json`: per clip id, one entry per spoken sentence, in the same order. The script stops with a clear message if a clip has the wrong number of sentences.
- A translation does not match the audio word for word, so each translated sentence gets the time of its spoken sentence, shared over its lines by length, and may stay up to 1.5 s longer in the pause after it.
- Put ` | ` in the text where you want a line to break; without it the line is split automatically. Check that every part is 42 characters or less (the script warns).
- An empty string lets the translated sentence before it cover two spoken sentences.
- Keep program and product terms in the original language when the audience uses them that way (for example product names or the name of a project).
- The model translates well, but a native speaker should read the subtitles before the film is shared.

## Checks

- `awk 'length>42' out/*.vtt out/*.srt` prints nothing.
- `npm run check` (voice sync) also checks the subtitles, because both use the same timing.
- If the spoken text has a word the voice says differently (`pronounce`), search the subtitle files for the spoken spelling: it must not appear.
