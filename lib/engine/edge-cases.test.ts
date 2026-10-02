// Awkward input from real players: emoji, pasted text, punctuation only,
// other scripts, markup, and drafts far longer than any set asks for.
import { describe, expect, test } from "vitest";
import { parseChallenge, trimWords } from "../share";
import { checkText } from "./check";
import { scoreText } from "./score";
import { tokenize } from "./tokenize";
import type { Exercise } from "./types";

// Every text rule at once, as the heaviest set would run them.
const everything: Exercise = {
  rules: [
    { type: "wordCount", id: "wc", weight: 15, min: 10 },
    { type: "syllables", id: "sy", weight: 15, max: 3 },
    { type: "noAdverbs", id: "adv", weight: 15 },
    { type: "noAdjectives", id: "adj", weight: 15 },
    { type: "bannedLetters", id: "bl", weight: 10, letters: "z" },
    { type: "requiredWords", id: "rw", weight: 10, words: ["river"] },
    { type: "noRepeats", id: "nr", weight: 10 },
  ],
  bonus: [{ type: "sentenceLength", id: "sl", weight: 10, max: 12 }],
};

// Every underline must cover exactly the word it names, or the highlight lands
// on the wrong characters.
function expectUnderlinesMatch(text: string) {
  for (const f of checkText(text, everything)) {
    if (f.start === undefined || f.end === undefined) continue;
    if (f.ruleId === "sl") continue; // underlines the words past the limit, not one word
    expect(text.slice(f.start, f.end), f.ruleId).toBe(f.word);
  }
}

describe("emoji and symbols", () => {
  test("emoji aren't words, and underlines after them still line up", () => {
    const text = "I 🙂 quickly ate 🍕 pizza 👍🏽 by the river, 👨‍👩‍👧 very happily.";
    expect(tokenize(text).map((t) => t.text)).toEqual(["I", "quickly", "ate", "pizza", "by", "the", "river", "very", "happily"]);
    expectUnderlinesMatch(text);
    const flagged = checkText(text, everything).map((f) => f.word);
    expect(flagged).toEqual(expect.arrayContaining(["quickly", "happily"]));
  });

  test("a draft of only emoji or punctuation scores 0 without errors", () => {
    for (const text of ["🙂🙂🙂", "...!!! ??? — …", "   \n\n  ", "‍​"]) {
      expect(tokenize(text), text).toEqual([]);
      expect(scoreText(text, everything, checkText(text, everything), []).score, text).toBe(0);
    }
  });
});

describe("pasted text", () => {
  test("Windows line breaks end sentences and keep underlines in place", () => {
    const text = "one two three four five six seven eight nine ten eleven twelve\r\nthirteen";
    expect(checkText(text, everything).filter((f) => f.ruleId === "sl")).toEqual([]);
    expectUnderlinesMatch("The river ran quickly.\r\nIt was very cold.\r\n\r\nWe left.");
  });

  test("non-breaking and zero-width spaces don't glue or split words wrongly", () => {
    expect(tokenize("one two three").map((t) => t.text)).toEqual(["one", "two", "three"]);
    expect(tokenize("one​two").map((t) => t.text)).toEqual(["one", "two"]);
  });

  test("accents and other scripts count as words and don't break the checkers", () => {
    const text = "Café naïve résumé, café by the river. Москва 東京 مرحبا.";
    expect(tokenize(text).map((t) => t.text)).toEqual(["Café", "naïve", "résumé", "café", "by", "the", "river", "Москва", "東京", "مرحبا"]);
    expectUnderlinesMatch(text);
  });

  test("markup is just text", () => {
    const text = '<script>alert("river")</script> <b>bold</b> by the river';
    expect(() => checkText(text, everything)).not.toThrow();
    expect(trimWords(text, 60)).toBe(text);
  });

  test("one enormous word doesn't hang the checker", () => {
    const text = "a".repeat(20_000) + " by the river";
    const start = performance.now();
    checkText(text, everything);
    expect(performance.now() - start).toBeLessThan(1000);
  });
});

describe("very long drafts", () => {
  // Varied prose, so the tagger and the repeat rule do real work.
  const sentence = (i: number) =>
    `The old river ${["ran", "wound", "slid", "rushed"][i % 4]} quietly past ${i} small houses, and nobody really noticed it today.`;
  const draft = (words: number) => {
    const parts: string[] = [];
    let n = 0;
    for (let i = 0; n < words; i++) {
      parts.push(sentence(i));
      n += tokenize(sentence(i)).length;
    }
    // A paragraph break every five sentences, like pasted prose.
    return parts.map((p, i) => p + (i % 5 === 4 ? "\n" : " ")).join("").trim();
  };

  // Each pause in typing reruns the whole check on the main thread, so this
  // time is roughly the freeze per pause (a mid-range phone is about 4x slower).
  test.each([150, 1000, 5000])("checks a %i-word draft and reports the time", (n) => {
    const text = draft(n);
    checkText(text, everything); // warm up, as the app has done by the time you type
    const runs = 3;
    const start = performance.now();
    for (let i = 0; i < runs; i++) checkText(text, everything);
    const ms = (performance.now() - start) / runs;
    console.log(`${tokenize(text).length} words: ${ms.toFixed(1)} ms per check on this machine`);
    expectUnderlinesMatch(text.slice(0, 2000));
    expect(ms).toBeLessThan(5000);
  });

  test("the share message of a long draft is cut to 60 words", () => {
    const text = draft(5000);
    const trimmed = trimWords(text, 60);
    expect(tokenize(trimmed)).toHaveLength(60);
    expect(trimmed.endsWith("…")).toBe(true);
  });
});

describe("hostile challenge links", () => {
  test("odd encodings and repeats parse safely", () => {
    expect(parseChallenge("?c=007")).toEqual({ score: 7 });
    expect(parseChallenge("?c=50&c=90")).toEqual({ score: 50 });
    expect(parseChallenge("?c=%35%30")).toEqual({ score: 50 });
    for (const bad of ["?c=50%00", "?c=1e2", "?c=+50", "?c= 50", `?c=${"9".repeat(1000)}`, "?c=５０", "?c=50#x"])
      expect(parseChallenge(bad), bad).toBeNull();
    expect(parseChallenge("?c=50&seed=0x10")).toEqual({ score: 50 });
  });
});
