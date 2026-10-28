# Explainer video skill for Claude Code

https://github.com/user-attachments/assets/a391b5cf-31be-47b0-b7a8-19242b82c074

This 2-minute film about the skill was made with the skill itself, in one working session: script, voice-over, music, scenes and English and Dutch subtitles.

A skill for [Claude Code](https://claude.com/claude-code) that makes a finished animated explainer video from a script or from a document about the subject. The result is an MP4 (1920x1080, usually 3 to 5 minutes) in the colours, font and logo of a company website, with a computer voice-over, generated music and sounds, and subtitle files in one or more languages.

The film is written as code with [Remotion](https://www.remotion.dev): every scene is a small React component, and every movement is timed on the spoken words. That makes changes after feedback quick: change a sentence, make that one voice clip again, render.

## What you need

- Claude Code.
- Node.js 20 or newer.
- ffmpeg and ffprobe on the PATH.
- Python 3 with two packages: `pip install edge-tts numpy`.
- An internet connection (for the voices, the fonts and the first download of Chrome that Remotion uses to render).

## Install

Clone this repository into your Claude Code skills folder.

macOS or Linux:

```
git clone https://github.com/baskb/explainer-video.git ~/.claude/skills/explainer-video
```

Windows (PowerShell):

```
git clone https://github.com/baskb/explainer-video.git "$env:USERPROFILE\.claude\skills\explainer-video"
```

Start a new Claude Code session. The skill is now listed and starts by itself when you ask for an explainer film.

## Use

Ask Claude Code something like: "Make a 3-minute explainer video about this document, in the style of www.example.com." Give it the script or document, the website, and who the film is for.

Claude asks a few questions in one go (audience, length, voice, subtitle languages), sets up a film project from the template, takes colours and logo from the website, and writes the script. It shows you the script with the measured length and waits for your approval before building the scenes. Then it builds the scenes, the music and the subtitles, renders the film and checks it.

Claude cannot hear sound. It makes samples of voices, pronunciations and music styles for you to choose from, and you should watch the finished film with sound before you share it.

## What is in this folder

- `SKILL.md`: the steps Claude follows.
- `references/`: detailed notes per step (script writing, brand, scenes and motion, audio, subtitles, checks and delivery, lessons learned).
- `assets/template/`: a working Remotion project with a short example film, copied for every new film.
- `scripts/extract-brand.py`: collects colours, fonts and logo files from a website.

## Good to know

- Remotion is free for individuals and for companies with up to 3 employees. Larger companies need a Remotion company licence. See [remotion.dev/license](https://www.remotion.dev/license).
- The voice uses `edge-tts`, which calls the free read-aloud service of Microsoft Edge. That is fine for trying things out and for internal films. For a public or production film, use the same voices through Azure AI Speech, or a human voice.
- The music and sounds are generated from code, so there are no licence questions about them.
- Logos, colours and fonts taken from a website belong to that company. Check their brand rules before a film is shown outside the company.
