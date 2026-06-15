// Click the toolbar icon -> open the Options page.
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Content script asks to open Options (hotkey with nothing to expand).
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "open-options") chrome.runtime.openOptionsPage();
});

// Service worker: relay the hotkey command to the active tab's content script.
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "expand-snippet") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id == null) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "expand-snippet" });
  } catch {
    // no content script on this page (chrome://, store, etc.) — ignore
  }
});
