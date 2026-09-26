// Pass-the-phone: turns, teasers, and keeping the other player's words hidden.
// See SPEC.md "Pass-the-phone details".
import { normalizeWord, tokenize } from "./engine/tokenize";
import type { Flag } from "./engine/types";
import { answerAt, answersText, type Part } from "./fill-in";

export type Player = "You" | "Spotter";
export type PassPhase = "handoff" | "turn" | "reveal";
// `shown`: how many lines the line-by-line reveal has shown.
export type PassState = { turn: number; phase: PassPhase; shown: number };

// The template's parts, one array per line, with the line breaks removed.
export function splitLines(parts: Part[]): Part[][] {
  const lines: Part[][] = [[]];
  for (const part of parts) {
    if (part.type !== "text") {
      lines[lines.length - 1].push(part);
      continue;
    }
    part.text.split("\n").forEach((piece, k) => {
      if (k > 0) lines.push([]);
      if (piece) lines[lines.length - 1].push({ type: "text", text: piece });
    });
  }
  return lines;
}

// The lines back as one list of parts, for showing part of the poem.
export function joinLines(lines: Part[][]): Part[] {
  return lines.flatMap((line, k) => (k === 0 ? line : [{ type: "text" as const, text: "\n" }, ...line]));
}

// The blanks to fill on a line; echoes don't count.
export const blanksIn = (line: Part[]) => line.flatMap((p) => (p.type === "blank" ? [p.index] : []));

// Which lines are turns: only lines with blanks to fill. Lines of template
// text or echoes only are revealed with the poem.
export function turnLines(lines: Part[][]): number[] {
  return lines.flatMap((line, i) => (blanksIn(line).length > 0 ? [i] : []));
}

// Turns alternate, and the spotter takes turn 2.
export const playerFor = (turn: number): Player => (turn % 2 === 0 ? "You" : "Spotter");

// The last few words of a line as the next player sees them. Echoes stay
// hidden, since they repeat an earlier answer.
export function teaser(line: Part[], answers: string[], words = 3): string {
  const text = line
    .map((p) => (p.type === "text" ? p.text : p.type === "blank" ? answers[p.index] : "___"))
    .join("");
  const all = text.trim().split(/\s+/).filter(Boolean);
  const last = all.slice(-words).join(" ");
  return all.length > words ? `…${last}` : last;
}

// The flags on this turn's blanks. A repeat of a word that isn't on this turn
// loses the word it repeats, so a note can't reveal the other player's words.
export function turnFlags(flags: Flag[], answers: string[], blanks: number[]): Flag[] {
  // This turn's words, with their positions in answersText.
  const own = tokenize(answersText(answers)).filter((t) => blanks.includes(answerAt(answers, t.start).index));
  return flags.flatMap((f) => {
    const start = f.start;
    if (start === undefined || !blanks.includes(answerAt(answers, start).index)) return [];
    const repeat = f.kind === "repeat" || f.kind === "repeatForm";
    const earlierHere = own.some((t) => t.start < start && normalizeWord(t.text) === normalizeWord(f.of ?? ""));
    if (repeat && !earlierHere) return [{ ...f, kind: "repeatEarlier", of: undefined }];
    return [f];
  });
}
