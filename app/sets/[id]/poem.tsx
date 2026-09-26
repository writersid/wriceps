import { capitalizeFirst, startsSentence, type Part } from "@/lib/fill-in";

// The poem card: answers in bold, or inline inputs where `editable`. Echoes
// show the answer they repeat, or a gap until it's filled; `hideEchoes` keeps
// them a gap (pass-the-phone turns).
export function Poem({
  parts,
  answers,
  flaggedAnswers,
  editable,
  hideEchoes,
  onAnswer,
}: {
  parts: Part[];
  answers: string[];
  flaggedAnswers: Set<number>;
  editable: boolean;
  hideEchoes?: boolean;
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
        } else if (!value.trim() || (part.type === "echo" && hideEchoes)) {
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

export function AnswerInput({
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
