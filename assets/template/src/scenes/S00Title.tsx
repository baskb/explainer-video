import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT } from "../brand/theme";
import { Logo } from "../brand/Logo";
import { prog } from "../anim";
import { Background } from "../components/Background";
import { Sfx } from "../components/Sfx";

// Title page without voice (about 5 seconds): fades in from black, then the logo,
// the title, a line, and one sentence that says what the film is about.
export const S00Title: React.FC = () => {
  const frame = useCurrentFrame();
  const black = 1 - prog(frame, 0, 14);
  const logo = prog(frame, 8, 22);
  const title = prog(frame, 22, 22);
  const rule = prog(frame, 36, 20);
  const sub = prog(frame, 46, 20);
  const rise = (p: number): React.CSSProperties => ({ opacity: p, transform: `translateY(${(1 - p) * 16}px)` });
  return (
    <Background>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
        <div style={rise(logo)}>
          <Logo on="dark" height={90} />
        </div>
        <div style={{ ...rise(title), marginTop: 60, display: "flex", alignItems: "baseline", gap: 26 }}>
          <div style={{ fontSize: 76, fontWeight: 300, color: C.textMuted }}>Example</div>
          <div style={{ fontSize: 76, fontWeight: 900, color: C.text }}>film title</div>
        </div>
        <div style={{ width: 620 * rule, height: 4, borderRadius: 2, background: C.accent, marginTop: 28, boxShadow: `0 0 24px ${C.accent}88` }} />
        <div style={{ ...rise(sub), marginTop: 30, fontSize: 38, fontWeight: 500, color: C.accent }}>One sentence on what this film is about</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
      <Sfx name="swell" at={14} volume={0.25} />
    </Background>
  );
};
