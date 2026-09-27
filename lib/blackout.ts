// Blackout poems: the player keeps words from a passage and the rest are
// blacked out. The poem is the kept words in passage order, joined by single
// spaces, without the source's punctuation. See SPEC.md "Blackout details".
import { tokenize } from "./engine/tokenize";
import type { Token } from "./engine/types";

// The passage's tappable words, using the rule engine's idea of a word.
export function passageWords(passage: string): Token[] {
  return tokenize(passage);
}

// `kept` holds positions in `words`, in any order.
export function poemText(words: Token[], kept: number[]): string {
  return [...kept]
    .sort((a, b) => a - b)
    .map((i) => words[i].text)
    .join(" ");
}

// The passage word behind a character position in the poem, so a flag can
// underline it on the page. Null when the position is past the poem's end.
export function keptWordAt(words: Token[], kept: number[], start: number): number | null {
  let at = 0;
  for (const i of [...kept].sort((a, b) => a - b)) {
    const end = at + words[i].text.length;
    if (start < end) return i;
    at = end + 1; // the joining space
  }
  return null;
}

// Keeps a word, or drops it if it was kept. Returns positions in passage order.
export function toggleKept(kept: number[], index: number): number[] {
  const next = kept.includes(index) ? kept.filter((i) => i !== index) : [...kept, index];
  return next.sort((a, b) => a - b);
}
