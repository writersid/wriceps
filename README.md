# Wriceps

Short, scored writing exercises for your phone. A word gym for writers.

**Play it:** https://www.wriceps.com. It's free, with no sign-up. Your progress stays in your browser.

## What it does

Wriceps has 31 sets across three kinds of exercise:

- **Constraint writing.** Write to rules such as an exact word count, no adverbs, no repeated words, or a syllable limit. Rule breaks are underlined as you type, and you get a score when you're done.
- **Fill-in poems.** Fill the blanks of a poem template, either solo or passing one phone back and forth with a friend.
- **Blackout poems.** Tap words in a public-domain passage to keep them. Everything else is blacked out.

After each set you can share a result card, or send a challenge link so a friend can try to beat your score.

## How it's built

- [Next.js](https://nextjs.org) (App Router), TypeScript, and Tailwind CSS, hosted on Vercel.
- No server, database, or accounts. Scores and drafts are saved in `localStorage`, the browser's built-in storage.
- A rule engine in `lib/engine/` written in plain TypeScript, with no UI code. It uses [compromise](https://github.com/spencermountain/compromise) for parts of speech, and a syllable list built from the CMU Pronouncing Dictionary with [syllable](https://github.com/words/syllable) as a fallback.
- Accuracy is measured against hand-labeled test sets in `test-data/`. Vitest tests enforce the thresholds.
- Cookieless analytics with [PostHog](https://posthog.com), limited to a short list of events. See the privacy page on the site.

## Run it locally

You need Node.js 20 or later.

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # Vitest
npm run lint
npm run build
```

Analytics are optional. To turn them on, copy `.env.example` to `.env.local` and fill in your own PostHog values.

## License

- **Code:** MIT, see [LICENSE](LICENSE).
- **Exercise writing** (`content/`, `CONTENT.md`, `COPY.md`): CC BY-NC 4.0, see [LICENSE-CONTENT.md](LICENSE-CONTENT.md).
- **Third-party code, data, and fonts:** see [NOTICES.md](NOTICES.md).
