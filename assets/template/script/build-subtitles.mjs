// Builds the subtitle files from the measured voice (public/audio/durations.json)
// and the scene timing (src/timing.ts), so subtitles use exactly the times of the video.
//
//   <output>.vtt and .srt            spoken language (film.json languages[0]), each line
//                                    timed by its own spoken words
//   <output>.<lang>.vtt and .srt     every other language in film.json, text from
//                                    script/subtitles-<lang>.json, timed per spoken sentence
//
// One line per subtitle, at most 42 characters. Some players (for example Stream in
// SharePoint) draw two-line subtitles so large that the lines overlap, so no subtitle
// has a line break.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { root, film, loadTiming } from "./load-timing.mjs";

const { VO_CUES, durations } = await loadTiming();
const FPS = film.fps;
const MAX = 42; // characters per line
const HOLD = 0.35; // seconds a subtitle stays after its last word
const MIN_SHOW = 0.9; // shortest time on screen, when there is room
const TAIL = 1.5; // seconds a translated sentence may stay after the last spoken word

const script = JSON.parse(readFileSync(path.join(root, "script", "voiceover.json"), "utf8"));
const textOf = Object.fromEntries(script.lines.map((l) => [l.id, l.text]));
const joinText = (tokens) => tokens.map((t) => t.text).join(" ");

const stamp = (t, sep = ",") => {
  const ms = Math.max(0, Math.round(t * 1000));
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${s}${sep}${String(ms % 1000).padStart(3, "0")}`;
};

// Words of a clip with their timing. Uses the word timings of the voice service;
// it sometimes returns two words as one ("In 2027"), which are split again. Without
// word timings, each sentence's time is shared over its words by length.
const timedWords = (clip) => {
  const d = durations[clip];
  const tokens = textOf[clip].split(/\s+/).filter(Boolean);
  const split = (d.words ?? []).flatMap((w) => {
    const parts = w.text.split(/\s+/);
    if (parts.length === 1) return [w];
    const total = parts.reduce((a, p) => a + p.length, 0);
    let t = w.start;
    return parts.map((p) => {
      const dur = (w.end - w.start) * (p.length / total);
      t += dur;
      return { start: t - dur, end: t };
    });
  });
  if (split.length === tokens.length) return tokens.map((text, i) => ({ text, start: split[i].start, end: split[i].end }));
  const out = [];
  for (const sen of d.sentences) {
    const ts = sen.text.split(/\s+/).filter(Boolean);
    const total = ts.reduce((a, t) => a + t.length + 1, 0);
    let t = sen.start;
    for (const text of ts) {
      const dur = (sen.end - sen.start) * ((text.length + 1) / total);
      out.push({ text, start: t, end: t + dur });
      t += dur;
    }
  }
  return out;
};

// Good and bad places to start a new line. Add a language by adding its two lists.
const JOINING = {
  en: ["and", "or", "but", "with", "to", "for", "from", "in", "on", "at", "by", "of", "that", "which", "what", "when", "who", "than", "because", "so"],
  nl: ["en", "of", "maar", "met", "om", "voor", "van", "naar", "in", "op", "aan", "bij", "dat", "die", "wat", "wanneer", "dan", "omdat", "zodat"],
  de: ["und", "oder", "aber", "mit", "zu", "für", "von", "in", "auf", "an", "bei", "dass", "die", "der", "was", "wenn", "weil", "damit"],
  fr: ["et", "ou", "mais", "avec", "pour", "de", "dans", "sur", "à", "par", "que", "qui", "quand", "parce"],
};
const WEAK_END = {
  en: ["a", "an", "the", "we", "i", "to", "of", "are", "is", "be", "will", "their", "our", "its", "his", "her", "my", "your", "what", "and", "or", "for", "in", "on"],
  nl: ["de", "het", "een", "we", "ik", "om", "van", "is", "zijn", "wordt", "hun", "onze", "mijn", "wat", "en", "of", "voor", "in", "op", "aan", "te", "naar"],
  de: ["der", "die", "das", "ein", "eine", "wir", "ich", "zu", "von", "ist", "sind", "und", "oder", "für", "in", "auf"],
  fr: ["le", "la", "les", "un", "une", "des", "nous", "je", "de", "est", "sont", "et", "ou", "pour", "dans", "sur"],
};
const set = (lists, lang) => new Set(lists[lang] ?? []);
const bare = (t) => t.toLowerCase().replace(/[^\p{L}']/gu, "");
const breakBonus = (before, after, lang) =>
  (/[,;:]$/.test(before) ? 14 : 0) + (set(JOINING, lang).has(bare(after)) ? 7 : 0) - (set(WEAK_END, lang).has(bare(before)) ? 10 : 0);

// Split a sentence into lines of at most MAX characters: try every way of breaking
// it and keep the cheapest. Fewer lines, lines close to MAX and good break points
// are cheap; very short lines are expensive.
const splitSentence = (tokens, lang) => {
  const n = tokens.length;
  const lineCost = (i, j) => {
    const len = joinText(tokens.slice(i, j)).length;
    if (len > MAX && j - i > 1) return Infinity;
    return 10 + 40 * ((MAX - len) / MAX) ** 2 + (len < 15 && n > j - i ? 25 : 0);
  };
  const best = [{ cost: 0, from: -1 }];
  for (let j = 1; j <= n; j++) {
    best[j] = { cost: Infinity, from: -1 };
    for (let i = 0; i < j; i++) {
      const c = best[i].cost + lineCost(i, j) - (j < n ? breakBonus(tokens[j - 1].text, tokens[j].text, lang) : 0);
      if (c < best[j].cost) best[j] = { cost: c, from: i };
    }
  }
  const parts = [];
  for (let j = n; j > 0; j = best[j].from) parts.unshift(tokens.slice(best[j].from, j));
  return parts;
};

const sentencesOf = (clip) => {
  const sentences = [];
  let current = [];
  for (const w of timedWords(clip)) {
    current.push(w);
    if (/[.?!]["”’)]?$/.test(w.text)) {
      sentences.push(current);
      current = [];
    }
  }
  if (current.length) sentences.push(current);
  return sentences;
};

const buildCues = (lang, translated) => {
  const cues = [];
  for (const c of VO_CUES) {
    const base = c.from / FPS;
    const spoken = sentencesOf(c.clip);
    if (translated && translated[c.clip]?.length !== spoken.length) {
      throw new Error(`script/subtitles-${lang}.json: ${c.clip} needs ${spoken.length} sentence(s), has ${translated[c.clip]?.length ?? 0}`);
    }
    spoken.forEach((sentence, k) => {
      if (!translated) {
        for (const part of splitSentence(sentence, lang)) {
          cues.push({ start: base + part[0].start, end: base + part[part.length - 1].end + HOLD, text: joinText(part) });
        }
        return;
      }
      // A translation does not match the audio word for word, so each translated
      // sentence gets the time of the spoken sentence, shared over its lines by length.
      const text = translated[c.clip][k];
      if (!text.trim()) return;
      let last = k;
      while (last + 1 < spoken.length && !translated[c.clip][last + 1].trim()) last++;
      const toTokens = (t) => t.split(/\s+/).filter(Boolean).map((w) => ({ text: w }));
      const parts = text.includes("|") ? text.split("|").map(toTokens) : splitSentence(toTokens(text), lang);
      const from = sentence[0].start;
      const to = last + 1 < spoken.length ? spoken[last + 1][0].start - 0.04 : spoken[last][spoken[last].length - 1].end + TAIL;
      const total = parts.reduce((a, p) => a + joinText(p).length + 1, 0);
      let t = from;
      for (const p of parts) {
        const d = (to - from) * ((joinText(p).length + 1) / total);
        cues.push({ start: base + t, end: base + t + d, text: joinText(p) });
        t += d;
      }
    });
  }
  cues.sort((a, b) => a.start - b.start);
  for (let i = 0; i < cues.length; i++) {
    const next = i + 1 < cues.length ? cues[i + 1].start - 0.04 : Infinity;
    cues[i].end = Math.min(Math.max(cues[i].end, cues[i].start + MIN_SHOW), next);
  }
  const long = cues.filter((c) => c.text.length > MAX);
  if (long.length) console.warn(`warning (${lang}): ${long.length} line(s) longer than ${MAX} characters, e.g. "${long[0].text}". Add a " | " break in the text.`);
  return cues;
};

const toSrt = (cues) => cues.map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`).join("\n");
const toVtt = (cues) => "WEBVTT\n\n" + cues.map((c, i) => `${i + 1}\n${stamp(c.start, ".")} --> ${stamp(c.end, ".")}\n${c.text}\n`).join("\n");

const out = path.join(root, film.output);
mkdirSync(path.dirname(out), { recursive: true });
const [spokenLang, ...others] = film.languages;
const main = buildCues(spokenLang, null);
writeFileSync(`${out}.vtt`, toVtt(main), "utf8");
writeFileSync(`${out}.srt`, toSrt(main), "utf8");
const report = [`${spokenLang}: ${main.length} subtitles (${path.basename(out)}.vtt, .srt)`];
for (const lang of others) {
  const file = path.join(root, "script", `subtitles-${lang}.json`);
  if (!existsSync(file)) {
    console.warn(`skipped ${lang}: ${path.relative(root, file)} does not exist`);
    continue;
  }
  const cues = buildCues(lang, JSON.parse(readFileSync(file, "utf8")));
  writeFileSync(`${out}.${lang}.vtt`, toVtt(cues), "utf8");
  writeFileSync(`${out}.${lang}.srt`, toSrt(cues), "utf8");
  report.push(`${lang}: ${cues.length} subtitles (${path.basename(out)}.${lang}.vtt, .srt)`);
}
console.log(report.join("; "));
