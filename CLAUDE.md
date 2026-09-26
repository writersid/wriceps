@AGENTS.md

# Wriceps

Wriceps is a mobile-first web app of short, scored writing exercises with a Word Gym theme. It is built for Amit Varma's Art of Clear Writing community, whose members mostly arrive from WhatsApp links on their phones. There are no accounts. Progress is saved in the browser (localStorage).

- `SPEC.md`: the approved v1 spec. Change it only with Sid's approval.
- `ROADMAP.md`: everything deliberately kept out of v1.

## Stack

- Next.js (App Router), TypeScript, ESLint, Tailwind CSS
- No database or auth in v1
- Hosting: Vercel Hobby
- Analytics: PostHog Cloud free tier, cookieless
- Tests: Vitest for the rule engine, plus a manual checklist on real phones
- Error tracking: Sentry free tier, added at deployment

## Commands

```powershell
npm run dev     # http://localhost:3000
npm run lint
npm run build
npm test                 # Vitest
npm run language:build   # regenerate lib/language/syllable-exceptions.json
npm run language:eval    # rerun syllable and part-of-speech accuracy, plus bundle sizes
```

## Status

- **Current phase:** 2 (Core logic), about half done.
- **Phase 1 done:** create-next-app scaffold; SPEC.md and ROADMAP.md; this file; .gitignore allows `.env.example`; private GitHub repo `writersid/wriceps`.
- **Phase 2 done:**
  - Vitest 4.1.11 (`npm test`).
  - Test sets in `test-data/`, reviewed by Sid: 200 syllable words (CMU counts plus Sid's accepted double counts), a 100-word held-out syllable set (drafted by Claude, reviewed by Sid), and 100 sentences with adverbs and adjectives labeled grammatically. `test-data.test.ts` checks they are well formed.
  - Libraries chosen and pinned to exact versions: `compromise` 14.17.0 (import `compromise/two`) for adverbs and adjectives, `syllable` 5.0.1 as the syllable fallback. The rest were evaluated and removed.
  - Syllable exceptions list `lib/language/syllable-exceptions.json`: CMU counts for SCOWL level-60 words that `syllable` gets wrong (45,908 words covered, 3,013 stored, 10.9 KB gzipped).
  - Results: syllables 100% on the main set and on the held-out set; adverb and adjective rule with both allowlists at precision 94.9%, recall 96.5% (literal SPEC reading); note names the right category 94.6% of the time.
  - SPEC.md records the rule details, both allowlists, the scoring model, and the evaluation criteria. NOTICES.md holds the CMU, SCOWL, and MIT notices.
- **Phase 2 left:**
  - Rule engine in `lib/` (pure TypeScript, no UI): word count (exact, min, max), max syllables, no adverbs, no adjectives, banned letters, required words, required first sentence, all following SPEC.md "Rule details". Flags carry their position and a sure or doubtful level. The allowlists move into the engine, and `scripts/language/evaluate-pos.mjs` imports them from there.
  - Scoring: rule weights, graded per-violation cost capped at each rule's weight, ignored and doubtful flags free, bonus rules, total capped at 100, word-count gating, and the four bands.
  - Vitest tests for every rule, the band cutoffs, determinism, and awkward inputs (empty text, emoji, curly quotes, dashes), plus the SPEC accuracy thresholds as tests.
  - Delete `node_modules/.cache/wriceps-eval` (Sid approved keeping it until the end of Phase 2).
- **Constraint for later phases:** load compromise and the syllable list only when a constraint exercise opens, not on app load.
- **Deferred:** create `.env.example` when PostHog is added (confirm its variable names from PostHog's current docs). Credits line on the privacy page linking to NOTICES.md.
- **Next step:** propose the rule engine's types and file layout to Sid, then build the text tokenizer and the word-count rule with its Vitest tests, and confirm with Sid before the next rule.
