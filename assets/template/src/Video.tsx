import React from "react";
import { AbsoluteFill, Audio, Sequence, getStaticFiles, interpolate, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { SCENE_COMPONENTS } from "./scenes";
import { SCENES, VO_CUES } from "./timing";

// Music level: lower while the narrator speaks, back up in the pauses.
const MUSIC_FULL = 0.26;
const MUSIC_UNDER_VOICE = 0.1;
const RAMP = 10; // frames

const musicVolume = (f: number) => {
  let v = MUSIC_FULL;
  for (const c of VO_CUES) {
    const t = interpolate(f, [c.from - RAMP, c.from, c.from + c.speechFrames, c.from + c.speechFrames + RAMP * 2], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    v = Math.min(v, MUSIC_FULL - (MUSIC_FULL - MUSIC_UNDER_VOICE) * t);
  }
  return v;
};

// A track placed at public/audio/music.mp3 replaces the generated music.
const musicFile = () => (getStaticFiles().some((f) => f.name === "audio/music.mp3") ? "audio/music.mp3" : "audio/music.wav");
const hasMusic = () => getStaticFiles().some((f) => f.name === "audio/music.mp3" || f.name === "audio/music.wav");

export const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <TransitionSeries>
      {SCENES.flatMap((sc, i) => {
        const Scene = SCENE_COMPONENTS[sc.id];
        if (!Scene) throw new Error(`Scene ${sc.id} is in timing.ts but not in scenes/index.ts`);
        const out = [
          <TransitionSeries.Sequence key={sc.id} durationInFrames={sc.frames}>
            <Scene />
          </TransitionSeries.Sequence>,
        ];
        if (i < SCENES.length - 1 && sc.fadeOut > 0) {
          out.push(<TransitionSeries.Transition key={`${sc.id}-fade`} presentation={fade()} timing={linearTiming({ durationInFrames: sc.fadeOut })} />);
        }
        return out;
      })}
    </TransitionSeries>
    {VO_CUES.map((c) => (
      <Sequence key={c.clip} from={c.from} durationInFrames={c.frames} layout="none">
        <Audio src={staticFile(`audio/vo/${c.clip}.mp3`)} volume={1} />
      </Sequence>
    ))}
    {hasMusic() ? <Audio src={staticFile(musicFile())} volume={musicVolume} /> : null}
  </AbsoluteFill>
);
