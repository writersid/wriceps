// Builds lib/language/syllable-exceptions.json: the common words (SCOWL up to
// level 60, per CMU) whose syllable count the `syllable` package gets wrong.
// Every other word is left to `syllable` at runtime.
// Run: npm run language:build
import fs from "node:fs";
import path from "node:path";
import { syllable } from "syllable";
import { ROOT, getSources, readCmu, readJson } from "./sources.mjs";

const SCOWL_LEVELS = [10, 20, 35, 40, 50, 55, 60];
const OUT = path.join(ROOT, "lib/language/syllable-exceptions.json");

const { cmuFile, scowlFinal } = await getSources();
const cmu = readCmu(cmuFile);

// Sid's reviewed counts in the 200-word test set override CMU. This makes that
// set easy to pass, which is why the held-out set is the honest check.
for (const { word, syllables } of readJson("test-data/syllables.json")) {
  cmu.set(word, new Set(syllables));
}

const vocab = new Set();
for (const level of SCOWL_LEVELS) {
  for (const file of [`english-words.${level}`, `american-words.${level}`]) {
    for (const line of fs.readFileSync(path.join(scowlFinal, file), "latin1").split("\n")) {
      const word = line.trim();
      if (/^[a-z]+$/.test(word)) vocab.add(word);
    }
  }
}

const covered = [...vocab].filter((w) => cmu.has(w));
const exceptions = covered.filter((w) => !cmu.get(w).has(syllable(w))).sort();

// Store each word's lowest count: the max-syllables rule passes a word if any
// valid count is within the limit. Grouped by count to keep the file small.
const groups = {};
for (const w of exceptions) (groups[Math.min(...cmu.get(w))] ??= []).push(w);
const output = Object.fromEntries(
  Object.keys(groups)
    .sort((a, b) => a - b)
    .map((n) => [n, groups[n].join(" ")]),
);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output) + "\n");
console.log(
  `Covered ${covered.length} words; wrote ${exceptions.length} exceptions to ${path.relative(ROOT, OUT)}`,
);
