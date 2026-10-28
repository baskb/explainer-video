// Brand of this film. Fill from the company website (see the skill's
// references/brand-from-website.md): colours from its stylesheet, font from its
// font-family. Only fonts in @remotion/google-fonts can be loaded this way; for a
// font that is not there, pick the closest Google font and say so in the README.
import { loadFont } from "@remotion/google-fonts/Inter";

export const { fontFamily: FONT } = loadFont("normal", { weights: ["300", "400", "500", "700", "900"], subsets: ["latin"] });
// Headlines and big numbers. Most brands use the body font with a heavy weight.
// A brand with a separate display font that has one weight (for example Bebas Neue):
//   import { loadFont as loadDisplay } from "@remotion/google-fonts/BebasNeue";
//   export const { fontFamily: DISPLAY } = loadDisplay("normal", { weights: ["400"], subsets: ["latin"] });
// and set DISPLAY_WEIGHT to 400, so the browser never makes up a bold version.
export const DISPLAY = FONT;
export const DISPLAY_WEIGHT = 800;
// Terminal text, file names, code and web addresses.
export const MONO = "ui-monospace, 'Cascadia Mono', Consolas, 'SF Mono', Menlo, monospace";

export const C = {
  // Background of most scenes (dark), from deep to light for the gradient.
  bgDeep: "#050d1f",
  bg: "#0b1f3a",
  bgGlow: "#16407c",
  // Light background for a light scene, and dark text on it.
  paper: "#f4f6fb",
  ink: "#14213d",
  slate: "#5b6b82",
  // Brand colours: primary (main brand colour), accent (highlights, lines, the thing that matters), highlight (warm contrast, used sparingly).
  primary: "#1e66f5",
  accent: "#22c3ee",
  highlight: "#f59e0b",
  // Meaning colours, used the same way in every scene.
  good: "#22a06b",
  warn: "#f2c14e",
  bad: "#e5484d",
  // Text and lines on the dark background.
  text: "#ffffff",
  // Text on a filled accent shape (badges, buttons). Use a dark colour when the accent is light.
  onAccent: "#ffffff",
  textMuted: "rgba(255,255,255,0.72)",
  line: "rgba(255,255,255,0.18)",
  card: "rgba(10, 34, 72, 0.92)",
} as const;

export const SHADOW = "0 20px 50px rgba(0,0,0,0.35)";
/** A soft glow in the accent colour, for windows and drawings that should stand out. */
export const GLOW = `0 0 28px ${C.accent}2e, ${SHADOW}`;
