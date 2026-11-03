// An adjective used as a noun: "the common good", "do some good", "the blue
// of the sky". compromise tags these as adjectives, so the no-adjectives rule
// skips them. See SPEC.md "Rule details". Also imported by
// scripts/language/evaluate-pos.mjs, so this file must stay plain enough for
// Node to run directly: no imports.

// `sentence` holds each word's compromise tags, in order. Word `i` counts as a
// noun when it's tagged as an adjective, no noun or adjective follows it, and
// the word before it (skipping other adjectives) is a determiner, possessive,
// or preposition. Only the last adjective of a run is spared: in "the common
// good", "common" still describes "good".
export function usedAsNoun(sentence: readonly (readonly string[])[], i: number): boolean {
  if (!sentence[i]?.includes("Adjective")) return false;
  const next = sentence[i + 1];
  if (next && (next.includes("Noun") || next.includes("Adjective"))) return false;
  let j = i - 1;
  while (j >= 0 && sentence[j].includes("Adjective")) j--;
  const before = sentence[j];
  return !!before && ["Determiner", "Possessive", "Preposition"].some((tag) => before.includes(tag));
}
