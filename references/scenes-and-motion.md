# Scenes and motion

Remotion turns React code into video. A scene is a function that gets the current frame number and returns the picture for that frame: HTML and SVG on a 1920 x 1080 canvas, every movement computed from the frame number. The same frame always gives the same picture, which is why checking single frames works.

## Files

| Where | What |
| --- | --- |
| `src/timing.ts` | Order and length of the scenes, voice clips per scene, transitions. The only place for timing. |
| `src/scenes/S01Name.tsx` | One file per scene, listed in `src/scenes/index.ts` under its id. |
| `src/parts/` | Parts used by more than one scene of this film (a wall of tiles, a roadmap, a crowd). Write these before the scenes. |
| `src/components/` | `Background`, `kit.tsx` (Kicker, Headline, Card, Bullet, Badge, Counter), `Icon` (about 50 line icons on a 24 grid: mail, check, doc, folder, lock, users, user, warning, database, search, calendar, chart, gantt, ship, spark, bolt, history, shield, bulb, building, gear, phone, grid, chat, scale, euro, layers, send, wave, clock, attach, arrowRight, mobile, cloud, satellite, pause, refresh, wifiOff, key, cube, flag, target, hub, server, link, cross, plus, question, eye, compass), `Sfx`. |
| `src/anim.ts` | `prog(frame, start, dur)` 0 to 1 with ease-out; `pop(frame, fps, start)` a spring; `fadeUp`, `fadeInOut`, `typed` (text that types itself), `lerp`, `s(seconds)` to frames. |
| `src/brand/` | `theme.ts` (colours `C`, `FONT`), `Logo.tsx`. |

## Timing a picture to the voice

```tsx
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const head = prog(frame, clipFrame("s02", "s02a"), 20);          // when the clip starts
const second = prog(frame, sentenceFrame("s02", "s02c", 1), 18); // second sentence of a clip
const stamp = pop(frame, fps, wordFrame("s07", "s07a", "budget") - 6, 11); // on one spoken word
```

Start an element 4 to 6 frames before its word, so it is there when the word is heard. `wordFrame` throws an error if the word is not in the clip; that is how a changed voice-over shows you which scene to update.

Scene spec in `timing.ts`:

```ts
{ id: "s02", min: 10, vo: [{ clip: "s02a", at: 0.6 }, { clip: "s02b", gap: 0.45 }], tail: 1.1, fadeOut: 18 },
```

`min` = shortest length the pictures need; `at` = seconds after the scene start; `gap` = pause after the previous clip; `tail` = seconds after the last word; `fadeOut` = frames of cross-fade into the next scene, 0 for a hard cut. The scene lasts the longer of `min` and last word plus `tail`.

## Transitions

- **Cross-fade** (18 frames) between scenes that show different pictures.
- **Hard cut** (`fadeOut: 0`) between scenes that continue one picture: the second scene starts by drawing exactly the last frame of the first (same shared part, same positions, `Background frameOffset={previous scene frames}`) and moves on from there. The viewer sees one continuous picture. Check both sides of the cut with stills.

## Rules that keep a picture readable

- One thing changes at a time, on the word that names it. Everything else holds still.
- A scene must be readable without sound: the `Kicker` names the subject, the key sentence or number is on screen. Many people watch without sound.
- Text is at least 18 px at 1080p, mostly 22 to 30 px for labels and 56 to 76 px for headlines. At most two lines. Give boxes room: text running past a card edge was the most common fix.
- Labels name what the viewer sees, short. The voice explains; the screen shows.
- The same thing looks the same in every scene (same component, same colour, same place).
- Colours have one meaning in the whole film (green good, red risk, accent = the subject).
- Use the full canvas. An empty half of the screen looks unfinished.
- Crowds: one SVG with many small figures, not 300 full components; full illustrated people only where one person matters. Renders stay fast.
- Gauges, meters and arcs: check frames in the middle of the motion, not only the end. An SVG arc can be drawn the long way round above 50 percent; fixed zones with a moving needle avoid that.
- People and places are illustrated (shapes and SVG), not photorealistic. For real people, places or products, ask for photos or footage.

## Making it look good

- Dark background with a slow gradient and dot grid (`Background`), light text, one accent colour with a soft glow (`boxShadow: 0 0 24px ${C.accent}66`).
- Elements arrive with `pop` (spring) or `fadeUp`; lists build one item per spoken word; numbers count up with `Counter`.
- Small sounds on arrivals (`pop`, `soft`, `check`, `whoosh`) at volume 0.15 to 0.35.
- Cards with a coloured border and an icon in a tinted square; badges as pills ("Our advice").
- Simple diagrams drawn in SVG: lines between cards that draw themselves (`strokeDasharray` with `prog`), dots moving along a line, a timeline with markers that pop in.
- Before writing the scenes, look at the stills of the template and of earlier films if there are any, so the style stays the same.
