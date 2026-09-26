import { describe, expect, it } from "vitest";
import { parseTemplate } from "../lib/fill-in";
import { constraintSets } from "./constraint";
import { fillInSets } from "./fill-in";

const allSets = [...constraintSets, ...fillInSets];

describe("content", () => {
  it("has unique set ids across mechanics, since they share /sets/[id]", () => {
    const ids = allSets.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps time limits in bonus rules only", () => {
    for (const set of allSets) {
      expect(set.rules.filter((r) => r.type === "timeLimit"), set.id).toEqual([]);
    }
  });

  it("has fill-in templates that parse", () => {
    for (const set of fillInSets) {
      expect(() => parseTemplate(set.template), set.id).not.toThrow();
    }
  });
});
