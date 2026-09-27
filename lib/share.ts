// Result cards and share messages. See SPEC.md "Sharing details".
// The card's piece is a list of styled runs: plain text, bold (answers, kept
// words), or a bar (blacked-out text). "\n" in a run's text is a line break.
import { bandFor } from "./engine/score";
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

// DRAFT wording, for Sid to rewrite: the score line, the piece, then the link.
export function shareMessage(r: {
  title: string;
  score: number;
  ignoredFlags: number;
  piece: string;
  link: string;
  team?: boolean;
}): string {
  const scoreLine = [
    r.title,
    `${r.team ? "Team score " : ""}${r.score} (${bandFor(r.score)})`,
    ...(r.team ? ["With a spotter"] : []),
    ...(r.ignoredFlags ? [ignoredLine(r.ignoredFlags)] : []),
  ].join(" · ");
  const piece = trimWords(r.piece, MESSAGE_WORDS);
  return [scoreLine, ...(piece ? [piece] : []), `${r.team ? "Play it" : "Beat it"}: ${r.link}`].join("\n\n");
}

export type Share = { card: Card; message: string; fileName: string };

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
}): Share {
  const link = `${r.origin}/sets/${r.setId}`;
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
