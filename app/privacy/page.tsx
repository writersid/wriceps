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
        {/* Must name everything lib/analytics.ts lets out (keepOnly). */}
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>No accounts. There&apos;s nothing to sign up for.</li>
          <li>Your writing stays on your device. It leaves only when you tap Share, and goes only where you send it.</li>
          <li>
            Challenge links carry the set, your score, and the round&apos;s draw, such as a letter or a word. Never your
            writing.
          </li>
          <li>
            Your scores and unfinished sets are saved in this browser. Clearing browser data clears them, and another
            phone or browser starts fresh.
          </li>
          <li>Wriceps sets no cookies and stores nothing on your device to recognize you.</li>
          <li>
            Wriceps counts five moments: starting a set, logging it, sharing it, opening a challenge link, and
            finishing a challenge. It never sends your writing.
          </li>
          <li>
            Each count includes the set, your score, the score to beat, solo or with a spotter, and how you shared. It
            also includes your device type (phone, tablet, or computer), your browser and system (such as Chrome on
            Android), the site that linked you here (such as reddit.com, never the full address), the time, and
            technical details PostHog needs, like this site&apos;s address and a random ID for each count.
          </li>
          <li>
            Counts go to PostHog, an analytics service, on its servers in the EU. To tell visitors apart without
            cookies, PostHog turns your IP address and browser details into a code that changes every day, then
            deletes them. PostHog groups counts from the same visit using that daily code. It doesn&apos;t look up
            your location.
          </li>
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
