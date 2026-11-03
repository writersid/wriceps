// The heavy language tools: the syllable list with the `syllable` fallback, and
// compromise for adverbs and adjectives. Only this file imports them, so the
// app can load them when a constraint exercise opens, not on app load.
import nlp from "compromise/two";
import { syllable } from "syllable";
import exceptions from "../language/syllable-exceptions.json";
import { usedAsNoun } from "../language/noun-use";
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
type Term = {
  text: string;
  normal: string;
  tags?: Set<string>;
  implicit?: string;
  offset?: { start: number };
  root?: string;
};
type VerbForms = Record<string, string>;
const world = nlp.world() as unknown as {
  model: object;
  methods: { two: { transform: { verb: { conjugate: (root: string, model: object) => VerbForms } } } };
};

// The keys each token can match for the no-repeats rule: its own spelling and
// compromise's root ("mice" → "mouse"). Verbs also get "v:" keys for every
// form of their root, so participles match ("gone" → "go"), but only against
// other verbs, so "left" as a direction doesn't match "leave".
export function wordRoots(text: string, tokens: Token[]): Set<string>[] {
  const roots = tokens.map((t) => new Set([normalizeWord(t.text)]));
  const doc = nlp(text);
  doc.compute(["offset", "root"]);
  for (const terms of doc.docs as Term[][]) {
    for (const t of terms) {
      const start = t.offset?.start;
      const i = start === undefined ? -1 : tokens.findLastIndex((k) => k.start <= start && start < k.end);
      if (i === -1) continue;
      const root = normalizeWord(t.root ?? t.normal);
      roots[i].add(root);
      if (!t.tags?.has("Verb")) continue;
      const forms = world.methods.two.transform.verb.conjugate(root, world.model);
      for (const [tense, form] of Object.entries(forms)) if (tense !== "FutureTense") roots[i].add(`v:${form}`);
      roots[i].add(`v:${root}`).add(`v:${normalizeWord(tokens[i].text)}`);
    }
  }
  return roots;
}

// Words compromise tags as adverbs or adjectives, mapped to our tokens.
// Adjectives used as nouns ("the common good") are left out.
// `word` is compromise's own word, lowercase: "known" inside "well-known",
// "n't" for the hidden "not" in "don't".
export function tagWords(text: string, tokens: Token[]): TaggedWord[] {
  const doc = nlp(text);
  doc.compute("offset");
  const out: TaggedWord[] = [];
  for (const terms of doc.docs as Term[][]) {
    const sentence = terms.map((t) => [...(t.tags ?? [])]);
    for (const [i, t] of terms.entries()) {
      const tags = t.tags ?? new Set();
      if (usedAsNoun(sentence, i)) continue;
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
