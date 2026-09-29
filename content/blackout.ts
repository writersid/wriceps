// Blackout poem sets. Adding a set means adding an entry here.
// The 6 launch sets from CONTENT.md, easy to hard. Each blurb is the set's
// task in one plain sentence. Weights: main rules share 90 points, split
// equally; a bonus is worth 10.
// Passages are copied word for word from Project Gutenberg's plain-text
// editions (prose line breaks joined, a poem's own lines kept; italics markers
// dropped), with the source recorded. Blackout sets use only word count, required words, banned letters,
// syllables, no repeats, and a time-limit bonus (content.test.ts checks this).
import type { Exercise } from "../lib/engine/types";

export type BlackoutSet = Exercise & {
  id: string;
  title: string;
  blurb: string;
  passage: string;
  // A poem keeps its line breaks ("\n" in the passage) on the page and the
  // card; prose passages are one paragraph.
  poem?: boolean;
  source: { title: string; author: string; year: number; url: string };
};

export const blackoutSets: BlackoutSet[] = [
  // Warm-ups
  {
    id: "best-of-times",
    title: "Best of Times",
    blurb: "Keep 8 to 15 words to make a poem from this famous opening.",
    // The opening sentence, up to the dash before "in short".
    passage:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of " +
      "foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, " +
      "it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had " +
      "everything before us, we had nothing before us, we were all going direct to Heaven, we were all " +
      "going direct the other way",
    source: { title: "A Tale of Two Cities", author: "Charles Dickens", year: 1859, url: "https://www.gutenberg.org/ebooks/98" },
    rules: [{ id: "length", type: "wordCount", min: 8, max: 15, weight: 90 }],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 90, weight: 10 }],
  },
  {
    id: "down-the-rabbit-hole",
    title: "Down the Rabbit Hole",
    blurb: "Keep 10 to 20 words to make a poem from Alice's fall.",
    passage:
      "The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so " +
      "suddenly that Alice had not a moment to think about stopping herself before she found herself " +
      "falling down a very deep well. Either the well was very deep, or she fell very slowly, for she had " +
      "plenty of time as she went down to look about her and to wonder what was going to happen next.",
    source: {
      title: "Alice's Adventures in Wonderland",
      author: "Lewis Carroll",
      year: 1865,
      url: "https://www.gutenberg.org/ebooks/11",
    },
    rules: [
      { id: "length", type: "wordCount", min: 10, max: 20, weight: 45 },
      { id: "repeats", type: "noRepeats", weight: 45 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 120, weight: 10 }],
  },

  // Working sets
  {
    id: "call-me",
    title: "Call Me",
    blurb: "Keep 10 to 20 words, including the word shown on screen.",
    passage:
      "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my " +
      "purse, and nothing particular to interest me on shore, I thought I would sail about a little and " +
      "see the watery part of the world. It is a way I have of driving off the spleen and regulating " +
      "the circulation.",
    source: { title: "Moby-Dick; or, The Whale", author: "Herman Melville", year: 1851, url: "https://www.gutenberg.org/ebooks/2701" },
    rules: [
      { id: "length", type: "wordCount", min: 10, max: 20, weight: 45 },
      // One word drawn from words in this passage.
      { id: "word", type: "requiredWords", options: [["world"], ["money"], ["purse"], ["shore"], ["sail"]], weight: 45 },
    ],
    bonus: [{ id: "repeats", type: "noRepeats", weight: 10 }],
  },
  {
    id: "spring-cleaning",
    title: "Spring Cleaning",
    blurb: "Keep 8 to 16 words, avoiding the letter shown on screen.",
    passage:
      "The Mole had been working very hard all the morning, spring-cleaning his little home. First with " +
      "brooms, then with dusters; then on ladders and steps and chairs, with a brush and a pail of " +
      "whitewash; till he had dust in his throat and eyes, and splashes of whitewash all over his black " +
      "fur, and an aching back and weary arms. Spring was moving in the air above and in the earth below " +
      "and around him, penetrating even his dark and lowly little house with its spirit of divine " +
      "discontent and longing.",
    source: { title: "The Wind in the Willows", author: "Kenneth Grahame", year: 1908, url: "https://www.gutenberg.org/ebooks/289" },
    rules: [
      { id: "length", type: "wordCount", min: 8, max: 16, weight: 45 },
      { id: "letters", type: "bannedLetters", pool: "aeionstr", weight: 45 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 120, weight: 10 }],
  },

  // Heavy lifts
  {
    id: "against-the-current",
    title: "Against the Current",
    blurb: "Keep exactly 12 words, none longer than two syllables.",
    // The novel's last lines, from mid-paragraph ("He did not know") to the end.
    passage:
      "He did not know that it was already behind him, somewhere back in that vast obscurity beyond the " +
      "city, where the dark fields of the republic rolled on under the night. Gatsby believed in the green " +
      "light, the orgiastic future that year by year recedes before us. It eluded us then, but that’s no " +
      "matter—tomorrow we will run faster, stretch out our arms further … And one fine morning— So we beat " +
      "on, boats against the current, borne back ceaselessly into the past.",
    source: { title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925, url: "https://www.gutenberg.org/ebooks/64317" },
    rules: [
      { id: "length", type: "wordCount", exact: 12, weight: 45 },
      { id: "syllables", type: "syllables", max: 2, weight: 45 },
    ],
    bonus: [{ id: "repeats", type: "noRepeats", weight: 10 }],
  },
  {
    id: "max-out-blackout",
    title: "Max Out: Blackout",
    blurb: "Keep exactly 10 words, each one syllable.",
    // Poem 35, whole, in Tagore's own English translation, one line per line of the poem.
    poem: true,
    passage:
      "Where the mind is without fear and the head is held high;\n" +
      "Where knowledge is free;\n" +
      "Where the world has not been broken up into fragments by narrow domestic walls;\n" +
      "Where words come out from the depth of truth;\n" +
      "Where tireless striving stretches its arms towards perfection;\n" +
      "Where the clear stream of reason has not lost its way into the dreary desert sand of dead habit;\n" +
      "Where the mind is led forward by thee into ever-widening thought and action—\n" +
      "Into that heaven of freedom, my Father, let my country awake.",
    source: { title: "Gitanjali", author: "Rabindranath Tagore", year: 1912, url: "https://www.gutenberg.org/ebooks/7164" },
    rules: [
      { id: "length", type: "wordCount", exact: 10, weight: 30 },
      { id: "syllables", type: "syllables", min: 1, max: 1, weight: 30 },
      { id: "repeats", type: "noRepeats", weight: 30 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 180, weight: 10 }],
  },
];
