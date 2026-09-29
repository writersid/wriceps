// Fill-in poem sets. Adding a set means adding an entry here.
// The 10 launch sets from CONTENT.md, easy to hard. Each blurb is the set's
// task in one plain sentence. Weights: main rules share 90 points, split
// equally; a bonus is worth 10.
// Template syntax (see lib/fill-in.ts): {label} is a blank, {label#name} names
// it, {=name} echoes its answer. Labels are free text. Line breaks are kept.
import type { Exercise } from "../lib/engine/types";

export type FillInSet = Exercise & {
  id: string;
  title: string;
  blurb: string;
  mode: "open" | "surprise";
  template: string;
};

export const fillInSets: FillInSet[] = [
  // Warm-ups
  {
    id: "morning-stretch",
    title: "Morning Stretch",
    blurb: "Fill four blanks to describe a very strange morning.",
    mode: "surprise",
    template:
      "This morning I woke up next to a {noun}.\n" +
      "It looked at me and started to {verb}.\n" +
      'I asked it, "{question}?"\n' +
      'It said, "{exclamation}," and went back to sleep.',
    rules: [{ id: "repeats", type: "noRepeats", weight: 90 }],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 60, weight: 10 }],
  },
  {
    id: "mystery-menu",
    title: "Mystery Menu",
    blurb: "Fill five blanks to write tonight's special at a strange restaurant.",
    mode: "surprise",
    template:
      "Tonight's special: {adjective} {food},\n" +
      "served on a bed of {plural noun}.\n" +
      "It comes with a side of {food}\n" +
      "and a glass of {drink}.",
    rules: [{ id: "letter", type: "sameFirstLetter", weight: 90 }],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 45, weight: 10 }],
  },
  {
    id: "weather-report",
    title: "Weather Report",
    blurb: "Fill five blanks to forecast your mood for the day.",
    mode: "open",
    template:
      "Today's forecast for my mood:\n" +
      "A {adjective} morning, with a chance of {plural noun} by noon.\n" +
      "Expect {noun} in the afternoon,\n" +
      "clearing to a {adjective} {noun} by evening.",
    rules: [{ id: "letter", type: "sameFirstLetter", random: true, weight: 90 }],
    bonus: [{ id: "repeats", type: "noRepeats", weight: 10 }],
  },

  // Working sets
  {
    id: "echo-canyon",
    title: "Echo Canyon",
    blurb: "Fill three blanks and hear what the canyon says back.",
    mode: "surprise",
    template:
      'I stood at the edge of the canyon and shouted, "{noun#call}!"\n' +
      'The canyon shouted back, "{=call}!"\n' +
      'So I whispered a secret: "{a secret#secret}."\n' +
      'Something in the dark whispered, "{=secret}."\n' +
      'Then it asked me, "{question}?"',
    rules: [{ id: "repeats", type: "noRepeats", weight: 90 }],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 60, weight: 10 }],
  },
  {
    id: "lost-and-found",
    title: "Lost and Found",
    blurb: "Fill six blanks to write a lost-pet poster for something that isn't a pet.",
    mode: "open",
    template:
      "LOST: one {object}.\n" +
      "Last seen near the {place}, {verb ending in -ing}.\n" +
      'Answers to the name "{name}."\n' +
      "Reward: a {noun} and my {noun}.",
    rules: [{ id: "syllables", type: "syllables", max: 2, weight: 90 }],
    bonus: [{ id: "letter", type: "sameFirstLetter", random: true, weight: 10 }],
  },
  {
    id: "dear-neighbor",
    title: "Dear Neighbor",
    blurb: "Fill six blanks to write a polite complaint about something absurd.",
    mode: "open",
    template:
      "Dear Neighbor,\n" +
      "I am writing about your {noun}.\n" +
      "Every night, it begins to {verb}.\n" +
      "Last Tuesday it ate my {noun}.\n" +
      "I have asked politely. I have left a {noun}.\n" +
      "If this continues, I will be forced to {verb}.\n" +
      "Yours, a {adjective} neighbor",
    rules: [{ id: "letters", type: "bannedLetters", pool: "aeionstr", weight: 90 }],
    bonus: [{ id: "repeats", type: "noRepeats", weight: 10 }],
  },
  {
    id: "tag-team",
    title: "Tag Team",
    blurb: "Fill eight blanks to tell an old myth, one line at a time.",
    mode: "surprise",
    template:
      "Long ago, a {noun} and a {noun} lived at the edge of the world.\n" +
      "One day they found a {noun} buried in the {place}.\n" +
      "They argued about who should {verb} it, and the {noun} won.\n" +
      "That is why, to this day, {plural noun} still {verb}.",
    rules: [{ id: "repeats", type: "noRepeats", weight: 90 }],
    bonus: [{ id: "letter", type: "sameFirstLetter", weight: 10 }],
  },

  // Heavy lifts
  {
    id: "alliteration-circuit",
    title: "Alliteration Circuit",
    blurb: "Fill eight blanks, each starting with the letter shown on screen.",
    mode: "open",
    template:
      "At the {place} gym, a {adjective} {noun}\n" +
      "lifted a {noun} over its head\n" +
      "while a {noun} counted reps\n" +
      'and shouted, "{exclamation}!"\n' +
      "After the workout, they all ate {food}\n" +
      "and went home to {verb}.",
    rules: [
      { id: "letter", type: "sameFirstLetter", random: true, weight: 45 },
      { id: "repeats", type: "noRepeats", weight: 45 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 120, weight: 10 }],
  },
  {
    id: "one-beat-poem",
    title: "One-Beat Poem",
    blurb: "Fill eight blanks using only one-syllable words.",
    mode: "open",
    template:
      "Night came like a {noun},\n" +
      "and the {noun} went {adjective}.\n" +
      "I held my {noun} to the {noun}\n" +
      "and heard it {verb}.\n" +
      'In the dark, a {noun} said, "{word}."\n' +
      "That was all.",
    rules: [
      { id: "syllables", type: "syllables", min: 1, max: 1, weight: 45 },
      { id: "repeats", type: "noRepeats", weight: 45 },
    ],
    bonus: [{ id: "letter", type: "sameFirstLetter", random: true, weight: 10 }],
  },
  {
    id: "max-out-fill-in",
    title: "Max Out: Fill-In",
    blurb: "Fill ten blanks with short words that all start with the letter shown on screen.",
    mode: "open",
    template:
      "Today I trained my {noun#muscle}.\n" +
      "First, ten reps of {plural noun}.\n" +
      "Then I {verb} a {noun} for a full minute\n" +
      'while my {noun} watched and shouted, "{exclamation}!"\n' +
      "By noon my {=muscle} was {adjective}.\n" +
      "I rested in a {place}, ate a {food},\n" +
      "and dreamed of {plural noun}.\n" +
      "Tomorrow: {=muscle} day again.",
    rules: [
      { id: "letter", type: "sameFirstLetter", random: true, weight: 30 },
      { id: "syllables", type: "syllables", max: 2, weight: 30 },
      { id: "repeats", type: "noRepeats", weight: 30 },
    ],
    bonus: [{ id: "clock", type: "timeLimit", seconds: 120, weight: 10 }],
  },
];
