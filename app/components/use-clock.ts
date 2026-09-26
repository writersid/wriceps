"use client";

import { useCallback, useEffect, useState } from "react";

// The time-limit bonus clock: starts at the first keystroke, ticks once a
// second while running, and stops when the set is logged. `clock` is what the
// rules get: undefined before the start, then 0, then Infinity once time is
// up, so the draft is rechecked once at the limit, not every second.
export function useClock(seconds: number | undefined) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const running = seconds !== undefined && startedAt !== null;
  // Stable, so screens can call it from their load effect.
  const restore = useCallback((t: number) => {
    setStartedAt(t);
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);

  const secondsLeft =
    seconds !== undefined && startedAt !== null ? Math.max(0, seconds - Math.floor((now - startedAt) / 1000)) : null;
  const timeUp = secondsLeft === 0;

  return {
    startedAt,
    secondsLeft,
    timeUp,
    clock: startedAt === null ? undefined : timeUp ? Infinity : 0,
    // Starts the clock if the set has a time limit and it isn't running yet.
    // Returns the start time to save with the draft.
    start(): number | null {
      if (seconds === undefined || startedAt !== null) return startedAt;
      const t = Date.now();
      setStartedAt(t);
      setNow(t);
      return t;
    },
    restore,
    // Time taken so far, for scoring at "Log this set".
    elapsed: () => (startedAt === null ? undefined : Date.now() - startedAt),
    stop: () => setStartedAt(null),
  };
}

// "0:42 left" or "time's up", for the bonus chip.
export function clockText(secondsLeft: number): string {
  if (secondsLeft === 0) return "time's up";
  return `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")} left`;
}
