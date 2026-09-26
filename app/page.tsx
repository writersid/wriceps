import Link from "next/link";
import { constraintSets } from "@/content/constraint";
import { fillInSets } from "@/content/fill-in";
import { PageFrame } from "./components/page-frame";

// Placeholder home until Phase 3 part 6 builds the real one.
export default function Home() {
  return (
    <PageFrame>
      <h1 className="font-display text-4xl font-extrabold leading-tight">
        Build your writing muscles.
      </h1>
      <p className="text-muted">Short, scored writing sets.</p>
      <ul className="flex flex-col gap-2">
        {[...constraintSets, ...fillInSets].map((set) => (
          <li key={set.id}>
            <Link
              href={`/sets/${set.id}`}
              className="block rounded-2xl border border-border bg-surface p-4 font-semibold"
            >
              {set.title}
            </Link>
          </li>
        ))}
      </ul>
    </PageFrame>
  );
}
