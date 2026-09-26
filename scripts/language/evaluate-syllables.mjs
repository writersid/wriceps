// Scores syllable counting on both test sets: `syllable` alone, and the
// exceptions list with `syllable` as fallback. SPEC: 95% main, 90% held-out.
// Run: npm run language:eval
import { syllable } from "syllable";
import { readJson } from "./sources.mjs";

const list = new Map();
for (const [count, words] of Object.entries(readJson("lib/language/syllable-exceptions.json"))) {
  for (const w of words.split(" ")) list.set(w, Number(count));
}
const withList = (w) => list.get(w) ?? syllable(w);

for (const [file, target] of [
  ["test-data/syllables.json", 95],
  ["test-data/syllables-heldout.json", 90],
]) {
  const data = readJson(file);
  for (const [name, count] of [
    ["syllable alone", syllable],
    ["exceptions list + fallback", withList],
  ]) {
    const misses = data.filter((d) => !d.syllables.includes(count(d.word)));
    const pct = (100 * (data.length - misses.length)) / data.length;
    console.log(`${file} | ${name}: ${pct.toFixed(1)}% (target ${target}%)`);
    if (misses.length) {
      console.log("  misses: " + misses.map((d) => `${d.word} (got ${count(d.word)}, want ${d.syllables.join("/")})`).join(", "));
    }
  }
}
