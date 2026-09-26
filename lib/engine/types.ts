// Shapes shared by the rule engine and scoring. See SPEC.md "Rule details" and "Scoring".

export type Rule =
  | { type: "wordCount"; exact?: number; min?: number; max?: number }
  | { type: "maxSyllables"; max: number }
  | { type: "noAdverbs" }
  | { type: "noAdjectives" }
  | { type: "bannedLetters"; letters: string }
  | { type: "requiredWords"; words: string[] }
  | { type: "firstSentence"; sentence: string };

// A rule as an exercise lists it. perViolation overrides the default cost
// (a third of the weight).
export type ScoredRule = Rule & { id: string; weight: number; perViolation?: number };

export type Exercise = { rules: ScoredRule[]; bonus?: ScoredRule[] };

export type Flag = {
  ruleId: string;
  kind: string;
  word: string;
  // Character positions in the draft; absent when there is nothing to
  // underline, such as a missing required word.
  start?: number;
  end?: number;
  level: "sure" | "doubtful";
  // Same key for every flag on the same word from the same rule, so one
  // Ignore covers them all.
  ignoreKey: string;
};

export type Token = { text: string; start: number; end: number };
