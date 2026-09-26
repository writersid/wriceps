import { describe, expect, test } from "vitest";
import { checkWordCount } from "./rules";
import { tokenize } from "./tokenize";

describe("word count", () => {
  const rule = (limits: { exact?: number; min?: number; max?: number }) =>
    ({ type: "wordCount", id: "wc", weight: 40, ...limits }) as const;
  const check = (limits: Parameters<typeof rule>[0], text: string) =>
    checkWordCount(rule(limits), tokenize(text));

  test("exact: on target is clean", () => {
    expect(check({ exact: 6 }, "For sale: baby shoes, never worn.")).toEqual([]);
  });

  test("exact: each extra word is one flag, on that word", () => {
    const flags = check({ exact: 6 }, "For sale: baby shoes, never worn. Sad.");
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatchObject({ ruleId: "wc", kind: "tooManyWords", word: "Sad", start: 34, end: 37, level: "sure", ignoreKey: "wc:sad" });
  });

  describe("six-word story (exact 6)", () => {
    test("5 words: one draft-level flag worth 1 violation", () => {
      expect(check({ exact: 6 }, "For sale: baby shoes, never.")).toEqual([
        { ruleId: "wc", kind: "tooFewWords", word: "", level: "sure", ignoreKey: "wc:", count: 1 },
      ]);
    });

    test("6 words: clean", () => {
      expect(check({ exact: 6 }, "For sale: baby shoes, never worn.")).toEqual([]);
    });

    test("7 words: the extra word is flagged, 1 violation", () => {
      const flags = check({ exact: 6 }, "For sale: baby shoes, never worn. Sad.");
      expect(flags.map((f) => [f.kind, f.word, f.count ?? 1])).toEqual([["tooManyWords", "Sad", 1]]);
    });
  });

  test("exact: each missing word is one violation, with no position", () => {
    const [short] = check({ exact: 6 }, "Baby shoes.");
    expect(short.count).toBe(4);
    expect(short.start).toBeUndefined();
    expect(check({ exact: 6 }, "")[0].count).toBe(6);
  });

  test("min: being under is not a flag", () => {
    expect(check({ min: 50 }, "Too short.")).toEqual([]);
  });

  test("a range (min and max together) flags only words past the max", () => {
    expect(check({ min: 3, max: 5 }, "one two")).toEqual([]);
    expect(check({ min: 3, max: 5 }, "one two three four five")).toEqual([]);
    expect(check({ min: 3, max: 5 }, "one two three four five six").map((f) => f.word)).toEqual(["six"]);
  });

  test("min only never flags extra words", () => {
    expect(check({ min: 2 }, "one two three four")).toEqual([]);
  });

  test("max: words past the limit are flagged", () => {
    expect(check({ max: 3 }, "one two three four five").map((f) => f.word)).toEqual(["four", "five"]);
  });

  test("counts contractions, hyphenated words, and numbers as one word each", () => {
    expect(check({ exact: 3 }, "Don't well-known 2026")).toEqual([]);
  });

  test("dashed pairs count as two words", () => {
    expect(check({ exact: 1 }, "yes—no")).toHaveLength(1);
  });

  test("empty text has no flags under a max", () => {
    expect(check({ max: 5 }, "")).toEqual([]);
  });
});
