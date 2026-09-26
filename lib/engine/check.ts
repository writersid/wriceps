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
  checkSyllables,
  checkTimeLimit,
  checkWordCount,
} from "./rules";
import { tokenize } from "./tokenize";
import type { Exercise, Flag } from "./types";

// `elapsedMs` is the time since the first keystroke, for time-limit bonuses;
// leave it out before the clock starts.
export function checkText(text: string, exercise: Exercise, elapsedMs?: number): Flag[] {
  const words = tokenize(text);
  let tagged: TaggedWord[] | undefined; // tagged once, only if a rule needs it
  return [...exercise.rules, ...(exercise.bonus ?? [])].flatMap((rule) => {
    switch (rule.type) {
      case "wordCount":
        return checkWordCount(rule, words);
      case "syllables":
        return checkSyllables(rule, words, syllableRange);
      case "noAdverbs":
      case "noAdjectives":
        tagged ??= tagWords(text, words);
        return checkBannedWordType(rule, tagged, exercise.wordList);
      case "bannedLetters":
        return checkBannedLetters(rule, words);
      case "requiredWords":
        return checkRequiredWords(rule, words);
      case "firstSentence":
        return checkFirstSentence(rule, text);
      case "noRepeats":
        return checkNoRepeats(rule, words, wordRoots(text, words));
      case "sameFirstLetter":
        return checkSameFirstLetter(rule, text);
      case "timeLimit":
        return checkTimeLimit(rule, elapsedMs);
    }
  });
}
