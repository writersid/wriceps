import { describe, expect, it } from "vitest";
import { constraintSets } from "../content/constraint";
import { checkText } from "./engine/check";
import { syllableRange } from "./engine/language";
import type { Exercise } from "./engine/types";
import { buildNotes, ruleLabel } from "./notes";
import { everyDraw } from "./round";

// Each set with its draws fixed to their first options (E, the stormy night line,
// lighthouse and key), so the tests don't depend on a random seed.
const set = (id: string) => everyDraw(constraintSets.find((s) => s.id === id)!)[0];
const notesFor = (id: string, text: string, ignored: string[] = [], elapsedMs?: number) =>
  buildNotes(checkText(text, set(id), elapsedMs), ignored, set(id), syllableRange);

const prose: Exercise = {
  rules: [
    { id: "syllables", type: "syllables", max: 2, weight: 50 },
    { id: "adverbs", type: "noAdverbs", weight: 50 },
  ],
};
const proseNotes = (text: string, ignored: string[] = []) =>
  buildNotes(checkText(text, prose), ignored, prose, syllableRange);

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
      " · Over the time limit, so no bonus · no Ignore",
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
    expect(note).toMatchObject({ word: "The", detail: "contains e", ignoreKeys: [] });
  });

  it("sums word-count problems into one card", () => {
    expect(notesFor("six-word-story", "Too short.")[0].detail).toBe("4 words short");
    expect(notesFor("six-word-story", "One two three four five six seven.")[0].detail).toBe("1 word over the limit");
  });

  it("covers the first sentence and missing required words", () => {
    const details = notesFor("stormy-night", "Hello there.").map((n) => n.detail);
    expect(details).toEqual(["Start with “It was a dark and stormy night.”", "Still missing: lighthouse, key"]);
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
});
