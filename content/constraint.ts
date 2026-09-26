// Constraint-writing sets. Adding a set means adding an entry here.
// PLACEHOLDERS: these four sample sets, drafted by Claude, exist to exercise all
// seven rules. Sid's real 14 sets replace them.
import type { Exercise } from "../lib/engine/types";

export type ConstraintSet = Exercise & { id: string; title: string; blurb: string };

export const constraintSets: ConstraintSet[] = [
  {
    id: "two-syllable-sprint",
    title: "The Two-Syllable Sprint",
    blurb: "List 20 different two-syllable words. No adjectives. Beat 60 seconds for a bonus.",
    wordList: true,
    rules: [
      { id: "length", type: "wordCount", exact: 20, weight: 30 },
      { id: "syllables", type: "syllables", min: 2, max: 2, weight: 25 },
      { id: "adjectives", type: "noAdjectives", weight: 20 },
      { id: "repeats", type: "noRepeats", weight: 15 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 60, weight: 10 }],
  },
  {
    id: "six-word-story",
    title: "Six-Word Story",
    blurb: "A whole story in six words. Not five. Not seven.",
    rules: [{ id: "length", type: "wordCount", exact: 6, weight: 100 }],
  },
  {
    id: "missing-e",
    title: "The Missing E",
    blurb: "Write 50 to 100 words without the most common letter in English.",
    rules: [
      { id: "letters", type: "bannedLetters", letters: "e", weight: 60 },
      { id: "length", type: "wordCount", min: 50, max: 100, weight: 40 },
    ],
  },
  {
    id: "stormy-night",
    title: "A Dark and Stormy Night",
    blurb: "The most mocked opening line in English. Make it work anyway.",
    rules: [
      // Edward Bulwer-Lytton, Paul Clifford (1830). Public domain.
      { id: "opening", type: "firstSentence", sentence: "It was a dark and stormy night.", weight: 30 },
      { id: "length", type: "wordCount", min: 50, max: 150, weight: 40 },
    ],
    bonus: [{ id: "words", type: "requiredWords", words: ["lighthouse", "key"], weight: 30 }],
  },
];
