"use client";

import { useRef } from "react";

type Range = { start: number; end: number };

// A plain textarea over an invisible copy of its text. The copy's letters are
// transparent but its underlines show, so flagged words look underlined while
// typing stays native. Both layers must share SHARED so the words line up.
const SHARED = "px-4 py-3.5 text-base leading-7 whitespace-pre-wrap break-words";

export function DraftEditor({
  value,
  onChange,
  underlines,
  label,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  underlines: Range[];
  label: string;
  disabled?: boolean;
}) {
  const mirror = useRef<HTMLDivElement>(null);

  return (
    <div className="relative h-56 overflow-hidden rounded-2xl border border-border bg-surface focus-within:border-ink">
      <div
        ref={mirror}
        aria-hidden="true"
        className={`${SHARED} pointer-events-none absolute inset-0 overflow-hidden text-transparent`}
      >
        {segments(value, underlines).map((s, i) =>
          s.flagged ? (
            <span
              key={i}
              className="underline decoration-coral decoration-wavy decoration-[1.5px] underline-offset-4"
            >
              {s.text}
            </span>
          ) : (
            s.text
          ),
        )}
        {/* Keeps a trailing line break as tall as the textarea's. */}
        {"​"}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => {
          if (mirror.current) mirror.current.scrollTop = e.currentTarget.scrollTop;
        }}
        aria-label={label}
        disabled={disabled}
        placeholder="Start your rep here."
        className={`${SHARED} relative block size-full resize-none bg-transparent outline-none [scrollbar-width:none] placeholder:text-muted`}
      />
    </div>
  );
}

// Splits the text into plain and underlined pieces. Overlapping ranges, such
// as one word flagged by two rules, merge into one underline.
function segments(text: string, ranges: Range[]) {
  const merged: Range[] = [];
  for (const r of [...ranges].sort((a, b) => a.start - b.start)) {
    const last = merged.at(-1);
    if (last && r.start <= last.end) last.end = Math.max(last.end, r.end);
    else merged.push({ ...r });
  }
  const out: { text: string; flagged: boolean }[] = [];
  let at = 0;
  for (const r of merged) {
    if (r.start > at) out.push({ text: text.slice(at, r.start), flagged: false });
    out.push({ text: text.slice(r.start, r.end), flagged: true });
    at = r.end;
  }
  if (at < text.length) out.push({ text: text.slice(at), flagged: false });
  return out;
}
