import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../brand/theme";
import { Logo } from "../brand/Logo";
import { prog } from "../anim";
import { Background } from "../components/Background";
import { Sfx } from "../components/Sfx";
import { clipFrame } from "../timing";

// End card: the one message or decision to remember, then the logo, with time to
// read it. The film ends on a fade to black while the last chord holds.
export const S99End: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const line1 = prog(frame, clipFrame("s99", "s99a"), 22);
  const line2 = prog(frame, clipFrame("s99", "s99a") + 30, 22);
  const logo = prog(frame, clipFrame("s99", "s99a") + 60, 24);
  const out = prog(frame, durationInFrames - 24, 24);
  const rise = (p: number): React.CSSProperties => ({ opacity: p, transform: `translateY(${(1 - p) * 16}px)` });
  return (
    <Background>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT, textAlign: "center" }}>
        <div style={{ ...rise(line1), fontSize: 66, fontWeight: 800, color: C.text, maxWidth: 1400, lineHeight: 1.15 }}>The one thing to remember.</div>
        <div style={{ ...rise(line2), fontSize: 42, fontWeight: 500, color: C.accent, marginTop: 26 }}>And what the viewer should do next.</div>
        <div style={{ ...rise(logo), marginTop: 90 }}>
          <Logo on="dark" height={70} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
      <Sfx name="swell" at={clipFrame("s99", "s99a") + 60} volume={0.2} />
    </Background>
  );
};
