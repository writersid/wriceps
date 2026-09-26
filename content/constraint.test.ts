import { describe, expect, it } from "vitest";
import { constraintSets } from "./constraint";

describe("constraint sets", () => {
  it("have unique ids", () => {
    const ids = constraintSets.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keep time limits in bonus rules only", () => {
    for (const set of constraintSets) {
      expect(set.rules.filter((r) => r.type === "timeLimit"), set.id).toEqual([]);
    }
  });
});
