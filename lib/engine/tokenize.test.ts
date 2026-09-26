import { describe, expect, test } from "vitest";
import { normalizeWord, tokenize } from "./tokenize";

const words = (text: string) => tokenize(text).map((t) => t.text);

describe("tokenize", () => {
  test("splits plain words and drops punctuation", () => {
    expect(words("The cat sat. Then, it slept!")).toEqual(["The", "cat", "sat", "Then", "it", "slept"]);
  });

  test("contractions and possessives are one word, straight or curly", () => {
    expect(words("don't won’t Sid's")).toEqual(["don't", "won’t", "Sid's"]);
  });

  test("hyphenated words are one word", () => {
    expect(words("a well-known mother-in-law")).toEqual(["a", "well-known", "mother-in-law"]);
  });

  test("numbers are one word", () => {
    expect(words("In 2026 it cost 3.5 or 1,000.")).toEqual(["In", "2026", "it", "cost", "3.5", "or", "1,000"]);
  });

  test("dashes with no spaces split words", () => {
    expect(words("yes—no")).toEqual(["yes", "no"]);
    expect(words("yes–no")).toEqual(["yes", "no"]);
    expect(words("yes--no")).toEqual(["yes", "no"]);
    expect(words("yes — no")).toEqual(["yes", "no"]);
  });

  test("quotes around words are not part of them", () => {
    expect(words("“Stop,” she said. 'Now.'")).toEqual(["Stop", "she", "said", "Now"]);
  });

  test("emoji and lone punctuation are not words", () => {
    expect(words("Coffee ☕ first 🙂 - then … work")).toEqual(["Coffee", "first", "then", "work"]);
  });

  test("non-English letters stay inside words", () => {
    expect(words("café naïve")).toEqual(["café", "naïve"]);
  });

  test("empty and whitespace-only text have no words", () => {
    expect(tokenize("")).toEqual([]);
    expect(tokenize("   \n\t ")).toEqual([]);
  });

  test("positions point back into the text", () => {
    const text = "  Hi, “you” there";
    for (const t of tokenize(text)) expect(text.slice(t.start, t.end)).toBe(t.text);
    expect(tokenize(text)[1]).toEqual({ text: "you", start: 7, end: 10 });
  });
});

describe("normalizeWord", () => {
  test("lowercases and straightens curly apostrophes", () => {
    expect(normalizeWord("Won’t")).toBe("won't");
  });
});
