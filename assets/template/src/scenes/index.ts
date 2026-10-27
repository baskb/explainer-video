import React from "react";
import { S00Title } from "./S00Title";
import { S01Example } from "./S01Example";
import { S99End } from "./S99End";

// One entry per scene id in src/timing.ts.
export const SCENE_COMPONENTS: Record<string, React.FC> = {
  s00: S00Title,
  s01: S01Example,
  s99: S99End,
};
