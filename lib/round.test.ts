import { describe, expect, it } from "vitest";
import type { Exercise } from "./engine/types";
import { draw, everyDraw, hasDraws, openRound, resolveRound, STARTING_LETTERS } from "./round";

describe("draws from a seed", () => {
  const letters = [..."abcdef"];

  it("the same seed and rule always draw the same option", () => {
    expect(draw(12345, "x", letters)).toBe(draw(12345, "x", letters));
  });

  it("spreads across the options", () => {
    const drawn = new Set(Array.from({ length: 300 }, (_, i) => draw(i * 7919, "x", letters)));
    expect(drawn.size).toBe(letters.length);
  });

  it("draws independently for different rules in one round", () => {
    const same = Array.from({ length: 200 }, (_, seed) => draw(seed, "a", letters) === draw(seed, "b", letters));
    expect(same.filter(Boolean).length).toBeLessThan(80);
  });
});

describe("resolveRound", () => {
  const exercise: Exercise = {
    rules: [
      { id: "letter", type: "sameFirstLetter", random: true, weight: 20 },
      { id: "banned", type: "bannedLetters", pool: "aoinst", weight: 20 },
      { id: "words", type: "requiredWords", options: [["key", "rain"], ["kite", "coin"]], weight: 20 },
      { id: "opening", type: "firstSentence", options: ["It was a dark and stormy night.", "Marley was dead: to begin with."], weight: 20 },
      { id: "repeats", type: "noRepeats", weight: 20 },
    ],
  };

  it("fixes every draw and leaves other rules alone", () => {
    const [letter, banned, words, opening, repeats] = resolveRound(exercise, 42).rules;
    expect(letter).toMatchObject({ random: false });
    expect(STARTING_LETTERS).toContain((letter as { letter: string }).letter);
    expect("aoinst").toContain((banned as { letters: string }).letters);
    expect(banned).not.toHaveProperty("pool");
    expect([["key", "rain"], ["kite", "coin"]]).toContainEqual((words as { words: string[] }).words);
    expect(opening).toHaveProperty("sentence");
    expect(hasDraws(resolveRound(exercise, 42))).toBe(false);
    expect(repeats).toBe(exercise.rules[4]);
  });

  it("keeps a drawn opening line and its short label together", () => {
    const labeled: Exercise = {
      rules: [{ id: "opening", type: "firstSentence", options: ["Line one.", "Line two.", "Line three."], optionLabels: ["One", "Two", "Three"], weight: 90 }],
    };
    for (let seed = 0; seed < 30; seed++) {
      const rule = resolveRound(labeled, seed).rules[0] as { sentence: string; label: string };
      expect(rule.sentence).toBe(`Line ${rule.label.toLowerCase()}.`);
    }
  });

  it("gives the same round for the same seed", () => {
    expect(resolveRound(exercise, 7)).toEqual(resolveRound(exercise, 7));
  });

  it("never draws a letter outside the starting pool", () => {
    const drawn = new Set(
      Array.from({ length: 500 }, (_, seed) => (resolveRound(exercise, seed).rules[0] as { letter: string }).letter),
    );
    expect([...drawn].sort().join("")).toBe([...STARTING_LETTERS].sort().join(""));
  });

  it("knows which sets draw", () => {
    expect(hasDraws(exercise)).toBe(true);
    expect(hasDraws({ rules: [{ id: "r", type: "noRepeats", weight: 100 }] })).toBe(false);
    expect(hasDraws({ rules: [{ id: "l", type: "bannedLetters", letters: "e", weight: 100 }] })).toBe(false);
  });
});

describe("everyDraw", () => {
  it("lists every option of every draw", () => {
    const rounds = everyDraw({
      rules: [
        { id: "banned", type: "bannedLetters", pool: "ae", weight: 50 },
        { id: "words", type: "requiredWords", options: [["sea"], ["world"], ["city"]], weight: 50 },
      ],
    });
    const letters = new Set(rounds.map((r) => (r.rules[0] as unknown as { letters: string }).letters));
    const words = new Set(rounds.map((r) => (r.rules[1] as unknown as { words: string[] }).words[0]));
    expect([...letters].sort()).toEqual(["a", "e"]);
    expect([...words].sort()).toEqual(["city", "sea", "world"]);
    expect(rounds.every((r) => !hasDraws(r))).toBe(true);
  });
});

describe("openRound", () => {
  type Saved = { seed?: number; text: string };
  const saved: Saved = { seed: 1, text: "some words" };
  const busy = (d: Saved) => d.text.trim() !== "";

  it("with no challenge, plays the saved round", () => {
    expect(openRound(saved, null, busy)).toEqual({ draft: saved, challenge: null, pending: null });
  });

  it("with a challenge on the same seed, or no seed, keeps the saved round", () => {
    expect(openRound(saved, { score: 80, seed: 1 }, busy).draft).toBe(saved);
    expect(openRound(saved, { score: 80 }, busy)).toEqual({ draft: saved, challenge: { score: 80 }, pending: null });
  });

  it("drops an empty saved round with another seed", () => {
    const empty: Saved = { seed: 1, text: " " };
    expect(openRound(empty, { score: 80, seed: 2 }, busy)).toEqual({ draft: null, challenge: { score: 80, seed: 2 }, pending: null });
  });

  it("asks first when a saved round with another seed has work in it", () => {
    expect(openRound(saved, { score: 80, seed: 2 }, busy)).toEqual({ draft: saved, challenge: null, pending: { score: 80, seed: 2 } });
  });

  it("treats a saved round from before draws (no seed) as another round", () => {
    expect(openRound<Saved>({ text: "hi" }, { score: 80, seed: 2 }, busy).pending).toEqual({ score: 80, seed: 2 });
  });
});
