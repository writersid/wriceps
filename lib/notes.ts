// Turns the engine's flags into note cards, and rules into chip labels.
import { normalizeWord } from "./engine/tokenize";
import type { Exercise, Flag, Rule } from "./engine/types";

export type Note = {
  key: string;
  word: string; // shown in coral; empty for notes about the whole draft
  detail: string;
  tip: string;
  ignoreKeys: string[]; // the ignorable rules on this word; empty means no Ignore button
};

// DRAFT tips, three per flag kind, for Sid to rewrite in the Wriceps voice.
const TIPS: Record<string, [string, string, string]> = {
  adverb: ["Cut it, or find a verb that does the work.", "Let the verb carry the weight.", "Drop it and see if anyone misses it."],
  adjective: ["Show it instead of labeling it.", "Try a sharper noun.", "Cut it and let the noun stand."],
  tooManySyllables: ["Find a shorter word.", "Break it into plain words.", "Short words hit harder."],
  tooFewSyllables: ["Find a longer word.", "Stretch it out.", "Too light. Add a syllable."],
  repeat: ["Find a new word.", "Once is enough.", "Swap it for something fresh."],
  repeatForm: ["Same word, new outfit. Find another.", "Pick a different word.", "It's still the same word."],
  overTime: ["Faster next rep.", "The clock won this one.", "Beat the clock next time."],
  bannedLetter: ["Find a word without it.", "Rephrase around it.", "That letter is benched today."],
  tooManyWords: ["Trim until it fits.", "Cut the weakest sentence.", "Every word has to earn its spot."],
  tooFewWords: ["Keep going.", "A few more reps.", "Not done yet."],
  missingWord: ["Work it in.", "Find a spot for it.", "It has to show up somewhere."],
  firstSentence: ["Open with it, word for word.", "The first line is set. Use it.", "Start there, then make it yours."],
};

// Picks a tip from the note's key, so it stays put while the person types.
function tipFor(kind: string, key: string): string {
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TIPS[kind][hash % 3];
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function buildNotes(
  flags: Flag[],
  ignored: string[],
  exercise: Exercise,
  syllableRange: (part: string) => [number, number] | null,
): Note[] {
  const visible = flags.filter((f) => !(f.ignorable && ignored.includes(f.ignoreKey)));
  const rules = [...exercise.rules, ...(exercise.bonus ?? [])];
  const ruleFor = (f: Flag) => rules.find((r) => r.id === f.ruleId) as Rule;
  const notes: Note[] = [];

  const opening = visible.find((f) => f.kind === "firstSentence");
  if (opening) {
    const rule = ruleFor(opening) as Extract<Rule, { type: "firstSentence" }>;
    notes.push(wholeDraft("firstSentence", `Start with “${rule.sentence}”`));
  }

  // One card per word, covering every rule that flagged it, word type first.
  const WORD_KINDS = ["adverb", "adjective", "bannedLetter", "tooManySyllables", "tooFewSyllables", "repeat", "repeatForm"];
  const byWord = new Map<string, Flag[]>();
  for (const f of visible) {
    if (!WORD_KINDS.includes(f.kind)) continue;
    const word = normalizeWord(f.word);
    byWord.set(word, [...(byWord.get(word) ?? []), f]);
  }
  const firstAt = (group: Flag[]) => Math.min(...group.map((f) => f.start ?? 0));
  for (const [word, unsorted] of [...byWord].sort((a, b) => firstAt(a[1]) - firstAt(b[1]))) {
    const group = [...unsorted].sort((a, b) => WORD_KINDS.indexOf(a.kind) - WORD_KINDS.indexOf(b.kind));
    const details = new Set<string>();
    for (const f of group) {
      if (f.kind === "tooManySyllables" || f.kind === "tooFewSyllables") {
        details.add(plural(syllablesShown(f, ruleFor(f) as Extract<Rule, { type: "syllables" }>, syllableRange), "syllable"));
      } else if (f.kind === "repeat") {
        details.add("used before");
      } else if (f.kind === "repeatForm") {
        details.add(`same word as “${f.of}”`);
      } else if (f.kind === "bannedLetter") {
        const letters = [...(ruleFor(f) as Extract<Rule, { type: "bannedLetters" }>).letters.toLowerCase()];
        details.add(`contains ${letters.filter((l) => word.includes(l)).join(", ")}`);
      } else {
        details.add(f.kind);
      }
    }
    const times = new Set(group.map((f) => f.start)).size;
    notes.push({
      key: `word:${word}`,
      word: times > 1 ? `${group[0].word} ×${times}` : group[0].word,
      detail: [...details].join(", "),
      tip: tipFor(group[0].kind, word),
      ignoreKeys: [...new Set(group.filter((f) => f.ignorable).map((f) => f.ignoreKey))],
    });
  }

  const missing = visible.filter((f) => f.kind === "missingWord").map((f) => f.word);
  if (missing.length) notes.push(wholeDraft("missingWord", `Still missing: ${missing.join(", ")}`));

  const over = visible.filter((f) => f.kind === "tooManyWords").length;
  if (over) notes.push(wholeDraft("tooManyWords", `${plural(over, "word")} over the limit`));

  const short = visible.find((f) => f.kind === "tooFewWords");
  if (short) notes.push(wholeDraft("tooFewWords", `${plural(short.count ?? 1, "word")} short`));

  if (visible.some((f) => f.kind === "overTime")) notes.push(wholeDraft("overTime", "Over the time limit, so no bonus"));

  return notes;
}

// The count that broke the rule: the whole word's highest count for a minimum,
// its lowest for "exactly", else its longest part's lowest (each part is
// checked on its own).
function syllablesShown(
  f: Flag,
  rule: Extract<Rule, { type: "syllables" }>,
  syllableRange: (part: string) => [number, number] | null,
): number {
  const parts = f.word.split("-").map((part) => syllableRange(part) ?? [0, 0]);
  if (f.kind === "tooFewSyllables") return parts.reduce((sum, p) => sum + p[1], 0);
  if (rule.min === rule.max) return parts.reduce((sum, p) => sum + p[0], 0);
  return Math.max(...parts.map((p) => p[0]));
}

function wholeDraft(kind: string, detail: string): Note {
  return { key: kind, word: "", detail, tip: tipFor(kind, kind), ignoreKeys: [] };
}

export function ruleLabel(rule: Rule): string {
  switch (rule.type) {
    case "wordCount":
      if (rule.exact !== undefined) return `Exactly ${plural(rule.exact, "word")}`;
      if (rule.min !== undefined && rule.max !== undefined) return `${rule.min}–${rule.max} words`;
      if (rule.min !== undefined) return `${rule.min}+ words`;
      return `Up to ${plural(rule.max ?? 0, "word")}`;
    case "syllables":
      if (rule.min !== undefined && rule.min === rule.max) return `Exactly ${plural(rule.min, "syllable")}`;
      if (rule.min !== undefined && rule.max !== undefined) return `${rule.min}–${rule.max} syllables`;
      if (rule.min !== undefined) return `Min ${plural(rule.min, "syllable")}`;
      return `Max ${plural(rule.max ?? 0, "syllable")}`;
    case "noRepeats":
      return "No repeated words";
    case "timeLimit":
      return `Under ${rule.seconds} seconds`;
    case "noAdverbs":
      return "No adverbs";
    case "noAdjectives":
      return "No adjectives";
    case "bannedLetters": {
      const letters = [...rule.letters.toUpperCase()];
      return `No letter${letters.length > 1 ? "s" : ""} ${letters.join(", ")}`;
    }
    case "requiredWords":
      return `Use: ${rule.words.join(", ")}`;
    case "firstSentence":
      return `Start with “${rule.sentence}”`;
  }
}
