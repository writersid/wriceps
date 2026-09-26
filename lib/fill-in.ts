// Fill-in poems: template parsing, answers as text for the rule engine, and
// the round's random elements. See SPEC.md "Fill-in poems".
import type { Exercise, ScoredRule } from "./engine/types";

// Template syntax: "{noun}" is a blank with its label; "{noun#shout}" also
// names it; "{=shout}" echoes that blank's answer, filled in automatically.
export type Part =
  | { type: "text"; text: string }
  | { type: "blank"; index: number; label: string }
  | { type: "echo"; index: number };

// Throws on a mistake in the template, so content tests catch it.
export function parseTemplate(template: string): { parts: Part[]; labels: string[] } {
  const parts: Part[] = [];
  const labels: string[] = [];
  const names = new Map<string, number>();
  const text = (s: string) => {
    if (/[{}]/.test(s)) throw new Error(`Stray brace in template near "${s}"`);
    if (s) parts.push({ type: "text", text: s });
  };
  let at = 0;
  for (const m of template.matchAll(/\{([^{}]*)\}/g)) {
    text(template.slice(at, m.index));
    const inner = m[1].trim();
    if (inner.startsWith("=")) {
      const index = names.get(inner.slice(1).trim());
      if (index === undefined) throw new Error(`"{${inner}}" echoes no earlier named blank`);
      parts.push({ type: "echo", index });
    } else {
      const [label, name] = inner.split("#").map((s) => s.trim());
      if (!label) throw new Error(`Blank "{${inner}}" has no label`);
      if (name) {
        if (names.has(name)) throw new Error(`Two blanks are named "${name}"`);
        names.set(name, labels.length);
      }
      parts.push({ type: "blank", index: labels.length, label });
      labels.push(label);
    }
    at = m.index + m[0].length;
  }
  text(template.slice(at));
  if (labels.length === 0) throw new Error("Template has no blanks");
  return { parts, labels };
}

// The answers as the rule engine sees them: one per line. Echoes aren't
// included, so they're never checked. Line breaks inside an answer become
// spaces, which keeps every position the same as in the answer.
export function answersText(answers: string[]): string {
  return answers.map((a) => a.replace(/\n/g, " ")).join("\n");
}

// Which answer a position in answersText falls in, and where in that answer.
export function answerAt(answers: string[], pos: number): { index: number; offset: number } {
  let start = 0;
  for (let index = 0; index < answers.length; index++) {
    if (pos <= start + answers[index].length) return { index, offset: pos - start };
    start += answers[index].length + 1;
  }
  return { index: answers.length - 1, offset: answers.at(-1)?.length ?? 0 };
}

// A random seed for a new round. Part 5's challenge links will carry it.
export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

// Letters that start plenty of everyday words.
const LETTER_POOL = "abcdefghilmnoprstw";

// The same seed always draws the same letter (mulberry32, a small standard
// random-number generator).
export function drawLetter(seed: number): string {
  let t = (seed + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const r = ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  return LETTER_POOL[Math.floor(r * LETTER_POOL.length)];
}

// The exercise for this round, with random elements fixed by the seed.
export function resolveRound<T extends Exercise>(exercise: T, seed: number): T {
  const fix = (rule: ScoredRule): ScoredRule =>
    rule.type === "sameFirstLetter" && rule.random ? { ...rule, letter: drawLetter(seed), random: false } : rule;
  return { ...exercise, rules: exercise.rules.map(fix), bonus: exercise.bonus?.map(fix) };
}
