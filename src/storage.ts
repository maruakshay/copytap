import { DEFAULTS, type Settings } from "./types.js";

const KEY = "settings";

export async function loadSettings(): Promise<Settings> {
  const got = await chrome.storage.sync.get(KEY);
  const s = got[KEY] as Partial<Settings> | undefined;
  return {
    prefix: s?.prefix || DEFAULTS.prefix,
    snippets: s?.snippets ?? DEFAULTS.snippets,
  };
}

export async function saveSettings(s: Settings): Promise<void> {
  await chrome.storage.sync.set({ [KEY]: s });
}

/** Subscribe to changes (so content scripts stay fresh without a reload). */
export function onSettingsChanged(cb: (s: Settings) => void): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes[KEY]?.newValue) {
      cb(changes[KEY].newValue as Settings);
    }
  });
}
