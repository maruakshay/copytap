import { match, triggerAtCursor } from "./matcher.js";
import { loadSettings, onSettingsChanged } from "./storage.js";
import { DEFAULTS, type Settings } from "./types.js";

let settings: Settings = DEFAULTS;

loadSettings().then((s) => (settings = s));
onSettingsChanged((s) => (settings = s));

type EditableInput = HTMLInputElement | HTMLTextAreaElement;

const TEXT_INPUT_TYPES = new Set([
  "text", "search", "url", "email", "tel", "password", "",
]);

function isTextInput(el: Element | null): el is EditableInput {
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) return TEXT_INPUT_TYPES.has(el.type);
  return false;
}

function isContentEditable(el: Element | null): el is HTMLElement {
  return el instanceof HTMLElement && el.isContentEditable;
}

/** Try to expand a trigger at the caret. Returns true if something expanded. */
function tryExpand(el: Element | null): boolean {
  if (isTextInput(el)) return expandInput(el);
  if (isContentEditable(el)) return expandContentEditable(el);
  return false;
}

function expandInput(el: EditableInput): boolean {
  const end = el.selectionEnd ?? el.value.length;
  const before = el.value.slice(0, end);
  const hit = triggerAtCursor(before, settings.prefix);
  if (!hit) return false;

  const snippet = match(hit.typed, settings.snippets);
  if (!snippet) return false;

  const after = el.value.slice(end);
  el.value = before.slice(0, hit.start) + snippet.value + after;

  const caret = hit.start + snippet.value.length;
  el.setSelectionRange(caret, caret);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

function expandContentEditable(host: HTMLElement): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return false;

  const range = sel.getRangeAt(0);
  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE) return false;
  if (!host.contains(node)) return false;

  const offset = range.startOffset;
  const text = node.textContent ?? "";
  const before = text.slice(0, offset);

  const hit = triggerAtCursor(before, settings.prefix);
  if (!hit) return false;

  const snippet = match(hit.typed, settings.snippets);
  if (!snippet) return false;

  // replace the ":key" run inside the text node
  const replaceRange = document.createRange();
  replaceRange.setStart(node, hit.start);
  replaceRange.setEnd(node, offset);
  replaceRange.deleteContents();
  const inserted = document.createTextNode(snippet.value);
  replaceRange.insertNode(inserted);

  // caret to end of inserted text
  sel.removeAllRanges();
  const after = document.createRange();
  after.setStartAfter(inserted);
  after.collapse(true);
  sel.addRange(after);

  host.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

// Auto-expand: on every input, check if caret now sits after a trigger.
document.addEventListener(
  "input",
  (e) => {
    const t = e.target as Element | null;
    if (isTextInput(t) || isContentEditable(t)) tryExpand(t);
  },
  true,
);

// Hotkey fallback A: background relays the registered command.
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "expand-snippet") tryExpand(document.activeElement);
});

// Hotkey fallback B: catch the combo directly in the page. Works even when
// Chrome failed to bind the registered shortcut (conflict, unset, etc.).
// Combo: Ctrl + Shift + Space (same on mac and windows/linux).
// Dual-purpose: expand a :key if one sits before the caret, else open Options.
document.addEventListener(
  "keydown",
  (e) => {
    if (!(e.ctrlKey && e.shiftKey && e.code === "Space")) return;
    e.preventDefault();
    if (!tryExpand(document.activeElement)) {
      chrome.runtime.sendMessage({ type: "open-options" });
    }
  },
  true,
);
