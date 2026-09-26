import { describe, expect, it } from "vitest";
import { constraintSets } from "../content/constraint";
import { checkText } from "./engine/check";
import { countSyllables } from "./engine/language";
import { buildNotes, ruleLabel } from "./notes";

const set = (id: string) => constraintSets.find((s) => s.id === id)!;
const notesFor = (id: string, text: string, ignored: string[] = []) =>
  buildNotes(checkText(text, set(id)), ignored, set(id), countSyllables);

describe("buildNotes", () => {
  it("gives one card per word, naming every rule that flagged it", () => {
    const [note] = notesFor("two-syllable-sprint", "She ran suddenly.");
    expect(note.word).toBe("suddenly");
    expect(note.detail).toBe("adverb, 3 syllables");
    expect(note.ignoreKeys).toHaveLength(2);
  });

  it("drops a card once all its flags are ignored", () => {
    const [note] = notesFor("two-syllable-sprint", "She ran suddenly.");
    expect(notesFor("two-syllable-sprint", "She ran suddenly.", note.ignoreKeys)).toEqual([]);
  });

  it("counts repeats of a word on one card", () => {
    const notes = notesFor("two-syllable-sprint", "She ran suddenly and stopped suddenly.");
    expect(notes.map((n) => n.word)).toEqual(["suddenly ×2"]);
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
    expect(ruleLabel({ type: "maxSyllables", max: 2 })).toBe("Max 2 syllables");
    expect(ruleLabel({ type: "bannedLetters", letters: "e" })).toBe("No letter E");
    expect(ruleLabel({ type: "bannedLetters", letters: "ae" })).toBe("No letters A, E");
    expect(ruleLabel({ type: "requiredWords", words: ["lighthouse", "key"] })).toBe("Use: lighthouse, key");
  });
});
