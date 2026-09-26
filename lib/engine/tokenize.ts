import type { Token } from "./types";

// A word is a run of letters or digits, joined by apostrophes ("don't"),
// single hyphens ("well-known"), or a point or comma between digits ("3.5",
// "1,000"). Dashes ("yes—no", "yes–no", "yes--no") split words.
const WORD = /[\p{L}\p{M}\p{N}]+(?:(?:['’-]|(?<=\p{N})[.,](?=\p{N}))[\p{L}\p{M}\p{N}]+)*/gu;

export function tokenize(text: string): Token[] {
  return [...text.matchAll(WORD)].map((m) => ({
    text: m[0],
    start: m.index,
    end: m.index + m[0].length,
  }));
}

// Lowercase with curly apostrophes straightened, for comparing words.
export function normalizeWord(word: string): string {
  return word.toLowerCase().replaceAll("’", "'");
}
