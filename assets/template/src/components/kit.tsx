import React from "react";
import { C, FONT, SHADOW } from "../brand/theme";
import { Icon, IconName } from "./Icon";

// Building blocks for scenes. Each takes a progress value `p` (0 = not there,
// 1 = fully there) that the scene computes from the frame with prog() or pop()
// from anim.ts, so every element appears on its own spoken word.

/** The small label in the top left that names the subject of the scene, so it reads without sound. */
export const Kicker: React.FC<{ text: string; p?: number }> = ({ text, p = 1 }) => (
  <div style={{ position: "absolute", left: 80, top: 70, display: "flex", alignItems: "center", gap: 14, opacity: p, fontFamily: FONT }}>
    <div style={{ width: 4, height: 26, borderRadius: 2, background: C.accent }} />
    <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: C.textMuted }}>{text}</div>
  </div>
);

/** A large headline; `strong` is the part in the accent colour. */
export const Headline: React.FC<{ text: string; strong?: string; p?: number; size?: number; style?: React.CSSProperties }> = ({ text, strong, p = 1, size = 64, style }) => (
  <div style={{ fontFamily: FONT, fontSize: size, fontWeight: 800, lineHeight: 1.12, color: C.text, opacity: p, transform: `translateY(${(1 - p) * 24}px)`, ...style }}>
    {text} {strong ? <span style={{ color: C.accent }}>{strong}</span> : null}
  </div>
);

/** A dark card with an optional icon and title. */
export const Card: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  icon?: IconName;
  colour?: string;
  p?: number;
  dim?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x, y, w, h, title, icon, colour = C.accent, p = 1, dim = 0, children, style }) => {
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        boxSizing: "border-box",
        borderRadius: 24,
        background: C.card,
        border: `1.5px solid ${colour}${dim > 0 ? "44" : "88"}`,
        boxShadow: SHADOW,
        opacity: p * (1 - dim * 0.55),
        transform: `translateY(${(1 - p) * 24}px) scale(${0.96 + 0.04 * p})`,
        fontFamily: FONT,
        overflow: "hidden",
        ...style,
      }}
    >
      {title ? (
        <div style={{ position: "absolute", left: 26, top: 22, right: 26, display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 700, color: C.text }}>
          {icon ? (
            <div style={{ width: 50, height: 50, borderRadius: 14, background: `${colour}2e`, border: `1.5px solid ${colour}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon name={icon} size={28} colour={colour} stroke={2} />
            </div>
          ) : null}
          <span style={{ lineHeight: 1.15 }}>{title}</span>
        </div>
      ) : null}
      {children}
    </div>
  );
};

/** One line with an icon, for lists inside a card. */
export const Bullet: React.FC<{ icon: IconName; colour?: string; p: number; children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ icon, colour = C.accent, p, children, size = 24, style }) => {
  if (p <= 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: size, color: C.text, opacity: p, transform: `translateX(${(1 - p) * -14}px)`, fontFamily: FONT, lineHeight: 1.2, ...style }}>
      <div style={{ width: size * 1.7, height: size * 1.7, borderRadius: 10, background: `${colour}26`, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon name={icon} size={size} colour={colour} stroke={2} />
      </div>
      <span>{children}</span>
    </div>
  );
};

/** A small pill label, for example "Our advice" or "Not recommended". */
export const Badge: React.FC<{ label: string; icon?: IconName; colour?: string; p: number; style?: React.CSSProperties }> = ({ label, icon, colour = C.accent, p, style }) => {
  if (p <= 0) return null;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 18px",
        borderRadius: 999,
        background: colour,
        color: "#fff",
        fontSize: 20,
        fontWeight: 700,
        whiteSpace: "nowrap",
        opacity: Math.min(1, p * 1.3),
        transform: `scale(${0.7 + 0.3 * p})`,
        boxShadow: `0 0 24px ${colour}66`,
        fontFamily: FONT,
        ...style,
      }}
    >
      {icon ? <Icon name={icon} size={20} colour="#fff" stroke={2.4} /> : null}
      {label}
    </div>
  );
};

/** A number that counts up from 0 to `to` as `p` goes from 0 to 1. */
export const Counter: React.FC<{ to: number; p: number; suffix?: string; size?: number; colour?: string; style?: React.CSSProperties }> = ({ to, p, suffix = "", size = 96, colour = C.accent, style }) => (
  <span style={{ fontFamily: FONT, fontSize: size, fontWeight: 900, color: colour, fontVariantNumeric: "tabular-nums", ...style }}>
    {Math.round(to * Math.max(0, Math.min(1, p))).toLocaleString("en-US")}
    {suffix}
  </span>
);
