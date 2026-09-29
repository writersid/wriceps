// How to play, one entry per mechanic, shown in a bottom sheet from the home
// screen and every set. DRAFT: all of this text is Claude's draft, for Sid to
// rewrite.
import type { Mechanic } from "../lib/notes";

export type { Mechanic };

export type HowToPlay = {
  name: string;
  intro: string; // one line, also shown on the home screen
  steps: string[];
};

export const howToPlay: Record<Mechanic, HowToPlay> = {
  constraint: {
    name: "Constraint",
    intro: "Write inside the rules. The rules are the weights.",
    steps: [
      "Read the rule chips under the title. That's the whole brief.",
      "Write in the box. Anything that breaks a rule gets a wavy underline and a note below.",
      "The checker can misread a word's type or syllables. On those flags, tap Ignore.",
      "Tap Log this set when you're happy with it.",
    ],
  },
  "fill-in": {
    name: "Fill-in",
    intro: "Fill the blanks. Every blank is a rep.",
    steps: [
      "Each blank asks for a kind of word: a noun, a verb, a question. The label is a prompt, not a test.",
      "Open sets show the poem as you fill it. Surprise sets hide it until the last blank.",
      "Echo blanks repeat an earlier answer on their own.",
      "With a spotter, you take turns on one phone, one line each, and see only the end of the last line. The poem is revealed at the end.",
    ],
  },
  blackout: {
    name: "Blackout",
    intro: "Find the poem hiding in someone else's page.",
    steps: [
      "Tap the words you want to keep. Tap again to drop one.",
      "Your poem is the kept words, in order, shown below the page.",
      "Tap Black out the rest to see the finished page. Back to picking takes you back.",
    ],
  },
};

// Scoring, the same for every mechanic.
export const scoringNotes: string[] = [
  "Every set scores 0 to 100. Warm-up under 40, Working set from 40, Heavy lift from 70, PR from 90.",
  "Your best score on a set is your PR. Beat it and you set a new one.",
  "Each rep gets 2 free ignores. After that, ignoring still hides a flag but costs points.",
  "Some sets have a bonus for finishing fast. The clock starts at your first keystroke or tap.",
];
