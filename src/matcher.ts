import type { Snippet } from "./types.js";

/**
 * Pure match logic — no DOM, no chrome APIs, fully unit-testable.
 *
 * `typed` is the word the user wrote after the prefix (without the prefix char).
 * Returns the matching snippet, or null if none.
 *
 * Rule: exact, case-insensitive — typed === key.
 */
export function match(typed: string, snippets: Snippet[]): Snippet | null {
  if (!typed) return null;
  const t = typed.toLowerCase();
  return snippets.find((s) => s.key.toLowerCase() === t) ?? null;
}

/**
 * Find a trigger at the end of `textBeforeCursor`.
 * Looks for `prefix` followed by word chars at the very end.
 * Returns the typed word (no prefix) and the start index of the prefix,
 * or null if the cursor is not sitting right after a trigger.
 */
export function triggerAtCursor(
  textBeforeCursor: string,
  prefix: string,
): { typed: string; start: number } | null {
  // word chars after the prefix, anchored to end of string
  const esc = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${esc}([A-Za-z0-9_-]+)$`);
  const m = re.exec(textBeforeCursor);
  if (!m) return null;
  return { typed: m[1], start: m.index };
}
