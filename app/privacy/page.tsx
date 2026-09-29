import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { PageFrame } from "@/app/components/page-frame";
import { blackoutSets } from "@/content/blackout";
import { openingLines } from "@/content/constraint";

export const metadata: Metadata = { title: "Privacy and credits · Wriceps" };

// Read when the site is built; the page is static.
const notices = readFileSync(path.join(process.cwd(), "NOTICES.md"), "utf8");

export default function PrivacyPage() {
  return (
    <PageFrame backHref="/">
      <h1 className="font-display text-4xl leading-tight font-extrabold">Privacy and credits</h1>

      <section aria-labelledby="privacy" className="flex flex-col gap-2">
        <h2 id="privacy" className="font-display text-2xl font-extrabold">
          Privacy
        </h2>
        {/* DRAFT: Sid rewrites. Add what analytics count when PostHog is added. */}
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>No accounts. There&apos;s nothing to sign up for.</li>
          <li>Your writing stays on your device. It leaves only when you tap Share, and goes only where you send it.</li>
          <li>Challenge links carry the set, your score, and the round&apos;s random letter. Never your writing.</li>
          <li>
            Your scores and unfinished sets are saved in this browser. Clearing browser data clears them, and another
            phone or browser starts fresh.
          </li>
          <li>Wriceps sets no cookies and doesn&apos;t track you.</li>
        </ul>
      </section>

      <section aria-labelledby="credits" className="flex flex-col gap-2">
        <h2 id="credits" className="font-display text-2xl font-extrabold">
          Credits
        </h2>
        <h3 className="font-semibold">Blackout passages</h3>
        <p className="-mt-1 text-sm text-muted">Public domain, from Project Gutenberg.</p>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          {blackoutSets.map(({ id, source }) => (
            <li key={id}>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                <cite>{source.title}</cite>
              </a>
              , {source.author} ({source.year})
            </li>
          ))}
        </ul>
        <h3 className="mt-2 font-semibold">Opening lines</h3>
        <p className="-mt-1 text-sm text-muted">Public domain, from Project Gutenberg.</p>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          {openingLines.map(({ source }) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                <cite>{source.title}</cite>
              </a>
              , {source.author} ({source.year})
            </li>
          ))}
        </ul>
        <h3 className="mt-2 font-semibold">Word data and code</h3>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>Syllable counts: the CMU Pronouncing Dictionary, trimmed to common words using SCOWL.</li>
          <li>Word types: compromise. Syllable fallback: syllable.</li>
          <li>Typefaces: Fraunces and Inter, under the SIL Open Font License.</li>
        </ul>
        <details className="mt-2 rounded-2xl border border-border bg-surface p-4">
          <summary className="min-h-11 cursor-pointer content-center font-semibold">Show full notices</summary>
          <pre className="mt-3 text-xs leading-relaxed whitespace-pre-wrap">{notices}</pre>
        </details>
      </section>
    </PageFrame>
  );
}
