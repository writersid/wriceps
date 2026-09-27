"use client";

import { useEffect, useMemo, useState } from "react";
import type { Engine } from "@/app/components/load-engine";
import { ScoreCard } from "@/app/components/score-card";
import { NoteCards, SetHeader, StartOver } from "@/app/components/set-parts";
import { ShareButton } from "@/app/components/share-button";
import type { FillInSet } from "@/content/fill-in";
import { scoreText } from "@/lib/engine/score";
import { answerAt, answersText, resolveRound, type Part } from "@/lib/fill-in";
import { buildNotes } from "@/lib/notes";
import { blanksIn, joinLines, playerFor, splitLines, teaser, turnFlags, turnLines, type PassState } from "@/lib/pass";
import { saveDraft, type FillInDraft } from "@/lib/progress";
import { buildShare, fillInRuns, fillInText } from "@/lib/share";
import { Poem } from "./poem";

const CHECK_DELAY_MS = 150;

// Two players, one phone: a turn is a line with blanks; between turns a
// handoff screen; at the end the poem is revealed a line at a time, then a
// team score that isn't a PR. See SPEC.md "Pass-the-phone details".
export function PassGame({
  set,
  parts,
  engine,
  seed,
  initial,
  eyebrow,
  onStartOver,
}: {
  set: FillInSet;
  parts: Part[];
  engine: Engine;
  seed: number;
  initial: FillInDraft | null;
  eyebrow: string;
  onStartOver: () => void;
}) {
  const blankCount = parts.filter((p) => p.type === "blank").length;
  const [answers, setAnswers] = useState<string[]>(() => initial?.answers ?? Array(blankCount).fill(""));
  const [checkedAnswers, setCheckedAnswers] = useState(answers);
  const [ignored, setIgnored] = useState<string[]>(() => initial?.ignored ?? []);
  // A new game starts on turn 1 with no handoff: the first player is holding the phone.
  const [pass, setPass] = useState<PassState>(() => initial?.pass ?? { turn: 0, phase: "turn", shown: 0 });

  useEffect(() => {
    const t = setTimeout(() => setCheckedAnswers(answers), CHECK_DELAY_MS);
    return () => clearTimeout(t);
  }, [answers]);

  const lines = useMemo(() => splitLines(parts), [parts]);
  const turns = useMemo(() => turnLines(lines), [lines]);
  // No time bonus with a spotter: handing the phone over eats the clock.
  const round = useMemo(
    () => resolveRound({ ...set, bonus: set.bonus?.filter((r) => r.type !== "timeLimit") }, seed),
    [set, seed],
  );
  const text = answersText(checkedAnswers);
  const flags = useMemo(() => engine.checkText(text, round), [engine, text, round]);
  // The team's result card, rebuilt only when the poem or its ignores change.
  const teamShare = useMemo(() => {
    const { score, ignoredFlags } = scoreText(text, round, flags, ignored);
    return buildShare({
      origin: location.origin,
      setId: set.id,
      mechanic: "Fill-in",
      title: set.title,
      runs: fillInRuns(parts, checkedAnswers),
      piece: fillInText(parts, checkedAnswers),
      score,
      ignoredFlags,
      team: true,
    });
  }, [text, round, flags, ignored, set.id, set.title, parts, checkedAnswers]);
  const player = playerFor(pass.turn);
  const line = lines[turns[pass.turn]];
  const blanks = blanksIn(line);

  function save(next: { answers?: string[]; ignored?: string[]; pass?: PassState }) {
    saveDraft(set.id, {
      answers: next.answers ?? answers,
      ignored: next.ignored ?? ignored,
      seed,
      step: 0,
      pass: next.pass ?? pass,
    });
  }

  function move(next: PassState) {
    setPass(next);
    save({ pass: next });
  }

  function answer(index: number, value: string) {
    const next = answers.map((a, i) => (i === index ? value : a));
    setAnswers(next);
    save({ answers: next });
  }

  function ignore(keys: string[]) {
    const next = [...ignored, ...keys.filter((k) => !ignored.includes(k))];
    setIgnored(next);
    save({ ignored: next });
  }

  const header = (
    <SetHeader
      eyebrow={eyebrow}
      title={set.title}
      blurb={set.blurb}
      rules={round.rules}
      bonus={round.bonus}
      secondsLeft={null}
    />
  );

  if (pass.phase === "handoff") {
    return (
      <>
        {header}
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm text-muted">
            Turn {pass.turn + 1} of {turns.length}
          </p>
          <p className="font-display text-2xl font-extrabold">
            {player === "Spotter" ? "Pass the phone to your spotter." : "Pass the phone back."}
          </p>
          <p className="text-muted">No peeking. The screen stays blank until the next player is ready.</p>
          <button
            type="button"
            onClick={() => move({ ...pass, phase: "turn" })}
            className="min-h-12 rounded-full bg-ink font-semibold text-bg"
          >
            {player === "Spotter" ? "Spotter: I'm ready" : "I'm ready"}
          </button>
        </section>
        <StartOver onConfirm={onStartOver} />
      </>
    );
  }

  if (pass.phase === "turn") {
    const done = blanks.every((b) => answers[b].trim());
    const last = pass.turn === turns.length - 1;
    const visible = flags.filter((f) => !(f.ignorable && ignored.includes(f.ignoreKey)));
    const flaggedAnswers = new Set(
      visible.flatMap((f) => (f.start === undefined ? [] : [answerAt(checkedAnswers, f.start).index])),
    );
    const notes = buildNotes(turnFlags(flags, checkedAnswers, blanks), ignored, round, engine.syllableRange);
    return (
      <>
        {header}
        <p className="text-sm text-muted">
          Turn {pass.turn + 1} of {turns.length} · {player === "You" ? "Your line" : "Spotter's line"}
        </p>
        {pass.turn > 0 && (
          <p className="-mt-2 text-muted">
            The last line ended: <span className="font-semibold text-ink">{teaser(lines[turns[pass.turn - 1]], answers)}</span>
          </p>
        )}
        <Poem
          parts={line}
          answers={answers}
          flaggedAnswers={flaggedAnswers}
          editable
          hideEchoes
          onAnswer={answer}
        />
        <NoteCards notes={notes} ignoredCount={ignored.length} onIgnore={ignore} />
        <button
          type="button"
          onClick={() =>
            move(last ? { turn: pass.turn, phase: "reveal", shown: 1 } : { turn: pass.turn + 1, phase: "handoff", shown: 0 })
          }
          disabled={!done}
          className="min-h-12 rounded-full bg-ink font-display text-lg font-black text-bg disabled:opacity-60"
        >
          {last ? "Reveal the poem" : "Done. Pass the phone"}
        </button>
        {!done && <p className="-mt-2 text-center text-sm text-muted">Fill every blank on your line first.</p>}
        <StartOver onConfirm={onStartOver} />
      </>
    );
  }

  // The reveal, one line at a time, then the team score.
  const all = pass.shown >= lines.length;
  const { score, band } = scoreText(text, round, flags, ignored);
  const flaggedAnswers = new Set(
    flags
      .filter((f) => !(f.ignorable && ignored.includes(f.ignoreKey)))
      .flatMap((f) => (f.start === undefined ? [] : [answerAt(checkedAnswers, f.start).index])),
  );
  return (
    <>
      {header}
      <Poem
        parts={joinLines(lines.slice(0, pass.shown))}
        answers={answers}
        flaggedAnswers={all ? flaggedAnswers : new Set()}
        editable={false}
        onAnswer={answer}
      />
      {!all ? (
        <button
          type="button"
          onClick={() => move({ ...pass, shown: pass.shown + 1 })}
          className="min-h-12 rounded-full bg-ink font-display text-lg font-black text-bg"
        >
          Next line
        </button>
      ) : null}
      {!all && <StartOver onConfirm={onStartOver} />}
      {all && (
        <>
          <NoteCards
            notes={buildNotes(flags, ignored, round, engine.syllableRange)}
            ignoredCount={ignored.length}
            onIgnore={ignore}
          />
          <p className="font-display text-2xl font-extrabold">Team score</p>
          <ScoreCard score={score} band={band} best={null} />
          <p className="-mt-2 text-sm text-muted">Team scores don&apos;t count toward your PR.</p>
          <ShareButton {...teamShare} />
          <button
            type="button"
            onClick={onStartOver}
            className="min-h-12 rounded-full border border-border font-semibold"
          >
            New round
          </button>
        </>
      )}
    </>
  );
}
