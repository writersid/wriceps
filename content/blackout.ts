// Blackout poem sets. Adding a set means adding an entry here.
// PLACEHOLDERS: these three sets, drafted by Claude, cover the rules blackout
// allows. Sid's real 6 sets replace them.
// Passages are copied word for word from Project Gutenberg's plain-text
// editions (line breaks joined), with the source recorded. Blackout sets use
// only word count, required words, banned letters, syllables, no repeats, and
// a time-limit bonus (content.test.ts checks this).
import type { Exercise } from "../lib/engine/types";

export type BlackoutSet = Exercise & {
  id: string;
  title: string;
  blurb: string;
  passage: string;
  source: { title: string; author: string; year: number; url: string };
};

export const blackoutSets: BlackoutSet[] = [
  {
    id: "best-of-times",
    title: "Best of Times",
    blurb: "Dickens said it all twice. Say it once.",
    passage:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of " +
      "foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, " +
      "it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had " +
      "everything before us, we had nothing before us, we were all going direct to Heaven, we were all " +
      "going direct the other way",
    source: {
      title: "A Tale of Two Cities",
      author: "Charles Dickens",
      year: 1859,
      url: "https://www.gutenberg.org/ebooks/98",
    },
    rules: [
      { id: "length", type: "wordCount", min: 8, max: 15, weight: 40 },
      { id: "repeats", type: "noRepeats", weight: 60 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 90, weight: 10 }],
  },
  {
    id: "call-me",
    title: "Call Me",
    blurb: "Melville took the long way. Take the short one, and keep the world in it.",
    passage:
      "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my " +
      "purse, and nothing particular to interest me on shore, I thought I would sail about a little and " +
      "see the watery part of the world. It is a way I have of driving off the spleen and regulating " +
      "the circulation.",
    source: {
      title: "Moby-Dick; or, The Whale",
      author: "Herman Melville",
      year: 1851,
      url: "https://www.gutenberg.org/ebooks/2701",
    },
    rules: [
      { id: "length", type: "wordCount", min: 6, max: 12, weight: 40 },
      { id: "world", type: "requiredWords", words: ["world"], weight: 30 },
      { id: "syllables", type: "syllables", max: 2, weight: 30 },
    ],
  },
  {
    id: "spring-cleaning",
    title: "Spring Cleaning",
    blurb: "Keep 8 to 16 words, including spring, avoiding the letter shown.",
    passage:
      "The Mole had been working very hard all the morning, spring-cleaning his little home. First with " +
      "brooms, then with dusters; then on ladders and steps and chairs, with a brush and a pail of " +
      "whitewash; till he had dust in his throat and eyes, and splashes of whitewash all over his black " +
      "fur, and an aching back and weary arms. Spring was moving in the air above and in the earth below " +
      "and around him, penetrating even his dark and lowly little house with its spirit of divine " +
      "discontent and longing.",
    source: {
      title: "The Wind in the Willows",
      author: "Kenneth Grahame",
      year: 1908,
      url: "https://www.gutenberg.org/ebooks/289",
    },
    rules: [
      { id: "length", type: "wordCount", min: 8, max: 16, weight: 40 },
      { id: "spring", type: "requiredWords", words: ["spring"], weight: 20 },
      // Only letters "spring" doesn't contain, so the required word stays usable.
      { id: "letters", type: "bannedLetters", pool: "aeo", weight: 40 },
    ],
  },
];
