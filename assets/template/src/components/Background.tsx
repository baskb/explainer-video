import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT } from "../brand/theme";

/**
 * The background of every scene: a slow-moving gradient with a faint dot grid.
 * `frameOffset` lets a scene continue the background of the scene before it at a
 * hard cut (pass the length of the previous scene), so the cut is not visible.
 */
export const Background: React.FC<{ children?: React.ReactNode; light?: boolean; frameOffset?: number }> = ({ children, light, frameOffset = 0 }) => {
  const frame = useCurrentFrame() + frameOffset;
  const drift = Math.sin(frame / 90) * 40;
  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        overflow: "hidden",
        background: light
          ? `radial-gradient(1400px 900px at ${60 + drift / 20}% 20%, #ffffff 0%, ${C.paper} 55%, #e4ebf6 100%)`
          : `radial-gradient(1500px 1000px at ${65 + drift / 20}% 15%, ${C.bgGlow} 0%, ${C.bg} 48%, ${C.bgDeep} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${light ? "rgba(20,33,61,0.09)" : "rgba(255,255,255,0.07)"} 1.4px, transparent 1.6px)`,
          backgroundSize: "36px 36px",
          backgroundPosition: `${drift / 4}px ${frame * 0.15}px`,
          maskImage: "radial-gradient(1200px 800px at 50% 45%, black 20%, transparent 85%)",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
