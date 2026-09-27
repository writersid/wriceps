"use client";

import { useEffect, useMemo, useState } from "react";
import { loadEngine, type Engine } from "@/app/components/load-engine";
import { ScoreCard } from "@/app/components/score-card";
import {
  ChallengeBanner,
  ChallengeConflict,
  ChallengeResult,
  EngineStatus,
  LogButton,
  NoteCards,
  SetHeader,
  StartOver,
  type Logged,
} from "@/app/components/set-parts";
import { ShareButton } from "@/app/components/share-button";
import { useClock } from "@/app/components/use-clock";
import type { FillInSet } from "@/content/fill-in";
import { bandFor, scoreText } from "@/lib/engine/score";
import type { Flag } from "@/lib/engine/types";
import {
  answerAt,
  answersText,
  newSeed,
  parseTemplate,
  resolveRound,
  scaleByFilled,
} from "@/lib/fill-in";
import { buildNotes } from "@/lib/notes";
import { splitLines, turnLines } from "@/lib/pass";
import { buildShare, fillInRuns, fillInText, parseChallenge, type Challenge } from "@/lib/share";
import {
  clearDraft,
  getBest,
  loadFillInDraft,
  logScore,
  saveDraft,
  workInProgress,
  type FillInDraft,
} from "@/lib/progress";
import { PassGame } from "./pass-game";
import { AnswerInput, Poem } from "./poem";

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
  // Solo, with a spotter, or not chosen yet (the first screen offers both).
  const [mode, setMode] = useState<"solo" | "pass" | null>(null);
  const [passDraft, setPassDraft] = useState<FillInDraft | null>(null);
  // Pass-the-phone needs at least two turns.
  const canPass = useMemo(() => turnLines(splitLines(parts)).length >= 2, [parts]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  // A challenge link that would replace a round in progress waits for the player's answer.
  const [pendingChallenge, setPendingChallenge] = useState<Challenge | null>(null);

  // The saved round loads with the engine, so nothing typed before then gets replaced.
  useEffect(() => {
    loadEngine()
      .then((loaded) => {
        let draft = loadFillInDraft(set.id, labels.length);
        // A challenge plays the linked round (its seed, solo). A saved round
        // with another seed is dropped if empty, else the player decides.
        const linked = parseChallenge(location.search);
        const clash = linked?.seed !== undefined && draft !== null && draft.seed !== linked.seed;
        if (clash && !workInProgress(draft!.answers, !!draft!.pass)) draft = null;
        if (clash && draft) setPendingChallenge(linked);
        else setChallenge(linked);
        if (draft?.pass) {
          setPassDraft(draft);
          setSeed(draft.seed);
          setMode("pass");
        } else if (draft) {
          setAnswers(draft.answers);
          setCheckedAnswers(draft.answers);
          setIgnored(draft.ignored);
          setStep(Math.min(draft.step, labels.length));
          setSeed(draft.seed);
          if (draft.startedAt) restore(draft.startedAt);
          setMode("solo");
        } else {
          setSeed(linked?.seed ?? newSeed());
          setMode(linked || !canPass ? "solo" : null);
        }
        setBest(getBest(set.id));
        setEngine(loaded);
      })
      .catch(() => setLoadFailed(true));
  }, [set.id, labels.length, restore, canPass]);

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
    const final = scoreText(now, round, engine.checkText(now, round, timer.elapsed()), ignored);
    const result = logScore(set.id, final.score);
    setBest(result.best);
    const share = buildShare({
      origin: location.origin,
      setId: set.id,
      mechanic: "Fill-in",
      title: set.title,
      runs: fillInRuns(parts, answers),
      piece: fillInText(parts, answers),
      score: final.score,
      ignoredFlags: final.ignoredFlags,
      seed: seed ?? undefined,
    });
    setLogged({ score: final.score, isNewPR: result.isNewPR, share });
    timer.stop();
    clearDraft(set.id);
  }

  // Discards the round in progress and goes back to choosing solo or a
  // spotter. In a challenge, the new round replays the challenge's seed, solo.
  function startOver() {
    resetRound(challenge?.seed ?? newSeed(), challenge || !canPass ? "solo" : null);
  }

  function startChallenge() {
    setChallenge(pendingChallenge);
    setPendingChallenge(null);
    resetRound(pendingChallenge?.seed ?? newSeed(), "solo");
  }

  // Keeps the round in progress and drops the challenge from the address, so
  // a refresh doesn't ask again.
  function keepRound() {
    setPendingChallenge(null);
    history.replaceState(null, "", location.pathname);
  }

  function resetRound(nextSeed: number, nextMode: "solo" | null) {
    clearDraft(set.id);
    const empty = labels.map(() => "");
    setAnswers(empty);
    setCheckedAnswers(empty);
    setIgnored([]);
    setStep(0);
    setLogged(null);
    timer.stop();
    setPassDraft(null);
    setSeed(nextSeed);
    setMode(nextMode);
  }
  const startOverControl = workInProgress(answers) && <StartOver onConfirm={startOver} />;

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

  const banner = challenge && <ChallengeBanner score={challenge.score} />;

  if (pendingChallenge) {
    return (
      <>
        {header}
        <ChallengeConflict onStart={startChallenge} onKeep={keepRound} />
      </>
    );
  }

  if (mode === "pass" && engine && seed !== null) {
    return (
      <PassGame
        set={set}
        parts={parts}
        engine={engine}
        seed={seed}
        initial={passDraft}
        eyebrow={`Set ${number} of ${total} · Fill-in · With a spotter`}
        onStartOver={startOver}
      />
    );
  }

  if (mode === null) {
    // The first screen: solo or with a spotter.
    return (
      <>
        {header}
        {engine ? (
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
            <p className="font-display text-2xl font-extrabold">How are you lifting?</p>
            <button
              type="button"
              onClick={() => setMode("solo")}
              className="min-h-12 rounded-full bg-ink font-semibold text-bg"
            >
              Solo
            </button>
            <button
              type="button"
              onClick={() => setMode("pass")}
              className="min-h-12 rounded-full border border-border font-semibold"
            >
              With a spotter
            </button>
            <p className="text-sm text-muted">With a spotter, you take turns on this phone, one line each.</p>
          </section>
        ) : (
          <EngineStatus loadFailed={loadFailed} />
        )}
      </>
    );
  }

  if (!revealed) {
    // Surprise mode, one blank at a time.
    const current = answers[step];
    const here = flags.filter((f) => f.start === undefined || answerAt(checkedAnswers, f.start).index === step);
    return (
      <>
        {header}
        {banner}
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
        {startOverControl}
      </>
    );
  }

  return (
    <>
      {header}
      {banner}
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
      {logged && challenge && <ChallengeResult mine={logged.score} theirs={challenge.score} />}
      {logged && <ShareButton {...logged.share} />}
      {startOverControl}
    </>
  );
}

