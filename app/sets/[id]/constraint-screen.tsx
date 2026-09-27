"use client";

import { useEffect, useMemo, useState } from "react";
import { DraftEditor } from "@/app/components/draft-editor";
import { loadEngine, type Engine } from "@/app/components/load-engine";
import { ScoreCard } from "@/app/components/score-card";
import {
  ChallengeBanner,
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
  const timeRule = set.bonus?.find((r) => r.type === "timeLimit");
  const timer = useClock(timeRule?.type === "timeLimit" ? timeRule.seconds : undefined);
  const { restore } = timer;

  // The saved draft loads with the engine, so nothing typed before then gets replaced.
  useEffect(() => {
    loadEngine()
      .then((loaded) => {
        const draft = loadDraft(set.id);
        if (draft) {
          setText(draft.text);
          setCheckedText(draft.text);
          setIgnored(draft.ignored);
          if (draft.startedAt) restore(draft.startedAt);
        }
        setChallenge(parseChallenge(location.search));
        setBest(getBest(set.id));
        setEngine(loaded);
      })
      .catch(() => setLoadFailed(true));
  }, [set.id, restore]);

  useEffect(() => {
    const t = setTimeout(() => setCheckedText(text), CHECK_DELAY_MS);
    return () => clearTimeout(t);
  }, [text]);

  const flags = useMemo(
    () => (engine ? engine.checkText(checkedText, set, timer.clock) : []),
    [engine, checkedText, set, timer.clock],
  );
  const notes = engine ? buildNotes(flags, ignored, set, engine.syllableRange) : [];
  const underlines = flags.flatMap((f) =>
    f.start !== undefined && f.end !== undefined && !(f.ignorable && ignored.includes(f.ignoreKey))
      ? [{ start: f.start, end: f.end }]
      : [],
  );
  const { score, band } = scoreText(checkedText, set, flags, ignored);

  function edit(value: string) {
    const started = timer.start();
    setText(value);
    setLogged(null);
    saveDraft(set.id, { text: value, ignored, startedAt: started ?? undefined });
  }

  function ignore(keys: string[]) {
    const next = [...ignored, ...keys.filter((k) => !ignored.includes(k))];
    setIgnored(next);
    saveDraft(set.id, { text, ignored: next, startedAt: timer.startedAt ?? undefined });
  }

  function log() {
    if (!engine) return;
    // Score the text and time as they are now, not as of the last pause in typing.
    const final = scoreText(text, set, engine.checkText(text, set, timer.elapsed()), ignored);
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
    });
    setLogged({ score: final.score, isNewPR: result.isNewPR, share });
    timer.stop();
    clearDraft(set.id);
  }

  // Discards the draft, its ignores, and the clock. The best score stays.
  function startOver() {
    clearDraft(set.id);
    setText("");
    setCheckedText("");
    setIgnored([]);
    setLogged(null);
    timer.stop();
  }

  return (
    <>
      <SetHeader
        eyebrow={`Set ${number} of ${total} · Constraint`}
        title={set.title}
        blurb={set.blurb}
        rules={set.rules}
        bonus={set.bonus}
        secondsLeft={timer.secondsLeft}
      />
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
      {workInProgress([text]) && <StartOver onConfirm={startOver} />}
    </>
  );
}
