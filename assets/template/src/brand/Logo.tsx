import React from "react";
import { Img, staticFile } from "remotion";

// The logo files in public/brand/: a version for dark backgrounds, one for light
// backgrounds, and the symbol alone. SVG is best; PNG works too (use a transparent
// PNG without empty border). Replace the placeholders with the company's files,
// change the names here if they are PNG, and set RATIO to width / height of each
// file (from the SVG viewBox, or `ffprobe` for a PNG).
const FILES = { light: "brand/logo-light.svg", dark: "brand/logo-dark.svg", mark: "brand/mark.svg" };
const RATIO = { full: 4, mark: 1 };

export const Logo: React.FC<{ kind?: "full" | "mark"; on?: "dark" | "light"; height: number; style?: React.CSSProperties }> = ({
  kind = "full",
  on = "dark",
  height,
  style,
}) => {
  const file = kind === "mark" ? FILES.mark : on === "dark" ? FILES.light : FILES.dark;
  return <Img src={staticFile(file)} style={{ height, width: height * RATIO[kind], display: "block", ...style }} />;
};
