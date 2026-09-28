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
    blurb: "Write 50 to 100 words without the letter shown.",
    rules: [
      { id: "letters", type: "bannedLetters", pool: "eaot", weight: 60 },
      { id: "length", type: "wordCount", min: 50, max: 100, weight: 40 },
    ],
  },
  {
    id: "stormy-night",
    title: "A Dark and Stormy Night",
    blurb: "Start with the opening line shown, then write 50 to 150 words of your own.",
    rules: [
      // Edward Bulwer-Lytton, Paul Clifford (1830); Charles Dickens, A Christmas
      // Carol (1843). Public domain. Wording to be checked against Project
      // Gutenberg in step 2.
      {
        id: "opening",
        type: "firstSentence",
        options: ["It was a dark and stormy night.", "Marley was dead: to begin with."],
        weight: 30,
      },
      { id: "length", type: "wordCount", min: 50, max: 150, afterFirstSentence: true, weight: 40 },
    ],
    bonus: [{ id: "words", type: "requiredWords", options: [["lighthouse", "key"], ["kite", "coin"]], weight: 30 }],
  },
  {
    id: "short-reps",
    title: "Short Reps",
    blurb: "Write 80 to 120 words where no sentence is longer than ten words.",
    rules: [
      { id: "length", type: "wordCount", min: 80, max: 120, weight: 50 },
      { id: "sentences", type: "sentenceLength", max: 10, weight: 50 },
    ],
  },
];
