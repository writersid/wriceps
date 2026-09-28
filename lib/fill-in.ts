// Fill-in poems: template parsing and answers as text for the rule engine.
// The round's random letter is drawn in lib/round.ts. See SPEC.md "Fill-in poems".

// Template syntax: "{noun}" is a blank with its label; "{noun#shout}" also
// names it; "{=shout}" echoes that blank's answer, filled in automatically.
export type Part =
  | { type: "text"; text: string }
  | { type: "blank"; index: number; label: string }
  | { type: "echo"; index: number };

// Throws on a mistake in the template, so content tests catch it.
export function parseTemplate(template: string): { parts: Part[]; labels: string[] } {
  const parts: Part[] = [];
  const labels: string[] = [];
  const names = new Map<string, number>();
  const text = (s: string) => {
    if (/[{}]/.test(s)) throw new Error(`Stray brace in template near "${s}"`);
    if (s) parts.push({ type: "text", text: s });
  };
  let at = 0;
  for (const m of template.matchAll(/\{([^{}]*)\}/g)) {
    text(template.slice(at, m.index));
    const inner = m[1].trim();
    if (inner.startsWith("=")) {
      const index = names.get(inner.slice(1).trim());
      if (index === undefined) throw new Error(`"{${inner}}" echoes no earlier named blank`);
      parts.push({ type: "echo", index });
    } else {
      const [label, name] = inner.split("#").map((s) => s.trim());
      if (!label) throw new Error(`Blank "{${inner}}" has no label`);
      if (name) {
        if (names.has(name)) throw new Error(`Two blanks are named "${name}"`);
        names.set(name, labels.length);
      }
      parts.push({ type: "blank", index: labels.length, label });
      labels.push(label);
    }
    at = m.index + m[0].length;
  }
  text(template.slice(at));
  if (labels.length === 0) throw new Error("Template has no blanks");
  return { parts, labels };
}

// The answers as the rule engine sees them: one per line. Echoes aren't
// included, so they're never checked. Line breaks inside an answer become
// spaces, which keeps every position the same as in the answer.
export function answersText(answers: string[]): string {
  return answers.map((a) => a.replace(/\n/g, " ")).join("\n");
}

// Which answer a position in answersText falls in, and where in that answer.
export function answerAt(answers: string[], pos: number): { index: number; offset: number } {
  let start = 0;
  for (let index = 0; index < answers.length; index++) {
    if (pos <= start + answers[index].length) return { index, offset: pos - start };
    start += answers[index].length + 1;
  }
  return { index: answers.length - 1, offset: answers.at(-1)?.length ?? 0 };
}

// The live score while blanks are still empty, scaled by the share filled, so
// a half-done poem can't show a high band. Logging needs every blank anyway.
export function scaleByFilled(score: number, answers: string[]): number {
  const filled = answers.filter((a) => a.trim()).length;
  return answers.length ? Math.round((score * filled) / answers.length) : 0;
}

// Whether the blank or echo at parts[index] starts a sentence: at the start of
// the template, at the start of a line, or after . ! or ? and a space. Only
// for display; the rules check answers as typed.
export function startsSentence(parts: Part[], index: number): boolean {
  const before = parts[index - 1];
  if (!before) return true;
  if (before.type !== "text") return false;
  if (index === 1 && !before.text.trim()) return true;
  return /(?:[.!?]["'”’)]*\s+|\n\s*)$/.test(before.text);
}

// The answer with its first letter capitalized, for display.
export function capitalizeFirst(answer: string): string {
  return answer.replace(/\p{L}/u, (letter) => letter.toUpperCase());
}
