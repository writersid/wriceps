import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDraft, getBest, loadDraft, logScore, saveDraft } from "./progress";

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
