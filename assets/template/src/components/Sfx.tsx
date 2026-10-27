import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

// The sounds made by script/make-audio.py.
export type SfxName = "notify" | "pop" | "click" | "whoosh" | "tick" | "success" | "rewind" | "check" | "swell" | "phone" | "soft" | "freeze" | "disconnect" | "connect";

/** Plays a sound at frame `at` (relative to the scene). Keep volumes low (0.15 to 0.35): sounds support the picture, the voice stays on top. */
export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({ name, at, volume = 0.3 }) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none">
    <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);
