import React from "react";
import { Img, staticFile } from "remotion";

// The logo files in public/brand/: logo-light.svg (for dark backgrounds),
// logo-dark.svg (for light backgrounds), mark.svg (the symbol alone). Replace the
// placeholders with the company's files and set RATIO to their width / height.
const RATIO = { full: 4, mark: 1 };

export const Logo: React.FC<{ kind?: "full" | "mark"; on?: "dark" | "light"; height: number; style?: React.CSSProperties }> = ({
  kind = "full",
  on = "dark",
  height,
  style,
}) => {
  const file = kind === "mark" ? "brand/mark.svg" : on === "dark" ? "brand/logo-light.svg" : "brand/logo-dark.svg";
  return <Img src={staticFile(file)} style={{ height, width: height * RATIO[kind], display: "block", ...style }} />;
};
