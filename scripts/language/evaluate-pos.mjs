// Scores compromise/two on test-data/pos-sentences.json. SPEC pass/fail uses
// the literal reading (adverb or adjective, either category): precision >= 90%,
// recall >= 85%. Also reports how often the note names the right category.
// Run: npm run language:eval
import nlp from "compromise/two";
import { readJson } from "./sources.mjs";
import { isAllowed } from "../../lib/language/allowlists.ts";

const allowed = { adj: (w) => isAllowed("adjective", w), adv: (w) => isAllowed("adverb", w) };

function tag(text) {
  const out = [];
  for (const s of nlp(text).json()) {
    for (const t of s.terms) {
      // compromise splits "don't" into "do" plus a hidden "not"; label it "n't".
      const word = t.text === "" && t.implicit === "not" ? "n't" : t.normal.replace(/[^a-z'-]/g, "");
      if (t.tags.includes("Adjective")) out.push({ word, cat: "adj" });
      else if (t.tags.includes("Adverb") || t.tags.includes("Negative")) out.push({ word, cat: "adv" });
    }
  }
  return out;
}

const sentences = readJson("test-data/pos-sentences.json");

function score(useAllowlists) {
  let flags = 0, correct = 0, rightCategory = 0, gold = 0;
  const wrongCategory = [], falseFlags = [], missed = [];
  for (const s of sentences) {
    const labels = [
      ...s.adjectives.map((word) => ({ word, cat: "adj" })),
      ...s.adverbs.map((word) => ({ word, cat: "adv" })),
    ].filter((l) => !useAllowlists || !allowed[l.cat](l.word));
    const preds = tag(s.text).filter((p) => !useAllowlists || !allowed[p.cat](p.word));
    flags += preds.length;
    gold += labels.length;
    const left = [...labels];
    for (const p of preds) {
      const i = left.findIndex((l) => l.word === p.word);
      if (i < 0) {
        falseFlags.push(`#${s.id} ${p.word} (as ${p.cat})`);
        continue;
      }
      correct++;
      if (left[i].cat === p.cat) rightCategory++;
      else wrongCategory.push(`#${s.id} ${p.word}: note says ${p.cat}, really ${left[i].cat}`);
      left.splice(i, 1);
    }
    for (const l of left) missed.push(`#${s.id} ${l.word} (${l.cat})`);
  }
  const pct = (a, b) => `${((100 * a) / b).toFixed(1)}% (${a}/${b})`;
  console.log(useAllowlists ? "\nRULE (both allowlists)" : "\nTAGGER (grammatical labels)");
  console.log(`  precision ${pct(correct, flags)}, recall ${pct(correct, gold)}, right category ${pct(rightCategory, correct)}`);
  console.log(`  wrong category: ${wrongCategory.join("; ") || "none"}`);
  console.log(`  false flags: ${falseFlags.join("; ") || "none"}`);
  console.log(`  missed: ${missed.join("; ") || "none"}`);
}

score(false);
score(true);
