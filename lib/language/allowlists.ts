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

// DRAFT for Sid's review. In word-list games only, the no-adjectives rule skips
// these: words used about as often as nouns, verbs, or adverbs as adjectives,
// so a bare list can't tell which is meant.
export const EITHER_WORDS: ReadonlySet<string> = new Set(
  [
    // colors and metals
    "red orange yellow green blue purple violet pink brown black white gray grey",
    "crimson scarlet amber ivory navy olive maroon indigo lavender turquoise",
    "silver gold copper bronze plastic crystal",
    // also verbs
    "open empty hollow clean clear close dry warm cool calm smooth slow free",
    "perfect complete correct separate direct secure equal double spare",
    "tame thin mean fancy alert idle welcome express",
    // also nouns
    "public private common general chief major minor standard square round",
    "level flat plain fair fine light dark right wrong past present future",
    "total average blank solid liquid native human individual initial original",
    "professional chemical criminal rival magic stable single prime principal",
    "kind patient content minute cold sweet blind sound",
    // participles also used as verbs
    "broken spoken woken frozen hidden fallen stolen chosen forgotten",
    // also adverbs
    "early late fast hard daily weekly monthly yearly",
  ].join(" ").split(" "),
);

const ORDINAL =/^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|\d+(st|nd|rd|th))$/;

// `word` is lowercase, with curly apostrophes straightened.
export function isAllowed(category: "adverb" | "adjective", word: string): boolean {
  return category === "adverb" ? ADVERB_ALLOWLIST.has(word) : ADJECTIVE_ALLOWLIST.has(word) || ORDINAL.test(word);
}
