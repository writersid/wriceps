// Runs every rule and bonus rule of an exercise on a draft. Imports the
// language tools, so the app should load this file only when a constraint
// exercise opens.
import { countSyllables, tagWords, type TaggedWord } from "./language";
import {
  checkBannedLetters,
  checkBannedWordType,
  checkFirstSentence,
  checkMaxSyllables,
  checkRequiredWords,
  checkWordCount,
} from "./rules";
import { tokenize } from "./tokenize";
import type { Exercise, Flag } from "./types";

export function checkText(text: string, exercise: Exercise): Flag[] {
  const words = tokenize(text);
  let tagged: TaggedWord[] | undefined; // tagged once, only if a rule needs it
  return [...exercise.rules, ...(exercise.bonus ?? [])].flatMap((rule) => {
    switch (rule.type) {
      case "wordCount":
        return checkWordCount(rule, words);
      case "maxSyllables":
        return checkMaxSyllables(rule, words, countSyllables);
      case "noAdverbs":
      case "noAdjectives":
        tagged ??= tagWords(text, words);
        return checkBannedWordType(rule, tagged);
      case "bannedLetters":
        return checkBannedLetters(rule, words);
      case "requiredWords":
        return checkRequiredWords(rule, words);
      case "firstSentence":
        return checkFirstSentence(rule, text);
    }
  });
}
