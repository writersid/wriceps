// Words the no-adverbs and no-adjectives rules never flag. See SPEC.md
// "Rule details". Also imported by scripts/language/evaluate-pos.mjs, so this
// file must stay plain enough for Node to run directly: no imports.

export const ADVERB_ALLOWLIST: ReadonlySet<string> = new Set(
  [
    "not n't never",
    "then now already yet again ago once always often sometimes soon today tomorrow yesterday tonight",
    "here there home away back",
    "also too either neither else instead",
    "how when where why",
    "as more most less least",
    "up down out off in on over around through",
    "please",
  ].join(" ").split(" "),
);

export const ADJECTIVE_ALLOWLIST: ReadonlySet<string> = new Set(
  "last next previous following other another same own only all few fewer many much more most less least several such enough".split(" "),
);

const ORDINAL = /^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|\d+(st|nd|rd|th))$/;

// `word` is lowercase, with curly apostrophes straightened.
export function isAllowed(category: "adverb" | "adjective", word: string): boolean {
  return category === "adverb" ? ADVERB_ALLOWLIST.has(word) : ADJECTIVE_ALLOWLIST.has(word) || ORDINAL.test(word);
}
