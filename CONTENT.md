# Wriceps launch content

The 31 sets for launch (15 constraint, 10 fill-in, 6 blackout), plus the engine changes they need. Written by Sid and Claude in chat, 2026-09-28.

Each group runs easy to hard, in the order listed. Each set's task line is its blurb: one plain sentence that says what to do. These replace all placeholder sets. Reuse an existing set id where a set keeps its name (Weather Report, Mystery Menu, Echo Canyon, Two-Syllable Sprint, and the three blackout placeholders).

## Part 1: engine changes (build these first)

### 1. Random draws from a list

A set can draw one value per round from a list in its content. The draw uses the round's seed, is saved with the round, survives a refresh, is replayed by challenge links, and is redrawn by Start over. The drawn value shows in the set's rule chip, so the player always sees what they got.

Draws needed:

- **Banned letter** from a letter pool (Light Bench, Heavy Bench, Dear Neighbor, Spring Cleaning).
- **Starting letter** from a letter pool, for every "random letter" rule on fill-ins. Use the pool below, so no round ever draws a letter like X or Q.
- **Required words** from a list of options, where each option is one word or a group of words (Three-Point Circuit, Call Me).
- **First sentence** from a list of opening lines (Pick Up the Bar).

Letter pools:

- Starting letters (all fill-ins with a random letter): B, C, D, F, G, H, L, M, P, R, S, T, W
- Medium banned letters (Light Bench): A, O, I, N, S, T
- Hard banned letters (Heavy Bench): E, A, O, T
- Mixed banned letters (Dear Neighbor, Spring Cleaning): A, E, I, O, N, S, T, R

For blackout sets, every value a list can draw must work with the passage: a required word must appear in it, and a banned letter must leave enough words to meet the word count. Extend the content test to check every option, not just one.

### 2. New rule: maximum words per sentence

Every sentence must have at most N words. Short Reps uses N = 10. Each over-long sentence is one violation. Tell me whether sentence detection can misfire (abbreviations like "Mr.", dialogue, ellipses), since that decides whether its flags get an Ignore button.

## Part 2: constraint sets (15)

### Warm-ups

**1. Six-Word Warm-Up**
Task: Tell a whole story in exactly six words.
Rules: exactly 6 words.
Bonus: no repeated words.

**2. Two-Syllable Sprint** (word list)
Task: List 20 different two-syllable words, none of them adjectives.
Rules: exactly 20 words, exactly 2 syllables, no adjectives, no repeated words.
Bonus: under 60 seconds.

**3. Light Bench** (word list)
Task: List 15 different words without the letter shown on screen.
Rules: exactly 15 words, banned letter drawn from the medium pool, no repeated words.
Bonus: under 45 seconds.

**4. Twenty-Five Reps**
Task: Tell a story in exactly 25 words.
Rules: exactly 25 words.
Bonus: no adverbs.

### Working sets

**5. Fifty Reps**
Task: Tell a story in exactly 50 words.
Rules: exactly 50 words.
Bonus: no word longer than two syllables.

**6. Light Weights**
Task: Describe your morning in 60 to 80 words, using no word longer than two syllables.
Rules: 60 to 80 words, max 2 syllables.
Bonus: under 5 minutes.

**7. Short Reps**
Task: Write 80 to 120 words where no sentence is longer than ten words.
Rules: 80 to 120 words, max 10 words per sentence.
Bonus: no adverbs.

**8. No Crutches**
Task: Describe a meal in 80 to 120 words without a single adverb.
Rules: 80 to 120 words, no adverbs.
Bonus: no adjectives.

**9. Raw Lift**
Task: Describe a person in 80 to 120 words without a single adjective.
Rules: 80 to 120 words, no adjectives.
Bonus: no adverbs.

**10. Heavy Bench**
Task: Write at least 50 words without the letter shown on screen.
Rules: 50+ words, banned letter drawn from the hard pool.
Bonus: under 5 minutes.

**11. Three-Point Circuit**
Task: Write a scene of 100 to 150 words that uses the three words shown on screen.
Rules: 100 to 150 words, required words drawn as a group from this list:
- key, rain, letter
- ladder, orange, silence
- clock, river, glove
- mirror, bread, storm
- ticket, owl, candle
- bridge, salt, phone
- kite, coin, fever
- lamp, train, secret
- boots, moon, apology
- window, sugar, map
Bonus: no adverbs.

### Heavy lifts

**12. Pick Up the Bar**
Task: Begin with the classic opening line shown on screen and write at least 100 more words.
Rules: first sentence drawn from this list, then 100+ more words:
- Jane Austen, Pride and Prejudice (1813): "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife."
- Charles Dickens, A Christmas Carol (1843): "Marley was dead: to begin with."
- J. M. Barrie, Peter Pan (1911): "All children, except one, grow up."
- Leo Tolstoy, Anna Karenina, translated by Constance Garnett (1901): "Happy families are all alike; every unhappy family is unhappy in its own way."
- Edward Bulwer-Lytton, Paul Clifford (1830): "It was a dark and stormy night."
Verify each line's exact wording and punctuation against the Project Gutenberg text, and record the sources for the credits page.
Bonus: no adverbs.

**13. Hundred-Rep Set**
Task: Tell a story in exactly 100 words, with no adverbs.
Rules: exactly 100 words, no adverbs.
Bonus: no word longer than two syllables.

**14. Full Body**
Task: Write 150 to 250 words with no adverbs, no adjectives, and no word over two syllables.
Rules: 150 to 250 words, no adverbs, no adjectives, max 2 syllables.
Bonus: under 15 minutes.

**15. Max Out**
Task: Tell a story in exactly 100 words with no adverbs, no adjectives, and no word over two syllables.
Rules: exactly 100 words, no adverbs, no adjectives, max 2 syllables.
Bonus: under 10 minutes.

## Part 3: fill-in sets (10)

Template syntax as in the app: `{label}` is a blank, `{label#name}` names it, `{=name}` echoes it. Labels are prompts only. If the template format limits label names, map these to the closest allowed label and tell me.

### Warm-ups

**1. Morning Stretch** (surprise)
Task: Fill four blanks to describe a very strange morning.
Rules: no repeated words.
Bonus: under 60 seconds.
```
This morning I woke up next to a {noun}.
It looked at me and started to {verb}.
I asked it, "{question}?"
It said, "{exclamation}," and went back to sleep.
```

**2. Mystery Menu** (surprise)
Task: Fill five blanks to write tonight's special at a strange restaurant.
Rules: every answer starts with the same letter as your first answer.
Bonus: under 45 seconds.
```
Tonight's special: {adjective} {food},
served on a bed of {plural noun}.
It comes with a side of {food}
and a glass of {drink}.
```

**3. Weather Report** (open)
Task: Fill five blanks to forecast your mood for the day.
Rules: every answer starts with a letter drawn from the starting-letter pool.
Bonus: no repeated words.
```
Today's forecast for my mood:
A {adjective} morning, with a chance of {plural noun} by noon.
Expect {noun} in the afternoon,
clearing to a {adjective} {noun} by evening.
```

### Working sets

**4. Echo Canyon** (surprise)
Task: Fill three blanks and hear what the canyon says back.
Rules: no repeated words.
Bonus: under 60 seconds.
```
I stood at the edge of the canyon and shouted, "{noun#call}!"
The canyon shouted back, "{=call}!"
So I whispered a secret: "{a secret#secret}."
Something in the dark whispered, "{=secret}."
Then it asked me, "{question}?"
```

**5. Lost and Found** (open)
Task: Fill six blanks to write a lost-pet poster for something that isn't a pet.
Rules: no answer longer than two syllables.
Bonus: every answer starts with a letter drawn from the starting-letter pool.
```
LOST: one {object}.
Last seen near the {place}, {verb ending in -ing}.
Answers to the name "{name}."
Reward: a {noun} and my {noun}.
```

**6. Dear Neighbor** (open)
Task: Fill six blanks to write a polite complaint about something absurd.
Rules: a banned letter drawn from the mixed pool, in every answer.
Bonus: no repeated words.
```
Dear Neighbor,
I am writing about your {noun}.
Every night, it begins to {verb}.
Last Tuesday it ate my {noun}.
I have asked politely. I have left a {noun}.
If this continues, I will be forced to {verb}.
Yours, a {adjective} neighbor
```

**7. Tag Team** (surprise, built for spotters)
Task: Fill eight blanks to tell an old myth, one line at a time.
Rules: no repeated words.
Bonus: every answer starts with the same letter as your first answer.
```
Long ago, a {noun} and a {noun} lived at the edge of the world.
One day they found a {noun} buried in the {place}.
They argued about who should {verb} it, and the {noun} won.
That is why, to this day, {plural noun} still {verb}.
```

### Heavy lifts

**8. Alliteration Circuit** (open)
Task: Fill eight blanks, each starting with the letter shown on screen.
Rules: every answer starts with a letter drawn from the starting-letter pool, no repeated words.
Bonus: under 2 minutes.
```
At the {place} gym, a {adjective} {noun}
lifted a {noun} over its head
while a {noun} counted reps
and shouted, "{exclamation}!"
After the workout, they all ate {food}
and went home to {verb}.
```

**9. One-Beat Poem** (open)
Task: Fill eight blanks using only one-syllable words.
Rules: exactly 1 syllable per answer, no repeated words.
Bonus: every answer starts with a letter drawn from the starting-letter pool.
```
Night came like a {noun},
and the {noun} went {adjective}.
I held my {noun} to the {noun}
and heard it {verb}.
In the dark, a {noun} said, "{word}."
That was all.
```

**10. Max Out: Fill-In** (open)
Task: Fill ten blanks with short words that all start with the letter shown on screen.
Rules: every answer starts with a letter drawn from the starting-letter pool, no answer over two syllables, no repeated words.
Bonus: under 2 minutes.
```
Today I trained my {noun#muscle}.
First, ten reps of {plural noun}.
Then I {verb} a {noun} for a full minute
while my {noun} watched and shouted, "{exclamation}!"
By noon my {=muscle} was {adjective}.
I rested in a {place}, ate a {food},
and dreamed of {plural noun}.
Tomorrow: {=muscle} day again.
```

## Part 4: blackout sets (6)

Fetch each passage from Project Gutenberg and copy it word for word, 60 to 100 words, as done for the placeholders. Where the source runs longer, take a self-contained excerpt and tell me where it starts and ends. Record each source for the credits page.

### Warm-ups

**1. Best of Times**
Passage: Charles Dickens, A Tale of Two Cities (1859), the opening.
Task: Keep 8 to 15 words to make a poem from this famous opening.
Rules: 8 to 15 words.
Bonus: under 90 seconds.

**2. Down the Rabbit Hole**
Passage: Lewis Carroll, Alice's Adventures in Wonderland (1865), from Alice's long fall in chapter 1.
Task: Keep 10 to 20 words to make a poem from Alice's fall.
Rules: 10 to 20 words, no repeated words.
Bonus: under 2 minutes.

### Working sets

**3. Call Me**
Passage: Herman Melville, Moby-Dick (1851), the opening.
Task: Keep 10 to 20 words, including the word shown on screen.
Rules: 10 to 20 words, one required word drawn from: sea, world, water, city. Keep only options that appear in the chosen excerpt, and tell me if the list needs changing.
Bonus: no repeated words.

**4. Spring Cleaning**
Passage: Kenneth Grahame, The Wind in the Willows (1908), Mole's spring cleaning at the opening.
Task: Keep 8 to 16 words, avoiding the letter shown on screen.
Rules: 8 to 16 words, banned letter drawn from the mixed pool (drop any letter that leaves too few usable words).
Bonus: under 2 minutes.

### Heavy lifts

**5. Against the Current**
Passage: F. Scott Fitzgerald, The Great Gatsby (1925), the closing lines.
Task: Keep exactly 12 words, none longer than two syllables.
Rules: exactly 12 words, max 2 syllables.
Bonus: no repeated words.

**6. Max Out: Blackout**
Passage: Rabindranath Tagore, Gitanjali (1912, Tagore's own English translation), poem 35, "Where the mind is without fear".
Task: Keep exactly 10 words, each one syllable.
Rules: exactly 10 words, exactly 1 syllable, no repeated words.
Bonus: under 3 minutes.

## Part 5: after loading the content

- Update COPY.md with the new titles and task lines.
- Update SPEC.md's content split to 15 constraint, 10 fill-in, 6 blackout (31 sets).
- Check every set in the browser at 360px, and list any set where a rule, pool, or passage made the task impossible or too easy.
