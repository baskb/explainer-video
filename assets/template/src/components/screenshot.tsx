import React from "react";
import { Img, staticFile } from "remotion";
import { C, FONT, MONO } from "../brand/theme";
import shots from "../../public/shots/index.json";
import { Browser } from "./drawings";

// Real screenshots in a scene. `npm run shoot` takes them (see script/shoot.mjs and
// references/screenshots.md) and writes public/shots/<name>.png plus index.json with
// the size of the browser window each was taken at, in CSS pixels. All positions
// here (crops, marks) are in those CSS pixels, so a number read from the page
// (getBoundingClientRect) can be used as it is.

type ShotName = keyof typeof shots;
/** Part of a screenshot to show: left, top and width in CSS px of the page. */
export type Crop = { x: number; y: number; w: number };

const sizeOf = (name: string): { w: number; h: number } => {
  const s = (shots as Record<string, { w: number; h: number }>)[name];
  if (!s) throw new Error(`Screenshot "${name}" is not in public/shots/index.json; run npm run shoot`);
  return s;
};

/** The whole screenshot. */
export const full = (name: ShotName | string): Crop => ({ x: 0, y: 0, w: sizeOf(name).w });

/** Blend two crops; t 0..1. For a zoom or a pan. */
export const mixCrop = (a: Crop, b: Crop, t: number): Crop => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t });

/** A point on the page (CSS px) as a point in a box of width `boxW` showing `crop`; k = the scale. */
export const toBox = (crop: Crop, boxW: number, x: number, y: number) => {
  const k = boxW / crop.w;
  return { x: (x - crop.x) * k, y: (y - crop.y) * k, k };
};

/** One screenshot, cropped to fill a box of w x h. */
export const ShotImage: React.FC<{ name: ShotName | string; w: number; h: number; crop?: Crop; opacity?: number }> = ({ name, w, h, crop, opacity = 1 }) => {
  const size = sizeOf(name);
  const c = crop ?? { x: 0, y: 0, w: size.w };
  const k = w / c.w;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, overflow: "hidden", opacity }}>
      <Img src={staticFile(`shots/${name}.png`)} style={{ position: "absolute", left: -c.x * k, top: -c.y * k, width: size.w * k, height: size.h * k, maxWidth: "none" }} />
    </div>
  );
};

/**
 * Screenshots in a browser window. `layers` are drawn in order, each with its own
 * opacity and crop, so one screenshot can fade into the next. Children are drawn
 * on top, in box coordinates (marks, a pointer, pins).
 */
export const ShotWindow: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  p?: number;
  url?: string;
  layers: { name: ShotName | string; opacity: number; crop?: Crop }[];
  children?: React.ReactNode;
}> = ({ x, y, w, h, p = 1, url = "localhost", layers, children }) => (
  <Browser x={x} y={y} w={w} h={h + 50} p={p} url={url}>
    {layers.map((l, i) => (l.opacity > 0 ? <ShotImage key={i} name={l.name} w={w} h={h} crop={l.crop} opacity={l.opacity} /> : null))}
    <div style={{ position: "absolute", inset: 0 }}>{children}</div>
  </Browser>
);

/** An outline that draws attention to part of a screenshot, with an optional label. */
export const Mark: React.FC<{ x: number; y: number; w: number; h: number; p: number; colour?: string; label?: string }> = ({ x, y, w, h, p, colour = C.accent, label }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", left: x - 6, top: y - 6, width: w + 12, height: h + 12, borderRadius: 12, border: `3px solid ${colour}`, boxShadow: `0 0 18px ${colour}88`, opacity: Math.min(1, p * 1.4), transform: `scale(${1.15 - 0.15 * p})` }}>
      {label ? <div style={{ position: "absolute", left: -3, top: -38, padding: "4px 12px", borderRadius: 8, background: colour, color: C.onAccent, fontFamily: FONT, fontWeight: 700, fontSize: 20, whiteSpace: "nowrap" }}>{label}</div> : null}
    </div>
  );

/** A numbered pin (a drop shape), centred on x, y. */
export const Pin: React.FC<{ x: number; y: number; n: number | string; p: number; colour?: string; size?: number }> = ({ x, y, n, p, colour = C.accent, size = 40 }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: `${size / 2}px ${size / 2}px ${size / 2}px 4px`, background: colour, color: C.onAccent, display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 700, fontSize: size * 0.5, boxShadow: `0 0 16px ${colour}88`, transform: `scale(${p})`, opacity: Math.min(1, p * 1.5) }}>{n}</div>
  );

/** A mouse pointer (arrow), tip at x, y. */
export const Pointer: React.FC<{ x: number; y: number; opacity?: number; size?: number }> = ({ x, y, opacity = 1, size = 34 }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 20 26" style={{ position: "absolute", left: x - 2, top: y - 1, opacity, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.45))" }}>
    <path d="M2 1 L2 20 L7 15.5 L10.5 23.5 L13.5 22 L10 14.5 L17 14.5 Z" fill="#fff" stroke="#111" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

/** A small code chip, for exact values ("padding 0px → 16px"), commands or flags. */
export const CodeChip: React.FC<{ text: string; p: number; size?: number; style?: React.CSSProperties }> = ({ text, p, size = 26, style }) =>
  p <= 0 ? null : (
    <div style={{ display: "inline-block", padding: "10px 18px", borderRadius: 12, background: "rgba(5,8,16,0.85)", border: `1px solid ${C.accent}88`, fontFamily: MONO, fontSize: size, color: C.highlight, whiteSpace: "nowrap", opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 14}px)`, ...style }}>{text}</div>
  );
