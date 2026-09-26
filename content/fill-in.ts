// Fill-in poem sets. Adding a set means adding an entry here.
// PLACEHOLDERS: these three sets, drafted by Claude, cover both modes, echo
// blanks, and a random letter. Sid's real 10 sets replace them.
// Template syntax (see lib/fill-in.ts): {label} is a blank, {label#name} names
// it, {=name} echoes its answer. Line breaks in the template are kept.
import type { Exercise } from "../lib/engine/types";

export type FillInSet = Exercise & {
  id: string;
  title: string;
  blurb: string;
  mode: "open" | "surprise";
  template: string;
};

export const fillInSets: FillInSet[] = [
  {
    id: "weather-report",
    title: "Weather Report",
    blurb: "Forecast the day. Every answer starts with the letter of the day.",
    mode: "open",
    template:
      "Today the sky is {adjective},\n" +
      "and the {noun} refuses to {verb}.\n" +
      "Expect scattered {plural noun} by noon.\n" +
      "Tomorrow's question: {question}",
    rules: [
      { id: "letter", type: "sameFirstLetter", random: true, weight: 60 },
      { id: "repeats", type: "noRepeats", weight: 40 },
    ],
  },
  {
    id: "mystery-menu",
    title: "Mystery Menu",
    blurb: "Order blind. You'll see what you ordered when it arrives.",
    mode: "surprise",
    template:
      "Tonight's special: {adjective} {noun},\n" +
      "served with a side of {plural noun}.\n" +
      "The chef will {verb} at your table.\n" +
      "Ask the waiter: {question}",
    rules: [
      { id: "letter", type: "sameFirstLetter", weight: 60 },
      { id: "repeats", type: "noRepeats", weight: 40 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 45, weight: 10 }],
  },
  {
    id: "echo-canyon",
    title: "Echo Canyon",
    blurb: "Shout into the canyon. It shouts back.",
    mode: "surprise",
    template:
      "I shouted {noun#shout} into the canyon.\n" +
      "The canyon answered: {=shout}, {=shout}.\n" +
      "Then it asked me: {question}\n" +
      "I said: {short phrase#reply}\n" +
      "The canyon said it back: {=reply}, {=reply}.",
    rules: [
      { id: "syllables", type: "syllables", max: 2, weight: 50 },
      { id: "repeats", type: "noRepeats", weight: 50 },
    ],
  },
];
