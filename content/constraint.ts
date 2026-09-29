// Constraint-writing sets. Adding a set means adding an entry here.
// The 15 launch sets from CONTENT.md, easy to hard. Each blurb is the set's
// task in one plain sentence. Weights: main rules share 90 points, split
// equally (any rounding goes to the word count); a bonus is worth 10.
import type { Exercise } from "../lib/engine/types";

export type ConstraintSet = Exercise & { id: string; title: string; blurb: string };

// Opening lines for Pick Up the Bar, copied from Project Gutenberg's plain-text
// editions, with sources for the credits page. `label` is the chip's short name
// ("Opening: Austen"); the line itself shows above the draft.
export const openingLines = [
  {
    label: "Austen",
    line: "It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife.",
    source: { title: "Pride and Prejudice", author: "Jane Austen", year: 1813, url: "https://www.gutenberg.org/ebooks/1342" },
  },
  {
    // The book prints "MARLEY" in capitals as a chapter opening.
    label: "Dickens",
    line: "Marley was dead: to begin with.",
    source: { title: "A Christmas Carol", author: "Charles Dickens", year: 1843, url: "https://www.gutenberg.org/ebooks/46" },
  },
  {
    label: "Barrie",
    line: "All children, except one, grow up.",
    source: { title: "Peter Pan", author: "J. M. Barrie", year: 1911, url: "https://www.gutenberg.org/ebooks/16" },
  },
  {
    label: "Tolstoy",
    line: "Happy families are all alike; every unhappy family is unhappy in its own way.",
    source: {
      title: "Anna Karenina",
      author: "Leo Tolstoy, translated by Constance Garnett",
      year: 1901,
      url: "https://www.gutenberg.org/ebooks/1399",
    },
  },
  {
    // The book's opening words; its sentence runs on after a semicolon.
    label: "Bulwer-Lytton",
    line: "It was a dark and stormy night.",
    source: { title: "Paul Clifford", author: "Edward Bulwer-Lytton", year: 1830, url: "https://www.gutenberg.org/ebooks/7735" },
  },
];

export const constraintSets: ConstraintSet[] = [
  // Warm-ups
  {
    id: "six-word-warm-up",
    title: "Six-Word Warm-Up",
    blurb: "Tell a whole story in exactly six words.",
    rules: [{ id: "length", type: "wordCount", exact: 6, weight: 90 }],
    bonus: [{ id: "repeats", type: "noRepeats", weight: 10 }],
  },
  {
    id: "two-syllable-sprint",
    title: "Two-Syllable Sprint",
    blurb: "List 20 different two-syllable words, none of them adjectives.",
    wordList: true,
    rules: [
      { id: "length", type: "wordCount", exact: 20, weight: 24 },
      { id: "syllables", type: "syllables", min: 2, max: 2, weight: 22 },
      { id: "adjectives", type: "noAdjectives", weight: 22 },
      { id: "repeats", type: "noRepeats", weight: 22 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 60, weight: 10 }],
  },
  {
    id: "light-bench",
    title: "Light Bench",
    blurb: "List 15 different words without the letter shown on screen.",
    wordList: true,
    rules: [
      { id: "length", type: "wordCount", exact: 15, weight: 30 },
      { id: "letters", type: "bannedLetters", pool: "aoinst", weight: 30 },
      { id: "repeats", type: "noRepeats", weight: 30 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 45, weight: 10 }],
  },
  {
    id: "twenty-five-reps",
    title: "Twenty-Five Reps",
    blurb: "Tell a story in exactly 25 words.",
    rules: [{ id: "length", type: "wordCount", exact: 25, weight: 90 }],
    bonus: [{ id: "adverbs", type: "noAdverbs", weight: 10 }],
  },

  // Working sets
  {
    id: "fifty-reps",
    title: "Fifty Reps",
    blurb: "Tell a story in exactly 50 words.",
    rules: [{ id: "length", type: "wordCount", exact: 50, weight: 90 }],
    bonus: [{ id: "syllables", type: "syllables", max: 2, weight: 10 }],
  },
  {
    id: "light-weights",
    title: "Light Weights",
    blurb: "Describe your morning in 60 to 80 words, using no word longer than two syllables.",
    rules: [
      { id: "length", type: "wordCount", min: 60, max: 80, weight: 45 },
      { id: "syllables", type: "syllables", max: 2, weight: 45 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 300, weight: 10 }],
  },
  {
    id: "short-reps",
    title: "Short Reps",
    blurb: "Write 80 to 120 words where no sentence is longer than ten words.",
    rules: [
      { id: "length", type: "wordCount", min: 80, max: 120, weight: 45 },
      { id: "sentences", type: "sentenceLength", max: 10, weight: 45 },
    ],
    bonus: [{ id: "adverbs", type: "noAdverbs", weight: 10 }],
  },
  {
    id: "no-crutches",
    title: "No Crutches",
    blurb: "Describe a meal in 80 to 120 words without a single adverb.",
    rules: [
      { id: "length", type: "wordCount", min: 80, max: 120, weight: 45 },
      { id: "adverbs", type: "noAdverbs", weight: 45 },
    ],
    bonus: [{ id: "adjectives", type: "noAdjectives", weight: 10 }],
  },
  {
    id: "raw-lift",
    title: "Raw Lift",
    blurb: "Describe a person in 80 to 120 words without a single adjective.",
    rules: [
      { id: "length", type: "wordCount", min: 80, max: 120, weight: 45 },
      { id: "adjectives", type: "noAdjectives", weight: 45 },
    ],
    bonus: [{ id: "adverbs", type: "noAdverbs", weight: 10 }],
  },
  {
    id: "heavy-bench",
    title: "Heavy Bench",
    blurb: "Write at least 50 words without the letter shown on screen.",
    rules: [
      { id: "length", type: "wordCount", min: 50, weight: 45 },
      { id: "letters", type: "bannedLetters", pool: "eaot", weight: 45 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 300, weight: 10 }],
  },
  {
    id: "three-point-circuit",
    title: "Three-Point Circuit",
    blurb: "Write a scene of 100 to 150 words that uses the three words shown on screen.",
    rules: [
      { id: "length", type: "wordCount", min: 100, max: 150, weight: 45 },
      {
        id: "words",
        type: "requiredWords",
        options: [
          ["key", "rain", "letter"],
          ["ladder", "orange", "silence"],
          ["clock", "river", "glove"],
          ["mirror", "bread", "storm"],
          ["ticket", "owl", "candle"],
          ["bridge", "salt", "phone"],
          ["kite", "coin", "fever"],
          ["lamp", "train", "secret"],
          ["boots", "moon", "apology"],
          ["window", "sugar", "map"],
        ],
        weight: 45,
      },
    ],
    bonus: [{ id: "adverbs", type: "noAdverbs", weight: 10 }],
  },

  // Heavy lifts
  {
    id: "pick-up-the-bar",
    title: "Pick Up the Bar",
    blurb: "Begin with the classic opening line shown on screen and write at least 100 more words.",
    rules: [
      {
        id: "opening",
        type: "firstSentence",
        options: openingLines.map((o) => o.line),
        optionLabels: openingLines.map((o) => o.label),
        weight: 45,
      },
      { id: "length", type: "wordCount", min: 100, afterFirstSentence: true, weight: 45 },
    ],
    bonus: [{ id: "adverbs", type: "noAdverbs", weight: 10 }],
  },
  {
    id: "hundred-rep-set",
    title: "Hundred-Rep Set",
    blurb: "Tell a story in exactly 100 words, with no adverbs.",
    rules: [
      { id: "length", type: "wordCount", exact: 100, weight: 45 },
      { id: "adverbs", type: "noAdverbs", weight: 45 },
    ],
    bonus: [{ id: "syllables", type: "syllables", max: 2, weight: 10 }],
  },
  {
    id: "full-body",
    title: "Full Body",
    blurb: "Write 150 to 250 words with no adverbs, no adjectives, and no word over two syllables.",
    rules: [
      { id: "length", type: "wordCount", min: 150, max: 250, weight: 24 },
      { id: "adverbs", type: "noAdverbs", weight: 22 },
      { id: "adjectives", type: "noAdjectives", weight: 22 },
      { id: "syllables", type: "syllables", max: 2, weight: 22 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 900, weight: 10 }],
  },
  {
    id: "max-out",
    title: "Max Out",
    blurb: "Tell a story in exactly 100 words with no adverbs, no adjectives, and no word over two syllables.",
    rules: [
      { id: "length", type: "wordCount", exact: 100, weight: 24 },
      { id: "adverbs", type: "noAdverbs", weight: 22 },
      { id: "adjectives", type: "noAdjectives", weight: 22 },
      { id: "syllables", type: "syllables", max: 2, weight: 22 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 600, weight: 10 }],
  },
];
