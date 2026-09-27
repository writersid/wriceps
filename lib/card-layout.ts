// Wraps a card's styled runs into lines. Takes the text measurer as an
// argument, so it runs without a canvas in tests.
import type { Run } from "./share";

export type Placed = { text: string; style: Run["style"]; x: number; width: number };
type Measure = (text: string, style: Run["style"]) => number;

// A word is a run of text with no spaces, which may span runs ("answer" then
// ","), so a line never breaks between a word and its punctuation.
type Item = { type: "word"; pieces: Run[] } | { type: "space" } | { type: "break" };

function items(runs: Run[]): Item[] {
  const out: Item[] = [];
  for (const run of runs) {
    for (const chunk of run.text.split(/(\n|[^\S\n]+)/)) {
      if (!chunk) continue;
      if (chunk === "\n") out.push({ type: "break" });
      else if (!/\S/.test(chunk)) out.push({ type: "space" });
      else {
        const last = out.at(-1);
        if (last?.type === "word") last.pieces.push({ text: chunk, style: run.style });
        else out.push({ type: "word", pieces: [{ text: chunk, style: run.style }] });
      }
    }
  }
  return out;
}

export function layoutRuns(runs: Run[], measure: Measure, width: number): Placed[][] {
  const lines: Placed[][] = [[]];
  let x = 0;
  let space = false;
  const spaceWidth = measure(" ", "plain");
  for (const item of items(runs)) {
    if (item.type === "break") {
      lines.push([]);
      x = 0;
      space = false;
    } else if (item.type === "space") {
      space = lines.at(-1)!.length > 0;
    } else {
      const widths = item.pieces.map((p) => measure(p.text, p.style));
      const total = widths.reduce((a, b) => a + b, 0);
      let start = x + (space ? spaceWidth : 0);
      if (lines.at(-1)!.length > 0 && start + total > width) {
        lines.push([]);
        start = 0;
      }
      item.pieces.forEach((p, i) => {
        lines.at(-1)!.push({ ...p, x: start, width: widths[i] });
        start += widths[i];
      });
      x = start;
      space = false;
    }
  }
  return lines;
}
