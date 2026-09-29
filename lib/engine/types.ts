// Shapes shared by the rule engine and scoring. See SPEC.md "Rule details" and "Scoring".

// Some rules take a fixed value or a list to draw one from each round (`pool`,
// `options`). lib/round.ts resolves the draw from the round's seed before
// anything checks or scores, so the checkers only ever see the fixed value.
export type Rule =
  // afterFirstSentence: skip as many words as the required opening has, so the
  // count is the player's own words.
  | { type: "wordCount"; exact?: number; min?: number; max?: number; afterFirstSentence?: boolean }
  | { type: "syllables"; min?: number; max?: number }
  | { type: "noAdverbs" }
  | { type: "noAdjectives" }
  // pool: letters to draw one banned letter from, such as "aoinst".
  | { type: "bannedLetters"; letters?: string; pool?: string }
  // options: word groups to draw one from.
  | { type: "requiredWords"; words?: string[]; options?: string[][] }
  // options: opening lines to draw one from. label / optionLabels: a short name
  // for the chip ("Austen"), since the line itself shows above the draft.
  | { type: "firstSentence"; sentence?: string; options?: string[]; label?: string; optionLabels?: string[] }
  | { type: "noRepeats" }
  // At most `max` words in every sentence.
  | { type: "sentenceLength"; max: number }
  // Every line (in a fill-in, every answer) starts with the same letter: `letter`,
  // or whatever the first line starts with. `random` means draw the letter from
  // the starting-letter pool (see lib/round.ts) before checking.
  | { type: "sameFirstLetter"; letter?: string; random?: boolean }
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
