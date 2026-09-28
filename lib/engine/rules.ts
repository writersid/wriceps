import { EITHER_WORDS, isAllowed } from "../language/allowlists";
import type { TaggedWord } from "./language";
import { normalizeWord } from "./tokenize";
import type { Flag, Rule, ScoredRule, Token } from "./types";

type RuleOf<T extends Rule["type"]> = Extract<ScoredRule, { type: T }>;

// No-repeats flags set their own: only root-form matches can be ignored.
const IGNORABLE: ReadonlySet<Rule["type"]> = new Set(["noAdverbs", "noAdjectives", "syllables"]);

function flag(rule: ScoredRule, kind: string, word: string, pos?: Token): Flag {
  return {
    ruleId: rule.id,
    kind,
    word,
    start: pos?.start,
    end: pos?.end,
    level: "sure",
    ignorable: IGNORABLE.has(rule.type),
    ignoreKey: `${rule.id}:${normalizeWord(word)}`,
  };
}

// Each word past the exact or maximum limit is one violation. Under an exact
// count, each missing word is one violation, carried by a single flag with no
// position. Under a minimum is not a violation; the score's gate handles that.
export function checkWordCount(rule: RuleOf<"wordCount">, words: Token[]): Flag[] {
  if (rule.exact !== undefined && words.length < rule.exact) {
    return [{ ...flag(rule, "tooFewWords", ""), count: rule.exact - words.length }];
  }
  const limit = rule.exact ?? rule.max;
  if (limit === undefined) return [];
  return words.slice(limit).map((w) => flag(rule, "tooManyWords", w.text, w));
}

// Lowercase with accents removed, so "É" and "é" both contain "e".
const plainLetters = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// One flag per word that contains any banned letter.
export function checkBannedLetters(rule: RuleOf<"bannedLetters">, words: Token[]): Flag[] {
  const banned = [...plainLetters(rule.letters ?? "")];
  return words
    .filter((w) => banned.some((letter) => plainLetters(w.text).includes(letter)))
    .map((w) => flag(rule, "bannedLetter", w.text, w));
}

// One flag per required word missing from the draft. Matches whole words only,
// so "rivers" does not satisfy "river".
export function checkRequiredWords(rule: RuleOf<"requiredWords">, words: Token[]): Flag[] {
  const present = new Set(words.map((w) => normalizeWord(w.text)));
  return (rule.words ?? [])
    .filter((word) => !present.has(normalizeWord(word)))
    .map((word) => flag(rule, "missingWord", word));
}

// One flag per word outside the limits. `range` gives a word part's lowest and
// highest valid counts, so a word passes if any valid count fits. The maximum
// checks each hyphenated part; the minimum checks the whole word; "exactly"
// (min = max) also checks the maximum on the whole word. Numbers aren't
// checked. Takes the counter as an argument so this file doesn't load the
// syllable list.
export function checkSyllables(
  rule: RuleOf<"syllables">,
  words: Token[],
  range: (part: string) => [number, number] | null,
): Flag[] {
  return words.flatMap((w) => {
    const parts = w.text.split("-").map(range);
    const known = parts.filter((p) => p !== null);
    const lowest = known.reduce((sum, p) => sum + p[0], 0);
    const highest = known.reduce((sum, p) => sum + p[1], 0);
    const { min, max } = rule;
    if (max !== undefined && (known.some((p) => p[0] > max) || (min === max && lowest > max))) {
      return [flag(rule, "tooManySyllables", w.text, w)];
    }
    if (min !== undefined && known.length === parts.length && highest < min) {
      return [flag(rule, "tooFewSyllables", w.text, w)];
    }
    return [];
  });
}

// One flag per word tagged as the banned category and not on its allowlist.
// In word-list games, adjectives that are as often nouns or verbs are skipped.
// Takes compromise's tags as an argument so this file doesn't load compromise.
export function checkBannedWordType(
  rule: RuleOf<"noAdverbs" | "noAdjectives">,
  tagged: TaggedWord[],
  wordList = false,
): Flag[] {
  const category = rule.type === "noAdverbs" ? "adverb" : "adjective";
  const flagged = new Set<Token>();
  for (const t of tagged) {
    if (t.category !== category || isAllowed(category, t.word)) continue;
    if (wordList && category === "adjective" && EITHER_WORDS.has(t.word)) continue;
    flagged.add(t.token);
  }
  return [...flagged].map((token) => flag(rule, category, token.text, token));
}

// One flag per word used before. The same word ignoring case ("the", "The") is
// exact, so it can't be ignored. Another form of the same word, matched through
// `roots` (from compromise), is the checker's guess, so it can be.
export function checkNoRepeats(rule: RuleOf<"noRepeats">, words: Token[], roots: Set<string>[]): Flag[] {
  return words.flatMap((w, i): Flag[] => {
    const earlier = words.slice(0, i);
    const same = earlier.find((e) => normalizeWord(e.text) === normalizeWord(w.text));
    if (same) return [{ ...flag(rule, "repeat", w.text, w), ignorable: false, of: same.text }];
    const form = roots.slice(0, i).findIndex((r) => [...roots[i]].some((x) => r.has(x)));
    if (form === -1) return [];
    return [{ ...flag(rule, "repeatForm", w.text, w), ignorable: true, of: words[form].text }];
  });
}

// One flag per line whose first letter isn't the rule's letter, or, with no
// letter set, the letter the first line starts with. The flag underlines the
// line's first word and carries the expected letter in `of`. Ignores case and
// accents; lines with no letters are skipped.
export function checkSameFirstLetter(rule: RuleOf<"sameFirstLetter">, text: string): Flag[] {
  let expected = rule.letter ? plainLetters(rule.letter) : undefined;
  const flags: Flag[] = [];
  let at = 0;
  for (const line of text.split("\n")) {
    const word = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/u.exec(line);
    if (word && /\p{L}/u.test(word[0][0])) {
      const first = plainLetters(word[0][0]);
      expected ??= first;
      if (first !== expected) {
        const pos = { text: word[0], start: at + word.index, end: at + word.index + word[0].length };
        flags.push({ ...flag(rule, "wrongFirstLetter", word[0], pos), of: expected });
      }
    }
    at += line.length + 1;
  }
  return flags;
}

// A sentence ends at . ! ? or … (runs like "?!" and "..." too, with any closing
// quotes or brackets) followed by a space or the end of the text, or at a line
// break. Semicolons, colons, and dashes don't end one. Abbreviations ("Mr.")
// and dialogue ("Stop!" she said) split early, which only makes sentences look
// shorter, so the rule can miss a long one but never flags a short one.
const SENTENCE_END = /[.!?…]+["'”’)\]]*(?=\s|$)|\n/g;

// One flag per sentence over the limit. `word` holds the whole sentence (for
// the note card); the underline covers only the words past the limit, where
// to cut. Exact, so never ignorable.
export function checkSentenceLength(rule: RuleOf<"sentenceLength">, text: string, words: Token[]): Flag[] {
  const ends = [...text.matchAll(SENTENCE_END)].map((m) => m.index + m[0].length);
  const flags: Flag[] = [];
  let i = 0;
  for (const end of [...ends, Infinity]) {
    const sentence: Token[] = [];
    while (i < words.length && words[i].start < end) sentence.push(words[i++]);
    if (sentence.length <= rule.max) continue;
    const whole = text.slice(sentence[0].start, sentence.at(-1)!.end);
    const over = { text: whole, start: sentence[rule.max].start, end: sentence.at(-1)!.end };
    flags.push(flag(rule, "longSentence", whole, over));
  }
  return flags;
}

// One flag, with nothing to underline, once the clock passes the limit.
// `elapsedMs` is undefined until the first keystroke.
export function checkTimeLimit(rule: RuleOf<"timeLimit">, elapsedMs: number | undefined): Flag[] {
  return elapsedMs !== undefined && elapsedMs > rule.seconds * 1000 ? [flag(rule, "overTime", "")] : [];
}

// Ignores case, curly versus straight quotes, and extra spaces.
const looseSentence = (s: string) =>
  s.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();

// The draft must begin with the required sentence, not run on into a longer
// word ("The end" is not satisfied by "The ending"). The flag underlines the
// draft's own first sentence.
export function checkFirstSentence(rule: RuleOf<"firstSentence">, text: string): Flag[] {
  if (rule.sentence === undefined) return [];
  const draft = looseSentence(text);
  const required = looseSentence(rule.sentence);
  if (draft.startsWith(required) && !/[\p{L}\p{N}]/u.test(draft.charAt(required.length))) return [];
  const first = /\S[^.!?]*[.!?]*["'”’]?/.exec(text);
  const pos = first ? { text: first[0], start: first.index, end: first.index + first[0].length } : undefined;
  return [flag(rule, "firstSentence", "", pos)];
}
