"use client";

import { useEffect, useMemo, useState } from "react";
import { DraftEditor } from "@/app/components/draft-editor";
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
import type { ConstraintSet } from "@/content/constraint";
import { scoreText } from "@/lib/engine/score";
import { buildNotes } from "@/lib/notes";
import { buildShare, constraintRuns, parseChallenge, type Challenge } from "@/lib/share";
import { clearDraft, getBest, loadDraft, logScore, saveDraft, workInProgress } from "@/lib/progress";
import { hasDraws, newSeed, openRound, resolveRound } from "@/lib/round";

// How long typing must pause before the draft is rechecked.
const CHECK_DELAY_MS = 150;

export function ConstraintScreen({ set, number, total }: { set: ConstraintSet; number: number; total: number }) {
  const [text, setText] = useState("");
  const [checkedText, setCheckedText] = useState("");
  const [ignored, setIgnored] = useState<string[]>([]);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const [logged, setLogged] = useState<Logged | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  // A challenge link that would replace a round in progress waits for the player's answer.
  const [pendingChallenge, setPendingChallenge] = useState<Challenge | null>(null);
  // The round's seed, for sets that draw a letter, words, or an opening line.
  const draws = useMemo(() => hasDraws(set), [set]);
  const [seed, setSeed] = useState<number | null>(null);
  const timeRule = set.bonus?.find((r) => r.type === "timeLimit");
  const timer = useClock(timeRule?.type === "timeLimit" ? timeRule.seconds : undefined);
  const { restore } = timer;

  // The saved draft loads with the engine, so nothing typed before then gets replaced.
  useEffect(() => {
    loadEngine()
      .then((loaded) => {
        const linked = parseChallenge(location.search);
        if (linked && !draws) delete linked.seed;
        const { draft, challenge, pending } = openRound(loadDraft(set.id), linked, (d) => workInProgress([d.text]));
        if (draft) {
          setText(draft.text);
          setCheckedText(draft.text);
          setIgnored(draft.ignored);
          if (draft.startedAt) restore(draft.startedAt);
        }
        if (draws) setSeed(draft?.seed ?? challenge?.seed ?? newSeed());
        setChallenge(challenge);
        setPendingChallenge(pending);
        setBest(getBest(set.id));
        setEngine(loaded);
      })
      .catch(() => setLoadFailed(true));
  }, [set.id, restore, draws]);

  useEffect(() => {
    const t = setTimeout(() => setCheckedText(text), CHECK_DELAY_MS);
    return () => clearTimeout(t);
  }, [text]);

  // This round's rules, with any draws made from the seed.
  const round = useMemo(() => (seed === null ? set : resolveRound(set, seed)), [set, seed]);
  const flags = useMemo(
    () => (engine ? engine.checkText(checkedText, round, timer.clock) : []),
    [engine, checkedText, round, timer.clock],
  );
  const notes = engine ? buildNotes(flags, ignored, round, engine.syllableRange) : [];
  const underlines = flags.flatMap((f) =>
    f.start !== undefined && f.end !== undefined && !(f.ignorable && ignored.includes(f.ignoreKey))
      ? [{ start: f.start, end: f.end }]
      : [],
  );
  const { score, band } = scoreText(checkedText, round, flags, ignored);

  function edit(value: string) {
    const started = timer.start();
    setText(value);
    setLogged(null);
    saveDraft(set.id, { text: value, ignored, startedAt: started ?? undefined, seed: seed ?? undefined });
  }

  function ignore(keys: string[]) {
    const next = [...ignored, ...keys.filter((k) => !ignored.includes(k))];
    setIgnored(next);
    saveDraft(set.id, { text, ignored: next, startedAt: timer.startedAt ?? undefined, seed: seed ?? undefined });
  }

  function log() {
    if (!engine) return;
    // Score the text and time as they are now, not as of the last pause in typing.
    const final = scoreText(text, round, engine.checkText(text, round, timer.elapsed()), ignored);
    const result = logScore(set.id, final.score);
    setBest(result.best);
    const share = buildShare({
      origin: location.origin,
      setId: set.id,
      mechanic: "Constraint",
      title: set.title,
      runs: constraintRuns(text),
      piece: text,
      score: final.score,
      ignoredFlags: final.ignoredFlags,
      seed: seed ?? undefined,
    });
    setLogged({ score: final.score, isNewPR: result.isNewPR, share });
    timer.stop();
    clearDraft(set.id);
  }

  // Discards the draft, its ignores, and the clock, and draws a new round (a
  // challenge replays its own). The best score stays.
  function startOver(nextChallenge = challenge) {
    clearDraft(set.id);
    setText("");
    setCheckedText("");
    setIgnored([]);
    setLogged(null);
    timer.stop();
    if (draws) setSeed(nextChallenge?.seed ?? newSeed());
  }

  function startChallenge() {
    setChallenge(pendingChallenge);
    setPendingChallenge(null);
    startOver(pendingChallenge);
  }

  // Keeps the round in progress and drops the challenge from the address, so
  // a refresh doesn't ask again.
  function keepRound() {
    setPendingChallenge(null);
    history.replaceState(null, "", location.pathname);
  }

  const header = (
    <SetHeader
      eyebrow={`Set ${number} of ${total} · Constraint`}
      mechanic="constraint"
      title={set.title}
      blurb={set.blurb}
      rules={round.rules}
      bonus={round.bonus}
      secondsLeft={timer.secondsLeft}
    />
  );

  if (pendingChallenge) {
    return (
      <>
        {header}
        <ChallengeConflict onStart={startChallenge} onKeep={keepRound} />
      </>
    );
  }

  return (
    <>
      {header}
      {challenge && <ChallengeBanner score={challenge.score} />}
      <DraftEditor
        value={text}
        onChange={edit}
        underlines={underlines}
        label={`Your draft for ${set.title}`}
        disabled={!engine}
      />
      {!engine && <EngineStatus loadFailed={loadFailed} />}
      <NoteCards notes={notes} ignoredCount={ignored.length} onIgnore={ignore} />
      <ScoreCard score={score} band={band} best={best} />
      <LogButton onLog={log} disabled={!engine || !text.trim()} logged={logged} best={best} />
      {logged && challenge && <ChallengeResult mine={logged.score} theirs={challenge.score} />}
      {logged && <ShareButton {...logged.share} />}
      {workInProgress([text]) && <StartOver onConfirm={() => startOver()} />}
    </>
  );
}
