// Shapes shared by the rule engine and scoring. See SPEC.md "Rule details" and "Scoring".

export type Rule =
  | { type: "wordCount"; exact?: number; min?: number; max?: number }
  | { type: "syllables"; min?: number; max?: number }
  | { type: "noAdverbs" }
  | { type: "noAdjectives" }
  | { type: "bannedLetters"; letters: string }
  | { type: "requiredWords"; words: string[] }
  | { type: "firstSentence"; sentence: string }
  | { type: "noRepeats" }
  // Bonus rules only.
  | { type: "timeLimit"; seconds: number };

// A rule as an exercise lists it. perViolation overrides the default cost
// (a third of the weight).
export type ScoredRule = Rule & { id: string; weight: number; perViolation?: number };

// wordList: the draft is a list of words, not prose. The adjective rule then
// skips words that are as often nouns or verbs (yellow, open).
export type Exercise = { rules: ScoredRule[]; bonus?: ScoredRule[]; wordList?: boolean };

export type Flag = {
  ruleId: string;
  kind: string;
  word: string;
  // Character positions in the draft; absent when there is nothing to
  // underline, such as a missing required word.
  start?: number;
  end?: number;
  level: "sure" | "doubtful";
  // How many violations this flag stands for, such as "4 words short". Default 1.
  count?: number;
  // For a repeat: the earlier word it repeats.
  of?: string;
  // Only the language rules (no adverbs, no adjectives, max syllables) can be
  // wrong, so only their flags get an Ignore button.
  ignorable: boolean;
  // Same key for every flag on the same word from the same rule, so one
  // Ignore covers them all.
  ignoreKey: string;
};

export type Token = { text: string; start: number; end: number };
