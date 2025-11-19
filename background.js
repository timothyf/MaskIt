// Track which tabs have been initialized with URL to prevent duplicate injections
const initializedTabs = new Map(); // tabId -> url

// List of script files to inject in order
const scriptFiles = [
  "settings.js",
  "storage.js",
  "mask-utils.js",
  "context-menu.js",
  "mask-creator.js",
  "navigation.js",
  "inject.js"
];

// Helper function to inject the script for auto-restore
function injectScriptForRestore(tabId) {
  console.log('[MaskIt] Auto-injecting for restore on tab', tabId);
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: scriptFiles
  }).catch(err => {
    // Silently fail for restricted pages (chrome://, etc.)
    console.log('Could not inject script:', err);
  });
}

// Helper function to inject and signal to add a new mask
function injectScriptForNewMask(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: scriptFiles
  }).then(() => {
    // After injection, send message to create a new mask
    chrome.tabs.sendMessage(tabId, { action: "addNewMask" }).catch(() => {
      // Ignore errors if content script isn't ready
    });
  }).catch(err => {
    console.log('Could not inject script:', err);
  });
}

// Auto-inject on page load to restore masks
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only inject when page is fully loaded and it's an http(s) page
  if (changeInfo.status === 'complete' && tab.url && 
      (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    
    console.log('[MaskIt] Tab', tabId, 'loaded:', tab.url);
    // Always inject on page load to restore masks (page reload clears the window object)
    injectScriptForRestore(tabId);
    initializedTabs.set(tabId, tab.url);
  }
});

// Clean up tracking when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  initializedTabs.delete(tabId);
});

// Manual activation via toolbar icon
chrome.action.onClicked.addListener((tab) => {
  injectScriptForNewMask(tab.id);
});

// Manual activation via keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "add-mask") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        injectScriptForNewMask(tabs[0].id);
      }
    });
  }
});