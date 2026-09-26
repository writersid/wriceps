"use client";

import { useEffect, useMemo, useState } from "react";
import { DraftEditor } from "@/app/components/draft-editor";
import { ScoreCard } from "@/app/components/score-card";
import type { ConstraintSet } from "@/content/constraint";
import { FREE_IGNORES, scoreText } from "@/lib/engine/score";
import { buildNotes, ruleLabel } from "@/lib/notes";
import { clearDraft, getBest, loadDraft, logScore, saveDraft } from "@/lib/progress";

type Engine = {
  checkText: typeof import("@/lib/engine/check").checkText;
  syllableRange: typeof import("@/lib/engine/language").syllableRange;
};

// How long typing must pause before the draft is rechecked.
const CHECK_DELAY_MS = 150;

export function ConstraintScreen({ set, number, total }: { set: ConstraintSet; number: number; total: number }) {
  const [text, setText] = useState("");
  const [checkedText, setCheckedText] = useState("");
  const [ignored, setIgnored] = useState<string[]>([]);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const [logged, setLogged] = useState<{ score: number; isNewPR: boolean } | null>(null);
  // Time-limit bonus: the clock starts at the first keystroke; `now` ticks the countdown.
  const timeRule = set.bonus?.find((r) => r.type === "timeLimit");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  // The language tools load only once a constraint set opens, not with the app.
  // The saved draft loads with them, so nothing typed before then gets replaced.
  useEffect(() => {
    Promise.all([import("@/lib/engine/check"), import("@/lib/engine/language")])
      .then(([check, language]) => {
        const draft = loadDraft(set.id);
        if (draft) {
          setText(draft.text);
          setCheckedText(draft.text);
          setIgnored(draft.ignored);
          if (draft.startedAt) {
            setStartedAt(draft.startedAt);
            setNow(Date.now());
          }
        }
        setBest(getBest(set.id));
        setEngine({ checkText: check.checkText, syllableRange: language.syllableRange });
      })
      .catch(() => setLoadFailed(true));
  }, [set.id]);

  useEffect(() => {
    const timer = setTimeout(() => setCheckedText(text), CHECK_DELAY_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const clockRunning = timeRule !== undefined && startedAt !== null && logged === null;
  useEffect(() => {
    if (!clockRunning) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [clockRunning]);
  const secondsLeft =
    timeRule?.type === "timeLimit" && startedAt !== null
      ? Math.max(0, timeRule.seconds - Math.floor((now - startedAt) / 1000))
      : null;
  // The rules only need to know whether time is up, so the draft isn't rechecked every second.
  const timeUp = secondsLeft === 0;
  const clock = startedAt === null ? undefined : timeUp ? Infinity : 0;

  const flags = useMemo(
    () => (engine ? engine.checkText(checkedText, set, clock) : []),
    [engine, checkedText, set, clock],
  );
  const notes = engine ? buildNotes(flags, ignored, set, engine.syllableRange) : [];
  const underlines = flags.flatMap((f) =>
    f.start !== undefined && f.end !== undefined && !(f.ignorable && ignored.includes(f.ignoreKey))
      ? [{ start: f.start, end: f.end }]
      : [],
  );
  const { score, band } = scoreText(checkedText, set, flags, ignored);
  const freeLeft = Math.max(0, FREE_IGNORES - ignored.length);

  function edit(value: string) {
    let started = startedAt;
    if (started === null && timeRule) {
      started = Date.now();
      setStartedAt(started);
      setNow(started);
    }
    setText(value);
    setLogged(null);
    saveDraft(set.id, { text: value, ignored, startedAt: started ?? undefined });
  }

  function ignore(keys: string[]) {
    const next = [...ignored, ...keys.filter((k) => !ignored.includes(k))];
    setIgnored(next);
    saveDraft(set.id, { text, ignored: next, startedAt: startedAt ?? undefined });
  }

  function log() {
    if (!engine) return;
    // Score the text and time as they are now, not as of the last pause in typing.
    const elapsed = startedAt === null ? undefined : Date.now() - startedAt;
    const final = scoreText(text, set, engine.checkText(text, set, elapsed), ignored).score;
    const result = logScore(set.id, final);
    setBest(result.best);
    setLogged({ score: final, isNewPR: result.isNewPR });
    setStartedAt(null);
    clearDraft(set.id);
  }

  return (
    <>
      <p className="text-xs font-semibold tracking-widest text-muted uppercase">
        Set {number} of {total} · Constraint
      </p>
      <h1 className="-mt-2 font-display text-4xl leading-tight font-extrabold">{set.title}</h1>
      <p className="-mt-2 text-muted">{set.blurb}</p>
      <ul className="flex flex-wrap gap-2 text-sm">
        {set.rules.map((rule) => (
          <li key={rule.id} className="rounded-full border border-border px-3 py-1.5">
            {ruleLabel(rule)}
          </li>
        ))}
        {set.bonus?.map((rule) => (
          <li key={rule.id} className="rounded-full border border-dashed border-muted px-3 py-1.5">
            Bonus: {ruleLabel(rule)}
            {rule.type === "timeLimit" && secondsLeft !== null && (
              <span className="font-semibold tabular-nums">
                {" · "}
                {timeUp
                  ? "time's up"
                  : `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")} left`}
              </span>
            )}
          </li>
        ))}
      </ul>

      <DraftEditor
        value={text}
        onChange={edit}
        underlines={underlines}
        label={`Your draft for ${set.title}`}
        disabled={!engine}
      />
      {!engine && (
        <p className="text-sm text-muted" role="status">
          {loadFailed
            ? "The checker didn't load. Check your connection and refresh the page."
            : "Warming up the checker…"}
        </p>
      )}

      {notes.length > 0 && (
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
                  onClick={() => ignore(note.ignoreKeys)}
                  className="min-h-11 shrink-0 rounded-xl border border-border px-3 text-sm font-medium"
                >
                  {note.ignoreKeys.length > 1 ? `Ignore (uses ${note.ignoreKeys.length})` : "Ignore"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {notes.some((n) => n.ignoreKeys.length > 0) && (
        <p className="-mt-2 text-sm text-muted">
          {freeLeft > 0
            ? `Free ignores left: ${freeLeft}.`
            : "No free ignores left. Ignoring now still hides the flag, but it costs points."}
        </p>
      )}

      <ScoreCard score={score} band={band} best={best} />

      <button
        type="button"
        onClick={log}
        disabled={!engine || !text.trim() || logged !== null}
        className="min-h-12 rounded-full bg-ink font-display text-lg font-black text-bg disabled:opacity-60"
      >
        {logged ? (logged.isNewPR ? "New PR!" : "Logged") : "Log this set"}
      </button>
      <p className="-mt-2 text-center text-sm text-muted" role="status">
        {logged && (logged.isNewPR ? `Logged ${logged.score}. That's a new PR.` : `Logged ${logged.score}. Your PR is still ${best}.`)}
      </p>
    </>
  );
}
