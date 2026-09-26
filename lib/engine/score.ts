// Turns a draft's flags into a 0–100 score and band. See SPEC.md "Scoring".
// Loads no language tools.
import { tokenize } from "./tokenize";
import type { Exercise, Flag, ScoredRule } from "./types";

export type Band = "Warm-up" | "Working set" | "Heavy lift" | "PR";

export function bandFor(score: number): Band {
  if (score >= 90) return "PR";
  if (score >= 70) return "Heavy lift";
  if (score >= 40) return "Working set";
  return "Warm-up";
}

const FREE_IGNORES = 2;

// `ignored` holds the ignoreKeys the person tapped, in order. The first two
// are free; later ones still hide their flags but cost points as usual.
export function scoreText(text: string, exercise: Exercise, flags: Flag[], ignored: string[]) {
  const free = new Set(ignored.slice(0, FREE_IGNORES));
  const hidden = new Set(ignored);
  const ignoredFlags = flags.filter((f) => f.ignorable && hidden.has(f.ignoreKey)).length;

  const violations = new Map<string, number>();
  for (const f of flags) {
    if (f.level === "doubtful" || (f.ignorable && free.has(f.ignoreKey))) continue;
    violations.set(f.ruleId, (violations.get(f.ruleId) ?? 0) + (f.count ?? 1));
  }
  // Points each rule keeps. A tiny tolerance stops floating-point leftovers
  // (40 − 3 × 13.333…) from counting as points left.
  const pointsLeft = (rule: ScoredRule) => {
    const lost = (rule.perViolation ?? rule.weight / 3) * (violations.get(rule.id) ?? 0);
    return rule.weight - lost > 1e-9 ? rule.weight - lost : 0;
  };

  const all = [...exercise.rules, ...(exercise.bonus ?? [])];
  const sum = all.reduce((total, rule) => total + pointsLeft(rule), 0);
  const score = Math.min(100, Math.round(sum * gate(tokenize(text).length, exercise, pointsLeft)));
  return { score, band: bandFor(score), ignoredFlags };
}

// Scales the score so a draft far from its word-count target can't score high.
// Only a word-count rule among the main rules gates; a bonus one doesn't.
function gate(words: number, exercise: Exercise, pointsLeft: (rule: ScoredRule) => number): number {
  const rule = exercise.rules.find((r): r is Extract<ScoredRule, { type: "wordCount" }> => r.type === "wordCount");
  if (!rule) return words > 0 ? 1 : 0;
  if (rule.exact !== undefined) {
    // Missing and extra words already cost points; the gate starts only once
    // the rule's points are used up, and works in both directions.
    if (pointsLeft(rule) > 0) return 1;
    return Math.min(words, rule.exact) / Math.max(words, rule.exact);
  }
  const target = rule.min ?? rule.max;
  return target ? Math.min(1, words / target) : 1;
}
