import { describe, expect, it } from "vitest";
import { passageWords } from "../lib/blackout";
import { normalizeWord } from "../lib/engine/tokenize";
import { parseTemplate } from "../lib/fill-in";
import { blackoutSets } from "./blackout";
import { constraintSets } from "./constraint";
import { fillInSets } from "./fill-in";

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

  it("has every required blackout word in its passage", () => {
    for (const set of blackoutSets) {
      const words = new Set(passageWords(set.passage).map((w) => normalizeWord(w.text)));
      for (const rule of set.rules) {
        if (rule.type === "requiredWords") for (const word of rule.words) expect(words, `${set.id}: ${word}`).toContain(normalizeWord(word));
      }
    }
  });

  it("records the source of every blackout passage", () => {
    for (const { id, source } of blackoutSets) {
      expect(source.title && source.author && source.year && source.url.startsWith("https://"), id).toBeTruthy();
    }
  });
});
