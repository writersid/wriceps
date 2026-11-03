import { describe, expect, it } from "vitest";
import { checkText } from "./engine/check";
import { syllableRange } from "./engine/language";
import type { Exercise } from "./engine/types";
import { buildNotes, ruleLabel, wordProgress, type Mechanic } from "./notes";

// Small sets written here, so the tests don't change when the content does.
const SETS: Record<string, Exercise> = {
  "two-syllable-sprint": {
    wordList: true,
    rules: [
      { id: "length", type: "wordCount", exact: 20, weight: 24 },
      { id: "syllables", type: "syllables", min: 2, max: 2, weight: 22 },
      { id: "adjectives", type: "noAdjectives", weight: 22 },
      { id: "repeats", type: "noRepeats", weight: 22 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 60, weight: 10 }],
  },
  "missing-e": { rules: [{ id: "letters", type: "bannedLetters", letters: "e", weight: 90 }] },
  "six-word-story": { rules: [{ id: "length", type: "wordCount", exact: 6, weight: 90 }] },
  "stormy-night": {
    rules: [
      { id: "opening", type: "firstSentence", sentence: "It was a dark and stormy night.", weight: 45 },
      { id: "length", type: "wordCount", min: 50, weight: 45 },
    ],
    bonus: [{ id: "words", type: "requiredWords", words: ["lighthouse", "key"], weight: 10 }],
  },
  "short-reps": { rules: [{ id: "sentences", type: "sentenceLength", max: 10, weight: 90 }] },
};
const set = (id: string) => SETS[id];
const notesFor = (id: string, text: string, ignored: string[] = [], elapsedMs?: number, mechanic: Mechanic = "constraint") =>
  buildNotes(checkText(text, set(id), elapsedMs), ignored, set(id), syllableRange, mechanic);

const prose: Exercise = {
  rules: [
    { id: "syllables", type: "syllables", max: 2, weight: 50 },
    { id: "adverbs", type: "noAdverbs", weight: 50 },
  ],
};
const proseNotes = (text: string, ignored: string[] = []) =>
  buildNotes(checkText(text, prose), ignored, prose, syllableRange, "constraint");

describe("buildNotes", () => {
  it("gives one card per word, naming every rule that flagged it", () => {
    const [note] = proseNotes("She ran suddenly.");
    expect(note.word).toBe("suddenly");
    expect(note.detail).toBe("adverb, 3 syllables");
    expect(note.ignoreKeys).toHaveLength(2);
  });

  it("drops a card once all its flags are ignored", () => {
    const [note] = proseNotes("She ran suddenly.");
    expect(proseNotes("She ran suddenly.", note.ignoreKeys)).toEqual([]);
  });

  it("counts repeats of a word on one card", () => {
    const notes = proseNotes("She ran suddenly and stopped suddenly.");
    expect(notes.map((n) => n.word)).toEqual(["suddenly ×2"]);
  });

  it("word-list game: repeats, syllable counts, and the clock", () => {
    const notes = notesFor("two-syllable-sprint", "window, windows, window, cat, banana", [], 61_000);
    expect(notes.map((n) => `${n.word} · ${n.detail} · ${n.ignoreKeys.length ? "Ignore" : "no Ignore"}`)).toEqual([
      "windows · same word as “window” · Ignore",
      "window · used before · no Ignore",
      "cat · 1 syllable · Ignore",
      "banana · 3 syllables · Ignore",
      " · 15 words short · no Ignore",
      " · Time's up, so no bonus. · no Ignore",
    ]);
  });

  it("word-list game skips adjectives that are as often nouns or verbs", () => {
    const words = notesFor("two-syllable-sprint", "yellow, happy, open").map((n) => n.word);
    expect(words).toContain("happy");
    expect(words).not.toContain("yellow");
    expect(words).not.toContain("open");
  });

  it("names the banned letter and offers no Ignore", () => {
    const [note] = notesFor("missing-e", "The cat sat.");
    expect(note).toMatchObject({ word: "The", detail: "contains E", ignoreKeys: [] });
  });

  it("names the banned letter in the tip, as a capital", () => {
    const [note] = notesFor("missing-e", "The cat sat.");
    expect(["Find a word without the E.", "Rephrase around the E.", "The E is benched today."]).toContain(note.tip);
  });

  it("names the expected starting letter, with the right article", () => {
    const tips = (letter: string) => {
      const exercise: Exercise = { rules: [{ id: "l", type: "sameFirstLetter", letter, weight: 90 }] };
      // Many different wrong words, so every tip in the list turns up.
      const text = ["zebra", "quiet", "vivid", "yak", "jumbo", "kite", "zoo", "quest", "vat", "yes"].join("\n");
      return new Set(buildNotes(checkText(text, exercise), [], exercise, syllableRange, "fill-in").map((n) => n.tip));
    };
    expect([...tips("s")].sort()).toEqual(["Find one that starts with S.", "Stay on the S.", "Try an S word."]);
    expect(tips("b")).toContain("Try a B word.");
  });

  it("uses the mechanic's own tips, and the constraint tips where it has none", () => {
    const blackout = (text: string) => notesFor("six-word-story", text, [], undefined, "blackout")[0].tip;
    expect(["Keep another word.", "Your poem needs a few more."]).toContain(blackout("Too short."));
    expect(["Drop a word.", "Keep only the strongest words."]).toContain(blackout("One two three four five six seven."));
    const [clock] = notesFor("two-syllable-sprint", "", [], 61_000, "blackout").filter((n) => n.key === "overTime");
    expect(["Faster next rep.", "The clock won this one.", "Beat the clock next time."]).toContain(clock.tip);
  });

  it("sums word-count problems into one card", () => {
    expect(notesFor("six-word-story", "Too short.")[0].detail).toBe("4 words short");
    expect(notesFor("six-word-story", "One two three four five six seven.")[0].detail).toBe("1 word over the limit");
  });

  it("covers the first sentence and missing required words", () => {
    const details = notesFor("stormy-night", "Hello there.").map((n) => n.detail);
    expect(details).toEqual(["Your opening doesn't match the line above", "Still missing: lighthouse, key"]);
  });

  it("shows no opening card on an empty draft, since the line shows above it", () => {
    expect(notesFor("stormy-night", "").map((n) => n.key)).not.toContain("firstSentence");
    expect(notesFor("stormy-night", "It was a dark and stormy night.").map((n) => n.key)).not.toContain("firstSentence");
  });

  it("gives one card per long sentence, named by its first words, with no Ignore", () => {
    const text = "One two three four five six seven eight nine ten eleven twelve. Short.";
    const notes = notesFor("short-reps", text).filter((n) => n.key.startsWith("sentence:"));
    expect(notes.map((n) => `${n.word} · ${n.detail} · ${n.ignoreKeys.length}`)).toEqual(["One two three… · 12 words, 2 over · 0"]);
  });

  it("gives every card a tip", () => {
    const notes = notesFor("stormy-night", "Hello there.");
    expect(notes.every((n) => n.tip.length > 0)).toBe(true);
  });
});

describe("ruleLabel", () => {
  it("labels each rule for its chip", () => {
    expect(ruleLabel({ type: "wordCount", min: 100 })).toBe("100+ words");
    expect(ruleLabel({ type: "wordCount", exact: 6 })).toBe("Exactly 6 words");
    expect(ruleLabel({ type: "wordCount", min: 50, max: 100 })).toBe("50–100 words");
    expect(ruleLabel({ type: "wordCount", max: 1 })).toBe("Up to 1 word");
    expect(ruleLabel({ type: "syllables", max: 2 })).toBe("Max 2 syllables");
    expect(ruleLabel({ type: "syllables", min: 2 })).toBe("Min 2 syllables");
    expect(ruleLabel({ type: "syllables", min: 2, max: 2 })).toBe("Exactly 2 syllables");
    expect(ruleLabel({ type: "syllables", min: 1, max: 3 })).toBe("1–3 syllables");
    expect(ruleLabel({ type: "noRepeats" })).toBe("No repeated words");
    expect(ruleLabel({ type: "timeLimit", seconds: 60 })).toBe("Under 60 seconds");
    expect(ruleLabel({ type: "timeLimit", seconds: 90 })).toBe("Under 90 seconds");
    expect(ruleLabel({ type: "timeLimit", seconds: 300 })).toBe("Under 5 minutes");
    expect(ruleLabel({ type: "bannedLetters", letters: "e" })).toBe("No letter E");
    expect(ruleLabel({ type: "bannedLetters", letters: "ae" })).toBe("No letters A, E");
    expect(ruleLabel({ type: "requiredWords", words: ["lighthouse", "key"] })).toBe("Use: lighthouse, key");
    expect(ruleLabel({ type: "sentenceLength", max: 10 })).toBe("Max 10 words per sentence");
    expect(ruleLabel({ type: "wordCount", min: 100, afterFirstSentence: true })).toBe("100+ words after the opening");
  });

  it("gives rules still waiting on their draw a neutral label", () => {
    expect(ruleLabel({ type: "bannedLetters", pool: "aoinst" })).toBe("One banned letter");
    expect(ruleLabel({ type: "requiredWords", options: [["key"]] })).toBe("Required words");
    expect(ruleLabel({ type: "firstSentence", options: ["Marley was dead: to begin with."] })).toBe("Start with a classic line");
  });

  it("names a drawn opening line by its short label", () => {
    expect(ruleLabel({ type: "firstSentence", sentence: "Marley was dead: to begin with.", label: "Dickens" })).toBe("Opening: Dickens");
  });
});

describe("wordProgress", () => {
  const count = (rule: Exercise["rules"][number]) => ({ rules: [rule] });

  it("shows the count against each kind of target", () => {
    expect(wordProgress(48, count({ id: "l", type: "wordCount", exact: 50, weight: 90 }))).toEqual({ text: "48 / 50 words", status: "short" });
    expect(wordProgress(52, count({ id: "l", type: "wordCount", min: 50, weight: 90 }))).toEqual({ text: "52 / 50+ words", status: "met" });
    expect(wordProgress(70, count({ id: "l", type: "wordCount", min: 60, max: 80, weight: 90 }))).toEqual({ text: "70 / 60–80 words", status: "met" });
    expect(wordProgress(40, count({ id: "l", type: "wordCount", max: 80, weight: 90 }))).toEqual({ text: "40 / up to 80 words", status: "met" });
  });

  it("marks the target met at the exact edge and over past a limit", () => {
    expect(wordProgress(50, count({ id: "l", type: "wordCount", exact: 50, weight: 90 })).status).toBe("met");
    expect(wordProgress(51, count({ id: "l", type: "wordCount", exact: 50, weight: 90 })).status).toBe("over");
    expect(wordProgress(59, count({ id: "l", type: "wordCount", min: 60, max: 80, weight: 90 })).status).toBe("short");
    expect(wordProgress(81, count({ id: "l", type: "wordCount", min: 60, max: 80, weight: 90 })).status).toBe("over");
    expect(wordProgress(500, count({ id: "l", type: "wordCount", min: 50, weight: 90 })).status).toBe("met");
  });

  it("shows a plain count when the set has no word-count rule", () => {
    expect(wordProgress(1, set("short-reps"))).toEqual({ text: "1 word", status: "none" });
    expect(wordProgress(12, set("short-reps"))).toEqual({ text: "12 words", status: "none" });
  });
});
