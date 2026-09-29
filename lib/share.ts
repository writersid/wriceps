// Result cards and share messages. See SPEC.md "Sharing details".
// The card's piece is a list of styled runs: plain text, bold (answers, kept
// words), or a bar (blacked-out text). "\n" in a run's text is a line break.
import { tokenize } from "./engine/tokenize";
import type { Token } from "./engine/types";
import { capitalizeFirst, startsSentence, type Part } from "./fill-in";

export type Run = { text: string; style: "plain" | "bold" | "bar" };

export function constraintRuns(text: string): Run[] {
  return [{ text: text.trim(), style: "plain" }];
}

// The finished poem: template text plain, answers and echoes bold, capitalized
// where they start a sentence (as on screen).
export function fillInRuns(parts: Part[], answers: string[]): Run[] {
  return parts.map((part, i) =>
    part.type === "text"
      ? { text: part.text, style: "plain" }
      : { text: startsSentence(parts, i) ? capitalizeFirst(answers[part.index]) : answers[part.index], style: "bold" },
  );
}

// The fill-in poem as plain text, for the share message.
export function fillInText(parts: Part[], answers: string[]): string {
  return fillInRuns(parts, answers)
    .map((r) => r.text)
    .join("");
}

// The blacked-out page: kept words bold, every dropped word and all
// punctuation a bar. Punctuation right after a dropped word joins its bar.
export function blackoutRuns(passage: string, words: Token[], kept: number[]): Run[] {
  const runs: Run[] = [];
  const gap = (between: string) => {
    for (const chunk of between.split(/(\s+)/)) if (chunk) runs.push({ text: chunk, style: /\S/.test(chunk) ? "bar" : "plain" });
  };
  gap(passage.slice(0, words[0]?.start ?? passage.length));
  words.forEach((word, i) => {
    const between = passage.slice(word.end, words[i + 1]?.start ?? passage.length);
    const attached = /^\S*/.exec(between)![0];
    if (kept.includes(i)) {
      runs.push({ text: word.text, style: "bold" });
      if (attached) runs.push({ text: attached, style: "bar" });
    } else {
      runs.push({ text: word.text + attached, style: "bar" });
    }
    gap(between.slice(attached.length));
  });
  return runs;
}

// The whole piece if it has at most `max` words, else its first `max` words and "…".
export function trimWords(text: string, max: number): string {
  const trimmed = text.trim();
  const words = tokenize(trimmed);
  if (words.length <= max) return trimmed;
  return `${trimmed.slice(0, words[max - 1].end)}…`;
}

export const MESSAGE_WORDS = 60;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// "1 flag ignored", or nothing when none were.
export function ignoredLine(n: number): string {
  return n ? `${plural(n, "flag")} ignored` : "";
}

// The score line, the piece, then the link. Solo: "Just lifted 82 on Weather
// Report (1 flag ignored)." and "Your turn: <link>". Spotter games: "We
// lifted 82 on Tag Team, taking turns on one phone." and "Try it with a
// friend: <link>".
export function shareMessage(r: {
  title: string;
  score: number;
  ignoredFlags: number;
  piece: string;
  link: string;
  team?: boolean;
}): string {
  const scoreLine = r.team
    ? `We lifted ${r.score} on ${r.title}, taking turns on one phone.`
    : `Just lifted ${r.score} on ${r.title}${r.ignoredFlags ? ` (${ignoredLine(r.ignoredFlags)})` : ""}.`;
  const piece = trimWords(r.piece, MESSAGE_WORDS);
  const link = r.team ? `Try it with a friend: ${r.link}` : `Your turn: ${r.link}`;
  return [scoreLine, ...(piece ? [piece] : []), link].join("\n\n");
}

export type Share = { card: Card; message: string; fileName: string };

// A challenge: the score to beat and, for a set that draws (a random letter,
// banned letter, words, or opening line), the round's seed, so the friend
// plays the identical round. Carried in the link: ?c=82&seed=123.
export type Challenge = { score: number; seed?: number };

export function challengeLink(origin: string, setId: string, challenge: Challenge): string {
  const seed = challenge.seed === undefined ? "" : `&seed=${challenge.seed}`;
  return `${origin}/sets/${setId}?c=${challenge.score}${seed}`;
}

// Reads a challenge from a link's query string. A broken or out-of-range value
// means no challenge (or no seed), so the set just opens normally.
export function parseChallenge(search: string): Challenge | null {
  const params = new URLSearchParams(search);
  const c = params.get("c") ?? "";
  const seed = params.get("seed") ?? "";
  if (!/^\d{1,3}$/.test(c) || Number(c) > 100) return null;
  const challenge: Challenge = { score: Number(c) };
  if (/^\d{1,10}$/.test(seed) && Number(seed) < 2 ** 32) challenge.seed = Number(seed);
  return challenge;
}

export function challengeResult(mine: number, theirs: number): string {
  const verdict = mine > theirs ? "You win." : mine === theirs ? "Dead even." : "They win this one.";
  return `You ${mine} · Them ${theirs}. ${verdict}`;
}

// How to share. Phones (a finger as the main pointer) use the share sheet:
// with the image where they allow it, else the message alone. Desktops skip
// the system share (Windows' share window drops the message) and get our panel.
export function shareRoute(device: { touch: boolean; canShareImage: boolean; canShareText: boolean }): "image" | "text" | "panel" {
  if (!device.touch) return "panel";
  if (device.canShareImage) return "image";
  if (device.canShareText) return "text";
  return "panel";
}

// Everything the share button needs, built once when the set is logged.
// `origin` is the address the app was opened on, so links work on any deploy.
export function buildShare(r: {
  origin: string;
  setId: string;
  mechanic: Card["mechanic"];
  title: string;
  runs: Run[];
  piece: string;
  score: number;
  ignoredFlags: number;
  team?: boolean;
  seed?: number; // the round's seed, for a set that draws, for the challenge link
}): Share {
  // Solo shares carry a challenge to beat this score; team shares link to the set.
  const link = r.team
    ? `${r.origin}/sets/${r.setId}`
    : challengeLink(r.origin, r.setId, { score: r.score, seed: r.seed });
  return {
    card: { mechanic: r.mechanic, title: r.title, runs: r.runs, score: r.score, ignoredFlags: r.ignoredFlags, team: r.team, url: link },
    message: shareMessage({ title: r.title, score: r.score, ignoredFlags: r.ignoredFlags, piece: r.piece, link, team: r.team }),
    fileName: `wriceps-${r.setId}.png`,
  };
}

// What the card shows, besides the piece.
export type Card = {
  mechanic: string; // "Constraint", "Fill-in", or "Blackout"
  title: string;
  runs: Run[];
  score: number;
  ignoredFlags: number;
  team?: boolean;
  url: string;
};
