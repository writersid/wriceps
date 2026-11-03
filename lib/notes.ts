// Turns the engine's flags into note cards, and rules into chip labels.
import { normalizeWord, tokenize } from "./engine/tokenize";
import type { Exercise, Flag, Rule } from "./engine/types";

export type Note = {
  key: string;
  word: string; // shown in coral; empty for notes about the whole draft
  detail: string;
  tip: string;
  ignoreKeys: string[]; // the ignorable rules on this word; empty means no Ignore button
};

export type Mechanic = "constraint" | "fill-in" | "blackout";

// Tips per flag kind: the constraint list, plus a fill-in or blackout list
// where the tip differs (a missing list uses the constraint tips). "{letter}"
// becomes the round's letter: the expected starting letter, or the banned
// letter in the word. Written to COPY.md's voice guide.
const TIPS: Record<string, { constraint: string[]; "fill-in"?: string[]; blackout?: string[] }> = {
  adverb: { constraint: ["Let the verb carry the weight.", "Find a stronger verb instead.", "Cut it and see if anyone notices."] },
  adjective: { constraint: ["Show it instead of naming it.", "Find a sharper noun.", "Cut it and let the noun stand."] },
  tooManySyllables: {
    constraint: ["Find a shorter word.", "Short words hit harder.", "Say it the plain way."],
    blackout: ["Keep a shorter word."],
  },
  tooFewSyllables: {
    constraint: ["Find a longer word.", "This one needs another beat.", "Stretch it by a syllable."],
    blackout: ["Keep a longer word."],
  },
  repeat: { constraint: ["Find a new word.", "Once is enough.", "Swap it for something fresh."], blackout: ["Drop one of them."] },
  repeatForm: { constraint: ["It's the same word in disguise.", "Find a different word."], blackout: ["Drop one of them."] },
  repeatEarlier: { constraint: ["Your spotter got there first.", "Find a word of your own."] },
  overTime: { constraint: ["Faster next rep.", "The clock won this one.", "Beat the clock next time."] },
  wrongFirstLetter: { constraint: ["Find one that starts with {letter}.", "Stay on the {letter}.", "Try {a} {letter} word."] },
  bannedLetter: {
    constraint: ["Find a word without the {letter}.", "Rephrase around the {letter}.", "The {letter} is benched today."],
    "fill-in": ["Find a word without the {letter}.", "The {letter} is benched today."],
    blackout: ["Keep a word without the {letter}."],
  },
  tooManyWords: {
    constraint: ["Trim until it fits.", "Every word has to earn its spot.", "Cut the weakest sentence."],
    blackout: ["Drop a word.", "Keep only the strongest words."],
  },
  tooFewWords: {
    constraint: ["Keep going.", "A few more reps.", "You're not done yet."],
    blackout: ["Keep another word.", "Your poem needs a few more."],
  },
  missingWord: { constraint: ["Work it in.", "Find a spot for it.", "It has to show up somewhere."], blackout: ["Keep it in your poem."] },
  firstSentence: {
    constraint: ["Open with the line, word for word.", "Start there, then make it yours.", "The first line is set, so use it."],
  },
  longSentence: {
    constraint: ["Break it in two.", "Add a period where it runs out of breath.", "Short sentences land harder."],
  },
};

// Letters whose names start with a vowel sound take "an": an S word, a B word.
const AN_LETTERS = "aefhilmnorsx";

// Picks a tip from the note's key, so it stays put while the person types.
function tipFor(kind: string, key: string, mechanic: Mechanic, letter = ""): string {
  const tips = TIPS[kind][mechanic] ?? TIPS[kind].constraint;
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return tips[hash % tips.length]
    .replaceAll("{a}", AN_LETTERS.includes(letter.toLowerCase()) ? "an" : "a")
    .replaceAll("{letter}", letter.toUpperCase());
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function buildNotes(
  flags: Flag[],
  ignored: string[],
  exercise: Exercise,
  syllableRange: (part: string) => [number, number] | null,
  mechanic: Mechanic,
): Note[] {
  const wholeDraft = (kind: string, detail: string): Note => ({
    key: kind,
    word: "",
    detail,
    tip: tipFor(kind, kind, mechanic),
    ignoreKeys: [],
  });
  const visible = flags.filter((f) => !(f.ignorable && ignored.includes(f.ignoreKey)));
  const rules = [...exercise.rules, ...(exercise.bonus ?? [])];
  const ruleFor = (f: Flag) => rules.find((r) => r.id === f.ruleId) as Rule;
  const notes: Note[] = [];

  // The line itself shows above the draft, so the card appears only once the
  // draft has a first sentence that isn't it (the flag then has a position).
  // An empty draft still misses the rule's points.
  const opening = visible.find((f) => f.kind === "firstSentence" && f.start !== undefined);
  if (opening) notes.push(wholeDraft("firstSentence", "Your opening doesn't match the line above"));

  // One card per word, covering every rule that flagged it, word type first.
  const WORD_KINDS = [
    "wrongFirstLetter",
    "adverb",
    "adjective",
    "bannedLetter",
    "tooManySyllables",
    "tooFewSyllables",
    "repeat",
    "repeatForm",
    "repeatEarlier",
  ];
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
    let letter = ""; // for the tip: the expected starting letter, or the banned letter in the word
    for (const f of group) {
      if (f.kind === "tooManySyllables" || f.kind === "tooFewSyllables") {
        details.add(plural(syllablesShown(f, ruleFor(f) as Extract<Rule, { type: "syllables" }>, syllableRange), "syllable"));
      } else if (f.kind === "wrongFirstLetter") {
        details.add(`should start with ${f.of?.toUpperCase()}`);
        letter ||= f.of ?? "";
      } else if (f.kind === "repeat") {
        details.add("used before");
      } else if (f.kind === "repeatEarlier") {
        details.add("used earlier in the poem");
      } else if (f.kind === "repeatForm") {
        details.add(`same word as “${f.of}”`);
      } else if (f.kind === "bannedLetter") {
        const letters = [...((ruleFor(f) as Extract<Rule, { type: "bannedLetters" }>).letters ?? "").toLowerCase()];
        const found = letters.filter((l) => word.includes(l));
        details.add(`contains ${found.join(", ").toUpperCase()}`);
        letter ||= found[0] ?? "";
      } else {
        details.add(f.kind);
      }
    }
    const times = new Set(group.map((f) => f.start)).size;
    notes.push({
      key: `word:${word}`,
      word: times > 1 ? `${group[0].word} ×${times}` : group[0].word,
      detail: [...details].join(", "),
      tip: tipFor(group[0].kind, word, mechanic, letter),
      ignoreKeys: [...new Set(group.filter((f) => f.ignorable).map((f) => f.ignoreKey))],
    });
  }

  // One card per over-long sentence, named by its first words.
  for (const f of visible.filter((f) => f.kind === "longSentence")) {
    const words = tokenize(f.word);
    const max = (ruleFor(f) as Extract<Rule, { type: "sentenceLength" }>).max;
    const opening = f.word.slice(0, words[Math.min(2, words.length - 1)].end);
    notes.push({
      key: `sentence:${f.start}`,
      word: `${opening}…`,
      detail: `${plural(words.length, "word")}, ${words.length - max} over`,
      tip: tipFor("longSentence", f.word, mechanic),
      ignoreKeys: [],
    });
  }

  const missing = visible.filter((f) => f.kind === "missingWord").map((f) => f.word);
  if (missing.length) notes.push(wholeDraft("missingWord", `Still missing: ${missing.join(", ")}`));

  const over = visible.filter((f) => f.kind === "tooManyWords").length;
  if (over) notes.push(wholeDraft("tooManyWords", `${plural(over, "word")} over the limit`));

  const short = visible.find((f) => f.kind === "tooFewWords");
  if (short) notes.push(wholeDraft("tooFewWords", `${plural(short.count ?? 1, "word")} short`));

  if (visible.some((f) => f.kind === "overTime")) notes.push(wholeDraft("overTime", "Time's up, so no bonus."));

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

// The draft box's live count against the set's word-count rule, such as
// "52 / 50+ words". `status` says whether the target is met or passed.
export type WordProgress = { text: string; status: "none" | "short" | "met" | "over" };

export function wordProgress(count: number, exercise: Exercise): WordProgress {
  const rule = exercise.rules.find((r) => r.type === "wordCount");
  if (rule?.type !== "wordCount") return { text: plural(count, "word"), status: "none" };
  const min = rule.exact ?? rule.min ?? 0;
  const max = rule.exact ?? rule.max;
  let target: string;
  if (rule.exact !== undefined) target = `${rule.exact}`;
  else if (rule.min !== undefined && rule.max !== undefined) target = `${rule.min}–${rule.max}`;
  else if (rule.min !== undefined) target = `${rule.min}+`;
  else target = `up to ${rule.max}`;
  const status = max !== undefined && count > max ? "over" : count >= min ? "met" : "short";
  return { text: `${count} / ${target} words`, status };
}

export function ruleLabel(rule: Rule): string {
  switch (rule.type) {
    case "wordCount": {
      const after = rule.afterFirstSentence ? " after the opening" : "";
      if (rule.exact !== undefined) return `Exactly ${plural(rule.exact, "word")}${after}`;
      if (rule.min !== undefined && rule.max !== undefined) return `${rule.min}–${rule.max} words${after}`;
      if (rule.min !== undefined) return `${rule.min}+ words${after}`;
      return `Up to ${plural(rule.max ?? 0, "word")}${after}`;
    }
    case "sentenceLength":
      return `Max ${plural(rule.max, "word")} per sentence`;
    case "syllables":
      if (rule.min !== undefined && rule.min === rule.max) return `Exactly ${plural(rule.min, "syllable")}`;
      if (rule.min !== undefined && rule.max !== undefined) return `${rule.min}–${rule.max} syllables`;
      if (rule.min !== undefined) return `Min ${plural(rule.min, "syllable")}`;
      return `Max ${plural(rule.max ?? 0, "syllable")}`;
    case "noRepeats":
      return "No repeated words";
    case "timeLimit":
      // Whole minutes from 2 up read as minutes ("Under 5 minutes").
      if (rule.seconds >= 120 && rule.seconds % 60 === 0) return `Under ${rule.seconds / 60} minutes`;
      return `Under ${rule.seconds} seconds`;
    case "sameFirstLetter":
      return rule.letter ? `Every answer starts with ${rule.letter.toUpperCase()}` : "Every answer starts with the same letter";
    case "noAdverbs":
      return "No adverbs";
    case "noAdjectives":
      return "No adjectives";
    // Before the round's draw is made (a split second while it loads), rules
    // with a list show a neutral label.
    case "bannedLetters": {
      if (rule.letters === undefined) return "One banned letter";
      const letters = [...rule.letters.toUpperCase()];
      return `No letter${letters.length > 1 ? "s" : ""} ${letters.join(", ")}`;
    }
    case "requiredWords":
      return rule.words ? `Use: ${rule.words.join(", ")}` : "Required words";
    case "firstSentence":
      if (rule.label) return `Opening: ${rule.label}`;
      return rule.sentence ? `Start with “${rule.sentence}”` : "Start with a classic line";
  }
}
