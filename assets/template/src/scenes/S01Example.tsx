import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../brand/theme";
import { pop, prog } from "../anim";
import { Background } from "../components/Background";
import { Card, Headline, Kicker } from "../components/kit";
import { Icon } from "../components/Icon";
import { Sfx } from "../components/Sfx";
import { clipFrame, wordFrame } from "../timing";

// Example of a content scene: the headline appears when the first clip starts, and
// each card pops in on the word that names it. Everything else holds still.
const CARDS = [
  { word: "script", title: "Script", icon: "doc" as const, colour: C.accent },
  { word: "voice", title: "Voice", icon: "wave" as const, colour: C.highlight },
  { word: "pictures", title: "Pictures", icon: "spark" as const, colour: C.good },
];

export const S01Example: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = prog(frame, clipFrame("s01", "s01a"), 20);
  return (
    <Background>
      <Kicker text="How it works" p={prog(frame, 4, 16)} />
      <Headline text="Built entirely" strong="from code" p={head} style={{ position: "absolute", left: 80, top: 190 }} />
      {CARDS.map((c, i) => {
        const at = wordFrame("s01", "s01b", c.word) - 4; // a few frames before the word, so it is there when heard
        const p = pop(frame, fps, at);
        return (
          <React.Fragment key={c.word}>
            <Card x={80 + i * 600} y={430} w={560} h={380} p={p} colour={c.colour}>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                <div style={{ textAlign: "center", color: C.text, fontSize: 44, fontWeight: 700 }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
                    <Icon name={c.icon} size={96} colour={c.colour} stroke={1.6} />
                  </div>
                  {c.title}
                </div>
              </div>
            </Card>
            <Sfx name="pop" at={at} volume={0.2} />
          </React.Fragment>
        );
      })}
    </Background>
  );
};
