import durations from "../public/audio/durations.json";
import { FPS } from "./fps";

// The only place where the order and length of the scenes are set.
// Scene lengths follow the measured voice clips (public/audio/durations.json,
// made by script/make-voice.py), so changing a sentence re-times the film by itself.

type ClipId = keyof typeof durations;
/** A voice clip in a scene. `at` = seconds from the scene start; or `gap` = seconds after the last spoken word of the clip before it. */
type VoCue = { clip: ClipId; at?: number; gap?: number };

type SceneSpec = {
  id: string;
  /** Shortest length the pictures need, in seconds. */
  min: number;
  vo: VoCue[];
  /** Seconds the scene stays after the last spoken word. */
  tail: number;
  /** Frames of cross-fade into the next scene (0 = hard cut: the next scene continues this picture). */
  fadeOut: number;
};

const SPECS: SceneSpec[] = [
  // Title page, no voice: fades in from black, cross-fades into scene 1.
  { id: "s00", min: 4.5, vo: [], tail: 0, fadeOut: 18 },
  { id: "s01", min: 8, vo: [{ clip: "s01a", at: 0.6 }, { clip: "s01b", gap: 0.5 }], tail: 1.2, fadeOut: 18 },
  // End card: closing lines and logo, with time to read and a held last chord.
  { id: "s99", min: 7, vo: [{ clip: "s99a", at: 1.0 }], tail: 3.0, fadeOut: 0 },
];

/** Time of the last spoken word in a clip (the MP3 has some silence after it). */
const speechEnd = (clip: ClipId) => {
  const sentences = durations[clip].sentences;
  return sentences.length ? Math.min(durations[clip].duration, sentences[sentences.length - 1].end) : durations[clip].duration;
};

type PlacedCue = { clip: ClipId; at: number };
export type SceneTiming = Omit<SceneSpec, "vo"> & { vo: PlacedCue[]; frames: number; start: number };

const place = (cues: VoCue[]): PlacedCue[] => {
  const out: PlacedCue[] = [];
  for (const c of cues) {
    const prev = out[out.length - 1];
    const at = c.at ?? (prev ? prev.at + speechEnd(prev.clip) + (c.gap ?? 0.5) : 0);
    out.push({ clip: c.clip, at });
  }
  return out;
};

export const SCENES: SceneTiming[] = (() => {
  let cursor = 0;
  return SPECS.map((spec) => {
    const vo = place(spec.vo);
    const lastWord = Math.max(0, ...vo.map((v) => v.at + speechEnd(v.clip)));
    const seconds = Math.max(spec.min, vo.length ? lastWord + spec.tail : 0);
    const frames = Math.round(seconds * FPS);
    const scene = { ...spec, vo, frames, start: cursor };
    cursor += frames - spec.fadeOut;
    return scene;
  });
})();

export const TOTAL_FRAMES = (() => {
  const last = SCENES[SCENES.length - 1];
  return last.start + last.frames;
})();

export const scene = (id: string) => {
  const found = SCENES.find((x) => x.id === id);
  if (!found) throw new Error(`Unknown scene ${id}`);
  return found;
};

const cueOf = (sceneId: string, clip: ClipId) => {
  const cue = scene(sceneId).vo.find((v) => v.clip === clip);
  if (!cue) throw new Error(`Clip ${clip} not in scene ${sceneId}`);
  return cue;
};

/** Frame (relative to the scene) where a clip starts. */
export const clipFrame = (sceneId: string, clip: ClipId) => Math.round(cueOf(sceneId, clip).at * FPS);

/** Frame (relative to the scene) where the clip's last word ends. */
export const clipEndFrame = (sceneId: string, clip: ClipId) => Math.round((cueOf(sceneId, clip).at + speechEnd(clip)) * FPS);

/** Frame (relative to the scene) where sentence `index` of a clip starts. */
export const sentenceFrame = (sceneId: string, clip: ClipId, index = 0) =>
  Math.round((cueOf(sceneId, clip).at + durations[clip].sentences[index].start) * FPS);

/** The words of a clip with their timing. Two words returned as one ("In 2027") are split again. */
export const wordsOf = (clip: ClipId) =>
  (durations[clip].words as { text: string; start: number; end: number }[]).flatMap((w) => {
    const parts = w.text.split(/\s+/);
    if (parts.length === 1) return [w];
    const total = parts.reduce((a, p) => a + p.length, 0);
    let t = w.start;
    return parts.map((p) => {
      const d = (w.end - w.start) * (p.length / total);
      const out = { text: p, start: t, end: t + d };
      t += d;
      return out;
    });
  });

const bare = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** Frame (relative to the scene) where `word` is spoken in a clip (`nth` occurrence, from 0). Puts a picture on one word. */
export const wordFrame = (sceneId: string, clip: ClipId, word: string, nth = 0) => {
  const hit = wordsOf(clip).filter((w) => bare(w.text) === bare(word))[nth];
  if (!hit) throw new Error(`Word "${word}" (#${nth}) not in clip ${clip}`);
  return Math.round((cueOf(sceneId, clip).at + hit.start) * FPS);
};

/** All voice cues of the film, in frames from the film start. */
export const VO_CUES = SCENES.flatMap((sc) =>
  sc.vo.map((v) => ({
    clip: v.clip as string,
    from: sc.start + Math.round(v.at * FPS),
    frames: Math.ceil(durations[v.clip].duration * FPS),
    speechFrames: Math.ceil(speechEnd(v.clip) * FPS),
  })),
);

export { durations };
