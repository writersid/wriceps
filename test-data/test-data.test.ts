// Checks that the hand-made test sets are well formed, so a typo in a label
// can't silently skew the accuracy numbers.
import { describe, expect, test } from "vitest";
import syllables from "./syllables.json";
import sentences from "./pos-sentences.json";

// Lowercase words in a sentence, with "don't" also yielding "n't".
function wordsIn(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  return words.flatMap((w) => (w.endsWith("n't") ? [w, "n't"] : [w]));
}

describe("syllables.json", () => {
  test("has 200 unique lowercase words", () => {
    const words = syllables.map((s) => s.word);
    expect(words).toHaveLength(200);
    expect(new Set(words).size).toBe(200);
    for (const w of words) expect(w).toMatch(/^[a-z]+$/);
  });

  test("every word has at least one positive syllable count", () => {
    for (const s of syllables) {
      expect(s.syllables.length, s.word).toBeGreaterThan(0);
      for (const n of s.syllables) expect(n, s.word).toBeGreaterThan(0);
    }
  });
});

describe("pos-sentences.json", () => {
  test("has 100 sentences with ids 1 to 100", () => {
    expect(sentences.map((s) => s.id)).toEqual(
      Array.from({ length: 100 }, (_, i) => i + 1),
    );
  });

  test("every labeled word appears in its sentence", () => {
    for (const s of sentences) {
      const words = wordsIn(s.text);
      for (const label of [...s.adjectives, ...s.adverbs]) {
        expect(words, `sentence ${s.id}: "${label}"`).toContain(label);
      }
    }
  });
});
