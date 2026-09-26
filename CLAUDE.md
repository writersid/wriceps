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
```

Tests: Vitest is added in Phase 2.

## Status

- **Current phase:** 1 (Setup)
- **Done:** create-next-app scaffold; SPEC.md and ROADMAP.md committed; this file; .gitignore allows `.env.example`; private GitHub repo `writersid/wriceps`.
- **Deferred:** create `.env.example` when PostHog is added (confirm its variable names from PostHog's current docs).
- **Next step:** Phase 2, the constraint-writing rule engine with Vitest tests.
