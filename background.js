// ── Shared: open the reader with selected text ──
async function openReader(tab) {
  if (!tab) return;

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString(),
  });

  const selectedText = results?.[0]?.result;
  if (!selectedText || !selectedText.trim()) return;

  await chrome.storage.local.set({ speedReadText: selectedText.trim() });

  chrome.windows.create({
    url: "reader.html",
    type: "popup",
    width: 700,
    height: 500,
  });
}

// ── Keyboard shortcut ──
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "speed-read-selection") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await openReader(tab);
  }
});

// ── Context menu ──
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "speed-read",
    title: "Speed Read Selection",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "speed-read") {
    if (info.selectionText) {
      await chrome.storage.local.set({ speedReadText: info.selectionText.trim() });
      chrome.windows.create({
        url: "reader.html",
        type: "popup",
        width: 700,
        height: 500,
      });
    }
  }
});
