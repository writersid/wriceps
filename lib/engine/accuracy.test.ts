// SPEC.md "Evaluation criteria", run through the engine itself.
// `npm run language:eval` prints the details behind these numbers.
import { describe, expect, test } from "vitest";
import syllables from "../../test-data/syllables.json";
import heldOut from "../../test-data/syllables-heldout.json";
import sentences from "../../test-data/pos-sentences.json";
import { isAllowed } from "../language/allowlists";
import { countSyllables, tagWords } from "./language";
import { checkBannedWordType } from "./rules";
import { normalizeWord, tokenize } from "./tokenize";

const pct = (a: number, b = 1) => `${((100 * a) / b).toFixed(1)}%`;

describe("syllable counting", () => {
  const accuracy = (set: { word: string; syllables: number[] }[]) =>
    set.filter((s) => s.syllables.includes(countSyllables(s.word)!)).length / set.length;

  test(`at least 95% on the 200-word list (got ${pct(accuracy(syllables))})`, () => {
    expect(accuracy(syllables)).toBeGreaterThanOrEqual(0.95);
  });

  test(`at least 90% on the 100-word held-out list (got ${pct(accuracy(heldOut))})`, () => {
    expect(accuracy(heldOut)).toBeGreaterThanOrEqual(0.9);
  });
});

describe("adverb and adjective flags on 100 labeled sentences", () => {
  // Literal reading: a flag is correct if the word is labeled as either an
  // adverb or an adjective. Labels on allowlisted words are left out, since
  // the rules never flag them.
  let flags = 0, correct = 0, gold = 0;
  for (const s of sentences) {
    const labels = [
      ...s.adjectives.filter((w) => !isAllowed("adjective", w)),
      ...s.adverbs.filter((w) => !isAllowed("adverb", w)),
    ];
    const tagged = tagWords(s.text, tokenize(s.text));
    const flagged = [
      ...checkBannedWordType({ type: "noAdverbs", id: "adv", weight: 1 }, tagged),
      ...checkBannedWordType({ type: "noAdjectives", id: "adj", weight: 1 }, tagged),
    ].map((f) => normalizeWord(f.word));
    gold += labels.length;
    flags += flagged.length;
    for (const w of flagged) {
      const i = labels.indexOf(w);
      if (i >= 0) {
        correct++;
        labels.splice(i, 1);
      }
    }
  }

  test(`precision at least 90% (got ${pct(correct, flags)})`, () => {
    expect(correct / flags).toBeGreaterThanOrEqual(0.9);
  });

  test(`recall at least 85% (got ${pct(correct, gold)})`, () => {
    expect(correct / gold).toBeGreaterThanOrEqual(0.85);
  });
});
