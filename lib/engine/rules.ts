import { normalizeWord } from "./tokenize";
import type { Flag, Rule, ScoredRule, Token } from "./types";

type RuleOf<T extends Rule["type"]> = Extract<ScoredRule, { type: T }>;

function flag(rule: ScoredRule, kind: string, word: string, pos?: Token): Flag {
  return {
    ruleId: rule.id,
    kind,
    word,
    start: pos?.start,
    end: pos?.end,
    level: "sure",
    ignoreKey: `${rule.id}:${normalizeWord(word)}`,
  };
}

// Each word past the exact or maximum limit is one violation. Under an exact
// count, each missing word is one violation, carried by a single flag with no
// position. Under a minimum is not a violation; the score's gate handles that.
export function checkWordCount(rule: RuleOf<"wordCount">, words: Token[]): Flag[] {
  if (rule.exact !== undefined && words.length < rule.exact) {
    return [{ ...flag(rule, "tooFewWords", ""), count: rule.exact - words.length }];
  }
  const limit = rule.exact ?? rule.max;
  if (limit === undefined) return [];
  return words.slice(limit).map((w) => flag(rule, "tooManyWords", w.text, w));
}

// Lowercase with accents removed, so "É" and "é" both contain "e".
const plainLetters = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// One flag per word that contains any banned letter.
export function checkBannedLetters(rule: RuleOf<"bannedLetters">, words: Token[]): Flag[] {
  const banned = [...plainLetters(rule.letters)];
  return words
    .filter((w) => banned.some((letter) => plainLetters(w.text).includes(letter)))
    .map((w) => flag(rule, "bannedLetter", w.text, w));
}

// One flag per required word missing from the draft. Matches whole words only,
// so "rivers" does not satisfy "river".
export function checkRequiredWords(rule: RuleOf<"requiredWords">, words: Token[]): Flag[] {
  const present = new Set(words.map((w) => normalizeWord(w.text)));
  return rule.words
    .filter((word) => !present.has(normalizeWord(word)))
    .map((word) => flag(rule, "missingWord", word));
}

// Ignores case, curly versus straight quotes, and extra spaces.
const looseSentence = (s: string) =>
  s.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();

// The draft must begin with the required sentence, not run on into a longer
// word ("The end" is not satisfied by "The ending"). The flag underlines the
// draft's own first sentence.
export function checkFirstSentence(rule: RuleOf<"firstSentence">, text: string): Flag[] {
  const draft = looseSentence(text);
  const required = looseSentence(rule.sentence);
  if (draft.startsWith(required) && !/[\p{L}\p{N}]/u.test(draft.charAt(required.length))) return [];
  const first = /\S[^.!?]*[.!?]*["'”’]?/.exec(text);
  const pos = first ? { text: first[0], start: first.index, end: first.index + first[0].length } : undefined;
  return [flag(rule, "firstSentence", "", pos)];
}
