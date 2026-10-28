import React from "react";
import { C, DISPLAY, DISPLAY_WEIGHT, FONT, GLOW, MONO } from "../brand/theme";
import { Icon, IconName } from "./Icon";

// Simple drawings that many films need: a document page, a film strip, a terminal
// window, a browser window, a file card and a line that draws itself. Each takes a
// progress value `p` (0 = not there, 1 = there), like the building blocks in kit.tsx.

type Box = { x: number; y: number; w: number; h: number; p?: number; style?: React.CSSProperties };

const appear = (p: number): React.CSSProperties => ({ opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 24}px) scale(${0.95 + 0.05 * p})` });

/** A paper page with an accent bar, a title and grey text lines; or your own content as children. */
export const DocPage: React.FC<Box & { title: string; lines?: number; children?: React.ReactNode }> = ({ x, y, w, h, p = 1, title, lines = 9, style, children }) => {
  if (p <= 0) return null;
  const widths = [0.92, 0.84, 0.88, 0.7, 0.9, 0.8, 0.86, 0.6, 0.9, 0.75, 0.82, 0.68];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 14, background: C.paper, boxShadow: "0 24px 60px rgba(0,0,0,0.45)", overflow: "hidden", fontFamily: FONT, ...appear(p), ...style }}>
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 10, background: C.accent }} />
      <div style={{ position: "absolute", left: 36, top: 40, fontFamily: DISPLAY, fontWeight: DISPLAY_WEIGHT, fontSize: 44, color: C.ink }}>{title}</div>
      {children ?? (
        <div style={{ position: "absolute", left: 36, right: 36, top: 120 }}>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} style={{ height: 12, borderRadius: 6, background: "rgba(0,0,0,0.14)", width: `${widths[i % widths.length] * 100}%`, marginBottom: 22 }} />
          ))}
        </div>
      )}
    </div>
  );
};

/** A film strip with sprocket holes and `frames` frames. `grey` 0..1 takes the colour out. */
export const FilmStrip: React.FC<Box & { frames?: number; grey?: number; children?: React.ReactNode }> = ({ x, y, w, h, p = 1, frames = 4, grey = 0, style, children }) => {
  if (p <= 0) return null;
  const holes = Math.floor(w / 46);
  const band = h * 0.16;
  const gap = 18;
  const fw = (w - gap * (frames + 1)) / frames;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 12, background: C.bgDeep, border: `1px solid ${C.accent}66`, boxShadow: GLOW, overflow: "hidden", filter: `grayscale(${grey}) brightness(${1 - grey * 0.35})`, ...appear(p), ...style }}>
      {[0, h - band].map((top) => (
        <div key={top} style={{ position: "absolute", left: 0, right: 0, top, height: band, display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          {Array.from({ length: holes }).map((_, i) => (
            <div key={i} style={{ width: 22, height: band * 0.46, borderRadius: 4, background: C.bg }} />
          ))}
        </div>
      ))}
      {Array.from({ length: frames }).map((_, i) => (
        <div key={i} style={{ position: "absolute", top: band + 8, height: h - band * 2 - 16, left: gap + i * (fw + gap), width: fw, borderRadius: 8, background: `linear-gradient(160deg, ${C.accent}55, ${C.bgGlow})` }} />
      ))}
      {children}
    </div>
  );
};

/** A terminal window with three dots and a title; children are the lines inside (monospace). */
export const Terminal: React.FC<Box & { title?: string; children?: React.ReactNode }> = ({ x, y, w, h, p = 1, title = "Terminal", style, children }) => {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, background: "rgba(5,8,16,0.9)", border: `1px solid ${C.accent}77`, boxShadow: GLOW, overflow: "hidden", ...appear(p), ...style }}>
      <div style={{ height: 54, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", borderBottom: `1px solid ${C.line}` }}>
        {[C.bad, C.warn, C.good].map((c) => (
          <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c, opacity: 0.8 }} />
        ))}
        <div style={{ marginLeft: 16, fontFamily: MONO, fontSize: 22, color: C.textMuted }}>{title}</div>
      </div>
      <div style={{ position: "absolute", left: 32, right: 32, top: 84, bottom: 24, fontFamily: MONO, fontSize: 26, color: C.text, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
};

/** A browser window with an address bar; children fill the page area (a drawn page or a screenshot). */
export const Browser: React.FC<Box & { url: string; children?: React.ReactNode }> = ({ x, y, w, h, p = 1, url, style, children }) => {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 16, background: C.bgDeep, border: `1px solid ${C.line}`, boxShadow: "0 24px 60px rgba(0,0,0,0.45)", overflow: "hidden", ...appear(p), ...style }}>
      <div style={{ height: 50, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", background: C.bg }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 6, background: C.line }} />
        ))}
        <div style={{ marginLeft: 14, flex: 1, height: 30, borderRadius: 15, background: C.bgDeep, display: "flex", alignItems: "center", padding: "0 16px", fontFamily: MONO, fontSize: 18, color: C.textMuted }}>{url}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 50, bottom: 0, overflow: "hidden" }}>{children}</div>
    </div>
  );
};

/** A file card: icon, name and a small line under it. */
export const FileCard: React.FC<{ x: number; y: number; w?: number; h?: number; p?: number; icon: IconName; name: string; sub?: string; colour?: string }> = ({ x, y, w = 320, h = 300, p = 1, icon, name, sub, colour = C.accent }) => {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 22, background: C.card, border: `1px solid ${colour}77`, boxShadow: GLOW, fontFamily: FONT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, ...appear(p) }}>
      <div style={{ width: 104, height: 104, borderRadius: 26, background: `${colour}22`, border: `1px solid ${colour}`, display: "grid", placeItems: "center" }}>
        <Icon name={icon} size={56} colour={colour} stroke={1.7} />
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: DISPLAY_WEIGHT, fontSize: 44, lineHeight: 1, color: C.text }}>{name}</div>
      {sub ? <div style={{ fontFamily: MONO, fontSize: 22, color: C.textMuted }}>{sub}</div> : null}
    </div>
  );
};

/** A line between two points that draws itself as `p` goes from 0 to 1. Put it in a full-screen <svg>. */
export const DrawLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; colour?: string; width?: number }> = ({ x1, y1, x2, y2, p, colour = C.accent, width = 2.5 }) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={width} strokeLinecap="round" strokeDasharray={`${len} ${len}`} strokeDashoffset={len * (1 - p)} />;
};
