# Wriceps roadmap

Features deliberately kept out of v1. Decide what moves up based on v1 usage numbers and feedback from early users.

## v1.1
- Play by link: two people complete a piece asynchronously. Player one does their half and sends a link on WhatsApp; player two adds theirs; both see the result. The unfinished piece travels inside the link, so no database is needed.

- Run the language engine in a Web Worker (a background thread), so a set page never freezes while compromise loads (about 350 ms on a mid-range phone; set pages score 88–89 on Lighthouse mobile instead of about 95) and checks on long drafts can't make typing stutter. Typing lag measured in Phase 6 on a mid-range phone profile (4x CPU): instant up to 500 words, fine at 1,000 (worst key about 100 ms), noticeable at 2,000 (1 key in 10 takes 100–140 ms, worst 180–250 ms). The longest set asks for about 250 words, so v1 doesn't need it.

## v2
- Live multiplayer (top priority): two or more people writing together in real time. Sid's view: people like doing things together, so this is the feature most likely to bring people back. Needs a backend (likely Supabase realtime) and abuse handling.
- Accounts and saved history: play first, sign up only to keep progress across devices and total scores. Needs auth, a database, and a full security pass.
- Leaderboards and friend challenges with persistent scores.
- AI feedback on writing: short, specific feedback on a piece. Costs money per use and needs rate limiting and abuse protection.
- POV-swap exercises ("Rashomonize it"): given a character pairing and situation, retell from the other character's point of view.
- New mechanics: N+7, snowball poems, stile, exquisite corpse with more than 2 players.
- More exercises and themed packs.
- Native Android and iOS apps, only if demand appears (wrap the web app with Capacitor rather than rebuild).

## Ideas parking lot
Add new ideas here as they come up. Nothing here is committed.
