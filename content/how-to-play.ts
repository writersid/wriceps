// How to play, one entry per mechanic, shown in a bottom sheet from the home
// screen and every set. Written to COPY.md's voice guide.
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
      "Read the rule chips. They're the weights for this set.",
      "Write in the box. Words that break a rule get underlined.",
      "Every broken rule gets a card below with a tip.",
      "Tap Log this set when you're done.",
    ],
  },
  "fill-in": {
    name: "Fill-in",
    intro: "Fill the blanks. Every blank is a rep.",
    steps: [
      "Play solo, or with a spotter taking turns on one phone.",
      "Fill each blank with the kind of word it asks for.",
      "In surprise sets, the poem stays hidden until you reveal it.",
      "Fill every blank, then log the set.",
    ],
  },
  blackout: {
    name: "Blackout",
    intro: "Find the poem hiding in someone else's page.",
    steps: [
      "Tap the words you want to keep. Tap again to drop one.",
      "Your poem builds below the passage as you pick.",
      "Tap Black out the rest to see your page, then log it.",
    ],
  },
};

// Scoring, the same for every mechanic.
export const scoringNotes: string[] = [
  "Every set scores out of 100. Following the rules earns up to 90, and the bonus earns the last 10.",
  "Each broken rule costs points.",
  "Scores fall into four bands: Warm-up, Working set, Heavy lift, and Top set.",
  "If the checker flags a word by mistake, tap Ignore. You get two free ignores per set.",
];
