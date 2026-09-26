@AGENTS.md

# Wriceps

Wriceps is a mobile-first web app of short, scored writing exercises with a Word Gym theme: exercises and prompts drawn from writing craft everywhere, plus original games, not tied to any one teacher or workshop. Its first users are an initial group of writers from writing communities, who mostly arrive from WhatsApp links on their phones. There are no accounts. Progress is saved in the browser (localStorage).

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
npm run language:eval    # rerun syllable, part-of-speech, and word-list accuracy, plus bundle sizes
```

## Status

- **Current phase:** 3 (App layer), part 3a (engine rules) done. Next: 3b. Part 3 is split: 3a engine rules, 3b fill-in poems (solo), 3c pass-the-phone.
- **Phase 3 = the app layer (screens).** Wriceps has no server, so the skill's "Server / API layer" phase becomes the screens. Parts: (1) design foundation, (2) constraint-writing screen, (3) fill-in poems with pass-the-phone, (4) blackout poems, (5) result cards, sharing, and challenge links, (6) home screen and set list, privacy page with credits from NOTICES.md, and the note that clearing browser data clears progress.
- **Phase 1 done:** create-next-app scaffold; SPEC.md and ROADMAP.md; this file; .gitignore allows `.env.example`; private GitHub repo `writersid/wriceps`.
- **Phase 2 done:**
  - Vitest 4.1.11 (`npm test`).
  - Test sets in `test-data/`, reviewed by Sid: 200 syllable words (CMU counts plus Sid's accepted double counts), a 100-word held-out syllable set (drafted by Claude, reviewed by Sid), and 100 sentences with adverbs and adjectives labeled grammatically. `test-data.test.ts` checks they are well formed.
  - Libraries chosen and pinned to exact versions: `compromise` 14.17.0 (import `compromise/two`) for adverbs and adjectives, `syllable` 5.0.1 as the syllable fallback. The rest were evaluated and removed.
  - Syllable exceptions list `lib/language/syllable-exceptions.json`: CMU counts for SCOWL level-60 words that `syllable` gets wrong (45,908 words covered). Since part 3a it also stores every word with more than one valid count as a range ("2-3"): 3,869 stored, 13.9 KB gzipped.
  - Results: syllables 100% on the main set and on the held-out set; adverb and adjective rule with both allowlists at precision 94.9%, recall 96.5% (literal SPEC reading); note names the right category 94.6% of the time.
  - SPEC.md records the rule details, both allowlists, the scoring model, and the evaluation criteria. NOTICES.md holds the CMU, SCOWL, and MIT notices.
  - Rule engine in `lib/engine/` (pure TypeScript, no UI), 101 Vitest tests: `tokenize.ts`, `rules.ts` (all seven rules), `language.ts` (the only file that loads compromise and the syllable list), `check.ts` (runs an exercise's rules), `score.ts` (score, band, ignored-flag count). Allowlists in `lib/language/allowlists.ts`, also imported by `evaluate-pos.mjs`. `accuracy.test.ts` enforces the SPEC accuracy thresholds.
  - Scoring decisions recorded in SPEC.md: cost per violation (fixed-maximum split, else a third, per-exercise override), 2 free ignores on language-rule flags only, no doubtful adverb or adjective flags in v1, exact word counts vs the min/max gate. Content rule: exact counts only for six-word story, half-dribble, dribble, drabble, and word-list games.
- **Phase 3 part 1 done (design foundation):**
  - Tokens in `app/globals.css` (`bg`, `surface`, `border`, `ink`, `muted`, `coral`, `lime`, `charcoal`) with the SPEC usage rules as comments. `coral` is deep coral in light mode and coral in dark mode, for text and violation underlines. Every text pair meets 4.5:1.
  - Fraunces (with the optical-size axis, `font-display`) and Inter (`font-sans`) via `next/font/google`.
  - Theme: a head script in `app/layout.tsx` sets `data-theme` before paint from localStorage `wriceps-theme`, else the device setting. Two-state toggle in `app/components/theme-toggle.tsx`; `dark:` utilities follow `data-theme`.
  - `app/components/page-frame.tsx`: optional back link, wordmark, toggle, 512px column with 16px padding. `app/page.tsx` is a placeholder home.
  - Mockups in `design/`.
- **Constraint for later phases:** load compromise and the syllable list only when a constraint exercise opens, not on app load: dynamically import `lib/engine/check.ts`; `score.ts` and `tokenize.ts` stay light.
- **Known:** `npm run language:eval` prints a harmless Node MODULE_TYPELESS_PACKAGE_JSON warning; Sid chose to leave it.
- **Deferred:** create `.env.example` when PostHog is added (confirm its variable names from PostHog's current docs). Credits line on the privacy page linking to NOTICES.md (part 6).
- **Phase 3 part 2 (constraint-writing screen):** `app/sets/[id]/` (static pages, unknown ids 404), `app/components/draft-editor.tsx`, `app/components/score-card.tsx`, `lib/notes.ts` (cards, chip labels, DRAFT tips), `lib/progress.ts` (best scores and drafts), 4 placeholder sets in `content/constraint.ts`. Decisions: mirror-layer underlines behind a textarea; content in `content/constraint.ts`; one note card per word ("Ignore (uses 2)" when it costs more than one); three rotating draft tips per rule for Sid to rewrite; draft saved in localStorage and cleared on "Log this set"; logging only saves the score and shows "Logged" or "New PR" until part 5.
- **Part 2 real-phone check passed** (reported by Sid, on a Vercel preview deploy): underlines instant, plates load per band, keyboard never covered the line being typed.
- **Phase 3 part 3a (engine rules) done.** Phone test passed on the Vercel preview (reported by Sid): repeat flags (form with Ignore, identical without), syllable flags, countdown survives a refresh, bonus drops at 60 seconds, typing feels instant.
  - Fixed a Phase 2 bug: the syllable list stored only words `syllable` gets wrong, so words like family (2 or 3) used the higher guess and were wrongly flagged under max 2. `syllableRange` now gives lowest and highest counts.
  - Rule `syllables` (replaces `maxSyllables`) with `min`/`max`; hyphen rules per SPEC.
  - Rule `noRepeats`: identical words strict; other forms matched by compromise root plus verb conjugations (verbs only match verbs), ignorable. Known tagger error: "Turn left, then leave." reads left as leave.
  - Rule `timeLimit` (bonus only, enforced by `content/constraint.test.ts`): clock from first keystroke, saved in the draft, countdown chip on the screen.
  - `Exercise.wordList`: the no-adjectives rule skips `EITHER_WORDS` in `lib/language/allowlists.ts` (about 125 words, reviewed by Sid).
  - `lib/engine/word-lists.test.ts` measures the word-list sets, and runs in `npm run language:eval`: repeats 100%/100% on lists and sentences; adjectives on lists precision 100%, recall 97.6%, "either" words flagged 0/23. Thresholds in SPEC.md: 90% precision, 85% recall. The time-limit clock's saved start time and bonus loss are unit-tested in `lib/progress.test.ts`.
  - Two-Syllable Sprint is now the word-list game (exact 20, exactly 2 syllables, no adjectives, no repeats; bonus under 60 seconds).
  - Speed: `checkText` on 150 words with all text rules takes about 11 ms on desktop.
- **Next step:** plan part 3b (fill-in poems, solo). Sid rewrites the DRAFT tips in `lib/notes.ts` when ready.