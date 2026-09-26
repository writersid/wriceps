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

export function saveDraft(setId: string, draft: Draft) {
  writeJson(draftKey(setId), draft);
}

export function clearDraft(setId: string) {
  try {
    localStorage.removeItem(draftKey(setId));
  } catch {}
}
