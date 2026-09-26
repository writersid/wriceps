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
  countSyllables: (part: string) => number | null,
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
  const WORD_KINDS = ["adverb", "adjective", "bannedLetter", "tooManySyllables"];
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
      if (f.kind === "tooManySyllables") {
        const counts = f.word.split("-").map((part) => countSyllables(part) ?? 0);
        details.add(plural(Math.max(...counts), "syllable"));
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

  return notes;
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
    case "maxSyllables":
      return `Max ${plural(rule.max, "syllable")}`;
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
