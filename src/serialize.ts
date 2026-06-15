import type { Settings, Snippet } from "./types.js";

const DEFAULT_PREFIX = ":";

/** Pretty JSON of the current settings for download. */
export function exportSettings(s: Settings): string {
  return JSON.stringify(s, null, 2);
}

/**
 * Parse + validate imported JSON into Settings. Pure, testable.
 * Accepts either a full Settings object `{ prefix, snippets }`
 * or a bare array of snippets `[ {key,value,match}, ... ]`.
 * Throws Error with a human message on bad input.
 */
export function parseImport(raw: string): Settings {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Not valid JSON");
  }

  const arr = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.snippets)
      ? data.snippets
      : null;
  if (!arr) throw new Error("Expected a snippets array or { prefix, snippets }");

  const snippets: Snippet[] = arr.map((item, i) => {
    if (!isRecord(item)) throw new Error(`Snippet ${i + 1} is not an object`);
    const key = String(item.key ?? "").trim().toLowerCase();
    const value = String(item.value ?? "");
    if (!key) throw new Error(`Snippet ${i + 1} missing "key"`);
    if (!value) throw new Error(`Snippet "${key}" missing "value"`);
    return { key, value };
  });

  const prefix =
    isRecord(data) && typeof data.prefix === "string" && data.prefix.trim()
      ? data.prefix.trim()
      : DEFAULT_PREFIX;

  return { prefix, snippets };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
