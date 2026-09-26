// The heavy language tools: the syllable list with the `syllable` fallback, and
// compromise for adverbs and adjectives. Only this file imports them, so the
// app can load them when a constraint exercise opens, not on app load.
import nlp from "compromise/two";
import { syllable } from "syllable";
import exceptions from "../language/syllable-exceptions.json";
import { normalizeWord } from "./tokenize";
import type { Token } from "./types";

// The list stores each word's lowest and highest valid count, grouped by
// count ("2") or range ("2-3").
const syllableList = new Map<string, [number, number]>();
for (const [key, words] of Object.entries(exceptions)) {
  const [low, high = low] = key.split("-").map(Number);
  for (const w of words.split(" ")) syllableList.set(w, [low, high]);
}

// Lowest and highest valid syllable counts of a word or word part, or null for
// numbers, which are not checked.
export function syllableRange(word: string): [number, number] | null {
  if (/\p{N}/u.test(word)) return null;
  const w = normalizeWord(word).replaceAll("'", "");
  const guess = syllable(w);
  return syllableList.get(w) ?? [guess, guess];
}

// Lowest valid syllable count of one word part (no hyphens), or null for numbers.
export function countSyllables(part: string): number | null {
  return syllableRange(part)?.[0] ?? null;
}

export type TaggedWord = { token: Token; word: string; category: "adverb" | "adjective" };

// compromise sets these at runtime but leaves them out of its types.
type Term = { text: string; normal: string; tags?: Set<string>; implicit?: string; offset?: { start: number } };

// Words compromise tags as adverbs or adjectives, mapped to our tokens.
// `word` is compromise's own word, lowercase: "known" inside "well-known",
// "n't" for the hidden "not" in "don't".
export function tagWords(text: string, tokens: Token[]): TaggedWord[] {
  const doc = nlp(text);
  doc.compute("offset");
  const out: TaggedWord[] = [];
  for (const terms of doc.docs as Term[][]) {
    for (const t of terms) {
      const tags = t.tags ?? new Set();
      const category = tags.has("Adjective") ? "adjective" : tags.has("Adverb") || tags.has("Negative") ? "adverb" : null;
      const start = t.offset?.start;
      if (!category || start === undefined) continue;
      // The hidden "not" has no length and starts where its word ends.
      const token = tokens.findLast((k) => k.start <= start && start <= k.end);
      if (!token) continue;
      const word = t.text === "" && t.implicit === "not" ? "n't" : normalizeWord(t.normal).replace(/[^\p{L}\p{N}'-]/gu, "");
      out.push({ token, word, category });
    }
  }
  return out;
}
