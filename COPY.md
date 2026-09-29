# Wriceps copy to rewrite

Every piece of player-facing text, gathered at the end of Phase 3 part 6 so Sid can rewrite it all in one session. Strings marked **DRAFT** are placeholders Claude wrote. "Other copy" is the rest of the interface wording, also written by Claude. Examples with numbers or names (82, Weather Report, S) show where values are filled in.

## Draft tips on note cards

`lib/notes.ts`, `TIPS`. One of the three is picked per word.

| Flag | Tips |
|---|---|
| adverb | Cut it, or find a verb that does the work. · Let the verb carry the weight. · Drop it and see if anyone misses it. |
| adjective | Show it instead of labeling it. · Try a sharper noun. · Cut it and let the noun stand. |
| too many syllables | Find a shorter word. · Break it into plain words. · Short words hit harder. |
| too few syllables | Find a longer word. · Stretch it out. · Too light. Add a syllable. |
| repeat | Find a new word. · Once is enough. · Swap it for something fresh. |
| repeat (other form) | Same word, new outfit. Find another. · Pick a different word. · It's still the same word. |
| repeat (spotter game) | Find a new word. · Someone got there first. · Swap it for something fresh. |
| over time | Faster next rep. · The clock won this one. · Beat the clock next time. |
| wrong first letter | Find one that fits the letter. · Stay on the letter. · Wrong letter. Try again. |
| banned letter | Find a word without it. · Rephrase around it. · That letter is benched today. |
| too many words | Trim until it fits. · Cut the weakest sentence. · Every word has to earn its spot. |
| too few words | Keep going. · A few more reps. · Not done yet. |
| missing word | Work it in. · Find a spot for it. · It has to show up somewhere. |
| first sentence | Open with it, word for word. · The first line is set. Use it. · Start there, then make it yours. |
| long sentence | Break it in two. · Put a period where it runs out of breath. · Short sentences land harder. |

Note: these tips are shared by all three mechanics. "Cut the weakest sentence" reads oddly on blackout sets, where the player keeps words rather than writing sentences.

## Share and challenge (DRAFT)

- Share message, `lib/share.ts` (`shareMessage`): "Weather Report · 82 (Heavy lift) · 1 flag ignored", then the piece, then "Beat it: <link>". Spotter games: "Team score 82 (Heavy lift) · With a spotter" and "Play it: <link>".
- Challenge result, `lib/share.ts` (`challengeResult`): "You 85 · Them 82." followed by "You win." / "A tie." / "They win this one."
- Challenge banner, `app/components/set-parts.tsx` (`ChallengeBanner`): "Challenge: beat 82."
- Conflict prompt, `app/components/set-parts.tsx` (`ChallengeConflict`): "Start the challenge? Your set in progress will be lost." / "Start the challenge" / "Keep my set"
- Share button, `app/components/share-button.tsx`:
  - "Share this rep" / "Making the card…"
  - "Message copied. Paste it if it doesn't come through."
  - "Download image" / "Copy message" / "Copied" / "Open WhatsApp"
  - "Copying didn't work here. Download the image, or open WhatsApp to send the message."
  - "The card didn't draw on this device, but the message still works."
- Result card, `app/components/result-card.ts`: "Team score", "With a spotter", "1 flag ignored".

## How to play (DRAFT)

`content/how-to-play.ts`

- Intros, also shown on the home screen:
  - Constraint: "Write inside the rules. The rules are the weights."
  - Fill-in: "Fill the blanks. Every blank is a rep."
  - Blackout: "Find the poem hiding in someone else's page."
- Steps: 4 for Constraint, 4 for Fill-in, 3 for Blackout.
- Scoring notes: 4, shared by all three sheets.
- Sheet labels, `app/components/how-to-play-sheet.tsx`: "How to play", "Scoring", "Close" (for screen readers).

## Home, footer, privacy (DRAFT)

- Footer line, `app/components/site-footer.tsx`: "Made by Sid Sharma, one rep at a time."
- Progress note, `app/page.tsx`: "Your progress lives in this browser. Clearing browser data clears it."
- Privacy bullets, `app/privacy/page.tsx`:
  - "No accounts. There's nothing to sign up for."
  - "Your writing stays on your device. It leaves only when you tap Share, and goes only where you send it."
  - "Challenge links carry the set, your score, and the round's random letter. Never your writing." (Now also the drawn banned letter, words, or opening line; reword to cover them.)
  - "Your scores and unfinished sets are saved in this browser. Clearing browser data clears them, and another phone or browser starts fresh."
  - "Wriceps sets no cookies and doesn't track you." (must change when PostHog is added)

## Other copy (not marked DRAFT)

- Note details and missing-word lines, `lib/notes.ts` (`buildNotes`):
  - "used before" / "used earlier in the poem" / "same word as "x""
  - "contains e" / "should start with S" / "3 syllables"
  - "Still missing: …" / "2 words over the limit" / "4 words short"
  - "Over the time limit, so no bonus"
  - long sentence card: "One two three…" (its first three words) / "12 words, 2 over"
- Rule chip labels, `lib/notes.ts` (`ruleLabel`):
  - "Exactly 6 words" / "8–15 words" / "50+ words" / "Up to 12 words"
  - **DRAFT:** "100+ words after the opening" / "Max 10 words per sentence"
  - **DRAFT**, shown for a split second before a round's draw is made: "One banned letter" / "Required words" / "Start with a classic line"
  - "Max 2 syllables" / "Min 2 syllables" / "Exactly 2 syllables" / "1–2 syllables"
  - "No repeated words" / "Every answer starts with S" / "Every answer starts with the same letter"
  - "No adverbs" / "No adjectives" / "No letter E" / "Use: …" / "Start with "…"" / "Under 90 seconds" / "Under 5 minutes"
- Shared set parts, `app/components/set-parts.tsx`:
  - checker loading: "Warming up the checker…" / "The checker didn't load. Check your connection and refresh the page."
  - ignores: "Ignore" / "Ignore (uses 2)" / "Free ignores left: 2." / "No free ignores left. Ignoring now still hides the flag, but it costs points."
  - start over: "Start over? Your current work will be lost." / "Keep going" / "Start over"
  - logging: "Log this set" / "Logged" / "New PR!" / "Logged 82. That's a new PR." / "Logged 70. Your PR is still 82."
- Fill-in screen, `app/sets/[id]/fill-in-screen.tsx`:
  - mode choice: "How are you lifting?" / "Solo" / "With a spotter" / "With a spotter, you take turns on this phone, one line each."
  - "Blank 2 of 5" / "Next" / "Back" / "Reveal the poem" / "Back to the blanks" / "Fill every blank to log the set."
- Spotter game, `app/sets/[id]/pass-game.tsx`:
  - handoff: "Pass the phone to your spotter." / "Pass the phone back." / "No peeking. The screen stays blank until the next player is ready." / "Spotter: I'm ready" / "I'm ready"
  - turns: "Turn 2 of 4 · Your line" / "Spotter's line" / "Done. Pass the phone" / "Fill every blank on your line first."
  - end: "Next line" / "Team score" / "Team scores don't count toward your PR." / "New round"
- Blackout screen, `app/sets/[id]/blackout-screen.tsx`: "Black out the rest" / "Back to picking" / "Your poem" / "Tap words in the passage to keep them." / "From *Title*, Author (year)."
- Constraint editor placeholder, `app/components/draft-editor.tsx`: "Start your rep here."
- Home headline and subline, `app/page.tsx`: "Build your writing muscles." / "Short, scored writing sets."
- Privacy page headings and credits, `app/privacy/page.tsx`: "Privacy and credits", "Credits", "Blackout passages", "Public domain, from Project Gutenberg.", "Word data and code" and its three lines, "Show full notices".
- Site title and description, `app/layout.tsx`: "Wriceps" / "Build your writing muscles with short, scored writing exercises."
- Privacy page credits heading: "Opening lines", `app/privacy/page.tsx`.

## Set titles and task lines

The 31 launch sets, written by Sid and Claude in CONTENT.md. Each blurb states the task in one plain sentence (SPEC.md "Content").

Constraint, `content/constraint.ts`:
1. Six-Word Warm-Up: Tell a whole story in exactly six words.
2. Two-Syllable Sprint: List 20 different two-syllable words, none of them adjectives.
3. Light Bench: List 15 different words without the letter shown on screen.
4. Twenty-Five Reps: Tell a story in exactly 25 words.
5. Fifty Reps: Tell a story in exactly 50 words.
6. Light Weights: Describe your morning in 60 to 80 words, using no word longer than two syllables.
7. Short Reps: Write 80 to 120 words where no sentence is longer than ten words.
8. No Crutches: Describe a meal in 80 to 120 words without a single adverb.
9. Raw Lift: Describe a person in 80 to 120 words without a single adjective.
10. Heavy Bench: Write at least 50 words without the letter shown on screen.
11. Three-Point Circuit: Write a scene of 100 to 150 words that uses the three words shown on screen.
12. Pick Up the Bar: Begin with the classic opening line shown on screen and write at least 100 more words.
13. Hundred-Rep Set: Tell a story in exactly 100 words, with no adverbs.
14. Full Body: Write 150 to 250 words with no adverbs, no adjectives, and no word over two syllables.
15. Max Out: Tell a story in exactly 100 words with no adverbs, no adjectives, and no word over two syllables.

Fill-in, `content/fill-in.ts` (blank labels and template text are in the file):
1. Morning Stretch: Fill four blanks to describe a very strange morning.
2. Mystery Menu: Fill five blanks to write tonight's special at a strange restaurant.
3. Weather Report: Fill five blanks to forecast your mood for the day.
4. Echo Canyon: Fill three blanks and hear what the canyon says back.
5. Lost and Found: Fill six blanks to write a lost-pet poster for something that isn't a pet.
6. Dear Neighbor: Fill six blanks to write a polite complaint about something absurd.
7. Tag Team: Fill eight blanks to tell an old myth, one line at a time.
8. Alliteration Circuit: Fill eight blanks, each starting with the letter shown on screen.
9. One-Beat Poem: Fill eight blanks using only one-syllable words.
10. Max Out: Fill-In: Fill ten blanks with short words that all start with the letter shown on screen.

Blackout, `content/blackout.ts`:
1. Best of Times: Keep 8 to 15 words to make a poem from this famous opening.
2. Down the Rabbit Hole: Keep 10 to 20 words to make a poem from Alice's fall.
3. Call Me: Keep 10 to 20 words, including the word shown on screen.
4. Spring Cleaning: Keep 8 to 16 words, avoiding the letter shown on screen.
5. Against the Current: Keep exactly 12 words, none longer than two syllables.
6. Max Out: Blackout: Keep exactly 10 words, each one syllable.
