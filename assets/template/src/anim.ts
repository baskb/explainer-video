import { Easing, interpolate, spring } from "remotion";
import { FPS } from "./fps";

export { FPS };
export const s = (seconds: number) => Math.round(seconds * FPS);

export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** 0 → 1 between start and start+dur (in frames), eased. */
export const prog = (frame: number, start: number, dur = 18, easing = EASE_OUT) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Opacity + upward slide for an element that appears at `start`. */
export const fadeUp = (frame: number, start: number, dur = 18, dist = 24) => {
  const p = prog(frame, start, dur);
  return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` };
};

/** Opacity that fades in at `inAt` and out at `outAt`. */
export const fadeInOut = (frame: number, inAt: number, outAt: number, dur = 12) =>
  Math.min(prog(frame, inAt, dur), 1 - prog(frame, outAt, dur, EASE_IN_OUT));

export const pop = (frame: number, fps: number, start: number, damping = 14) =>
  spring({ frame: frame - start, fps, config: { damping, stiffness: 170, mass: 0.8 } });

/** Visible part of `text` when typing at `cps` characters per second. */
export const typed = (text: string, frame: number, start: number, cps = 40) => {
  const n = Math.floor(Math.max(0, frame - start) * (cps / FPS));
  return text.slice(0, Math.min(text.length, n));
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
