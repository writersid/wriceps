"use client";

import { useEffect, useRef } from "react";
import { howToPlay, scoringNotes, type Mechanic } from "@/content/how-to-play";

// "How to play" link that opens a bottom sheet over the current screen. The
// sheet only draws on top, so a draft underneath is never touched. Opening it
// adds a history entry at the same address (Next.js keeps its own state on
// it), so the phone's back button closes the sheet instead of leaving the
// page; the close button, a tap outside, and Esc go back the same way.
export function HowToPlaySheet({ mechanic }: { mechanic: Mechanic }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pushed = useRef(false);
  const info = howToPlay[mechanic];

  useEffect(() => {
    const onPop = () => {
      if (!pushed.current) return;
      pushed.current = false;
      dialog.current?.close();
    };
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);

  function open() {
    dialog.current?.showModal();
    history.pushState({ howToPlay: true }, "");
    pushed.current = true;
  }

  function close() {
    if (pushed.current) history.back(); // the popstate handler closes the sheet
    else dialog.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="min-h-11 shrink-0 px-1 text-sm font-medium text-muted underline underline-offset-4"
      >
        How to play
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={`how-to-play-${mechanic}`}
        onCancel={(e) => {
          e.preventDefault(); // Esc, or Android's back gesture in some browsers
          close();
        }}
        // A tap on the backdrop lands on the dialog itself, not its content.
        onClick={(e) => e.target === e.currentTarget && close()}
        className="mx-auto mt-auto mb-0 max-h-[85dvh] w-full max-w-lg rounded-t-3xl border border-border bg-surface p-0 text-ink backdrop:bg-black/50"
      >
        <div className="flex flex-col gap-4 p-5 pb-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-widest text-muted uppercase">How to play</p>
              <h2 id={`how-to-play-${mechanic}`} className="font-display text-3xl font-extrabold">
                {info.name}
              </h2>
            </div>
            <button type="button" onClick={close} className="grid size-11 shrink-0 place-items-center rounded-xl border border-border">
              <span className="sr-only">Close</span>
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-muted">{info.intro}</p>
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            {info.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <h3 className="font-display text-xl font-extrabold">Scoring</h3>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            {scoringNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
