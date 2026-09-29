import Link from "next/link";
import { blackoutSets } from "@/content/blackout";
import { constraintSets } from "@/content/constraint";
import { fillInSets } from "@/content/fill-in";
import { howToPlay, type Mechanic } from "@/content/how-to-play";
import { BestBadge } from "./components/best-badge";
import { HowToPlaySheet } from "./components/how-to-play-sheet";
import { PageFrame } from "./components/page-frame";
import { SiteFooter } from "./components/site-footer";

const sections: { mechanic: Mechanic; sets: { id: string; title: string; blurb: string }[] }[] = [
  { mechanic: "constraint", sets: constraintSets },
  { mechanic: "fill-in", sets: fillInSets },
  { mechanic: "blackout", sets: blackoutSets },
];

export default function Home() {
  return (
    <PageFrame>
      <h1 className="font-display text-4xl leading-tight font-extrabold">Build your writing muscles.</h1>
      <p className="-mt-2 text-muted">Short, scored writing sets.</p>
      {sections.map(({ mechanic, sets }) => (
        <section key={mechanic} aria-labelledby={`section-${mechanic}`} className="mt-2 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <h2 id={`section-${mechanic}`} className="text-xs font-semibold tracking-widest text-violet uppercase">
              {howToPlay[mechanic].name}
            </h2>
            <HowToPlaySheet mechanic={mechanic} />
          </div>
          <p className="-mt-2 text-sm text-muted">{howToPlay[mechanic].intro}</p>
          <ul className="flex flex-col gap-2">
            {sets.map((set) => (
              <li key={set.id}>
                <Link href={`/sets/${set.id}`} className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4">
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-display text-xl font-extrabold">{set.title}</span>
                    <BestBadge setId={set.id} />
                  </span>
                  <span className="text-sm text-muted">{set.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {/* DRAFT wording. */}
      <p className="text-sm text-muted">Your progress lives in this browser. Clearing browser data clears it.</p>
      <SiteFooter />
    </PageFrame>
  );
}
