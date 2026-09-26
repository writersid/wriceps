// Accuracy of the no-repeats and no-adjectives rules on the word-list test
// sets reviewed by Sid. Prints a report (npm run language:eval shows it) and
// fails below the SPEC thresholds.
import { describe, expect, test } from "vitest";
import adjectiveLists from "../../test-data/adjective-lists.json";
import repeatLists from "../../test-data/repeat-lists.json";
import { checkText } from "./check";
import { wordRoots } from "./language";
import { checkNoRepeats } from "./rules";
import { normalizeWord, tokenize } from "./tokenize";

const MIN_PRECISION = 0.9;
const MIN_RECALL = 0.85;

type Score = { tp: number; fp: number; fn: number; misses: string[]; extras: string[] };
const blank = (): Score => ({ tp: 0, fp: 0, fn: 0, misses: [], extras: [] });
const precision = (s: Score) => s.tp / (s.tp + s.fp);
const recall = (s: Score) => s.tp / (s.tp + s.fn);

function report(name: string, s: Score, extra = "") {
  const pct = (n: number) => `${(100 * n).toFixed(1)}%`;
  const lines = [`${name}: precision ${pct(precision(s))} (${s.tp}/${s.tp + s.fp}), recall ${pct(recall(s))} (${s.tp}/${s.tp + s.fn})${extra}`];
  if (s.misses.length) lines.push(`  missed: ${s.misses.join(", ")}`);
  if (s.extras.length) lines.push(`  false flags: ${s.extras.join(", ")}`);
  console.log(lines.join("\n"));
}

function tally(s: Score, id: number, found: string[], want: string[]) {
  for (const f of found) if (want.includes(f)) s.tp++; else { s.fp++; s.extras.push(`#${id} ${f}`); }
  for (const w of want) if (!found.includes(w)) { s.fn++; s.misses.push(`#${id} ${w}`); }
}

describe("no repeated words", () => {
  for (const group of ["lists", "sentences"] as const) {
    test(`${group} meet the accuracy targets`, () => {
      const s = blank();
      for (const item of repeatLists[group]) {
        const words = tokenize(item.text);
        const flags = checkNoRepeats({ type: "noRepeats", id: "nr", weight: 1 }, words, wordRoots(item.text, words));
        const kind = (k: string) => (k === "repeat" ? "identical" : "form");
        tally(s, item.id, flags.map((f) => `${f.word}|${kind(f.kind)}`), item.repeats.map((r) => `${r.word}|${r.kind}`));
      }
      report(`REPEATS ${group}`, s);
      expect(precision(s)).toBeGreaterThanOrEqual(MIN_PRECISION);
      expect(recall(s)).toBeGreaterThanOrEqual(MIN_RECALL);
    });
  }
});

describe("no adjectives in word-list games", () => {
  test("meets the accuracy targets, skipping words that are as often nouns or verbs", () => {
    const exercise = { wordList: true, rules: [{ id: "adj", type: "noAdjectives" as const, weight: 1 }] };
    const s = blank();
    let eitherFlagged = 0;
    let eitherTotal = 0;
    for (const item of adjectiveLists.lists) {
      const flagged = [...new Set(checkText(item.text, exercise).map((f) => normalizeWord(f.word)))];
      tally(s, item.id, flagged, item.adjectives);
      eitherTotal += item.either.length;
      eitherFlagged += item.either.filter((w) => flagged.includes(w)).length;
    }
    report("ADJECTIVES word lists", s, `, "either" words flagged ${eitherFlagged}/${eitherTotal}`);
    expect(precision(s)).toBeGreaterThanOrEqual(MIN_PRECISION);
    expect(recall(s)).toBeGreaterThanOrEqual(MIN_RECALL);
  });
});
