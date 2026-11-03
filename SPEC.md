# Wriceps v1 spec

Wriceps: build your writing muscles. A web app of short, fun writing exercises that sharpen writing skills: a gym of exercises and prompts drawn from writing craft everywhere, plus original games. It is not tied to any one teacher or workshop.

Status: approved by Sid on 2026-09-26, revised 2026-09-27, 2026-09-28, and 2026-09-29. Change this file only with Sid's approval.

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
Rules run on the player's answers only, not on the template text, using the constraint-writing rule engine plus one fill-in rule: every answer starts with the same letter. The letter is set by the exercise, is any letter the answers share, or is drawn at random for the round from a seed, so a challenge link replays the same letter. Random letters come from the starting pool B, C, D, F, G, H, L, M, P, R, S, T, W, so no round draws a letter like X or Q.
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
- sentence length: a maximum number of words per sentence
- time limit (bonus rules only)

A banned letter, the required words, and the required first sentence can each be drawn per round from a list in the set's content (a letter pool, word groups, or opening lines). The draw uses the round's seed: it survives a refresh, a challenge link replays it, and Start over draws again. The rule chip shows what was drawn.

Violations are highlighted live as the user types (coral wavy underline plus a note card below the draft). Doubtful flags are shown but never block the user. Flags from the language rules (no adverbs, no adjectives, syllables per word) have an Ignore button, since the checker can be wrong on those. Flags from word count, banned letters, required words, required first sentence, and sentence length have none, since those checks are exact. No repeated words has an Ignore button only on repeats matched by root form, since that match is the checker's guess (see Rule details). This mechanic covers general craft exercises (such as cutting adverbs and adjectives), six-word stories, drabbles (100 words), dribbles (50 words), lipograms, opening-line exercises, and original word-list games.

Rule details (decided in Phase 2):
- Word count: contractions ("don't"), hyphenated words ("well-known"), and numbers ("2026") count as one word each. Words joined by a dash with no spaces ("yes—no", "yes–no", "yes--no") count as two words.
- Banned letters and required words ignore case. A required word must match exactly: "rivers" does not satisfy "river".
- Required first sentence ignores case, curly versus straight quotes, and extra spaces.
- The required opening isn't the player's writing: when the draft begins with it (as matched above), every other rule skips it, so no adverb, syllable, repeat, or sentence-length flag lands inside it. The word count follows its own setting (below). A changed opening isn't skipped. (Decided in Content step 2, after "universally" in Austen's line cost the no-adverbs bonus.)
- On screen, a drawn opening line shows once, as a quote above the draft; its chip gives a short name ("Opening: Austen"). The note card appears only once the draft has a first sentence that isn't the line; an empty draft still misses the rule's points.
- Words after the opening (decided in Content step 1): a word-count rule can count only the words after a required first sentence, by skipping as many words as that sentence has. Used where the opening line is drawn, so every line asks for the same number of the player's own words. The chip reads "100+ words after the opening".
- Sentence length (decided in Content step 1): a sentence ends at . ! ? or … (and runs such as "?!" or "...", with any closing quotes or brackets) followed by a space or the end of the text, or at a line break. Semicolons, colons, and dashes don't end a sentence. Words are counted as in the word-count rule. Each sentence over the limit is one violation; the underline covers the words past the limit. Abbreviations ("Mr.") and dialogue ("Stop!" she said) split a sentence early, which only makes it look shorter, so the rule can miss a long sentence but never flags a short one. That is why it has no Ignore button.
- Syllables per word: some words have more than one valid count (fire: 1 or 2; every: 2 or 3). A word passes with no flag if any valid count is within the limits (at most the maximum, at least the minimum). Setting both to the same number means "exactly". Hyphenated words: a maximum checks each part separately; a minimum checks the whole word. When the minimum and maximum are equal ("exactly"), the maximum is also checked on the whole word. So "well-known" passes "exactly 2", and "forget-me-not" (4 syllables) fails it.
- No repeated words: strict, with no exemptions. No word may appear more than once, and forms of the same word count as a repeat (window/windows, run/runs/running, mouse/mice, go/went), matched by compromise's root form. Matching ignores case. Every occurrence after the first is one violation. A repeat of the identical word ("the"/"the") has no Ignore button. A repeat matched only by root form has one, and counts as a language-rule flag for ignores, since the checker can pick the wrong root (left as "leave" or as a direction). Exercises that don't include the rule are unaffected.
- Time limit (bonus rules only): the clock starts at the first keystroke and stops at "Log this set". The start time is saved with the draft, so a refresh doesn't reset it. Logging after the limit loses the bonus's full weight.
- Draft status strip (added 2026-11-03 after beta feedback: the clock scrolled away on phones, and players couldn't tell when they'd hit the word target): constraint sets show a strip across the top of the draft box. On the left is the live word count against the word-count rule ("52 / 50+ words"): a ✓ once the target is met, coral once past an exact count or a maximum, and only the words after the opening where the rule skips it. Sets without a word-count rule show a plain count. On the right, on sets with a time bonus, is the clock: "5:00" before the first keystroke, then "3:12 left", then "Time's up". The bonus chip then shows only the rule. The strip sits just above the typing, so it stays on screen with the phone keyboard open.
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
- Adjectives used as nouns (added 2026-11-03 after beta feedback on "good"): the no-adjectives rule skips a word the tagger calls an adjective when no noun or adjective follows it and the word before it is a determiner, possessive, or preposition, skipping other adjectives on the way back. Examples: "the common good" (common is flagged, good is not), "do some good", "a world of good", "the blue of the sky". It doesn't help when the tagger also mislabels the next word ("The good outweighs the bad" reads outweighs as a noun, so good stays flagged); Ignore covers those. The 100-sentence and word-list accuracy figures were unchanged by it.

### 3. Blackout poems
A public-domain passage is shown. The user taps the words to keep; the rest are blacked out, and the kept words form the poem, shareable as an image.

Blackout details (decided in Phase 3):
- Tap a word to keep it (outlined); tap again to drop it. Punctuation isn't tappable. Nothing is kept at the start, so an untouched passage scores 0.
- The poem is the kept words in passage order, joined by single spaces, cased as in the source, without the source's punctuation. Rules run on it; flags underline the kept word on the page, with the usual note cards.
- "Black out the rest" shows the finished page: every dropped word, and all punctuation, becomes a bar the width of the text, so the page keeps its shape. "Back to picking" returns to editing.
- Blackout sets use only word count (minimum and maximum), required words, banned letters, syllables per word, no repeated words, and a time-limit bonus. No adverbs, no adjectives, required first sentence, and same first letter don't apply: the tagger can't judge words pulled out of their sentences, and the poem has no lines or sentences of its own.
- The clock starts at the first tap. "Log this set" needs at least one kept word. Kept words, ignores, the clock, and the view survive a refresh.
- No pass-the-phone mode.
- A poem passage (set per passage) keeps its own line breaks, on the page and on the result card. Prose passages are one paragraph.

## Scoring

- Every exercise has at least one measurable rule or bonus rule, so every score is earned. Examples: "no word used twice," "every blank starts with the same letter," "finish in 90 seconds," "keep between 10 and 20 words," "your poem must keep the word river."
- Every exercise gets a score from 0 to 100, shown as a barbell meter that loads a plate per band.
- Bands: Warm-up (0 to 39), Working set (40 to 69), Heavy lift (70 to 89), Top set (90 to 100). (The top band was called PR until the final copy.)
- A new best score on an exercise is a PR. "PR" only ever means a player's personal best, never a band.
- Scoring is deterministic: the same text and time taken always get the same score.
- How points are earned: each exercise lists its rules and bonus rules with point weights. Each violation costs part of its rule's points, and a rule can never lose more than its weight. Bonus rules add points, and the total is capped at 100.
- Default cost of a violation: the rule's weight divided by its fixed maximum number of violations. A missed required first sentence costs the full weight; each missing required word costs the weight divided by the number of required words. Rules with no fixed maximum (word count, banned letters, syllables per word, no adverbs, no adjectives, no repeated words, same first letter, sentence length) cost a third of their weight per violation. An exercise can set its own cost for any rule.
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
- The message: a score line, then the piece (whole if it has at most 60 words, else its first 60 words and "…"), then the link. Solo: "Just lifted 82 on Weather Report." (with "(1 flag ignored)" before the period when there are ignores) and "Your turn: <link>". Spotter games: "We lifted 82 on Tag Team, taking turns on one phone." and "Try it with a friend: <link>" (a plain link to the set). The band isn't in the message.
- Challenge links: a solo share's link carries the score to beat (`?c=82`) and, for a fill-in or any set that draws (a banned letter, words, or an opening line), the round's seed (`&seed=…`), so the friend gets the same round. The friend sees "Challenge: beat 82" under the title and, after logging, both scores and who won. A challenge is played solo (no spotter choice), still counts toward the friend's own PR, and Start over replays the same round. A broken or out-of-range link opens the set normally. If the friend has a round in progress with another seed, on any mechanic, the app asks first: start the challenge (the round is lost) or keep the round. Spotter games share a plain link, with no challenge.
- On a phone, sharing uses the share sheet with the image and message, else the message alone, and also copies the message, since some apps drop it when an image comes with it. On a desktop (or where sharing fails), a panel offers Download image, Copy message, and Open WhatsApp; the desktop system share is skipped because it can drop the message.

## Content

- 31 exercises at launch: 15 constraint, 10 fill-in, 6 blackout. The sets, and the choices behind them, are in CONTENT.md. Each mechanic's sets run easy to hard.
- Point weights: a set's main rules share 90 points, split equally (any rounding goes to the word count), and its bonus rule is worth 10. A clean rep without the bonus scores 90, still a Top set; only the bonus reaches 100.
- Original exercises written by Sid, with Claude drafting options for him to edit.
- Exercises by other authors are used only with their permission, obtained before the app is shared, and are credited in the app.
- Quoted source text (opening lines, blackout passages) comes only from public-domain works such as Project Gutenberg, with the source recorded for each.
- Content lives in its own file(s), separate from code, so adding an exercise means adding content, not code.
- Exact word counts are used only for named exact-length forms (six-word story, half-dribble, dribble, drabble) and word-list games, plus heavy-lift blackout sets, where keeping exactly N words is a clear, fair target. All other exercises use a minimum, a maximum, or a range (a minimum and a maximum together).
- Every set's blurb states the task in one plain sentence, so a player knows what to do before reading the rule chips. (Added after the part 4 phone test: Spring Cleaning's task wasn't clear.)

## Home, help, footer, and privacy (added in Phase 3, built in part 6)

- "How to play" for each mechanic (constraint, fill-in, blackout) opens as a bottom sheet over the current screen, from each mechanic's section on the home screen and from every set near its title. The phone's back button, a tap outside, and a close button all close it, and it never disturbs a draft in progress.
- A home-page footer: a short muted line (wording by Sid) and links to Sid's GitHub, his X account, and the privacy and credits page.
- The home screen lists sets grouped by mechanic, each with its title, blurb, and PR once there is one, and says that progress lives in this browser.
- One privacy and credits page (/privacy): a plain-language privacy note, the blackout passage sources, the opening-line sources, and the third-party notices from NOTICES.md.

## Analytics and privacy

- PostHog Cloud free tier, configured cookieless. Confirm config from current PostHog docs at install time.
- Five events only: exercise started, exercise completed, result shared, challenge link opened, challenge completed.
- Nothing the user writes is ever sent to analytics. Writing leaves the device only when the user shares it.
- A short privacy note page explains this in plain language.

Analytics details (decided in Phase 4):
- PostHog EU Cloud, `cookieless_mode: "always"`, with the project's "Cookieless server hash mode" on. Nothing is stored in the browser; PostHog tells visitors apart by a daily hash of IP, user agent, and host, then deletes the IP and user agent. PostHog's server (not the browser) also adds a device ID from that daily hash and a session ID that groups one visit's events.
- posthog-js loads only when the first event fires, never on page load. With no project token, nothing loads or sends.
- The events and their properties:
  - exercise started: the first input of a round (first keystroke, answer, or kept word) when the set had no work in progress. Clearing a whole draft and typing again counts as a new start. Properties: set, mechanic, mode (solo or spotter).
  - exercise completed: "Log this set", or the last line revealed in a spotter game. Properties: set, mechanic, mode, score, challenge (yes or no).
  - result shared: the share sheet finished (not cancelled), or Download image, Copy message, or Open WhatsApp used. Properties: set, mechanic, mode, method.
  - challenge link opened: a set opened with a valid challenge link (a refresh counts again). Properties: set, mechanic, score to beat.
  - challenge completed: "Log this set" on a challenge. Properties: set, mechanic, score, score to beat, result (won, tied, or lost).
- Context kept on every event: device type, browser name, OS name, and the referring domain (not the full referrer). PostHog's own required fields stay (token, the cookieless ID, host, user agent for the hash, library version, a random ID per event). A final filter drops every other property and any event not listed above.
- Location lookup (GeoIP) is off on every event. Off entirely: pageviews, autocapture, session recording, heatmaps, surveys, error capture, feature flags, campaign tags, person profiles. No reverse proxy, so ad blockers can drop events.
- The privacy page names everything sent; change it whenever the filter changes.

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
- Violet #6A45C2 in light mode, #B59CFF in dark mode (mechanic names as labels only). Added after content step 2.

Usage rules:
- Lime is never text in light mode. Charcoal text on a lime fill is fine.
- Coral is never small text in light mode; use deep coral. In dark mode, coral works as text.
- The main button uses the text color as its fill (charcoal in light, chalk in dark), not lime.
- Violations never rely on color alone: always an underline plus a note.
- The violation underline is deep coral in light mode (about 4.8:1 on the white surface) and coral in dark mode.
- All text meets WCAG contrast: 4.5:1 for body text, 3:1 for text 24px and up.
- Violet marks a mechanic name ("Constraint", "Fill-in", "Blackout") wherever it appears as a label: the set eyebrow (only the name, not "Set 12 of 15" or "With a spotter"), home section headings, the How to play sheet title, and the result card (always the light shade there). Labels keep their style: small, spaced-out capitals, no small caps. Violet is never used for problems, earned things, or buttons. Contrast: 6.2:1 on the light background, 7.4:1 on the dark one.
- The blackout passage is always a paper page, in both themes: chalk background, charcoal text and bars, deep coral underlines. The rest of the screen follows the theme.

Dark mode tokens (from the approved mockup): background #1C1C1C, surface #262626, border #3A3A38, text #FAFAF7, muted #B8B8B0.
Light mode tokens: background #FAFAF7, surface #FFFFFF, border #E3E1D8, text #222222, muted #5C5C56.

Approved mockup: the constraint writing screen, light and dark, on Sid's Wriceps Word Gym design canvas.

Brand images (from Sid's sketches on the design canvas, approved by Sid). They never follow the theme.
- Link preview card (1200×630, the Open Graph image for WhatsApp and social links), always light: chalk background; on the left the "wriceps" wordmark in Fraunces 900, the violet eyebrow "SHORT WRITING WORKOUTS" (#6A45C2), the headline "Build your writing muscles." in Fraunces 900 at 88px, and "www.wriceps.com" in muted gray; on the right a fully loaded barbell like the score meter, four lime plates of rising height with charcoal outlines on a charcoal bar. The preview text is the site description. Every page shows the same card.
- Icon: charcoal background, a chalk bar across the middle, two lime plates on each side, inner plates shorter. The favicon (32px) is a rounded square with slightly wider plates, to read at tab size. The app icon (180px) is a full square, because iPhones round it themselves.

## Voice and vocabulary

Dry and playful, never literary or cute. Gym vocabulary:
- exercises are sets; each piece is a rep
- quick exercises are warm-ups
- the pass-the-phone partner is the spotter
- a new best score is a PR (a personal best)
- the top score band (90 to 100) is a Top set
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
- Domain: wriceps.com, registered at Cloudflare (DNS only). The site is served at www.wriceps.com; wriceps.com redirects to it.

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
- All 31 exercises load, complete, and score on Chrome for Android, Safari on iPhone, and desktop Chrome.
- Pass-the-phone hides and reveals correctly and survives a refresh.
- Challenge links open the identical round on another device, including from inside WhatsApp on Android and iPhone.
- Share card generates in under 2 seconds, is readable on a phone, and includes the URL.
- Progress survives closing the browser; clearing browser data starts fresh without errors.

### 3. Experience
- From a WhatsApp link to a first exercise in under 10 seconds, no signup.
- Works at 360px width; tap targets at least 44px; the keyboard never covers the text being typed.
- Live checker feedback within 200ms of typing on a mid-range Android phone.
- Lighthouse mobile: 90+ for performance and accessibility, except set pages, where performance is 85+: loading the language engine (compromise sets up in one block of about 350 ms on a mid-range phone) costs them a few points. Measured in Phase 6 at 88–89; moving the engine into a Web Worker is in ROADMAP.md.
- All copy dry and playful, US English, no typos; each exercise's instructions fit on one phone screen.

### 4. Content
- 31 exercises in the 15 / 10 / 6 split, each with at least one scored rule or bonus rule.
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
- Deployed on the custom domain with HTTPS. Met: www.wriceps.com on Vercel Production, with wriceps.com redirecting to it (308). Deployment protection is Standard Protection, so the production domain is public and preview deployments stay behind a Vercel login.
- Analytics events visible in PostHog.
- Sid and 3 to 5 friends have played it on real phones before it is shared with the initial group of writers.

## Out of scope for v1

Everything in ROADMAP.md.
