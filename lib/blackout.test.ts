import { describe, expect, it } from "vitest";
import { keptWordAt, passageWords, poemText, toggleKept } from "./blackout";

const passage = "It was the best of times, it was the worst of times; well-known, don't you think?";
const words = passageWords(passage);
const at = (word: string, nth = 0) => words.map((w, i) => (w.text === word ? i : -1)).filter((i) => i >= 0)[nth];

describe("blackout poems", () => {
  it("splits the passage into words, keeping hyphens and apostrophes inside a word", () => {
    expect(words.map((w) => w.text)).toContain("well-known");
    expect(words.map((w) => w.text)).toContain("don't");
    expect(words.map((w) => w.text)).not.toContain("times,");
  });

  it("makes the poem from kept words in passage order, without punctuation", () => {
    const kept = [at("think"), at("best"), at("times", 1), at("It")];
    expect(poemText(words, kept)).toBe("It best times think");
    expect(poemText(words, [])).toBe("");
  });

  it("maps a poem position back to the passage word, even for a repeated word", () => {
    const kept = [at("was", 0), at("best"), at("was", 1)];
    // Poem: "was best was"; the second "was" starts at 9.
    expect(poemText(words, kept)).toBe("was best was");
    expect(keptWordAt(words, kept, 0)).toBe(at("was", 0));
    expect(keptWordAt(words, kept, 4)).toBe(at("best"));
    expect(keptWordAt(words, kept, 9)).toBe(at("was", 1));
    expect(keptWordAt(words, kept, 99)).toBeNull();
  });

  it("toggles a word in and out, keeping positions in order", () => {
    expect(toggleKept([5, 1], 3)).toEqual([1, 3, 5]);
    expect(toggleKept([1, 3, 5], 3)).toEqual([1, 5]);
  });
});
