<p align="center">
  <img src="logo.png" alt="Coptap" width="96" height="96" />
</p>

<h1 align="center">Copytap — snippet expander</h1>

> Type `:linkedin`, get `https://linkedin.com/in/your-handle`. Instantly, in any text box, on any site.

## The problem

You type the same things over and over. Your email, your LinkedIn, your address,
your wallet ID, a support reply you send daily, a code block you keep reaching for —
the same text, retyped across forms, chats, docs, and dashboards all day long.

Chrome has no built-in way to say "when I type `addr`, drop in my full address."
So you copy-paste from a notes file, or retype from memory and get it wrong.
It's slow, it breaks your flow, and it adds up across hundreds of fields.

## The solution

A tiny key→value expander that lives in the browser. You store snippets once
(`addr` → your full address), then trigger them anywhere by typing a short key.

- **Auto-expand** — type the prefix + key (e.g. `:addr`). The instant it
  matches a snippet, it swaps in the full value. No clicking, no menus, no chord.
- **Works everywhere** — any `<input>`, `<textarea>`, or rich-text field, on any site.
- **Yours, synced** — snippets roam across your signed-in Chrome via `chrome.storage.sync`.
  Add your own, import/export as JSON.

Built to kill repetitive typing — anywhere you fill in text.

## How it works

- **Prefix auto-expand:** type the prefix (`:` by default) + a key. The moment the
  typed word matches a snippet, it swaps in the value. No keypress needed.
- **Hotkey:** `Ctrl+Shift+Space` (same on macOS, Windows, Linux). Expands the
  `:key` before the caret — or, if there's nothing to expand, opens Options.
- **Matching:** exact, case-insensitive — the typed word must equal a key.
- Works in `<input>`, `<textarea>`, and `contenteditable` fields.
- Snippets live in `chrome.storage.sync` — roam across your signed-in Chrome.
- **Custom snippets:** add your own in Options with **+ Add snippet** (key, value), then **Save**.
- **Import / Export JSON:** back up or share your snippets.
  - *Export* downloads `coptap-snippets-YYYY-MM-DD.json` (`{ prefix, snippets }`).
  - *Import* accepts that full shape **or** a bare `[{key,value}]` array.
    Imported keys merge over existing ones; review the table, then **Save**.

## Setup

```bash
npm install
npm run build      # outputs to dist/
```

Then in Chrome:

1. Go to `chrome://extensions`.
2. Toggle **Developer mode** (top right).
3. **Load unpacked** → select the `dist/` folder.
4. Open the extension's **Options** to add/edit your key→value pairs.

Dev loop: `npm run watch` rebuilds on save. Hit the reload icon on the
extension card to pick up changes.

## Project layout

```
manifest.json          MV3 manifest (source; copied to dist/ on build)
build.mjs              esbuild bundler + static copy
src/
  types.ts             Snippet/Settings shapes + defaults
  matcher.ts           pure match logic — no DOM, unit-tested
  matcher.test.ts      node:test cases
  serialize.ts         import/export JSON parse + validate — pure, unit-tested
  serialize.test.ts    node:test cases
  storage.ts           chrome.storage.sync load/save + change subscription
  content.ts           DOM glue: detect trigger, replace text
  background.ts        service worker: relay hotkey command
  options/             key→value editor UI
```

## Test / typecheck

```bash
npm test           # runs matcher tests (node:test)
npm run typecheck  # tsc --noEmit
```

## Cross-platform

Runs anywhere Chrome (or any Chromium browser — Edge, Brave) runs: **macOS, Windows, Linux**.

- Same hotkey everywhere: `Ctrl+Shift+Space` on macOS, Windows, and Linux
  (mac maps the Ctrl key via `MacCtrl` in `manifest.json`).
- Build tooling is Node-only and OS-agnostic — `npm run build` / `watch` work the same
  on all three (the Tailwind step resolves `npx`/`npx.cmd` per platform).
- Requires Node 20+ to build.

## Notes

- `Cmd+Shift+Tab` (from the original idea) is reserved by Chrome for tab
  switching and can't be overridden, so the hotkey is `Ctrl+Shift+Space`.
  You can rebind it at `chrome://extensions/shortcuts`.
- Prefix is configurable in Options (e.g. switch `:` to `/`).
