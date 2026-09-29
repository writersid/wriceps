import { describe, expect, test } from "vitest";
import { checkText } from "./check";
import { bandFor, scoreText } from "./score";
import type { Exercise, Flag } from "./types";

const words = (n: number) => Array(n).fill("cat").join(" ");
const run = (text: string, exercise: Exercise, ignored: string[] = []) =>
  scoreText(text, exercise, checkText(text, exercise), ignored);

// A hand-made adverb flag, so these tests don't depend on the tagger.
const adverb = (word: string, extra: Partial<Flag> = {}): Flag => ({
  ruleId: "adv", kind: "adverb", word, level: "sure", ignorable: true, ignoreKey: `adv:${word}`, ...extra,
});

describe("bands", () => {
  test("cutoffs match SPEC", () => {
    expect([0, 39, 40, 69, 70, 89, 90, 100].map(bandFor)).toEqual([
      "Warm-up", "Warm-up", "Working set", "Working set", "Heavy lift", "Heavy lift", "Top set", "Top set",
    ]);
  });

  test("the score result carries its band", () => {
    const exercise: Exercise = { rules: [{ type: "wordCount", id: "wc", weight: 100, min: 10 }] };
    expect(run(words(5), exercise)).toEqual({ score: 50, band: "Working set", ignoredFlags: 0 });
  });
});

describe("exact word counts", () => {
  const exact = (n: number): Exercise => ({
    rules: [
      { type: "wordCount", id: "wc", weight: 60, exact: n },
      { type: "bannedLetters", id: "bl", weight: 40, letters: "z" },
    ],
  });

  test("six-word story: 5 and 7 words score the same, 6 scores full", () => {
    expect(run(words(6), exact(6)).score).toBe(100);
    expect(run(words(5), exact(6)).score).toBe(80);
    expect(run(words(7), exact(6)).score).toBe(80);
  });

  test("drabble: 97 and 103 words score the same", () => {
    expect(run(words(97), exact(100)).score).toBe(39);
    expect(run(words(103), exact(100)).score).toBe(39);
  });

  test("drabble: no gate while the rule has points left", () => {
    expect(run(words(98), exact(100)).score).toBe(60);
  });

  test("drabble: 10 and 150 words score low", () => {
    expect(run(words(10), exact(100))).toMatchObject({ score: 4, band: "Warm-up" });
    expect(run(words(150), exact(100))).toMatchObject({ score: 27, band: "Warm-up" });
  });

  test("empty draft scores 0", () => {
    expect(run("", exact(6)).score).toBe(0);
  });
});

describe("minimum, maximum, and range gates", () => {
  const wc = (limits: { min?: number; max?: number }): Exercise => ({
    rules: [{ type: "wordCount", id: "wc", weight: 100, ...limits }],
  });

  test("minimum: points scale with progress toward it", () => {
    expect(run(words(25), wc({ min: 50 })).score).toBe(50);
    expect(run(words(80), wc({ min: 50 })).score).toBe(100);
  });

  test("maximum only: the maximum is the target", () => {
    expect(run(words(25), wc({ max: 50 })).score).toBe(50);
    expect(run(words(50), wc({ max: 50 })).score).toBe(100);
  });

  test("range: the minimum is the target", () => {
    expect(run(words(5), wc({ min: 10, max: 20 })).score).toBe(50);
    expect(run(words(15), wc({ min: 10, max: 20 })).score).toBe(100);
  });

  test("going over a maximum costs a third of the weight per word", () => {
    expect(run(words(22), wc({ min: 10, max: 20 })).score).toBe(33);
  });

  test("no word-count rule: empty scores 0, anything else is not gated", () => {
    const exercise: Exercise = { rules: [{ type: "bannedLetters", id: "bl", weight: 100, letters: "z" }] };
    expect(run("", exercise).score).toBe(0);
    expect(run("  🙂 ", exercise).score).toBe(0);
    expect(run("Hi", exercise).score).toBe(100);
  });

  test("a word-count bonus rule does not gate", () => {
    const exercise: Exercise = {
      rules: [{ type: "bannedLetters", id: "bl", weight: 80, letters: "z" }],
      bonus: [{ type: "wordCount", id: "wc", weight: 20, min: 10 }],
    };
    expect(run(words(5), exercise).score).toBe(100);
  });
});

describe("violations, ignores, and bonus rules", () => {
  const exercise: Exercise = {
    rules: [
      { type: "noAdverbs", id: "adv", weight: 90 },
      { type: "wordCount", id: "wc", weight: 10, min: 3 },
    ],
  };
  const score = (flags: Flag[], ignored: string[] = [], ex = exercise) => scoreText("one two three", ex, flags, ignored);
  const three = [adverb("slowly"), adverb("quickly"), adverb("softly")];

  test("each violation costs a third of the rule's weight", () => {
    expect(score([]).score).toBe(100);
    expect(score([adverb("slowly")]).score).toBe(70);
    expect(score(three).score).toBe(10);
  });

  test("a rule never loses more than its weight", () => {
    expect(score([...three, adverb("very"), adverb("really")]).score).toBe(10);
  });

  test("an exercise can set its own cost per violation", () => {
    const ex: Exercise = { rules: [{ ...exercise.rules[0], perViolation: 10 }, exercise.rules[1]] };
    expect(score(three, [], ex).score).toBe(70);
  });

  test("a missed first sentence costs the rule's full weight", () => {
    const ex: Exercise = { rules: [{ type: "firstSentence", id: "fs", weight: 40, sentence: "It rained." }] };
    expect(run("It rained. Then it stopped.", ex).score).toBe(40);
    expect(run("It snowed.", ex).score).toBe(0);
  });

  test("each missing required word costs the weight divided by the number of words", () => {
    const ex: Exercise = { rules: [{ type: "requiredWords", id: "rw", weight: 40, words: ["river", "stone", "moon", "salt"] }] };
    expect(run("river stone moon salt", ex).score).toBe(40);
    expect(run("river stone moon", ex).score).toBe(30);
    expect(run("river", ex).score).toBe(10);
    expect(run("nothing here", ex).score).toBe(0);
  });

  test("an exercise's own cost overrides the fixed-maximum default", () => {
    const ex: Exercise = {
      rules: [
        { type: "firstSentence", id: "fs", weight: 40, sentence: "It rained.", perViolation: 10 },
        { type: "requiredWords", id: "rw", weight: 40, words: ["river", "stone"], perViolation: 5 },
      ],
    };
    expect(run("It snowed.", ex).score).toBe(60);
  });

  test("the first two ignores are free", () => {
    expect(score(three, ["adv:slowly", "adv:quickly"])).toEqual({ score: 70, band: "Heavy lift", ignoredFlags: 2 });
  });

  test("a third ignore hides the flag but still costs points", () => {
    expect(score(three, ["adv:slowly", "adv:quickly", "adv:softly"])).toMatchObject({ score: 70, ignoredFlags: 3 });
  });

  test("one ignore covers every occurrence of the word", () => {
    const flags = [adverb("slowly"), adverb("slowly"), adverb("quickly")];
    expect(score(flags, ["adv:slowly"])).toMatchObject({ score: 70, ignoredFlags: 2 });
  });

  test("flags that can't be ignored still cost points", () => {
    const exact: Exercise = { rules: [{ type: "wordCount", id: "wc", weight: 100, exact: 2 }] };
    const flags = checkText("one two three", exact);
    expect(flags[0].ignorable).toBe(false);
    expect(scoreText("one two three", exact, flags, [flags[0].ignoreKey])).toMatchObject({ score: 67, ignoredFlags: 0 });
  });

  test("doubtful flags cost nothing", () => {
    expect(score([adverb("slowly", { level: "doubtful" })]).score).toBe(100);
  });

  test("bonus rules add points, and the total is capped at 100", () => {
    const ex: Exercise = {
      rules: [{ type: "bannedLetters", id: "bl", weight: 70, letters: "z" }],
      bonus: [{ type: "requiredWords", id: "rw", weight: 20, words: ["river"] }],
    };
    expect(run("the river", ex).score).toBe(90);
    expect(run("the lake", ex).score).toBe(70);
    const big: Exercise = { ...ex, bonus: [{ type: "requiredWords", id: "rw", weight: 50, words: ["river"] }] };
    expect(run("the river", big).score).toBe(100);
  });
});

describe("words after the opening line", () => {
  const exercise: Exercise = {
    rules: [
      { id: "opening", type: "firstSentence", sentence: "Marley was dead: to begin with.", weight: 50 },
      { id: "length", type: "wordCount", min: 10, afterFirstSentence: true, weight: 50 },
    ],
  };
  const score = (text: string) => scoreText(text, exercise, checkText(text, exercise), []).score;
  const own = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");

  test("the opening's words don't count toward the target", () => {
    expect(score(`Marley was dead: to begin with. ${own(5)}`)).toBe(50);
    expect(score(`Marley was dead: to begin with. ${own(10)}`)).toBe(100);
  });

  test("a maximum also counts only the words after the opening", () => {
    const capped: Exercise = {
      rules: [
        { id: "opening", type: "firstSentence", sentence: "Marley was dead: to begin with.", weight: 50 },
        { id: "length", type: "wordCount", max: 3, afterFirstSentence: true, weight: 50 },
      ],
    };
    const text = `Marley was dead: to begin with. ${own(4)}`;
    expect(checkText(text, capped).map((f) => f.word)).toEqual(["w3"]);
  });

  test("without the flag, the opening counts", () => {
    const plain: Exercise = { rules: [exercise.rules[0], { id: "length", type: "wordCount", min: 12, weight: 50 }] };
    const text = `Marley was dead: to begin with. ${own(6)}`;
    expect(scoreText(text, plain, checkText(text, plain), []).score).toBe(100);
  });
});

describe("other rules skip the required opening", () => {
  const austen = "It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife.";
  const exercise: Exercise = {
    rules: [{ id: "opening", type: "firstSentence", sentence: austen, weight: 45 }],
    bonus: [
      { id: "adverbs", type: "noAdverbs", weight: 10 },
      { id: "repeats", type: "noRepeats", weight: 10 },
      { id: "sentences", type: "sentenceLength", max: 10, weight: 10 },
      { id: "syllables", type: "syllables", max: 2, weight: 10 },
    ],
  };
  const flagged = (text: string) => checkText(text, exercise).map((f) => `${f.ruleId}:${f.word}`);

  test("no flags inside the opening when it's typed as given, even with other capitals and extra spaces", () => {
    expect(flagged(`${austen} She laughed.`)).toEqual([]);
    expect(flagged(`  IT is a truth  universally acknowledged, that a single man in possession of a good fortune must be in want of a wife. She laughed.`)).toEqual([]);
  });

  test("the player's own words are still checked, positions unchanged", () => {
    const text = `${austen} She laughed loudly.`;
    const flags = checkText(text, exercise).filter((f) => f.ruleId === "adverbs");
    expect(flags.map((f) => text.slice(f.start, f.end))).toEqual(["loudly"]);
  });

  test("a changed opening isn't skipped", () => {
    expect(flagged("It is a truth universally known. She laughed.")).toContain("adverbs:universally");
    expect(flagged("It is a truth universally known. She laughed.")).toContain("opening:");
  });
});

describe("determinism and awkward input", () => {
  const exercise: Exercise = {
    rules: [
      { type: "wordCount", id: "wc", weight: 20, max: 30 },
      { type: "noAdverbs", id: "adv", weight: 30 },
      { type: "noAdjectives", id: "adj", weight: 30 },
      { type: "syllables", id: "ms", weight: 20, max: 2 },
    ],
    bonus: [{ type: "firstSentence", id: "fs", weight: 10, sentence: "It was a “dark” night." }],
  };

  test("the same text always gets the same flags and score", () => {
    const text = "It was a \"dark\" night. The old dog barked loudly—twice—at the enormous moon 🌕.";
    expect(checkText(text, exercise)).toEqual(checkText(text, exercise));
    expect(run(text, exercise)).toEqual(run(text, exercise));
  });

  test("empty, emoji-only, and dash-only drafts score without errors", () => {
    for (const text of ["", "🙂🙂", "— -- –", "   \n  "]) {
      expect(run(text, exercise).score, JSON.stringify(text)).toBeGreaterThanOrEqual(0);
    }
  });
});
