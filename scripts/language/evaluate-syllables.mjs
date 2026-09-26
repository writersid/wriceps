// Scores syllable counting on both test sets: `syllable` alone, and the
// exceptions list with `syllable` as fallback. SPEC: 95% main, 90% held-out.
// Run: npm run language:eval
import { syllable } from "syllable";
import { readJson } from "./sources.mjs";

// The list stores each word's lowest and highest count, keyed "2" or "2-3".
const list = new Map();
for (const [key, words] of Object.entries(readJson("lib/language/syllable-exceptions.json"))) {
  const [low, high = low] = key.split("-").map(Number);
  for (const w of words.split(" ")) list.set(w, [low, high]);
}
const alone = (w) => [syllable(w), syllable(w)];
const withList = (w) => list.get(w) ?? alone(w);

// A word is right when both its lowest and highest counts are valid ones.
for (const [file, target] of [
  ["test-data/syllables.json", 95],
  ["test-data/syllables-heldout.json", 90],
]) {
  const data = readJson(file);
  for (const [name, range] of [
    ["syllable alone", alone],
    ["exceptions list + fallback", withList],
  ]) {
    const misses = data.filter((d) => !range(d.word).every((n) => d.syllables.includes(n)));
    const pct = (100 * (data.length - misses.length)) / data.length;
    console.log(`${file} | ${name}: ${pct.toFixed(1)}% (target ${target}%)`);
    if (misses.length) {
      const got = (w) => [...new Set(range(w))].join("-");
      console.log("  misses: " + misses.map((d) => `${d.word} (got ${got(d.word)}, want ${d.syllables.join("/")})`).join(", "));
    }
  }
}
