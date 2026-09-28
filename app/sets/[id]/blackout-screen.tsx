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
import type { BlackoutSet } from "@/content/blackout";
import { keptWordAt, passageWords, poemText, toggleKept } from "@/lib/blackout";
import { scoreText } from "@/lib/engine/score";
import { buildNotes } from "@/lib/notes";
import { blackoutRuns, buildShare, parseChallenge, type Challenge } from "@/lib/share";
import { clearDraft, getBest, loadBlackoutDraft, logScore, saveDraft } from "@/lib/progress";
import { hasDraws, newSeed, openRound, resolveRound } from "@/lib/round";

const UNDERLINE = "underline decoration-coral decoration-wavy decoration-[1.5px] underline-offset-4";

export function BlackoutScreen({ set, number, total }: { set: BlackoutSet; number: number; total: number }) {
  const words = useMemo(() => passageWords(set.passage), [set.passage]);
  const [kept, setKept] = useState<number[]>([]);
  const [blackedOut, setBlackedOut] = useState(false);
  const [ignored, setIgnored] = useState<string[]>([]);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const [logged, setLogged] = useState<Logged | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  // A challenge link that would replace a round in progress waits for the player's answer.
  const [pendingChallenge, setPendingChallenge] = useState<Challenge | null>(null);
  // The round's seed, for sets that draw a banned letter or a required word.
  const draws = useMemo(() => hasDraws(set), [set]);
  const [seed, setSeed] = useState<number | null>(null);
  const timeRule = set.bonus?.find((r) => r.type === "timeLimit");
  const timer = useClock(timeRule?.type === "timeLimit" ? timeRule.seconds : undefined);
  const { restore } = timer;

  // The saved round loads with the engine, so no tap before then gets replaced.
  useEffect(() => {
    loadEngine()
      .then((loaded) => {
        const linked = parseChallenge(location.search);
        if (linked && !draws) delete linked.seed;
        const saved = loadBlackoutDraft(set.id, words.length);
        const { draft, challenge, pending } = openRound(saved, linked, (d) => d.kept.length > 0);
        if (draft) {
          setKept(draft.kept);
          setIgnored(draft.ignored);
          setBlackedOut(draft.blackedOut);
          if (draft.startedAt) restore(draft.startedAt);
        }
        if (draws) setSeed(draft?.seed ?? challenge?.seed ?? newSeed());
        setChallenge(challenge);
        setPendingChallenge(pending);
        setBest(getBest(set.id));
        setEngine(loaded);
      })
      .catch(() => setLoadFailed(true));
  }, [set.id, words.length, restore, draws]);

  const text = poemText(words, kept);
  // This round's rules, with any draws made from the seed.
  const round = useMemo(() => (seed === null ? set : resolveRound(set, seed)), [set, seed]);
  const flags = useMemo(() => (engine ? engine.checkText(text, round, timer.clock) : []), [engine, text, round, timer.clock]);
  const flagged = new Set(
    flags.flatMap((f) =>
      f.start === undefined || (f.ignorable && ignored.includes(f.ignoreKey)) ? [] : [keptWordAt(words, kept, f.start)],
    ),
  );
  const notes = engine ? buildNotes(flags, ignored, round, engine.syllableRange) : [];
  const { score, band } = scoreText(text, round, flags, ignored);

  function save(next: { kept?: number[]; ignored?: string[]; blackedOut?: boolean; startedAt?: number | null }) {
    const startedAt = next.startedAt !== undefined ? next.startedAt : timer.startedAt;
    saveDraft(set.id, {
      kept: next.kept ?? kept,
      ignored: next.ignored ?? ignored,
      blackedOut: next.blackedOut ?? blackedOut,
      startedAt: startedAt ?? undefined,
      seed: seed ?? undefined,
    });
  }

  function tap(index: number) {
    const started = timer.start();
    const next = toggleKept(kept, index);
    setKept(next);
    setLogged(null);
    save({ kept: next, startedAt: started });
  }

  function ignore(keys: string[]) {
    const next = [...ignored, ...keys.filter((k) => !ignored.includes(k))];
    setIgnored(next);
    save({ ignored: next });
  }

  function showBlackedOut(on: boolean) {
    setBlackedOut(on);
    save({ blackedOut: on });
  }

  function log() {
    if (!engine) return;
    // Score the time as it is now, not as of the last tap.
    const final = scoreText(text, round, engine.checkText(text, round, timer.elapsed()), ignored);
    const result = logScore(set.id, final.score);
    setBest(result.best);
    const share = buildShare({
      origin: location.origin,
      setId: set.id,
      mechanic: "Blackout",
      title: set.title,
      runs: blackoutRuns(set.passage, words, kept),
      piece: text,
      score: final.score,
      ignoredFlags: final.ignoredFlags,
      seed: seed ?? undefined,
    });
    setLogged({ score: final.score, isNewPR: result.isNewPR, share });
    timer.stop();
    clearDraft(set.id);
  }

  // Discards the picks, ignores, and clock, and draws a new round (a challenge
  // replays its own). The best score stays.
  function startOver(nextChallenge = challenge) {
    clearDraft(set.id);
    setKept([]);
    setIgnored([]);
    setBlackedOut(false);
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

  const bar = (text: string, key?: number) => (
    <span key={key} aria-hidden className="rounded-sm bg-ink px-0.5 text-transparent select-none">
      {text}
    </span>
  );
  // Between words: spaces stay; in the blacked-out view, punctuation goes black too.
  const gap = (between: string) =>
    blackedOut ? between.split(/(\s+)/).map((chunk, i) => (/\S/.test(chunk) ? bar(chunk, i) : chunk)) : between;

  const header = (
    <SetHeader
      eyebrow={`Set ${number} of ${total} · Blackout`}
      mechanic="blackout"
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
      <section
        aria-label={blackedOut ? "Your blackout page" : "The passage. Tap words to keep them."}
        className="paper rounded-2xl border border-border p-4 text-lg leading-11"
      >
        {gap(set.passage.slice(0, words[0]?.start ?? 0))}
        {words.map((word, i) => {
          const isKept = kept.includes(i);
          const underline = flagged.has(i) ? UNDERLINE : "";
          // Punctuation right after the word ("times,") stays on its line, and
          // joins its bar when blacked out.
          const between = set.passage.slice(word.end, words[i + 1]?.start ?? set.passage.length);
          const attached = /^\S*/.exec(between)![0];
          let shown;
          if (!blackedOut) {
            // An outline takes no space, so keeping a word doesn't move the others.
            shown = (
              <>
                <button type="button" aria-pressed={isKept} disabled={!engine} onClick={() => tap(i)}>
                  <span className={isKept ? `rounded-sm outline-2 outline-offset-2 outline-ink ${underline}` : undefined}>
                    {word.text}
                  </span>
                </button>
                {attached}
              </>
            );
          } else if (isKept) {
            shown = (
              <>
                <span className={`font-semibold ${underline}`}>{word.text}</span>
                {attached && bar(attached)}
              </>
            );
          } else {
            shown = bar(word.text + attached);
          }
          return (
            <span key={i}>
              <span className="whitespace-nowrap">{shown}</span>
              {gap(between.slice(attached.length))}
            </span>
          );
        })}
      </section>
      <p className="-mt-2 text-sm text-muted">
        From <cite>{set.source.title}</cite>, {set.source.author} ({set.source.year}).
      </p>
      {!engine && <EngineStatus loadFailed={loadFailed} />}
      <section aria-label="Your poem" className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm text-muted">Your poem</p>
        <p className="text-lg">{text || <span className="text-muted">Tap words in the passage to keep them.</span>}</p>
      </section>
      <button
        type="button"
        onClick={() => showBlackedOut(!blackedOut)}
        disabled={kept.length === 0}
        className="min-h-11 rounded-full border border-border font-semibold disabled:opacity-60"
      >
        {blackedOut ? "Back to picking" : "Black out the rest"}
      </button>
      <NoteCards notes={notes} ignoredCount={ignored.length} onIgnore={ignore} />
      <ScoreCard score={score} band={band} best={best} />
      <LogButton onLog={log} disabled={!engine || kept.length === 0} logged={logged} best={best} />
      {logged && challenge && <ChallengeResult mine={logged.score} theirs={challenge.score} />}
      {logged && <ShareButton {...logged.share} />}
      {kept.length > 0 && <StartOver onConfirm={() => startOver()} />}
    </>
  );
}
