import { loadSettings, saveSettings } from "../storage.js";
import { exportSettings, parseImport } from "../serialize.js";
import type { Snippet } from "../types.js";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const rowsEl = $("rows") as HTMLDivElement;
const prefixEl = $("prefix") as HTMLInputElement;
const exPrefixEl = $("ex-prefix") as HTMLSpanElement;
const statusEl = $("status") as HTMLSpanElement;
const countEl = $("count") as HTMLSpanElement;
const emptyEl = $("empty") as HTMLDivElement;
const rowTpl = $("row-tpl") as HTMLTemplateElement;

function rowTemplate(s: Snippet): HTMLElement {
  const row = rowTpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
  (row.querySelector(".key") as HTMLInputElement).value = s.key;
  (row.querySelector(".val") as HTMLTextAreaElement).value = s.value;
  (row.querySelector(".del") as HTMLButtonElement).onclick = () => {
    row.remove();
    updateMeta();
  };
  return row;
}

function readRows(): Snippet[] {
  return [...rowsEl.children]
    .map((row): Snippet => ({
      key: (row.querySelector(".key") as HTMLInputElement).value.trim().toLowerCase(),
      value: (row.querySelector(".val") as HTMLTextAreaElement).value,
    }))
    .filter((s) => s.key && s.value);
}

function updateMeta(): void {
  const n = rowsEl.children.length;
  countEl.textContent = `${n} snippet${n === 1 ? "" : "s"}`;
  emptyEl.classList.toggle("hidden", n > 0);
}

function flash(msg: string): void {
  statusEl.textContent = msg;
  setTimeout(() => (statusEl.textContent = ""), 2400);
}

function renderRows(snippets: Snippet[]): void {
  rowsEl.replaceChildren(...snippets.map(rowTemplate));
  updateMeta();
}

function downloadJson(text: string): void {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `coptap-snippets-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function init(): Promise<void> {
  ($("hotkey") as HTMLElement).textContent = "Ctrl+Shift+Space";

  const s = await loadSettings();
  prefixEl.value = s.prefix;
  exPrefixEl.textContent = s.prefix;
  renderRows(s.snippets);

  prefixEl.oninput = () => (exPrefixEl.textContent = prefixEl.value || ":");

  $("add").onclick = () => {
    const row = rowTemplate({ key: "", value: "" });
    rowsEl.appendChild(row);
    updateMeta();
    (row.querySelector(".key") as HTMLInputElement).focus();
  };

  $("save").onclick = async () => {
    const prefix = prefixEl.value.trim() || ":";
    await saveSettings({ prefix, snippets: readRows() });
    flash("Saved ✓");
  };

  $("export").onclick = () => {
    const prefix = prefixEl.value.trim() || ":";
    downloadJson(exportSettings({ prefix, snippets: readRows() }));
    flash("Exported ✓");
  };

  const fileEl = $("file") as HTMLInputElement;
  $("import").onclick = () => fileEl.click();
  fileEl.onchange = async () => {
    const file = fileEl.files?.[0];
    fileEl.value = ""; // allow re-importing the same file
    if (!file) return;
    try {
      const incoming = parseImport(await file.text());
      // merge: imported keys overwrite existing; rest kept
      const byKey = new Map<string, Snippet>();
      for (const snip of readRows()) byKey.set(snip.key, snip);
      for (const snip of incoming.snippets) byKey.set(snip.key, snip);
      prefixEl.value = incoming.prefix;
      exPrefixEl.textContent = incoming.prefix;
      renderRows([...byKey.values()]);
      flash(`Imported ${incoming.snippets.length} — review then Save`);
    } catch (err) {
      flash(`Import failed: ${(err as Error).message}`);
    }
  };
}

init();
