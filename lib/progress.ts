// Best scores and unsent drafts, kept in the browser's localStorage.
// Storage can be missing or full (private windows, blocked site data), so every
// call fails quietly instead of breaking the screen.
const PROGRESS_KEY = "wriceps-progress";
const draftKey = (setId: string) => `wriceps-draft:${setId}`;

type Progress = Record<string, { best: number }>;
// startedAt: when the first keystroke started the clock (ms since 1970), for time-limit bonuses.
export type Draft = { text: string; ignored: string[]; startedAt?: number };

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
  return typeof draft.startedAt === "number" ? draft : { text: draft.text, ignored: draft.ignored };
}

// A fill-in round: one answer per blank, the round's seed (random letter), and
// in surprise mode the blank on screen.
export type FillInDraft = { answers: string[]; ignored: string[]; seed: number; step: number; startedAt?: number };

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
  const { answers, ignored, seed, step, startedAt } = d;
  return typeof startedAt === "number" ? { answers, ignored, seed, step, startedAt } : { answers, ignored, seed, step };
}

export function saveDraft(setId: string, draft: Draft | FillInDraft) {
  writeJson(draftKey(setId), draft);
}

export function clearDraft(setId: string) {
  try {
    localStorage.removeItem(draftKey(setId));
  } catch {}
}
