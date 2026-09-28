// A round's random parts: the seed, the draws it makes, and which round to
// play when a challenge link meets a saved draft. Shared by all three
// mechanics. See SPEC.md "Sharing details".
import type { Exercise, ScoredRule } from "./engine/types";
import type { Challenge } from "./share";

// A random seed for a new round. Challenge links carry it.
export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

// Starting letters for "random letter" rules: letters that start plenty of
// everyday words, so no round draws X or Q.
export const STARTING_LETTERS = "bcdfghlmprstw";

// One option, picked by the seed and the rule's id, so the same round always
// draws the same thing and two draws in one set land independently.
// mulberry32, a small standard random-number generator.
export function draw<T>(seed: number, ruleId: string, options: readonly T[]): T {
  let t = seed >>> 0;
  for (const ch of ruleId) t = Math.imul(t ^ ch.charCodeAt(0), 0x9e3779b1) >>> 0;
  t = (t + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const r = ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  return options[Math.floor(r * options.length)];
}

// Whether a rule still has something to draw.
function drawsIn(rule: ScoredRule): boolean {
  switch (rule.type) {
    case "sameFirstLetter":
      return !!rule.random;
    case "bannedLetters":
      return rule.pool !== undefined;
    case "requiredWords":
    case "firstSentence":
      return rule.options !== undefined;
    default:
      return false;
  }
}

export function hasDraws(exercise: Exercise): boolean {
  return [...exercise.rules, ...(exercise.bonus ?? [])].some(drawsIn);
}

// The rule with its draw made: `pick` chooses from the options.
function resolveRule(rule: ScoredRule, pick: <T>(options: readonly T[]) => T): ScoredRule {
  if (!drawsIn(rule)) return rule;
  switch (rule.type) {
    case "sameFirstLetter":
      return { ...rule, letter: pick([...STARTING_LETTERS]), random: false };
    case "bannedLetters": {
      const { pool, ...rest } = rule;
      return { ...rest, letters: pick([...pool!]) };
    }
    case "requiredWords": {
      const { options, ...rest } = rule;
      return { ...rest, words: pick(options!) };
    }
    case "firstSentence": {
      const { options, ...rest } = rule;
      return { ...rest, sentence: pick(options!) };
    }
    default:
      return rule;
  }
}

// The exercise for this round, with every draw fixed by the seed.
export function resolveRound<T extends Exercise>(exercise: T, seed: number): T {
  const fix = (rule: ScoredRule) => resolveRule(rule, (options) => draw(seed, rule.id, options));
  return { ...exercise, rules: exercise.rules.map(fix), bonus: exercise.bonus?.map(fix) };
}

// Every round a set can produce, one per option of each draw taken in turn
// (the other draws take their first option). For content tests: every option
// must work. Random letters aren't listed; the starting pool is fixed.
export function everyDraw<T extends Exercise>(exercise: T): T[] {
  const all = [...exercise.rules, ...(exercise.bonus ?? [])];
  const choicesFor = (rule: ScoredRule): number => {
    if (rule.type === "bannedLetters" && rule.pool !== undefined) return rule.pool.length;
    if ((rule.type === "requiredWords" || rule.type === "firstSentence") && rule.options) return rule.options.length;
    return 1;
  };
  const rounds: T[] = [];
  for (const target of all) {
    for (let i = 0; i < choicesFor(target); i++) {
      const fix = (rule: ScoredRule) =>
        resolveRule(rule, (options) => options[rule === target ? i : 0]);
      rounds.push({ ...exercise, rules: exercise.rules.map(fix), bonus: exercise.bonus?.map(fix) });
    }
  }
  return rounds;
}

// Which round to play when a set opens. A challenge with a seed plays that
// round; a saved round with another seed is dropped if nothing's in it, else
// the player decides (`pending`). `inProgress` says whether the saved round
// has work in it.
export function openRound<D extends { seed?: number }>(
  saved: D | null,
  linked: Challenge | null,
  inProgress: (draft: D) => boolean,
): { draft: D | null; challenge: Challenge | null; pending: Challenge | null } {
  const clash = linked?.seed !== undefined && saved !== null && saved.seed !== linked.seed;
  if (!clash) return { draft: saved, challenge: linked, pending: null };
  if (!inProgress(saved)) return { draft: null, challenge: linked, pending: null };
  return { draft: saved, challenge: null, pending: linked };
}
