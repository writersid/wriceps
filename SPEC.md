# Wriceps v1 spec

Wriceps: build your writing muscles. A web app of short, fun writing exercises that sharpen writing skills: a gym of exercises and prompts drawn from writing craft everywhere, plus original games. It is not tied to any one teacher or workshop.

Status: approved by Sid on 2026-09-26, revised 2026-09-27 and 2026-09-28. Change this file only with Sid's approval.

## Goal and success

A fun, well-built web app that Sid is proud to put his name on, shared with an initial group of writers from writing communities. Success for v1 means it is live on a public URL, shared with those writers, and people play it. Growth is not a v1 goal. Anything beyond v1 lives in ROADMAP.md.

## First users

An initial group of writers from writing communities, mostly arriving from WhatsApp links on their phones.

## Platform

- Mobile-first web app that also works on desktop. English only, US spelling.
- No accounts. Progress and scores are saved in the browser (localStorage). The app tells people that clearing browser data clears their progress.
- Light and dark mode, with a toggle. Default follows the device setting.

## The three mechanics

### 1. Fill-in poems
Templates with labeled blanks (noun, verb, adjective, question). The finished poem is shown as a card.
Each set fills in one of two ways:
- Open: the poem is shown with its blanks inline, so the player picks words that fit.
- Surprise: one blank at a time, showing only its label; the poem stays hidden until the end. A Back button lets the player change earlier answers until the set is logged.

Blank labels are prompts only: the app does not check that a noun blank got a noun. Echo blanks repeat an earlier answer (for example, the words from line 2) and are filled in automatically; echoed words are not checked by the rules.
When the poem is shown, a blank or echo that starts a sentence (at the start of the poem or a line, or after . ! or ? and a space) is displayed with a capital first letter. The rules still check the answer as typed.
While blanks are still empty, the live score is scaled by the share of blanks filled. "Log this set" needs every blank filled.
Rules run on the player's answers only, not on the template text, using the constraint-writing rule engine plus one fill-in rule: every answer starts with the same letter. The letter is set by the exercise, is any letter the answers share, or is drawn at random for the round from a seed, so a challenge link replays the same letter.
Modes: solo, and pass-the-phone for 2 players. In pass-the-phone, players take turns on one device; the app hides everything except the last few words of the previous turn, then reveals the full piece in order at the end. A page refresh mid-game must not lose turns.

Pass-the-phone details (decided in Phase 3):
- Every fill-in set offers Solo and With a spotter.
- A turn is one line of the poem that has blanks to fill. A line with none (template text only, or echoes only) isn't a turn; it's revealed with the poem. Turns alternate between You and Spotter over the lines with blanks; the spotter takes turn 2.
- Between turns, a handoff screen asks the next player to tap when ready. Each turn shows only the last 3 words of the previous turn. Echoes stay hidden until the reveal, and notes never name the other player's words before it (a repeat reads "used earlier in the poem").
- There is no going back into a finished turn; Back works within your own turn. After a refresh, the game returns to the handoff screen for the current turn.
- The poem is revealed one line at a time, then a shared team score. It doesn't count as a PR.
- The time bonus is off with a spotter.

### 2. Constraint writing
One rule engine. Each exercise is a combination of these rules:
- word count: exact, minimum, or maximum
- syllables per word: a maximum, a minimum, or both
- banned word types: adverbs, adjectives
- banned letters
- required words
- required first sentence
- no repeated words (only in exercises that include it)
- time limit (bonus rules only)

Violations are highlighted live as the user types (coral wavy underline plus a note card below the draft). Doubtful flags are shown but never block the user. Flags from the language rules (no adverbs, no adjectives, syllables per word) have an Ignore button, since the checker can be wrong on those. Flags from word count, banned letters, required words, and required first sentence have none, since those checks are exact. No repeated words has an Ignore button only on repeats matched by root form, since that match is the checker's guess (see Rule details). This mechanic covers general craft exercises (such as cutting adverbs and adjectives), six-word stories, drabbles (100 words), dribbles (50 words), lipograms, opening-line exercises, and original word-list games.

Rule details (decided in Phase 2):
- Word count: contractions ("don't"), hyphenated words ("well-known"), and numbers ("2026") count as one word each. Words joined by a dash with no spaces ("yes—no", "yes–no", "yes--no") count as two words.
- Banned letters and required words ignore case. A required word must match exactly: "rivers" does not satisfy "river".
- Required first sentence ignores case, curly versus straight quotes, and extra spaces.
- Syllables per word: some words have more than one valid count (fire: 1 or 2; every: 2 or 3). A word passes with no flag if any valid count is within the limits (at most the maximum, at least the minimum). Setting both to the same number means "exactly". Hyphenated words: a maximum checks each part separately; a minimum checks the whole word. When the minimum and maximum are equal ("exactly"), the maximum is also checked on the whole word. So "well-known" passes "exactly 2", and "forget-me-not" (4 syllables) fails it.
- No repeated words: strict, with no exemptions. No word may appear more than once, and forms of the same word count as a repeat (window/windows, run/runs/running, mouse/mice, go/went), matched by compromise's root form. Matching ignores case. Every occurrence after the first is one violation. A repeat of the identical word ("the"/"the") has no Ignore button. A repeat matched only by root form has one, and counts as a language-rule flag for ignores, since the checker can pick the wrong root (left as "leave" or as a direction). Exercises that don't include the rule are unaffected.
- Time limit (bonus rules only): the clock starts at the first keystroke and stops at "Log this set". The start time is saved with the draft, so a refresh doesn't reset it. Logging after the limit loses the bonus's full weight.
- No adverbs: never flags these allowlisted words:
  - negation: not, n't, never
  - time: then, now, already, yet, again, ago, once, always, often, sometimes, soon, today, tomorrow, yesterday, tonight
  - place: here, there, home, away, back
  - focus and addition: also, too, either, neither, else, instead
  - question words: how, when, where, why
  - comparison: as, more, most, less, least
  - phrasal verb particles: up, down, out, off, in, on, over, around, through
  - politeness: please

  Everything else is flagged, including intensifiers (very, really, quite, so, just, extremely, rather, pretty, totally, actually, basically), only, even, still, and manner adverbs (slowly, loudly).
- No adjectives: never flags these allowlisted determiner-like words: first, second, third and other ordinals, last, next, previous, following, other, another, same, own, only, all, few, fewer, many, much, more, most, less, least, several, such, enough. Everything else is flagged, including whole, entire, little, main, particular, various, and certain. "Only" is allowed as an adjective ("the only doctor") but flagged as an adverb ("only fresh fish"). In word-list games, where a bare list gives no context, it also skips a reviewed list of about 125 words used as often as nouns, verbs, or adverbs (yellow, open, early).

### 3. Blackout poems
A public-domain passage is shown. The user taps the words to keep; the rest are blacked out, and the kept words form the poem, shareable as an image.

Blackout details (decided in Phase 3):
- Tap a word to keep it (outlined); tap again to drop it. Punctuation isn't tappable. Nothing is kept at the start, so an untouched passage scores 0.
- The poem is the kept words in passage order, joined by single spaces, cased as in the source, without the source's punctuation. Rules run on it; flags underline the kept word on the page, with the usual note cards.
- "Black out the rest" shows the finished page: every dropped word, and all punctuation, becomes a bar the width of the text, so the page keeps its shape. "Back to picking" returns to editing.
- Blackout sets use only word count (minimum and maximum), required words, banned letters, syllables per word, no repeated words, and a time-limit bonus. No adverbs, no adjectives, required first sentence, and same first letter don't apply: the tagger can't judge words pulled out of their sentences, and the poem has no lines or sentences of its own.
- The clock starts at the first tap. "Log this set" needs at least one kept word. Kept words, ignores, the clock, and the view survive a refresh.
- No pass-the-phone mode.

## Scoring

- Every exercise has at least one measurable rule or bonus rule, so every score is earned. Examples: "no word used twice," "every blank starts with the same letter," "finish in 90 seconds," "keep between 10 and 20 words," "your poem must keep the word river."
- Every exercise gets a score from 0 to 100, shown as a barbell meter that loads a plate per band.
- Bands: Warm-up (0 to 39), Working set (40 to 69), Heavy lift (70 to 89), PR (90 to 100).
- A new best score on an exercise is a PR.
- Scoring is deterministic: the same text and time taken always get the same score.
- How points are earned: each exercise lists its rules and bonus rules with point weights. Each violation costs part of its rule's points, and a rule can never lose more than its weight. Bonus rules add points, and the total is capped at 100.
- Default cost of a violation: the rule's weight divided by its fixed maximum number of violations. A missed required first sentence costs the full weight; each missing required word costs the weight divided by the number of required words. Rules with no fixed maximum (word count, banned letters, syllables per word, no adverbs, no adjectives, no repeated words, same first letter) cost a third of their weight per violation. An exercise can set its own cost for any rule.
- Each piece gets 2 free ignores. Ignoring a word covers every flag on that word from the same rule and uses one free ignore. After 2, Ignore still hides the flag, but it costs points as usual. Only flags from the language rules, and repeats matched by root form, can be ignored. Doubtful flags cost nothing. The result card and share text show how many flags were ignored.
- In v1 no adverb or adjective flag is doubtful: in testing, the tagger's guessed tags were as accurate as its sure ones.
- The word-count rule gates the score: points scale with progress toward the word-count target, so a short draft can't reach a high band. The target is the minimum, or the maximum when there is no minimum. Only a word-count rule among the main rules gates, not a bonus one. Without a word-count rule, an empty draft scores 0.
- Exact word counts work differently. Each word short or over costs one violation, so being under and over cost the same. While the word-count rule still has points left, there is no gate. Once its points are used up, a gate scales the score by the draft's distance from the target: words ÷ target when short, target ÷ words when over.

## Sharing

- Each finished piece produces a result card (image and text) for WhatsApp, including the app's URL.
- Challenge link: opens the same exercise with the same random elements (same seed), so a friend plays the identical round and compares scores.

Sharing details (decided in Phase 3):
- "Share this rep" appears after "Log this set", and on the team-score screen of a spotter game. The card and message match the logged score.
- The card is drawn in the browser (canvas), so nothing is sent anywhere until the player shares. It is always paper-light (chalk, charcoal, lime plates), portrait 1080×1350, with the wordmark, mechanic, title, the piece, score, band, plate meter, ignored-flag count, "With a spotter" on team cards, and the app's address. Blackout cards show the blacked-out page. Long pieces shrink to fit, then end with "…".
- The message: a score line, then the piece (whole if it has at most 60 words, else its first 60 words and "…"), then the link: "Beat it:" for solo, "Play it:" (a plain link to the set) for spotter games. All share wording is a draft for Sid to rewrite.
- Challenge links: a solo share's link carries the score to beat (`?c=82`) and, for a fill-in, the round's seed (`&seed=…`), so the friend gets the same letter. Constraint and blackout sets have no random parts. The friend sees "Challenge: beat 82" under the title and, after logging, both scores and who won. A challenge is played solo (no spotter choice), still counts toward the friend's own PR, and Start over replays the same round. A broken or out-of-range link opens the set normally. If the friend has a fill-in round in progress with another letter, the app asks first: start the challenge (the round is lost) or keep the round. Spotter games share a plain link, with no challenge.
- On a phone, sharing uses the share sheet with the image and message, else the message alone, and also copies the message, since some apps drop it when an image comes with it. On a desktop (or where sharing fails), a panel offers Download image, Copy message, and Open WhatsApp; the desktop system share is skipped because it can drop the message.

## Content

- 30 exercises at launch: about 10 fill-in, 14 constraint, 6 blackout.
- Original exercises written by Sid, with Claude drafting options for him to edit.
- Exercises by other authors are used only with their permission, obtained before the app is shared, and are credited in the app.
- Quoted source text (opening lines, blackout passages) comes only from public-domain works such as Project Gutenberg, with the source recorded for each.
- Content lives in its own file(s), separate from code, so adding an exercise means adding content, not code.
- Exact word counts are used only for named exact-length forms (six-word story, half-dribble, dribble, drabble) and word-list games. All other exercises use a minimum, a maximum, or a range (a minimum and a maximum together).
- Every set's blurb states the task in one plain sentence, so a player knows what to do before reading the rule chips. (Added after the part 4 phone test: Spring Cleaning's task wasn't clear.)

## Help pages and footer (added in Phase 3, built in part 6)

- A "How to play" page for each mechanic (constraint, fill-in, blackout), linked from every set near its title.
- A home-page footer: a short muted line (wording by Sid) and links to Sid's GitHub, his X account, and the privacy and credits page.

## Analytics and privacy

- PostHog Cloud free tier, configured cookieless. Confirm config from current PostHog docs at install time.
- Five events only: exercise started, exercise completed, result shared, challenge link opened, challenge completed.
- Nothing the user writes is ever sent to analytics. Writing leaves the device only when the user shares it.
- A short privacy note page explains this in plain language.

## Design (locked)

Theme: Word Gym. Building writing muscle runs through the UI and the copy.

Typefaces (Google Fonts):
- Headings: Fraunces, heavy weights (800 to 900) for impact
- Body and interface: Inter

Colors:
- Chalk white #FAFAF7 (light background)
- Charcoal #222222 (light text; basis of dark background)
- Coral #FF6B4A (rule violations: underlines and accents)
- Deep coral #C8462C (coral used as text in light mode, for contrast)
- Electric lime #D4FF3A (earned things only: loaded plates, PR badge)

Usage rules:
- Lime is never text in light mode. Charcoal text on a lime fill is fine.
- Coral is never small text in light mode; use deep coral. In dark mode, coral works as text.
- The main button uses the text color as its fill (charcoal in light, chalk in dark), not lime.
- Violations never rely on color alone: always an underline plus a note.
- The violation underline is deep coral in light mode (about 4.8:1 on the white surface) and coral in dark mode.
- All text meets WCAG contrast: 4.5:1 for body text, 3:1 for text 24px and up.
- The blackout passage is always a paper page, in both themes: chalk background, charcoal text and bars, deep coral underlines. The rest of the screen follows the theme.

Dark mode tokens (from the approved mockup): background #1C1C1C, surface #262626, border #3A3A38, text #FAFAF7, muted #B8B8B0.
Light mode tokens: background #FAFAF7, surface #FFFFFF, border #E3E1D8, text #222222, muted #5C5C56.

Approved mockup: the constraint writing screen, light and dark, on Sid's Wriceps Word Gym design canvas.

## Voice and vocabulary

Dry and playful, never literary or cute. Gym vocabulary:
- exercises are sets; each piece is a rep
- quick exercises are warm-ups
- the pass-the-phone partner is the spotter
- a new best score is a PR
- the main action on an exercise is "Log this set"

## Stack (approved)

- Next.js (App Router) with TypeScript, ESLint, Tailwind CSS, created with create-next-app recommended defaults
- No database or auth in v1
- Hosting: Vercel Hobby plan (personal, non-commercial; move to Pro if Wriceps ever charges money)
- Analytics: PostHog Cloud free tier, cookieless
- Language rules (chosen in Phase 2 by testing candidates against our test sets):
  - Adverbs and adjectives: compromise, using its smaller compromise/two build
  - Syllables: a CMU Pronouncing Dictionary word list trimmed to common English words (under about 150 KB gzipped), with the syllable package as the fallback for words not on the list
  - Both load only when a constraint exercise opens, not on app load
- Tests: Vitest for the rule engine; a written manual checklist for screens on real phones
- Error tracking: Sentry free tier, added at deployment
- Domain: wriceps.com if available, else wriceps.app (Sid buys it)

## Evaluation criteria ("done when")

### 1. Rule engine accuracy (automated, Vitest)
- Word count, banned letters, required words, required first sentence: 100% correct on test cases.
- Syllable counting: at least 95% correct on a 200-word list including tricky words (fire, every, business).
- Adverb and adjective flags on 100 hand-labeled sentences: at least 90% of flagged words are truly adverbs or adjectives, and at least 85% of the real ones are caught. Sentences are labeled grammatically: adjectives include predicative ones ("the sky is blue") and participles used as adjectives ("a broken window"), but not articles, possessives, numbers, or nouns used as modifiers ("stone wall"); adverbs include function adverbs such as "not" and "then". Tagger accuracy is measured against these labels, and the rules' flag precision is reported separately with both allowlists applied. Pass/fail uses the literal reading: a flag counts as correct if the word is an adverb or an adjective, even when the tagger names the wrong one of the two. How often the note names the right category is reported but does not decide pass or fail.
- Syllable test words with more than one valid count accept any of them. A word gets more than one count when the CMU Pronouncing Dictionary lists more than one pronunciation, or when Sid's review accepts a common everyday pronunciation that CMU omits (such as flower, tired, chocolate). Otherwise it gets the dictionary's single count. Words ending in -ire are checked by hand, because CMU often lists only their longer form.
- Syllable counting: at least 90% correct on a held-out list of 100 words that are not in the 200-word list. Its labels were drafted by Claude and reviewed by Sid, independently of CMU, so the check does not grade the CMU word list against itself. They were not looked up in Merriam-Webster, whose site blocks automated lookups.
- Word lists (test sets drafted by Claude and reviewed by Sid): no repeated words, on lists and on sentences, and no adjectives in word-list games, each at least 90% precision and 85% recall.
- Scoring is deterministic and the band cutoffs match this spec.

### 2. Features (manual checklist)
- All 30 exercises load, complete, and score on Chrome for Android, Safari on iPhone, and desktop Chrome.
- Pass-the-phone hides and reveals correctly and survives a refresh.
- Challenge links open the identical round on another device, including from inside WhatsApp on Android and iPhone.
- Share card generates in under 2 seconds, is readable on a phone, and includes the URL.
- Progress survives closing the browser; clearing browser data starts fresh without errors.

### 3. Experience
- From a WhatsApp link to a first exercise in under 10 seconds, no signup.
- Works at 360px width; tap targets at least 44px; the keyboard never covers the text being typed.
- Live checker feedback within 200ms of typing on a mid-range Android phone.
- Lighthouse mobile: 90+ for performance and accessibility.
- All copy dry and playful, US English, no typos; each exercise's instructions fit on one phone screen.

### 4. Content
- 30 exercises in the 10 / 14 / 6 split, each with at least one scored rule or bonus rule.
- Every quoted source confirmed public domain, source recorded.
- Permission recorded for any credited exercise before launch.

### 5. Security and privacy
- /security-audit passes, plus /security-review as a second opinion.
- No secrets in the repo.
- Analytics cookieless; no user writing sent anywhere unless the user shares it.
- Privacy note page live.

### 6. Code and process
- All tests pass, TypeScript reports no errors, lint is clean.
- Every working change committed.
- README explains how to run the project; the Status section in CLAUDE.md is current.

### 7. Launch
- Deployed on the custom domain with HTTPS.
- Analytics events visible in PostHog.
- Sid and 3 to 5 friends have played it on real phones before it is shared with the initial group of writers.

## Out of scope for v1

Everything in ROADMAP.md.
