# Writing or improving the script

The script is the thing to review. Changing a fact in the script costs a minute; changing it after the render costs a voice clip, new music and a render. So the script is written (or improved) first, shown to the person, and only built after they approve it.

## Input you may get

- **A finished script.** Ask whether it must be read word for word or may be shortened. Keep sentences the author marks as important word for word. Improve only what the rules below require, and list every change in the README under "Differences from the script".
- **A document or a few lines about the subject** (a design document, an impact assessment, a policy, a product page). Write the script yourself from it. Use the terms of the document as they are on that day, round numbers the way the document does, and write down which document and which revision the film follows. A film is as correct as its sources on the day it was made.
- **An earlier film to renew.** Read its subtitles (`.vtt`) next to the new sources, sentence by sentence. Keep what it got right; a renewed film easily loses a fact that the old one had.

## Script format

One Markdown file, `script/<title> script.md`, with a short header (audience, message, length, sources with revision, voice, style) and one section per scene:

```markdown
## Scene 2. Where the time goes

What is seen: a week planner fills with blocks. The 12 blocks that are manual data entry turn amber and slide into a stack on the right, with a counter.

Text on screen: "Where the time goes", "12 hours a week", "manual data entry".

Voice-over: "Every week, our team spends twelve hours typing the same data into three different systems." **(key)**
```

End the file with "Notes for the build" (sources per fact, what was shortened and why, sentences that can be cut if the film must be shorter). After feedback rounds, add a section per round with what changed.

## Structure: opening, middle, closing

- **Title page** (scene `s00`, about 5 seconds, no voice): logo, title, one line that says what the film is about. A film that starts straight in the first scene feels abrupt.
- **Opening** (scene 1, sometimes 2): where the viewer is today, in a picture they recognise (a real screenshot of their intranet, their way of working, the problem as they feel it). Short: 10 to 25 seconds.
- **Middle** (most scenes): one idea per scene, in the order of the story. A scene is 10 to 50 seconds. A long scene works when the picture changes with every sentence. Typical patterns: problem, cause, what we did, how it works, what it costs, options.
- **Closing** (last one or two scenes plus end card): the one message or decision, said plainly, with time. A rushed ending is a common complaint. If the voice says "eight benefits", it names all eight. The end card shows the core decision or message and the logo, and holds for about 3 seconds after the last word.

## Length

- The narrator (Ava at +5%) reads about 150 to 157 words per minute.
- A film is about 1.15 times the speech, plus the title page. 600 words of voice-over gives about 4:30.
- Measure before building: run `npm run voice` on the script and look at the printed total. Shorten then, when nothing is built yet.
- Agree a maximum length at the start. Every feedback round tends to make a film longer. Keep a list of sentences that can be cut.

## Rules for the voice-over

- **Do not read what the screen shows.** A list of names on screen needs one sentence about what the list means, not the list. This often cuts a script by a fifth without losing a message.
- **Short sentences, plain words, no metaphors.** The computer voice reads exactly what is written. Write numbers as they should be spoken ("forty-two" or "42" both work; "14 July 2026" is read correctly).
- **Write for the ear.** "An HR system" (letters are spoken), not "A HR system". Explain an abbreviation once ("CRM, the customer relationship management system").
- **Counts come from the source, and what is said is what is shown.** A voice that says "sixteen principles" while the screen shows ten, or items marked at random instead of the ones in the source list, will be noticed. Take every number and every marked item from the source file.
- **Check every "because".** It is tempting to give a simple reason that is wrong when the real one is too technical to explain. If the real reason is too technical, say "for technical reasons" rather than a simpler reason that is wrong.
- **Tone.** The voice cannot be told to sound disappointed. Wording does it: "Unfortunately, the old system no longer gets updates, so problems will not be fixed." Read every sentence with each group in the audience in mind; a sentence can sound harsh to the people who run the current system. Name the cause, not the people.
- **No real names of people**, unless the person asks. Show people by role. Product names as plain text, no product logos.
- **Leave out what the audience does not need**: internal numbering, names of tools, project codes.
- **Pauses**: the voice service sets its own pauses inside a clip. Where a pause matters ("Technology alone does not make it work. … People do."), make the second sentence its own clip.

## Splitting into clips

Clip ids are scene id plus a letter: `s02a`, `s02b`. A clip is one to three sentences. Split where a picture must change on a sentence, or where you want to set the pause. These go into `script/voiceover.json`.
