import type { ScoredRule } from "@/lib/engine/types";
import { FREE_IGNORES } from "@/lib/engine/score";
import { ruleLabel, type Note } from "@/lib/notes";
import { clockText } from "./use-clock";

// Pieces shared by the constraint and fill-in screens.

export function SetHeader({
  eyebrow,
  title,
  blurb,
  rules,
  bonus,
  secondsLeft,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  rules: ScoredRule[];
  bonus?: ScoredRule[];
  secondsLeft: number | null;
}) {
  return (
    <>
      <p className="text-xs font-semibold tracking-widest text-muted uppercase">{eyebrow}</p>
      <h1 className="-mt-2 font-display text-4xl leading-tight font-extrabold">{title}</h1>
      <p className="-mt-2 text-muted">{blurb}</p>
      <ul className="flex flex-wrap gap-2 text-sm">
        {rules.map((rule) => (
          <li key={rule.id} className="rounded-full border border-border px-3 py-1.5">
            {ruleLabel(rule)}
          </li>
        ))}
        {bonus?.map((rule) => (
          <li key={rule.id} className="rounded-full border border-dashed border-muted px-3 py-1.5">
            Bonus: {ruleLabel(rule)}
            {rule.type === "timeLimit" && secondsLeft !== null && (
              <span className="font-semibold tabular-nums">
                {" · "}
                {clockText(secondsLeft)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

export function EngineStatus({ loadFailed }: { loadFailed: boolean }) {
  return (
    <p className="text-sm text-muted" role="status">
      {loadFailed ? "The checker didn't load. Check your connection and refresh the page." : "Warming up the checker…"}
    </p>
  );
}

export function NoteCards({
  notes,
  ignoredCount,
  onIgnore,
}: {
  notes: Note[];
  ignoredCount: number;
  onIgnore: (keys: string[]) => void;
}) {
  const freeLeft = Math.max(0, FREE_IGNORES - ignoredCount);
  if (notes.length === 0) return null;
  return (
    <>
      <ul className="flex flex-col gap-2">
        {notes.map((note) => (
          <li key={note.key} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
            <p className="flex-1 text-sm">
              {note.word && (
                <>
                  <span className="font-semibold text-coral">{note.word}</span> ·{" "}
                </>
              )}
              {/[.!?”"]$/.test(note.detail) ? note.detail : `${note.detail}.`} {note.tip}
            </p>
            {note.ignoreKeys.length > 0 && (
              <button
                type="button"
                onClick={() => onIgnore(note.ignoreKeys)}
                className="min-h-11 shrink-0 rounded-xl border border-border px-3 text-sm font-medium"
              >
                {note.ignoreKeys.length > 1 ? `Ignore (uses ${note.ignoreKeys.length})` : "Ignore"}
              </button>
            )}
          </li>
        ))}
      </ul>
      {notes.some((n) => n.ignoreKeys.length > 0) && (
        <p className="-mt-2 text-sm text-muted">
          {freeLeft > 0
            ? `Free ignores left: ${freeLeft}.`
            : "No free ignores left. Ignoring now still hides the flag, but it costs points."}
        </p>
      )}
    </>
  );
}

export type Logged = { score: number; isNewPR: boolean };

export function LogButton({
  onLog,
  disabled,
  logged,
  best,
}: {
  onLog: () => void;
  disabled: boolean;
  logged: Logged | null;
  best: number | null;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onLog}
        disabled={disabled || logged !== null}
        className="min-h-12 rounded-full bg-ink font-display text-lg font-black text-bg disabled:opacity-60"
      >
        {logged ? (logged.isNewPR ? "New PR!" : "Logged") : "Log this set"}
      </button>
      <p className="-mt-2 text-center text-sm text-muted" role="status">
        {logged &&
          (logged.isNewPR ? `Logged ${logged.score}. That's a new PR.` : `Logged ${logged.score}. Your PR is still ${best}.`)}
      </p>
    </>
  );
}
