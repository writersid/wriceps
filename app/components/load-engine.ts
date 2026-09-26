// The rule engine and language tools, loaded only when a set opens, not with
// the app (see CLAUDE.md, "Constraint for later phases").
export type Engine = {
  checkText: typeof import("@/lib/engine/check").checkText;
  syllableRange: typeof import("@/lib/engine/language").syllableRange;
};

export async function loadEngine(): Promise<Engine> {
  const [check, language] = await Promise.all([import("@/lib/engine/check"), import("@/lib/engine/language")]);
  return { checkText: check.checkText, syllableRange: language.syllableRange };
}
