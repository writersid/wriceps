import { describe, expect, test } from "vitest";
import { syllableRange, tagWords, wordRoots } from "./language";
import {
  checkBannedLetters,
  checkBannedWordType,
  checkFirstSentence,
  checkNoRepeats,
  checkRequiredWords,
  checkSyllables,
  checkTimeLimit,
  checkWordCount,
} from "./rules";
import { tokenize } from "./tokenize";

describe("max syllables", () => {
  const check = (max: number, text: string) =>
    checkSyllables({ type: "syllables", id: "ms", weight: 30, max }, tokenize(text), syllableRange).map((f) => f.word);

  test("words within the limit pass", () => {
    expect(check(1, "The cat sat on the mat.")).toEqual([]);
  });

  test("flags each word over the limit, with its position", () => {
    const flags = checkSyllables({ type: "syllables", id: "ms", weight: 30, max: 1 }, tokenize("A happy dog"), syllableRange);
    expect(flags).toEqual([{ ruleId: "ms", kind: "tooManySyllables", word: "happy", start: 2, end: 7, level: "sure", ignorable: true, ignoreKey: "ms:happy" }]);
  });

  test("a word with several valid counts passes if any is within the limit", () => {
    expect(check(1, "fire hour")).toEqual([]);
    expect(check(2, "every")).toEqual([]);
    expect(check(1, "every")).toEqual(["every"]);
  });

  test("uses a word's lowest valid count even when the fallback guesses a higher one", () => {
    expect(check(2, "family different camera interest")).toEqual([]);
  });

  test("tricky words from the test set", () => {
    expect(check(2, "business")).toEqual([]);
    expect(check(1, "business")).toEqual(["business"]);
  });

  test("each part of a hyphenated word is checked separately", () => {
    expect(check(1, "well-known")).toEqual([]);
    expect(check(1, "sun-dappled")).toEqual(["sun-dappled"]);
  });

  test("contractions and curly apostrophes", () => {
    expect(check(1, "don't won’t")).toEqual([]);
    expect(check(1, "couldn't")).toEqual(["couldn't"]);
  });

  test("case does not matter", () => {
    expect(check(1, "HAPPY")).toEqual(["HAPPY"]);
  });

  test("numbers are not checked", () => {
    expect(check(1, "In 2026")).toEqual([]);
  });

  test("empty text has no flags", () => {
    expect(check(1, "")).toEqual([]);
  });
});

describe("min and exact syllables", () => {
  const check = (min: number | undefined, max: number | undefined, text: string) =>
    checkSyllables({ type: "syllables", id: "sy", weight: 30, min, max }, tokenize(text), syllableRange).map(
      (f) => `${f.word}:${f.kind}`,
    );

  test("flags words under the minimum", () => {
    expect(check(2, undefined, "cat window")).toEqual(["cat:tooFewSyllables"]);
  });

  test("a word passes the minimum if any valid count reaches it", () => {
    expect(check(2, undefined, "fire hour tired")).toEqual([]);
  });

  test("exactly 2 accepts either count of a two-way word", () => {
    expect(check(2, 2, "fire every window")).toEqual([]);
    expect(check(2, 2, "cat banana")).toEqual(["cat:tooFewSyllables", "banana:tooManySyllables"]);
  });

  test("hyphenated words: the minimum checks the whole word", () => {
    expect(check(2, undefined, "well-known")).toEqual([]);
  });

  test("hyphenated words: exactly also checks the maximum on the whole word", () => {
    expect(check(2, 2, "well-known")).toEqual([]);
    expect(check(2, 2, "forget-me-not")).toEqual(["forget-me-not:tooManySyllables"]);
    expect(check(undefined, 2, "forget-me-not")).toEqual([]);
  });

  test("numbers are not checked against the minimum", () => {
    expect(check(2, 2, "2026")).toEqual([]);
  });
});

describe("no repeated words", () => {
  const check = (text: string) => {
    const words = tokenize(text);
    return checkNoRepeats({ type: "noRepeats", id: "nr", weight: 20 }, words, wordRoots(text, words)).map(
      (f) => `${f.word}<${f.of}:${f.kind}:${f.ignorable ? "ignorable" : "strict"}`,
    );
  };

  test("different words pass", () => {
    expect(check("window, chair, lamp")).toEqual([]);
  });

  test("the same word ignoring case is a strict repeat", () => {
    expect(check("Apple, apple, pear, APPLE")).toEqual(["apple<Apple:repeat:strict", "APPLE<Apple:repeat:strict"]);
  });

  test("regular and irregular plurals are ignorable repeats", () => {
    expect(check("window, windows")).toEqual(["windows<window:repeatForm:ignorable"]);
    expect(check("mouse, mice, child, children, goose, geese")).toEqual([
      "mice<mouse:repeatForm:ignorable",
      "children<child:repeatForm:ignorable",
      "geese<goose:repeatForm:ignorable",
    ]);
  });

  test("verb forms, including irregular participles", () => {
    expect(check("run, ran, running")).toEqual(["ran<run:repeatForm:ignorable", "running<run:repeatForm:ignorable"]);
    expect(check("go, went, gone")).toEqual(["went<go:repeatForm:ignorable", "gone<go:repeatForm:ignorable"]);
    expect(check("write, written")).toEqual(["written<write:repeatForm:ignorable"]);
  });

  test("derived words are different words", () => {
    expect(check("sing, singer, walk, walker, new, news")).toEqual([]);
  });

  test("in a sentence, left as leave and left as a direction", () => {
    expect(check("She left because he wanted to leave.")).toEqual(["leave<left:repeatForm:ignorable"]);
    // compromise misreads "Turn left, then leave." (left as leave), so a flag
    // there is a tagger error the player can ignore.
    expect(check("She turned left and then had to leave.")).toEqual([]);
  });

  test("each repeat after the first is flagged", () => {
    expect(check("the the the")).toHaveLength(2);
  });
});

describe("time limit", () => {
  const rule = { type: "timeLimit" as const, id: "tl", weight: 10, seconds: 60 };

  test("no flag before the clock starts or within the limit", () => {
    expect(checkTimeLimit(rule, undefined)).toEqual([]);
    expect(checkTimeLimit(rule, 60_000)).toEqual([]);
  });

  test("one strict flag once past the limit", () => {
    expect(checkTimeLimit(rule, 60_001)).toMatchObject([{ ruleId: "tl", kind: "overTime", ignorable: false }]);
  });
});

describe("no adverbs and no adjectives", () => {
  const check = (type: "noAdverbs" | "noAdjectives", text: string) =>
    checkBannedWordType({ type, id: type, weight: 30 }, tagWords(text, tokenize(text)));
  const words = (type: "noAdverbs" | "noAdjectives", text: string) => check(type, text).map((f) => f.word);

  test("flags manner adverbs and plain adjectives, with positions", () => {
    const text = "The old man walked slowly to the quiet harbor.";
    expect(check("noAdverbs", text)).toEqual([
      { ruleId: "noAdverbs", kind: "adverb", word: "slowly", start: 19, end: 25, level: "sure", ignorable: true, ignoreKey: "noAdverbs:slowly" },
    ]);
    expect(words("noAdjectives", text)).toEqual(["old", "quiet"]);
  });

  test("flags intensifiers, only, even, still", () => {
    expect(words("noAdverbs", "It was very cold, and I was really tired.")).toEqual(["very", "really"]);
    expect(words("noAdverbs", "He even smiled.")).toEqual(["even"]);
  });

  test("never flags allowlisted adverbs", () => {
    expect(words("noAdverbs", "I never go there now, and she won't come back again.")).toEqual([]);
    expect(words("noAdverbs", "Please sit down.")).toEqual([]);
  });

  test("never flags allowlisted adjectives, including ordinals", () => {
    expect(words("noAdjectives", "The first and last trains left on the same day.")).toEqual([]);
    expect(words("noAdjectives", "She won her 21st race.")).toEqual([]);
  });

  test("'only' passes as an adjective but is flagged as an adverb", () => {
    expect(words("noAdjectives", "He was the only doctor in town.")).toEqual([]);
    expect(words("noAdverbs", "They sell only fresh fish.")).toEqual(["only"]);
  });

  test("predicative adjectives and participles used as adjectives", () => {
    expect(words("noAdjectives", "The sky is blue.")).toEqual(["blue"]);
    expect(words("noAdjectives", "A broken window rattled.")).toEqual(["broken"]);
  });

  test("a flag inside a hyphenated word underlines the whole word", () => {
    expect(words("noAdjectives", "A well-known man arrived.")).toEqual(["well-known"]);
  });

  test("curly quotes and apostrophes don't break tagging", () => {
    expect(words("noAdverbs", "“Walk slowly,” she said. I didn’t.")).toEqual(["slowly"]);
  });

  test("text with no words, or only emoji, has no flags", () => {
    expect(words("noAdverbs", "")).toEqual([]);
    expect(words("noAdjectives", "🙂 🙂")).toEqual([]);
  });
});

describe("banned letters", () => {
  const check = (letters: string, text: string) =>
    checkBannedLetters({ type: "bannedLetters", id: "bl", weight: 30, letters }, tokenize(text));

  test("clean text has no flags", () => {
    expect(check("e", "A cat sat on a mat.")).toEqual([]);
  });

  test("flags each word containing the letter, with its position", () => {
    const flags = check("e", "The cat sat here.");
    expect(flags.map((f) => [f.word, f.start, f.end])).toEqual([["The", 0, 3], ["here", 12, 16]]);
    expect(flags[0]).toMatchObject({ kind: "bannedLetter", level: "sure", ignorable: false, ignoreKey: "bl:the" });
  });

  test("one flag per word, even with the letter twice", () => {
    expect(check("e", "sleepy")).toHaveLength(1);
  });

  test("ignores case in both the text and the rule", () => {
    expect(check("E", "Eat")).toHaveLength(1);
    expect(check("e", "EAT")).toHaveLength(1);
  });

  test("several banned letters", () => {
    expect(check("ae", "A dog, the fox, I").map((f) => f.word)).toEqual(["A", "the"]);
  });

  test("accented letters count as their plain letter", () => {
    expect(check("e", "café")).toHaveLength(1);
  });

  test("checks both parts of hyphenated words and contractions", () => {
    expect(check("e", "well-known don't")).toHaveLength(1);
    expect(check("t", "don't")).toHaveLength(1);
  });

  test("empty text has no flags", () => {
    expect(check("e", "")).toEqual([]);
  });
});

describe("required words", () => {
  const check = (words: string[], text: string) =>
    checkRequiredWords({ type: "requiredWords", id: "rw", weight: 20, words }, tokenize(text));

  test("all present: no flags", () => {
    expect(check(["river", "stone"], "The river ran past a stone.")).toEqual([]);
  });

  test("one flag per missing word, with no position", () => {
    const flags = check(["river", "stone", "moon"], "The river ran.");
    expect(flags.map((f) => f.word)).toEqual(["stone", "moon"]);
    expect(flags[0]).toMatchObject({ kind: "missingWord", ignorable: false, ignoreKey: "rw:stone", start: undefined });
  });

  test("ignores case", () => {
    expect(check(["River"], "RIVER deep")).toEqual([]);
  });

  test("must match exactly: 'rivers' does not satisfy 'river'", () => {
    expect(check(["river"], "Two rivers met.")).toHaveLength(1);
    expect(check(["river"], "A riverbank.")).toHaveLength(1);
  });

  test("curly and straight apostrophes match", () => {
    expect(check(["don't"], "I don’t know.")).toEqual([]);
  });

  test("a hyphenated required word must appear whole", () => {
    expect(check(["well-known"], "A well-known face.")).toEqual([]);
    expect(check(["well"], "A well-known face.")).toHaveLength(1);
  });

  test("empty text misses everything", () => {
    expect(check(["river"], "")).toHaveLength(1);
  });
});

describe("required first sentence", () => {
  const sentence = "It was a dark and stormy night.";
  const check = (text: string, required = sentence) =>
    checkFirstSentence({ type: "firstSentence", id: "fs", weight: 30, sentence: required }, text);

  test("exact match, followed by more text: no flag", () => {
    expect(check("It was a dark and stormy night. The rain fell.")).toEqual([]);
  });

  test("ignores case and extra spaces", () => {
    expect(check("  it WAS a   dark and\nstormy night.  Then...")).toEqual([]);
  });

  test("ignores curly versus straight quotes", () => {
    const quoted = `"Stop," she said. "Don't move."`;
    expect(check(`“Stop,” she said. “Don’t move.” He froze.`, quoted)).toEqual([]);
  });

  test("a different opening is flagged over the draft's first sentence", () => {
    const text = "It was a bright cold day. The clocks struck.";
    const [f] = check(text);
    expect(f).toMatchObject({ kind: "firstSentence", level: "sure", ignorable: false, ignoreKey: "fs:" });
    expect(text.slice(f.start, f.end)).toBe("It was a bright cold day.");
  });

  test("different punctuation is not ignored", () => {
    expect(check("It was a dark and stormy night, and cold.")).toHaveLength(1);
  });

  test("the sentence must not run on into a longer word", () => {
    expect(check("The ending came.", "The end")).toHaveLength(1);
    expect(check("The end.", "The end")).toEqual([]);
  });

  test("the required sentence must come first, not later", () => {
    expect(check("Look. It was a dark and stormy night.")).toHaveLength(1);
  });

  test("empty text is flagged with no position", () => {
    const [f] = check("   ");
    expect(f.start).toBeUndefined();
  });
});

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
    expect(flags[0]).toMatchObject({ ruleId: "wc", kind: "tooManyWords", word: "Sad", start: 34, end: 37, level: "sure", ignorable: false, ignoreKey: "wc:sad" });
  });

  describe("six-word story (exact 6)", () => {
    test("5 words: one draft-level flag worth 1 violation", () => {
      expect(check({ exact: 6 }, "For sale: baby shoes, never.")).toEqual([
        { ruleId: "wc", kind: "tooFewWords", word: "", level: "sure", ignorable: false, ignoreKey: "wc:", count: 1 },
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
