export interface Snippet {
  /** word typed after the ":" trigger, e.g. "linkedin". lowercased on save. */
  key: string;
  /** text that replaces ":key". Matched exactly against the typed word. */
  value: string;
}

export interface Settings {
  /** char that starts a trigger. default ":". */
  prefix: string;
  snippets: Snippet[];
}

export const DEFAULTS: Settings = {
  prefix: ":",
  snippets: [
    { key: "linkedin", value: "https://linkedin.com/in/your-handle" },
  ],
};
