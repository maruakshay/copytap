import { test } from "node:test";
import assert from "node:assert/strict";
import { exportSettings, parseImport } from "./serialize.ts";
import type { Settings } from "./types.ts";

const settings: Settings = {
  prefix: ":",
  snippets: [{ key: "linkedin", value: "LINK" }],
};

test("export then import round-trips", () => {
  const out = parseImport(exportSettings(settings));
  assert.deepEqual(out, settings);
});

test("import accepts bare snippet array", () => {
  const out = parseImport('[{"key":"gh","value":"X"}]');
  assert.equal(out.prefix, ":");
  assert.deepEqual(out.snippets, [{ key: "gh", value: "X" }]);
});

test("import lowercases key and trims", () => {
  const out = parseImport('[{"key":"  LinkedIn ","value":"X"}]');
  assert.equal(out.snippets[0].key, "linkedin");
});

test("import ignores legacy match field", () => {
  const out = parseImport('[{"key":"a","value":"X","match":"prefix"}]');
  assert.deepEqual(out.snippets[0], { key: "a", value: "X" });
});

test("import rejects invalid JSON", () => {
  assert.throws(() => parseImport("{nope"), /Not valid JSON/);
});

test("import rejects wrong shape", () => {
  assert.throws(() => parseImport('{"foo":1}'), /Expected a snippets array/);
});

test("import rejects snippet missing key", () => {
  assert.throws(() => parseImport('[{"value":"X"}]'), /missing "key"/);
});

test("import rejects snippet missing value", () => {
  assert.throws(() => parseImport('[{"key":"a"}]'), /missing "value"/);
});
