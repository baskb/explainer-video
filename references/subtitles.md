# Subtitles

`npm run subs` (also run by `npm run render`) builds them from the measured voice and `src/timing.ts`, so they always match the video.

## Rules and why

- **One line per subtitle, at most 42 characters.** Some players, for example Stream in SharePoint, draw two-line subtitles so large that the lines overlap. So no subtitle has a line break; a long sentence becomes several one-line subtitles in a row.
- **The spoken language is timed per line by its own words.** Each line appears on its first spoken word and stays 0.35 s after its last, at least 0.9 s on screen, never over the next line.
- **Good break points.** The splitter tries every way to break a sentence and prefers breaks after a comma or before words like "and", "with", "because", and avoids ending a line on "the", "a", "our". English, Dutch, German and French lists are in `script/build-subtitles.mjs`; add a language by adding its two lists.
- **Separate files, not burned into the picture.** `.vtt` (web players, Stream, SharePoint, PowerPoint) and `.srt` (other players). The viewer can switch them off, and a translation can be added later without a new render.

## Subtitles in the picture

Separate files are best where the player can load them. Some places cannot: a player that starts muted and has no subtitle menu, a web page, a social media post. There the film must read without sound, so the subtitles of the spoken language go into the picture.

- Ask where the film will be shown in step 0. With burned-in subtitles, every scene keeps the lowest 130 px free.
- After `npm run render`: `npm run burn -- --test 30` makes one still to check the style at a busy scene; `npm run burn` writes `out/<name>-subtitled.mp4` (same quality), and `-- --web 1280` also writes `out/<name>-web.mp4`, smaller, for a place with a size limit, and prints both sizes. Raise `--crf` (default 25) if the file is still too large. `--lang nl` burns in another language from its `.srt`.
- The style is light text on a semi-transparent dark box, one line, low in the picture. It uses an installed font (Segoe UI Semibold on Windows, Helvetica Neue on macOS, DejaVu Sans on Linux; `--font` for another), because ffmpeg cannot use the film's web font. Say so in the README.
- ffmpeg must be a full build with libass; the script stops with a clear message if it is not. On Windows it runs inside `out/`, because the colon of a drive letter breaks the subtitle filter.
- Keep the clean MP4 and the subtitle files as well: they are still the best version for an intranet, Teams or Stream.

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
