import { test } from "node:test";
import assert from "node:assert/strict";
import { match, triggerAtCursor } from "./matcher.ts";
import type { Snippet } from "./types.ts";

const snips: Snippet[] = [
  { key: "linkedin", value: "LINK" },
  { key: "github", value: "GH" },
  { key: "git", value: "G" },
];

test("exact match", () => {
  assert.equal(match("linkedin", snips)?.value, "LINK");
});

test("exact is case-insensitive", () => {
  assert.equal(match("LinkedIn", snips)?.value, "LINK");
});

test("no match returns null", () => {
  assert.equal(match("nope", snips), null);
});

test("partial word does not match", () => {
  assert.equal(match("gi", snips), null);
});

test("full word hits", () => {
  assert.equal(match("github", snips)?.value, "GH");
});

test("empty typed -> null", () => {
  assert.equal(match("", snips), null);
});

test("triggerAtCursor finds word at end", () => {
  assert.deepEqual(triggerAtCursor("hello :linkedin", ":"), {
    typed: "linkedin",
    start: 6,
  });
});

test("triggerAtCursor null when not at end", () => {
  assert.equal(triggerAtCursor(":linkedin done", ":"), null);
});

test("triggerAtCursor null without prefix", () => {
  assert.equal(triggerAtCursor("linkedin", ":"), null);
});
