import { describe, expect, it } from "vitest";
import { passageWords } from "../lib/blackout";
import { syllableRange } from "../lib/engine/language";
import { checkBannedLetters, checkSyllables } from "../lib/engine/rules";
import { normalizeWord } from "../lib/engine/tokenize";
import { parseTemplate } from "../lib/fill-in";
import { everyDraw } from "../lib/round";
import { blackoutSets } from "./blackout";
import { constraintSets } from "./constraint";
import { fillInSets } from "./fill-in";
import { howToPlay } from "./how-to-play";

const allSets = [...constraintSets, ...fillInSets, ...blackoutSets];

describe("content", () => {
  it("has unique set ids across mechanics, since they share /sets/[id]", () => {
    const ids = allSets.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps time limits in bonus rules only", () => {
    for (const set of allSets) {
      expect(set.rules.filter((r) => r.type === "timeLimit"), set.id).toEqual([]);
    }
  });

  it("has fill-in templates that parse", () => {
    for (const set of fillInSets) {
      expect(() => parseTemplate(set.template), set.id).not.toThrow();
    }
  });

  // The tagger can't judge words pulled out of their sentences, and the poem
  // has no lines or sentences of its own.
  it("uses only the rules blackout allows", () => {
    const allowed = ["wordCount", "requiredWords", "bannedLetters", "syllables", "noRepeats", "timeLimit"];
    for (const set of blackoutSets) {
      for (const rule of [...set.rules, ...(set.bonus ?? [])]) expect(allowed, `${set.id}: ${rule.type}`).toContain(rule.type);
    }
  });

  it("resolves every draw to a value", () => {
    for (const set of allSets) {
      for (const round of everyDraw(set)) {
        for (const rule of [...round.rules, ...(round.bonus ?? [])]) {
          if (rule.type === "bannedLetters") expect(rule.letters, set.id).toMatch(/^\p{L}+$/u);
          if (rule.type === "requiredWords") expect(rule.words?.length, set.id).toBeGreaterThan(0);
          if (rule.type === "firstSentence") expect(rule.sentence?.trim(), set.id).toBeTruthy();
        }
      }
    }
  });

  // Every value a list can draw must work with the passage.
  it("has every required blackout word, in every draw, in its passage", () => {
    for (const set of blackoutSets) {
      const words = new Set(passageWords(set.passage).map((w) => normalizeWord(w.text)));
      for (const round of everyDraw(set)) {
        for (const rule of [...round.rules, ...(round.bonus ?? [])]) {
          if (rule.type !== "requiredWords") continue;
          for (const word of rule.words ?? []) expect(words, `${set.id}: ${word}`).toContain(normalizeWord(word));
        }
      }
    }
  });

  // Usable words pass the round's banned letter and syllable limits; when the
  // main rules ban repeats, only distinct words count. So an impossible set
  // (too few one-syllable words, or a letter that blanks the page) fails here.
  it("leaves enough usable blackout words for the word count in every draw", () => {
    for (const set of blackoutSets) {
      const count = set.rules.find((r) => r.type === "wordCount");
      const needed = count?.type === "wordCount" ? (count.exact ?? count.min ?? 1) : 1;
      const distinct = set.rules.some((r) => r.type === "noRepeats");
      for (const round of everyDraw(set)) {
        const usable = passageWords(set.passage).filter((w) =>
          round.rules.every((rule) => {
            if (rule.type === "bannedLetters") return checkBannedLetters(rule, [w]).length === 0;
            if (rule.type === "syllables") return checkSyllables(rule, [w], syllableRange).length === 0;
            return true;
          }),
        );
        const available = distinct ? new Set(usable.map((w) => normalizeWord(w.text))).size : usable.length;
        const banned = round.rules.find((r) => r.type === "bannedLetters");
        const label = banned?.type === "bannedLetters" ? ` without ${banned.letters}` : "";
        expect(available, `${set.id}${label}`).toBeGreaterThanOrEqual(needed);
      }
    }
  });

  it("has How to play text for every mechanic", () => {
    for (const mechanic of ["constraint", "fill-in", "blackout"] as const) {
      const info = howToPlay[mechanic];
      expect(info.name && info.intro && info.steps.length > 0, mechanic).toBeTruthy();
    }
  });

  it("records the source of every blackout passage", () => {
    for (const { id, source } of blackoutSets) {
      expect(source.title && source.author && source.year && source.url.startsWith("https://"), id).toBeTruthy();
    }
  });
});
