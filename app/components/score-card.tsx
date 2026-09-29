import { BANDS, type Band } from "@/lib/engine/score";

const PLATE_HEIGHTS = ["h-8", "h-9", "h-11", "h-13"];

// The barbell meter loads one plate per band reached.
export function ScoreCard({ score, band, best }: { score: number; band: Band; best: number | null }) {
  const loaded = score > 0 ? BANDS.indexOf(band) + 1 : 0;

  return (
    <section aria-label="Score" className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-baseline gap-3">
          <span className="font-display text-5xl font-black">{score}</span>
          <span className="font-semibold">{band}</span>
        </p>
        {best !== null && (
          <span className="rounded-full bg-lime px-3 py-1 text-sm font-semibold text-charcoal">
            Your PR: {best}
          </span>
        )}
      </div>
      <div aria-hidden="true" className="mt-4 flex items-center gap-1.5">
        <div className="h-1 w-5 rounded-full bg-ink" />
        {PLATE_HEIGHTS.map((height, i) => (
          <div
            key={height}
            className={`w-5 rounded-md ${height} ${
              i < loaded ? "border-2 border-charcoal bg-lime" : "border border-dashed border-muted"
            }`}
          />
        ))}
        <div className="h-1 flex-1 rounded-full bg-ink" />
      </div>
      <ul className="mt-3 grid grid-cols-4 text-xs">
        {BANDS.map((b) => (
          <li key={b} className={b === band ? "font-semibold" : "text-muted"}>
            {b}
          </li>
        ))}
      </ul>
    </section>
  );
}
