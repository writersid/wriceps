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

- **Current phase:** Phase 3 (App layer) done: all six parts built and passed Sid's Android phone tests. **Still pending: the iPhone checks for 5a and 5b** (Sid, together). Part 3 was split: 3a engine rules, 3b fill-in poems (solo), 3c pass-the-phone.
- **Phase 3 = the app layer (screens).** Wriceps has no server, so the skill's "Server / API layer" phase becomes the screens. Parts: (1) design foundation, (2) constraint-writing screen, (3) fill-in poems with pass-the-phone, (4) blackout poems, (5) result cards, sharing, and challenge links, (6) home screen and set list, privacy page with credits from NOTICES.md, and the note that clearing browser data clears progress. Part 6 also adds (Sid, after part 4; see SPEC.md "Help pages and footer"): a "How to play" page per mechanic, linked from every set near its title, and a home-page footer with a short muted line (wording from Sid) and links to Sid's GitHub, his X account, and the privacy and credits page.
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
- **Phase 3 part 3b (fill-in poems, solo) done.** Phone test passed on the Vercel preview (reported by Sid): all three sets, inline boxes at 360px, Next and Back, refresh keeping place and letter, echoes.
  - Content in `content/fill-in.ts`: 3 placeholder sets (open mode with a random letter; surprise mode with a time bonus; surprise mode with echoes). Template syntax `{label}`, `{label#name}`, `{=name}`, parsed by `lib/fill-in.ts`; `content/content.test.ts` checks every template parses and ids are unique across mechanics.
  - Rule `sameFirstLetter` (per line; in fill-ins, per answer): a set letter, the first answer's letter, or `random` drawn from the round's seed (`drawLetter`, mulberry32). The seed is saved in the draft for part 5's challenge links.
  - Rules run on the answers only, one per line (`answersText`); echoes are never checked.
  - Live score scaled by the share of blanks filled (`scaleByFilled`). Blanks and echoes that start a sentence are capitalized for display only (`startsSentence`, `capitalizeFirst`).
  - `app/sets/[id]/fill-in-screen.tsx`: open mode (inline inputs in the poem card) and surprise mode (one blank at a time, Back until logged, reveal). Logging needs every blank filled. Answers, step, seed, and clock survive a refresh (`loadFillInDraft`).
  - Shared by both screens: `app/components/set-parts.tsx` (header, note cards, log button), `use-clock.ts`, `load-engine.ts`.
- **Phase 3 part 3c (pass-the-phone) done.** Phone test passed (reported by Sid): pass-the-phone and Start over.
  - Rules in SPEC.md "Pass-the-phone details". Every fill-in set with at least two turn lines offers Solo and With a spotter on its first screen.
  - `lib/pass.ts`: `splitLines`, `turnLines` (only lines with blanks are turns; text-only and echo-only lines are revealed with the poem), `playerFor` (spotter second), `teaser` (last 3 words, echoes hidden), `turnFlags` (repeat notes don't name the other player's word).
  - `app/sets/[id]/pass-game.tsx`: handoff screen, turn screen (one line, inline boxes), line-by-line reveal, team score (not a PR), New game. No time bonus with a spotter.
  - Saved in the fill-in draft's `pass` field; a turn in progress reopens on its handoff screen after a refresh.
  - `Poem` and `AnswerInput` moved to `app/sets/[id]/poem.tsx`.
  - "Start over" (`StartOver` in `set-parts.tsx`, inline confirm) shows on every set with work in progress (`workInProgress` in `lib/progress.ts`): constraint drafts (clears text, ignores, clock; keeps the best score) and fill-in rounds, solo or with a spotter (returns to the Solo / With a spotter choice). Fixes resumed solo rounds hiding the choice (found by Sid on his phone).
- **Phase 3 part 4 (blackout poems) done.** Phone test passed (reported by Sid): all three sets, picks, blackout view, refresh, dark-mode paper page, Log, Start over. Passage length is fine, no fade while picking, touching outlines are fine. Spring Cleaning's task wasn't clear from its blurb, which led to the one-sentence blurb rule in SPEC.md "Content".
  - Rules in SPEC.md "Blackout details". Tap to keep (Sid's choice over tap to black out: fewer taps, and an untouched passage scores 0 with no scoring change). "Black out the rest" / "Back to picking" toggle.
  - The passage is always a paper page (`.paper` in `app/globals.css` resets the color tokens to light values): chalk, charcoal text and bars, deep coral underlines. Recorded in SPEC.md's design rules.
  - `lib/blackout.ts`: `passageWords`, `poemText` (kept words in passage order, single spaces, no punctuation), `keptWordAt` (flag position back to the passage word), `toggleKept`.
  - `app/sets/[id]/blackout-screen.tsx`; draft in `lib/progress.ts` (`BlackoutDraft`, `loadBlackoutDraft`). Punctuation right after a word stays on its line and joins its bar.
  - 3 placeholder sets in `content/blackout.ts` (Dickens, Melville, Grahame), each copied word for word from Project Gutenberg's plain text and checked against it, source recorded. `content/content.test.ts` allows only word count, required words, banned letters, syllables, no repeats, and a time bonus in blackout sets, and checks required words appear in the passage.
  - Some shared DRAFT tips read oddly for blackout ("Cut the weakest sentence").
- **Watch out:** in Windows PowerShell 5.1, `Get-Content`/`Set-Content` read and write the wrong encoding and corrupt characters like "·" and "…". Use the Edit tool, or `[IO.File]` with UTF-8 (no BOM).
- **Phase 3 part 5 plan (approved):** 5a result card and share (canvas card, always paper-light, 1080×1350; share message with the piece trimmed to about 60 words; share sheet with image, else text, else Download / Copy / Open WhatsApp; spotter games share the card with a plain set link). 5b challenge links (`?c=<score>`, plus `&seed=` for fill-ins; "beat 82" banner and comparison after logging). All share wording is DRAFT for Sid's rewrite. Analytics events wait for PostHog.
- **Testing on Vercel:** the deployment is protected (Vercel login), so only Sid can open it for now. 5b's test steps must account for this: Sid tests challenge links on his own devices, signing in to Vercel inside WhatsApp's in-app browser too. No friend can open a link until protection is turned off.
- **Phase 3 part 5a (result card and share) built:** `lib/share.ts` (card runs per mechanic, 60-word trim, DRAFT message, `buildShare`), `lib/card-layout.ts` (line wrapping, measurer passed in), `app/components/result-card.ts` (canvas drawing, about 250 ms), `app/components/share-button.tsx` (card drawn on appear so a tap shares at once; share sheet with image, else text, else Download / Copy / Open WhatsApp). `Logged` now carries the share built at logging. Rules in SPEC.md "Sharing details". Fraunces draws a hairline "4" at the card's 130px score size (its real large-size design); Sid to judge.
- **5a phone tests:** Android passed (reported by Sid): card clean and readable, caption and link arrived in WhatsApp. **iPhone test pending** (Sid, later). Desktop fix after Sid's test: Chrome on Windows opened the Windows share window, and WhatsApp desktop got the card without the caption. Now `shareRoute` in `lib/share.ts` sends desktops (main pointer not a finger, `pointer: coarse`) straight to the Download / Copy / Open WhatsApp panel, and phones copy the message to the clipboard in the same tap as sharing, with a DRAFT note "Message copied. Paste it if it doesn't come through."
- **5a rechecks passed** (reported by Sid): desktop shows the panel (Download, Copy, WhatsApp all work); Android shows "Message copied" and the caption still arrives; the spotter team card shares fine on Android. **iPhone checks for 5a and 5b are pending**; Sid will run them together after 5b.
- **Phase 3 part 5b (challenge links) built:** `challengeLink`, `parseChallenge`, `challengeResult` in `lib/share.ts` (tested); `buildShare` puts the challenge link in solo shares. `ChallengeBanner`, `ChallengeResult`, `ChallengeConflict` in `set-parts.tsx`. Fill-in: a challenge sets the seed and skips the mode choice; a saved round with another seed is dropped if empty, else the player chooses (Keep my set clears the link from the address). Rules in SPEC.md "Sharing details". Checked in headless Chrome: same letter on a second profile, comparison, conflict both ways, broken link, constraint banner.
- **5b Android tests passed** (reported by Sid): a challenge link opened from WhatsApp shows the banner and the same letter; the comparison appears after logging; a second device gets the same letter; the Start / Keep prompt works both ways, with no re-ask after a refresh; constraint and blackout challenges show the banner and comparison. **iPhone checks for 5a and 5b are still pending** (Sid, later, together).
- **Phase 3 part 6 built:** home screen grouped by mechanic (`app/page.tsx`, PR badges via `app/components/best-badge.tsx` with `useSyncExternalStore`), How to play as a bottom sheet (`app/components/how-to-play-sheet.tsx`, a `<dialog>` plus a same-address history entry so back closes it; text in `content/how-to-play.ts`), footer (`app/components/site-footer.tsx`), `/privacy` (privacy note, passage sources from `content/blackout.ts`, NOTICES.md read at build). Checked in headless Chrome: closing the sheet by back, close button, tap outside, and Esc keeps the draft and the `?c=` address with no reload, and one more back leaves the page. Rules in SPEC.md "Home, help, footer, and privacy".
- **Part 6 phone test passed** (reported by Sid): home sections, PR badges, How to play sheet (closes with back, tap outside, and ✕; drafts untouched, including on a challenge link), footer links, privacy page.
- **Launch content:** `CONTENT.md` (committed) holds the 31 launch sets (15 constraint, 10 fill-in, 6 blackout) and the engine changes they need. Built in two steps.
- **Content step 1 (engine) done.** Phone test passed (reported by Sid): drawn letter kept on refresh and redrawn by Start over, drawn opening line with words counted after it, long-sentence card with no Ignore, challenge links replaying draws with the Start / Keep prompt, Weather Report letters from the starting pool.
  - `lib/round.ts`: `newSeed`, `draw`, `resolveRound` (moved from `lib/fill-in.ts`), `hasDraws`, `everyDraw` (content tests), `openRound` (which round to play when a challenge link meets a saved draft, used by all three screens).
  - Draws in content: `bannedLetters.pool`, `requiredWords.options`, `firstSentence.options`; `sameFirstLetter.random` draws from B C D F G H L M P R S T W. Constraint and blackout drafts save `seed`; any set that draws puts it in challenge links.
  - Rule `sentenceLength` (strict, no Ignore: detection only errs toward shorter sentences). `wordCount.afterFirstSentence` counts only words after the required opening, in the checker and the score gate (`skippedWords` in `score.ts`).
  - Content test checks every draw option; blackout options must appear in the passage and banned letters must leave enough words. Not checked: a required word containing a banned letter (no launch set uses both).
  - Placeholders use draws for testing, plus a temporary `short-reps`; step 2 replaces them.
- **Mechanic label accent done.** Phone test passed (reported by Sid): home headings, set eyebrows (spotter note stays gray), How to play title, solo and team cards, both themes.
  - One violet token `--violet` in `app/globals.css`: #6A45C2 light (6.2:1), #B59CFF dark (7.4:1). Mechanic names as labels only (SPEC.md Design). Today's eyebrow style kept: small, spaced-out capitals, no small caps (Inter and Fraunces from Google have none).
  - `SetHeader` takes `position` ("Set 12 of 15") and an optional `note` ("With a spotter"), and reads the name from `content/how-to-play.ts`; only the name is violet. The result card always uses #6A45C2.
  - Known, left as is: at 360px the spotter eyebrow wraps to two lines beside "How to play" (it did before too).
- **Content step 2 (launch sets) done.** Phone test passed (reported by Sid): home order, Pick Up the Bar quote and skip, Gitanjali as a poem (page and card), draws on every drawing set, Tag Team with a spotter, privacy credits.
  - 31 sets in `content/` (15 constraint, 10 fill-in, 6 blackout), easy to hard, placeholders gone. Weights: main rules share 90, bonus 10 (SPEC "Content").
  - Passages and opening lines copied from Project Gutenberg and checked against it by script. Pride and Prejudice uses Gutenberg's wording (no comma after "fortune"); Bulwer-Lytton is the famous fragment. Call Me uses the 58-word opening and draws from world, money, purse, shore, sail.
  - A required opening typed as given is skipped by every other rule (`openingEnd` in `rules.ts`). Pick Up the Bar shows the drawn line once as a quote; chip "Opening: Austen"; note card only when the draft opens with something else.
  - Blackout `poem: true` keeps a passage's line breaks (Gitanjali 35).
  - Content test: every draw leaves enough usable blackout words after banned letters and syllable limits. Time limits of whole minutes read "Under 5 minutes".
  - Known and accepted: Morning Stretch, Echo Canyon, and Best of Times are easy to max (Sid keeps them as warm-ups).
- **Next step:** Sid rewrites all the copy in one session from `COPY.md` (every DRAFT string and the rest of the interface wording, with file locations; update it if copy moves). iPhone checks for 5a and 5b still pending.