# Lessons from earlier films

Each problem below happened at least once while making films this way. The answer is now built into the skill.

| Lesson | What goes wrong | What to do |
| --- | --- | --- |
| Voice before scenes | Pictures built first and "filled" with voice later come too early or too late. | Make and measure the voice, then build scenes on the measured words. |
| Measure the length before building | A "three minute" brief becomes five minutes when the whole script is read out. | Run the voice on the script first; shorten while nothing is built. |
| The script is the thing to review | A wrong fact found after the render costs a voice clip, music and a render. A script review finds the same errors before anything is built. | Show the script and get approval before building. |
| Counts from the source | The voice says sixteen while the screen shows ten. Items are marked at random instead of the ones from the source list. A number is rounded differently from the source. | Take every number and marked item from the source; say what is shown. |
| Check every reason | A film gives a simple reason that is wrong. | Check each "because" with the author; "for technical reasons" is better than a wrong reason. |
| Tone through wording | Bad news sounds cheerful in a neutral computer voice. A sentence sounds harsh to the people who run the current system. | Write bad news as bad news ("Unfortunately, …"); name causes, not people. |
| A renewed film keeps what the old one had | A fact from the first version is missing in the renewed one. | Compare with the old subtitles sentence by sentence. |
| Do not read the screen | Lists on screen are also read out. | The screen shows the list; the voice says what it means. |
| Give the ending time | The ending feels rushed; the voice says "the benefits" without naming them. | The conclusion gets its own time; name what you count; end card with the one decision. |
| Title page | A film that starts straight in scene 1 feels abrupt. | Always a title page of about 5 seconds without voice. |
| Control a pause by splitting | The voice service leaves too short a pause before a key sentence. | Make that sentence its own clip and set the gap. |
| The model cannot hear | A name is pronounced wrong; the first music is too gloomy. | Make samples (spellings, voices, music styles); the person chooses. |
| Music level by average loudness | Music with a beat comes out 6 to 8 dB too loud when set by its peak. | `make-audio.py` sets the level by RMS. |
| One-line subtitles | Two-line subtitles overlap in some players (for example Stream in SharePoint). | One line, at most 42 characters, separate files. |
| Look at frames, and at motion | Frame checks catch most overlaps, but lines running through figures or a meter drawn wrongly only show in motion. | Stills at the start, middle and end of every motion; a person watches the whole film. |
| Drawn flows must make sense | An arrow points from the wrong team to the wrong person. | Someone who knows the work checks every arrow. |
| Real material for recognition | A drawn intranet looks like any intranet; a real screenshot is recognised at once. | Use real screenshots where the audience knows the thing; cover personal names. |
| Shared parts before scenes | Hard cuts and repeated pictures only line up when the part is written once. | Write `src/parts/` before the scenes that use them. |
| Everything from one timing module | Subtitles, music sections, sounds and pictures no longer match when times are typed by hand. | Never hard-code a time that follows from the voice; use `clipFrame`, `sentenceFrame`, `wordFrame`. |
| Earlier work must not change | Several films share one project and a change in one touches another. | Checksums before and after; backup before a large feedback round. |
| Write the README during the work | The next person, or the next model, has nothing to start from. | README sections as in `checks-and-delivery.md`. |
| Feedback in writing, with times | Feedback given in a conversation is hard to process point by point. | Ask for a document with "0:45, scene 3: …" per point. |
| Windows path length | In a very deep folder, the downloaded Chrome cannot start (path over 260 characters). | Keep the project folder path short. |
