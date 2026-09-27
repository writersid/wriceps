import { describe, expect, it } from "vitest";
import { passageWords } from "./blackout";
import { layoutRuns } from "./card-layout";
import { parseTemplate } from "./fill-in";
import {
  blackoutRuns,
  buildShare,
  challengeLink,
  challengeResult,
  fillInRuns,
  fillInText,
  parseChallenge,
  shareMessage,
  shareRoute,
  trimWords,
  type Run,
} from "./share";

describe("share message", () => {
  const base = { title: "Weather Report", score: 82, ignoredFlags: 0, piece: "Snow sings.", link: "https://x.test/sets/w" };

  it("puts the score line, the piece, and the link on separate paragraphs", () => {
    expect(shareMessage(base)).toBe("Weather Report · 82 (Heavy lift)\n\nSnow sings.\n\nBeat it: https://x.test/sets/w");
  });

  it("counts ignored flags, singular and plural", () => {
    expect(shareMessage({ ...base, ignoredFlags: 1 })).toContain("· 1 flag ignored");
    expect(shareMessage({ ...base, ignoredFlags: 2 })).toContain("· 2 flags ignored");
  });

  it("marks a team score and links to the set without a challenge", () => {
    const text = shareMessage({ ...base, team: true });
    expect(text).toContain("Weather Report · Team score 82 (Heavy lift) · With a spotter");
    expect(text).toContain("Play it: https://x.test/sets/w");
    expect(text).not.toContain("Beat it");
  });
});

describe("challenge links", () => {
  it("carries the score, and the seed for a fill-in", () => {
    expect(challengeLink("https://x.test", "call-me", { score: 82 })).toBe("https://x.test/sets/call-me?c=82");
    expect(challengeLink("https://x.test", "weather-report", { score: 40, seed: 123 })).toBe(
      "https://x.test/sets/weather-report?c=40&seed=123",
    );
  });

  it("reads back what it wrote", () => {
    expect(parseChallenge("?c=40&seed=4294967295")).toEqual({ score: 40, seed: 4294967295 });
    expect(parseChallenge("?c=100")).toEqual({ score: 100 });
    expect(parseChallenge("?c=0")).toEqual({ score: 0 });
  });

  it("ignores a broken or out-of-range score, so the set opens normally", () => {
    for (const bad of ["", "?c=", "?c=101", "?c=-5", "?c=8.5", "?c=abc", "?seed=12"]) expect(parseChallenge(bad), bad).toBeNull();
  });

  it("drops a broken seed but keeps the score", () => {
    for (const bad of ["x", "-1", "4294967296", "1.5"]) expect(parseChallenge(`?c=50&seed=${bad}`), bad).toEqual({ score: 50 });
  });

  it("puts a challenge link in solo shares and a plain link in team shares", () => {
    const common = { origin: "https://x.test", setId: "w", mechanic: "Fill-in" as const, title: "W", runs: [], piece: "", score: 70, ignoredFlags: 0 };
    expect(buildShare({ ...common, seed: 9 }).message).toContain("Beat it: https://x.test/sets/w?c=70&seed=9");
    expect(buildShare({ ...common, seed: 9, team: true }).message).toContain("Play it: https://x.test/sets/w");
    expect(buildShare({ ...common, seed: 9, team: true }).message).not.toContain("?c=");
  });

  it("compares scores", () => {
    expect(challengeResult(85, 82)).toBe("You 85 · Them 82. You win.");
    expect(challengeResult(82, 82)).toBe("You 82 · Them 82. A tie.");
    expect(challengeResult(70, 82)).toBe("You 70 · Them 82. They win this one.");
  });
});

describe("choosing how to share", () => {
  const phone = { touch: true, canShareImage: true, canShareText: true };

  it("shares the image from a phone's share sheet where it can", () => {
    expect(shareRoute(phone)).toBe("image");
  });

  it("falls back to the message alone, then to the panel, on a phone", () => {
    expect(shareRoute({ ...phone, canShareImage: false })).toBe("text");
    expect(shareRoute({ touch: true, canShareImage: false, canShareText: false })).toBe("panel");
  });

  it("always shows the panel on a desktop, even where the system share exists", () => {
    expect(shareRoute({ ...phone, touch: false })).toBe("panel");
  });
});

describe("trimming the piece", () => {
  const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i + 1}`).join(" ");

  it("keeps a piece of up to 60 words whole", () => {
    expect(trimWords(words(60), 60)).toBe(words(60));
  });

  it("cuts a longer piece after its 60th word, keeping its punctuation out", () => {
    const text = `${words(59)} sixty, sixty-one.`;
    expect(trimWords(text, 60)).toBe(`${words(59)} sixty…`);
  });

  it("keeps line breaks", () => {
    expect(trimWords("one\ntwo three", 2)).toBe("one\ntwo…");
  });
});

describe("card pieces", () => {
  it("bolds fill-in answers and echoes, capitalized at sentence starts", () => {
    const { parts } = parseTemplate("I shouted {noun#s}. {=s} came back as {noun}.");
    const runs = fillInRuns(parts, ["snow", "sleet"]);
    expect(runs.filter((r) => r.style === "bold").map((r) => r.text)).toEqual(["snow", "Snow", "sleet"]);
    expect(fillInText(parts, ["snow", "sleet"])).toBe("I shouted snow. Snow came back as sleet.");
  });

  it("draws a blackout page: kept words bold, dropped words and punctuation as bars", () => {
    const passage = "It was the best of times, it was";
    const words = passageWords(passage);
    const runs = blackoutRuns(passage, words, [3, 5]); // best, times
    const shown = runs.filter((r) => r.style !== "plain");
    expect(shown).toEqual([
      { text: "It", style: "bar" },
      { text: "was", style: "bar" },
      { text: "the", style: "bar" },
      { text: "best", style: "bold" },
      { text: "of", style: "bar" },
      { text: "times", style: "bold" },
      { text: ",", style: "bar" },
      { text: "it", style: "bar" },
      { text: "was", style: "bar" },
    ]);
    // Punctuation after a dropped word joins its bar.
    expect(blackoutRuns(passage, words, [3])).toContainEqual({ text: "times,", style: "bar" });
  });
});

describe("card layout", () => {
  const measure = (text: string) => text.length * 10;
  const lineTexts = (runs: Run[], width: number) => layoutRuns(runs, measure, width).map((l) => l.map((p) => p.text).join("|"));

  it("wraps at the width, and never between a word and its punctuation", () => {
    const runs: Run[] = [
      { text: "The sky is ", style: "plain" },
      { text: "grey", style: "bold" },
      { text: ", then gone.", style: "plain" },
    ];
    expect(lineTexts(runs, 100)).toEqual(["The|sky|is", "grey|,|then", "gone."]);
  });

  it("keeps line breaks and blank lines", () => {
    expect(lineTexts([{ text: "one\n\ntwo", style: "plain" }], 500)).toEqual(["one", "", "two"]);
  });

  it("places words with a space between them", () => {
    const [line] = layoutRuns([{ text: "ab cd", style: "plain" }], measure, 500);
    expect(line.map((p) => p.x)).toEqual([0, 30]);
  });
});
