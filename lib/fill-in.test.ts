import { describe, expect, it } from "vitest";
import { checkText } from "./engine/check";
import { checkSameFirstLetter } from "./engine/rules";
import { scoreText } from "./engine/score";
import type { Exercise } from "./engine/types";
import {
  answerAt,
  answersText,
  capitalizeFirst,
  parseTemplate,
  scaleByFilled,
  startsSentence,
} from "./fill-in";

describe("parseTemplate", () => {
  it("splits text, blanks, and echoes", () => {
    const { parts, labels } = parseTemplate("I shouted {noun#shout}.\nIt said {=shout}, then {verb}.");
    expect(labels).toEqual(["noun", "verb"]);
    expect(parts).toEqual([
      { type: "text", text: "I shouted " },
      { type: "blank", index: 0, label: "noun" },
      { type: "text", text: ".\nIt said " },
      { type: "echo", index: 0 },
      { type: "text", text: ", then " },
      { type: "blank", index: 1, label: "verb" },
      { type: "text", text: "." },
    ]);
  });

  it("rejects mistakes", () => {
    expect(() => parseTemplate("No blanks here.")).toThrow("no blanks");
    expect(() => parseTemplate("{=later} then {noun#later}")).toThrow("echoes no earlier");
    expect(() => parseTemplate("{noun#a} {verb#a}")).toThrow("Two blanks");
    expect(() => parseTemplate("{noun} and {")).toThrow("Stray brace");
    expect(() => parseTemplate("{ }")).toThrow("no label");
  });
});

describe("answers as engine text", () => {
  it("puts one answer per line and maps positions back", () => {
    const answers = ["red fox", "runs", "What now?"];
    const text = answersText(answers);
    expect(text).toBe("red fox\nruns\nWhat now?");
    expect(answerAt(answers, text.indexOf("fox"))).toEqual({ index: 0, offset: 4 });
    expect(answerAt(answers, text.indexOf("runs"))).toEqual({ index: 1, offset: 0 });
    expect(answerAt(answers, text.indexOf("now"))).toEqual({ index: 2, offset: 5 });
  });

  it("keeps positions when an answer contains a line break", () => {
    expect(answersText(["a\nb", "c"])).toBe("a b\nc");
  });
});

describe("same first letter", () => {
  const rule = (letter?: string) => ({ type: "sameFirstLetter" as const, id: "l", weight: 60, letter });
  const words = (letter: string | undefined, answers: string[]) =>
    checkSameFirstLetter(rule(letter), answersText(answers)).map((f) => `${f.word}<${f.of}`);

  it("with a set letter, flags answers that start otherwise, ignoring case and accents", () => {
    expect(words("m", ["Moon", "mellow", "Élan", "mud pie"])).toEqual(["Élan<m"]);
  });

  it("with no letter, the first answer sets it", () => {
    expect(words(undefined, ["tiger", "Tall", "banana"])).toEqual(["banana<t"]);
  });

  it("skips empty answers and flags are strict", () => {
    expect(words("s", ["", "snow", "  "])).toEqual([]);
    expect(checkSameFirstLetter(rule("s"), "rain")[0]).toMatchObject({ ignorable: false, start: 0, end: 4 });
  });
});

describe("live score while blanks are empty", () => {
  it("scales by the share of blanks filled", () => {
    expect(scaleByFilled(100, ["a", "b", "", "", ""])).toBe(40);
    expect(scaleByFilled(80, ["a", "b", "c", " ", ""])).toBe(48);
    expect(scaleByFilled(90, ["a", "b"])).toBe(90);
    expect(scaleByFilled(90, ["", ""])).toBe(0);
  });
});

describe("capitals at the start of a sentence", () => {
  // Which blanks and echoes start a sentence, by position in the template.
  const starts = (template: string) => {
    const { parts } = parseTemplate(template);
    return parts.flatMap((p, i) => (p.type === "text" ? [] : [startsSentence(parts, i)]));
  };

  it("at the start of the template or of a line", () => {
    expect(starts("{noun} ran.\n{verb} now.")).toEqual([true, true]);
    expect(starts("  {noun} ran.")).toEqual([true]);
  });

  it("after . ! or ? and a space, including after a closing quote", () => {
    expect(starts('It ended. {noun}! {verb}? {adjective} "Go." {noun} done.')).toEqual([true, true, true, true]);
  });

  it("not mid-sentence, after a colon or comma, or right after another blank", () => {
    expect(starts("The {noun} said: {verb}, {adjective}{noun}.")).toEqual([false, false, false, false]);
  });

  it("covers echoes too", () => {
    expect(starts("I said {noun#reply}.\n{=reply}, said the canyon. {=reply}.")).toEqual([false, true, true]);
  });

  it("capitalizes only the first letter, leaving the rest as typed", () => {
    expect(capitalizeFirst("just me")).toBe("Just me");
    expect(capitalizeFirst("“oh no”")).toBe("“Oh no”");
    expect(capitalizeFirst("éclair")).toBe("Éclair");
    expect(capitalizeFirst("42")).toBe("42");
  });

  it("the rules still check the answer as typed", () => {
    const exercise: Exercise = { rules: [{ id: "l", type: "sameFirstLetter", letter: "j", weight: 100 }] };
    expect(checkText(answersText(["just me"]), exercise)).toEqual([]);
  });
});

describe("scoring answers", () => {
  it("scores the answers only, and echoes never count as repeats", () => {
    const exercise: Exercise = {
      rules: [
        { id: "l", type: "sameFirstLetter", letter: "s", weight: 60 },
        { id: "r", type: "noRepeats", weight: 40 },
      ],
    };
    // The template might echo "snow" twice; only the typed answers reach the engine.
    const answers = ["snow", "sings", "Should we stay?"];
    const text = answersText(answers);
    expect(scoreText(text, exercise, checkText(text, exercise), []).score).toBe(100);
  });
});
