"use client";

import { useEffect, useMemo, useState } from "react";
import { loadEngine, type Engine } from "@/app/components/load-engine";
import { ScoreCard } from "@/app/components/score-card";
import { EngineStatus, LogButton, NoteCards, SetHeader, type Logged } from "@/app/components/set-parts";
import { useClock } from "@/app/components/use-clock";
import type { FillInSet } from "@/content/fill-in";
import { bandFor, scoreText } from "@/lib/engine/score";
import type { Flag } from "@/lib/engine/types";
import {
  answerAt,
  answersText,
  capitalizeFirst,
  newSeed,
  parseTemplate,
  resolveRound,
  scaleByFilled,
  startsSentence,
  type Part,
} from "@/lib/fill-in";
import { buildNotes } from "@/lib/notes";
import { clearDraft, getBest, loadFillInDraft, logScore, saveDraft } from "@/lib/progress";

const CHECK_DELAY_MS = 150;

export function FillInScreen({ set, number, total }: { set: FillInSet; number: number; total: number }) {
  const { parts, labels } = useMemo(() => parseTemplate(set.template), [set.template]);
  const [answers, setAnswers] = useState<string[]>(() => labels.map(() => ""));
  const [checkedAnswers, setCheckedAnswers] = useState(answers);
  const [ignored, setIgnored] = useState<string[]>([]);
  const [seed, setSeed] = useState<number | null>(null);
  // Surprise mode: which blank is on screen; labels.length means the poem is revealed.
  const [step, setStep] = useState(0);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const [logged, setLogged] = useState<Logged | null>(null);
  const timeRule = set.bonus?.find((r) => r.type === "timeLimit");
  const timer = useClock(timeRule?.type === "timeLimit" ? timeRule.seconds : undefined);
  const { restore } = timer;

  // The saved round loads with the engine, so nothing typed before then gets replaced.
  useEffect(() => {
    loadEngine()
      .then((loaded) => {
        const draft = loadFillInDraft(set.id, labels.length);
        if (draft) {
          setAnswers(draft.answers);
          setCheckedAnswers(draft.answers);
          setIgnored(draft.ignored);
          setStep(Math.min(draft.step, labels.length));
          setSeed(draft.seed);
          if (draft.startedAt) restore(draft.startedAt);
        } else {
          setSeed(newSeed());
        }
        setBest(getBest(set.id));
        setEngine(loaded);
      })
      .catch(() => setLoadFailed(true));
  }, [set.id, labels.length, restore]);

  useEffect(() => {
    const t = setTimeout(() => setCheckedAnswers(answers), CHECK_DELAY_MS);
    return () => clearTimeout(t);
  }, [answers]);

  // This round's rules, with the random letter drawn from the seed.
  const round = useMemo(() => (seed === null ? set : resolveRound(set, seed)), [set, seed]);
  const text = answersText(checkedAnswers);
  const flags = useMemo(
    () => (engine ? engine.checkText(text, round, timer.clock) : []),
    [engine, text, round, timer.clock],
  );
  const visible = flags.filter((f) => !(f.ignorable && ignored.includes(f.ignoreKey)));
  const flaggedAnswers = new Set(
    visible.flatMap((f) => (f.start === undefined ? [] : [answerAt(checkedAnswers, f.start).index])),
  );
  const notesFor = (some: Flag[]) => (engine ? buildNotes(some, ignored, round, engine.syllableRange) : []);
  const score = scaleByFilled(scoreText(text, round, flags, ignored).score, checkedAnswers);
  const band = bandFor(score);
  const complete = answers.every((a) => a.trim());
  const revealed = set.mode === "open" || step === labels.length;

  function save(next: { answers?: string[]; ignored?: string[]; step?: number; startedAt?: number | null }) {
    if (seed === null) return;
    const startedAt = next.startedAt !== undefined ? next.startedAt : timer.startedAt;
    saveDraft(set.id, {
      answers: next.answers ?? answers,
      ignored: next.ignored ?? ignored,
      seed,
      step: next.step ?? step,
      startedAt: startedAt ?? undefined,
    });
  }

  function answer(index: number, value: string) {
    const started = timer.start();
    const next = answers.map((a, i) => (i === index ? value : a));
    setAnswers(next);
    setLogged(null);
    save({ answers: next, startedAt: started });
  }

  function ignore(keys: string[]) {
    const next = [...ignored, ...keys.filter((k) => !ignored.includes(k))];
    setIgnored(next);
    save({ ignored: next });
  }

  function go(to: number) {
    setStep(to);
    save({ step: to });
  }

  function log() {
    if (!engine) return;
    const now = answersText(answers);
    const final = scoreText(now, round, engine.checkText(now, round, timer.elapsed()), ignored).score;
    const result = logScore(set.id, final);
    setBest(result.best);
    setLogged({ score: final, isNewPR: result.isNewPR });
    timer.stop();
    clearDraft(set.id);
  }

  const header = (
    <SetHeader
      eyebrow={`Set ${number} of ${total} · Fill-in`}
      title={set.title}
      blurb={set.blurb}
      rules={round.rules}
      bonus={round.bonus}
      secondsLeft={timer.secondsLeft}
    />
  );

  if (!revealed) {
    // Surprise mode, one blank at a time.
    const current = answers[step];
    const here = flags.filter((f) => f.start === undefined || answerAt(checkedAnswers, f.start).index === step);
    return (
      <>
        {header}
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm text-muted">
            Blank {step + 1} of {labels.length}
          </p>
          <label htmlFor="blank" className="font-display text-2xl font-extrabold first-letter:uppercase">
            {labels[step]}
          </label>
          <AnswerInput
            id="blank"
            value={current}
            label={labels[step]}
            flagged={flaggedAnswers.has(step)}
            disabled={!engine}
            onChange={(v) => answer(step, v)}
            onEnter={() => current.trim() && go(step + 1)}
            wide
          />
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => go(step - 1)}
                className="min-h-11 flex-1 rounded-full border border-border font-semibold"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => go(step + 1)}
              disabled={!current.trim()}
              className="min-h-11 flex-1 rounded-full bg-ink font-semibold text-bg disabled:opacity-60"
            >
              {step === labels.length - 1 ? "Reveal the poem" : "Next"}
            </button>
          </div>
        </section>
        {!engine && <EngineStatus loadFailed={loadFailed} />}
        <NoteCards notes={notesFor(here)} ignoredCount={ignored.length} onIgnore={ignore} />
      </>
    );
  }

  return (
    <>
      {header}
      <Poem
        parts={parts}
        answers={answers}
        flaggedAnswers={flaggedAnswers}
        editable={set.mode === "open" && !!engine}
        onAnswer={answer}
      />
      {!engine && <EngineStatus loadFailed={loadFailed} />}
      {set.mode === "surprise" && !logged && (
        <button
          type="button"
          onClick={() => go(labels.length - 1)}
          className="min-h-11 rounded-full border border-border font-semibold"
        >
          Back to the blanks
        </button>
      )}
      <NoteCards notes={notesFor(flags)} ignoredCount={ignored.length} onIgnore={ignore} />
      <ScoreCard score={score} band={band} best={best} />
      <LogButton onLog={log} disabled={!engine || !complete} logged={logged} best={best} />
      {!complete && <p className="-mt-2 text-center text-sm text-muted">Fill every blank to log the set.</p>}
    </>
  );
}

// The poem card: answers in bold, or inline inputs in open mode. Echoes show
// the answer they repeat, or a dashed gap until it's filled.
function Poem({
  parts,
  answers,
  flaggedAnswers,
  editable,
  onAnswer,
}: {
  parts: Part[];
  answers: string[];
  flaggedAnswers: Set<number>;
  editable: boolean;
  onAnswer: (index: number, value: string) => void;
}) {
  return (
    <section
      aria-label="Your poem"
      className="rounded-2xl border border-border bg-surface p-4 text-lg leading-10 whitespace-pre-line"
    >
      {parts.map((part, i) => {
        // Punctuation right after an input stays on its line. (Text never
        // breaks before punctuation, so only inputs need this.)
        const trailing = (p: Part | undefined) => (p?.type === "text" ? (/^[^\s\p{L}\p{N}]+/u.exec(p.text)?.[0] ?? "") : "");
        if (part.type === "text") {
          const skip = parts[i - 1]?.type !== "text" ? trailing(part).length : 0;
          return <span key={i}>{part.text.slice(skip)}</span>;
        }
        const value = answers[part.index];
        let filled;
        if (part.type === "blank" && editable) {
          filled = (
            <AnswerInput
              value={value}
              label={`${part.label} (blank ${part.index + 1})`}
              placeholder={part.label}
              flagged={flaggedAnswers.has(part.index)}
              onChange={(v) => onAnswer(part.index, v)}
            />
          );
        } else if (!value.trim()) {
          filled = <span className="text-muted">____</span>;
        } else {
          filled = (
            <strong
              className={
                part.type === "blank" && flaggedAnswers.has(part.index)
                  ? "underline decoration-coral decoration-wavy decoration-[1.5px] underline-offset-4"
                  : undefined
              }
            >
                {startsSentence(parts, i) ? capitalizeFirst(value) : value}
            </strong>
          );
        }
        return (
          <span key={i} className={part.type === "blank" && editable ? "whitespace-nowrap" : undefined}>
            {filled}
            {trailing(parts[i + 1])}
          </span>
        );
      })}
    </section>
  );
}

function AnswerInput({
  id,
  value,
  label,
  placeholder,
  flagged,
  disabled,
  onChange,
  onEnter,
  wide,
}: {
  id?: string;
  value: string;
  label: string;
  placeholder?: string;
  flagged: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onEnter?: () => void;
  wide?: boolean;
}) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) onEnter();
      }}
      aria-label={id ? undefined : label}
      aria-invalid={flagged}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete="off"
      enterKeyHint={onEnter ? "next" : undefined}
      // Inline blanks grow with the answer; 16px text stops iPhones zooming in.
      style={wide ? undefined : { width: `${Math.max(value.length, placeholder?.length ?? 0, 3) + 2}ch` }}
      className={`${wide ? "w-full rounded-xl border px-3 py-2.5" : "mx-0.5 border-b-2 px-1"} max-w-full bg-transparent text-base font-semibold outline-none placeholder:font-normal placeholder:text-muted focus:border-ink ${
        flagged
          ? "border-coral underline decoration-coral decoration-wavy decoration-[1.5px] underline-offset-4"
          : "border-border"
      }`}
    />
  );
}
