// Scores compromise/two on test-data/pos-sentences.json. SPEC pass/fail uses
// the literal reading (adverb or adjective, either category): precision >= 90%,
// recall >= 85%. Also reports how often the note names the right category.
// Run: npm run language:eval
import nlp from "compromise/two";
import { readJson } from "./sources.mjs";

// Mirrors the allowlists in SPEC.md. Replace with the rule engine's lists once it exists.
const ADV_ALLOW = new Set(
  "not n't never then now already yet again ago once always often sometimes soon today tomorrow yesterday tonight here there home away back also too either neither else instead how when where why as more most less least up down out off in on over around through please".split(" "),
);
const ADJ_ALLOW = new Set(
  "last next previous following other another same own only all few fewer many much more most less least several such enough".split(" "),
);
const ORDINALS = /^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|\d+(st|nd|rd|th))$/;
const allowed = { adj: (w) => ADJ_ALLOW.has(w) || ORDINALS.test(w), adv: (w) => ADV_ALLOW.has(w) };

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
