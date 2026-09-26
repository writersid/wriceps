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
