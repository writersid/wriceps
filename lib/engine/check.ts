// Runs every rule and bonus rule of an exercise on a draft. Imports the
// language tools, so the app should load this file only when a constraint
// exercise opens.
import { syllableRange, tagWords, wordRoots, type TaggedWord } from "./language";
import {
  checkBannedLetters,
  checkBannedWordType,
  checkFirstSentence,
  checkNoRepeats,
  checkRequiredWords,
  checkSameFirstLetter,
  checkSentenceLength,
  checkSyllables,
  checkTimeLimit,
  checkWordCount,
  openingEnd,
} from "./rules";
import { skippedWords } from "./score";
import { tokenize } from "./tokenize";
import type { Exercise, Flag } from "./types";

// `elapsedMs` is the time since the first keystroke, for time-limit bonuses;
// leave it out before the clock starts.
export function checkText(text: string, exercise: Exercise, elapsedMs?: number): Flag[] {
  const all = [...exercise.rules, ...(exercise.bonus ?? [])];
  // A required opening, typed as given, isn't the player's writing, so the
  // other rules skip it: it's blanked out (positions and line breaks kept).
  const opening = all.find((r) => r.type === "firstSentence");
  const end = opening?.type === "firstSentence" && opening.sentence ? openingEnd(text, opening.sentence) : null;
  const body = end ? text.slice(0, end).replace(/[^\n]/g, " ") + text.slice(end) : text;
  const words = tokenize(body);
  let tagged: TaggedWord[] | undefined; // tagged once, only if a rule needs it
  return all.flatMap((rule) => {
    switch (rule.type) {
      case "wordCount":
        // Counts the whole draft, unless it counts only the words after the opening.
        return checkWordCount(rule, tokenize(text).slice(skippedWords(exercise)));
      case "syllables":
        return checkSyllables(rule, words, syllableRange);
      case "noAdverbs":
      case "noAdjectives":
        tagged ??= tagWords(body, words);
        return checkBannedWordType(rule, tagged, exercise.wordList);
      case "bannedLetters":
        return checkBannedLetters(rule, words);
      case "requiredWords":
        return checkRequiredWords(rule, words);
      case "firstSentence":
        return checkFirstSentence(rule, text);
      case "noRepeats":
        return checkNoRepeats(rule, words, wordRoots(body, words));
      case "sentenceLength":
        return checkSentenceLength(rule, body, words);
      case "sameFirstLetter":
        return checkSameFirstLetter(rule, body);
      case "timeLimit":
        return checkTimeLimit(rule, elapsedMs);
    }
  });
}
