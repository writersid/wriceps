// Best scores and unsent drafts, kept in the browser's localStorage.
// Storage can be missing or full (private windows, blocked site data), so every
// call fails quietly instead of breaking the screen.
import type { PassState } from "./pass";

const PROGRESS_KEY = "wriceps-progress";
const draftKey = (setId: string) => `wriceps-draft:${setId}`;

type Progress = Record<string, { best: number }>;
// startedAt: when the first keystroke started the clock (ms since 1970), for time-limit bonuses.
// seed: the round's draws (see lib/round.ts), for sets that draw.
export type Draft = { text: string; ignored: string[]; startedAt?: number; seed?: number };

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getBest(setId: string): number | null {
  const best = readJson<Progress>(PROGRESS_KEY)?.[setId]?.best;
  return typeof best === "number" ? best : null;
}

// Saves the score if it beats the old best. The first logged score is a PR too.
export function logScore(setId: string, score: number): { best: number; isNewPR: boolean } {
  const old = getBest(setId);
  if (old !== null && score <= old) return { best: old, isNewPR: false };
  writeJson(PROGRESS_KEY, { ...readJson<Progress>(PROGRESS_KEY), [setId]: { best: score } });
  return { best: score, isNewPR: true };
}

export function loadDraft(setId: string): Draft | null {
  const draft = readJson<Draft>(draftKey(setId));
  if (typeof draft?.text !== "string" || !Array.isArray(draft.ignored)) return null;
  const clean: Draft = { text: draft.text, ignored: draft.ignored };
  if (typeof draft.startedAt === "number") clean.startedAt = draft.startedAt;
  if (Number.isInteger(draft.seed)) clean.seed = draft.seed;
  return clean;
}

// A fill-in round: one answer per blank, the round's seed (random letter), and
// in surprise mode the blank on screen.
export type FillInDraft = {
  answers: string[];
  ignored: string[];
  seed: number;
  step: number;
  startedAt?: number;
  pass?: PassState; // present in a pass-the-phone game
};

export function loadFillInDraft(setId: string, blanks: number): FillInDraft | null {
  const d = readJson<FillInDraft>(draftKey(setId));
  const valid =
    Array.isArray(d?.answers) &&
    d.answers.length === blanks &&
    d.answers.every((a) => typeof a === "string") &&
    Array.isArray(d.ignored) &&
    Number.isInteger(d.seed) &&
    Number.isInteger(d.step);
  if (!d || !valid) return null;
  const { answers, ignored, seed, step, startedAt, pass } = d;
  const draft: FillInDraft = { answers, ignored, seed, step };
  if (typeof startedAt === "number") draft.startedAt = startedAt;
  if (pass !== undefined) {
    const phases = ["handoff", "turn", "reveal"];
    if (!Number.isInteger(pass?.turn) || !phases.includes(pass.phase) || !Number.isInteger(pass.shown)) return null;
    // After a refresh, a turn in progress goes back to its handoff screen, so the
    // game never reopens on someone's answers.
    draft.pass = { turn: pass.turn, phase: pass.phase === "turn" ? "handoff" : pass.phase, shown: pass.shown };
  }
  return draft;
}

// A blackout round: the kept words' positions in the passage, and whether the
// blacked-out page is showing.
export type BlackoutDraft = { kept: number[]; ignored: string[]; blackedOut: boolean; startedAt?: number; seed?: number };

export function loadBlackoutDraft(setId: string, words: number): BlackoutDraft | null {
  const d = readJson<BlackoutDraft>(draftKey(setId));
  const valid =
    Array.isArray(d?.kept) &&
    d.kept.every((i) => Number.isInteger(i) && i >= 0 && i < words) &&
    Array.isArray(d.ignored) &&
    typeof d.blackedOut === "boolean";
  if (!d || !valid) return null;
  const draft: BlackoutDraft = { kept: [...new Set(d.kept)].sort((a, b) => a - b), ignored: d.ignored, blackedOut: d.blackedOut };
  if (typeof d.startedAt === "number") draft.startedAt = d.startedAt;
  if (Number.isInteger(d.seed)) draft.seed = d.seed;
  return draft;
}

// Whether a set has work to discard before starting over: any text typed (a
// constraint draft, or any fill-in answer), or a spotter game under way.
export function workInProgress(texts: string[], spotterGame = false): boolean {
  return spotterGame || texts.some((t) => t.trim());
}

export function saveDraft(setId: string, draft: Draft | FillInDraft | BlackoutDraft) {
  writeJson(draftKey(setId), draft);
}

export function clearDraft(setId: string) {
  try {
    localStorage.removeItem(draftKey(setId));
  } catch {}
}
