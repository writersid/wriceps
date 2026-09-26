import { describe, expect, it } from "vitest";
import { checkText } from "./engine/check";
import type { Exercise } from "./engine/types";
import { answersText, parseTemplate } from "./fill-in";
import { blanksIn, joinLines, playerFor, splitLines, teaser, turnFlags, turnLines } from "./pass";

const { parts } = parseTemplate(
  "The {noun#x} woke up.\n" + // turn 1: You
    "Nobody noticed.\n" + // template text only: not a turn
    "It began to {verb} and {verb}.\n" + // turn 2: Spotter
    "{=x}, {=x}.\n" + // echoes only: not a turn
    "Then {noun} asked {question}", // turn 3: You
);
const lines = splitLines(parts);

describe("turns", () => {
  it("splits the template into lines", () => {
    expect(lines).toHaveLength(5);
    expect(lines[1]).toEqual([{ type: "text", text: "Nobody noticed." }]);
  });

  it("skips lines with no blanks to fill: template text only, or echoes only", () => {
    expect(turnLines(lines)).toEqual([0, 2, 4]);
    expect(blanksIn(lines[3])).toEqual([]);
  });

  it("alternates players over the turn lines, spotter second", () => {
    expect(turnLines(lines).map((_, turn) => playerFor(turn))).toEqual(["You", "Spotter", "You"]);
  });

  it("joins lines back for the reveal", () => {
    expect(joinLines(lines.slice(0, 2))).toEqual([
      ...lines[0],
      { type: "text", text: "\n" },
      ...lines[1],
    ]);
  });
});

describe("teaser", () => {
  const answers = ["sardine", "swim", "sing", "salmon", "Who?"];

  it("shows the last 3 words of the previous turn", () => {
    expect(teaser(lines[2], answers)).toBe("…swim and sing.");
    expect(teaser(lines[0], answers)).toBe("…sardine woke up.");
  });

  it("keeps echoes hidden", () => {
    expect(teaser(lines[3], answers)).toBe("___, ___.");
  });

  it("shows short lines whole, without the ellipsis", () => {
    expect(teaser([{ type: "text", text: "Go now." }], answers)).toBe("Go now.");
  });
});

describe("notes during a turn", () => {
  const exercise: Exercise = { rules: [{ id: "r", type: "noRepeats", weight: 100 }] };
  const flagsFor = (answers: string[], blanks: number[]) =>
    turnFlags(checkText(answersText(answers), exercise), answers, blanks).map((f) => `${f.word}:${f.kind}:${f.of ?? "-"}`);

  it("only shows flags on this turn's blanks", () => {
    expect(flagsFor(["moon", "moon", "star"], [2])).toEqual([]);
  });

  it("hides the other player's word in a repeat", () => {
    expect(flagsFor(["moon", "stars", "moon"], [2])).toEqual(["moon:repeatEarlier:-"]);
    expect(flagsFor(["mouse", "stars", "mice"], [2])).toEqual(["mice:repeatEarlier:-"]);
  });

  it("names a repeat within the same turn", () => {
    expect(flagsFor(["stars", "moon", "moon"], [1, 2])).toEqual(["moon:repeat:moon"]);
  });
});
