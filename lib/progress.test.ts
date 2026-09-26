import { beforeEach, describe, expect, it, vi } from "vitest";
import { constraintSets } from "../content/constraint";
import { checkText } from "./engine/check";
import { scoreText } from "./engine/score";
import { clearDraft, getBest, loadDraft, loadFillInDraft, logScore, saveDraft, workInProgress } from "./progress";

// Tests run in Node, which has no localStorage, so stand in a simple one.
function fakeStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", fakeStorage());
});

describe("best scores", () => {
  it("treats the first logged score as a PR and keeps the highest", () => {
    expect(getBest("a")).toBeNull();
    expect(logScore("a", 60)).toEqual({ best: 60, isNewPR: true });
    expect(logScore("a", 40)).toEqual({ best: 60, isNewPR: false });
    expect(logScore("a", 60)).toEqual({ best: 60, isNewPR: false });
    expect(logScore("a", 75)).toEqual({ best: 75, isNewPR: true });
    expect(getBest("a")).toBe(75);
  });

  it("keeps each set's best separate", () => {
    logScore("a", 50);
    logScore("b", 90);
    expect([getBest("a"), getBest("b")]).toEqual([50, 90]);
  });
});

describe("drafts", () => {
  it("saves, loads, and clears a draft", () => {
    saveDraft("a", { text: "Hello", ignored: ["k"] });
    expect(loadDraft("a")).toEqual({ text: "Hello", ignored: ["k"] });
    clearDraft("a");
    expect(loadDraft("a")).toBeNull();
  });

  it("ignores damaged saved data", () => {
    localStorage.setItem("wriceps-draft:a", "not json");
    localStorage.setItem("wriceps-progress", '{"a":{"best":"high"}}');
    expect(loadDraft("a")).toBeNull();
    expect(getBest("a")).toBeNull();
  });
});

describe("time-limit clock in the saved draft", () => {
  const sprint = constraintSets.find((s) => s.id === "two-syllable-sprint")!;
  // 20 different two-syllable nouns: every main rule passes.
  const list =
    "window garden river table pencil basket rabbit candle button doctor " +
    "kitchen carpet pepper dinner music bottle forest paper monkey butter";
  const scoreAfter = (elapsedMs: number) => scoreText(list, sprint, checkText(list, sprint, elapsedMs), []).score;

  it("saves the start time and restores it after a reload", () => {
    const startedAt = 1_700_000_000_000;
    saveDraft(sprint.id, { text: "window", ignored: [], startedAt });
    expect(loadDraft(sprint.id)).toEqual({ text: "window", ignored: [], startedAt });
  });

  it("drops a start time that isn't a number", () => {
    localStorage.setItem(`wriceps-draft:${sprint.id}`, '{"text":"window","ignored":[],"startedAt":"soon"}');
    expect(loadDraft(sprint.id)).toEqual({ text: "window", ignored: [] });
  });

  it("keeps the bonus within the limit and loses its full weight after, timed from the restored start", () => {
    const startedAt = 1_700_000_000_000;
    saveDraft(sprint.id, { text: list, ignored: [], startedAt });
    const restored = loadDraft(sprint.id)!.startedAt!;
    const bonus = sprint.bonus!.find((r) => r.type === "timeLimit")!.weight;
    const inTime = scoreAfter(startedAt + 59_000 - restored);
    const late = scoreAfter(startedAt + 61_000 - restored);
    expect(inTime).toBe(100);
    expect(inTime - late).toBe(bonus);
  });
});

describe("fill-in drafts", () => {
  const draft = { answers: ["snow", ""], ignored: [], seed: 42, step: 1, startedAt: 1_700_000_000_000 };

  it("saves and restores answers, seed, step, and clock", () => {
    saveDraft("f", draft);
    expect(loadFillInDraft("f", 2)).toEqual(draft);
  });

  it("drops a draft whose blank count no longer matches the template", () => {
    saveDraft("f", draft);
    expect(loadFillInDraft("f", 3)).toBeNull();
  });

  it("drops damaged drafts", () => {
    localStorage.setItem("wriceps-draft:f", '{"answers":["a",2],"ignored":[],"seed":1,"step":0}');
    expect(loadFillInDraft("f", 2)).toBeNull();
  });
});

describe("pass-the-phone games", () => {
  const game = (phase: "handoff" | "turn" | "reveal") => ({
    answers: ["snow", "sing"],
    ignored: [],
    seed: 7,
    step: 0,
    pass: { turn: 1, phase, shown: phase === "reveal" ? 2 : 0 },
  });

  it("keeps every turn's answers and the turn number after a reload", () => {
    saveDraft("p", game("handoff"));
    expect(loadFillInDraft("p", 2)).toEqual(game("handoff"));
  });

  it("reopens a turn in progress on its handoff screen", () => {
    saveDraft("p", game("turn"));
    expect(loadFillInDraft("p", 2)?.pass).toEqual({ turn: 1, phase: "handoff", shown: 0 });
  });

  it("keeps the reveal where it was", () => {
    saveDraft("p", game("reveal"));
    expect(loadFillInDraft("p", 2)?.pass).toEqual({ turn: 1, phase: "reveal", shown: 2 });
  });

  it("drops a damaged game state", () => {
    localStorage.setItem(
      "wriceps-draft:p",
      '{"answers":["a","b"],"ignored":[],"seed":1,"step":0,"pass":{"turn":1,"phase":"peek","shown":0}}',
    );
    expect(loadFillInDraft("p", 2)).toBeNull();
  });
});

describe("starting over", () => {
  it("offers it once there's work: text in a constraint draft", () => {
    expect(workInProgress([""])).toBe(false);
    expect(workInProgress(["  \n "])).toBe(false);
    expect(workInProgress(["The tea went cold."])).toBe(true);
  });

  it("offers it once there's work: any fill-in answer, or a spotter game", () => {
    expect(workInProgress(["", " "])).toBe(false);
    expect(workInProgress(["", "snow"])).toBe(true);
    expect(workInProgress(["", ""], true)).toBe(true);
  });

  it("discards the saved work of either kind of set", () => {
    saveDraft("c", { text: "The tea went cold.", ignored: ["x"], startedAt: 1 });
    saveDraft("f", { answers: ["snow", ""], ignored: [], seed: 3, step: 1, pass: { turn: 1, phase: "handoff", shown: 0 } });
    clearDraft("c");
    clearDraft("f");
    expect(loadDraft("c")).toBeNull();
    expect(loadFillInDraft("f", 2)).toBeNull();
  });

  it("keeps the best score", () => {
    logScore("c", 70);
    saveDraft("c", { text: "Another rep.", ignored: [] });
    clearDraft("c");
    expect(getBest("c")).toBe(70);
  });
});

describe("when storage is blocked", () => {
  it("fails quietly", () => {
    const blocked = () => {
      throw new Error("blocked");
    };
    vi.stubGlobal("localStorage", { getItem: blocked, setItem: blocked, removeItem: blocked });
    expect(getBest("a")).toBeNull();
    expect(logScore("a", 50)).toEqual({ best: 50, isNewPR: true });
    expect(loadDraft("a")).toBeNull();
    expect(() => saveDraft("a", { text: "x", ignored: [] })).not.toThrow();
    expect(() => clearDraft("a")).not.toThrow();
  });
});
