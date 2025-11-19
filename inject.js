/**
 * MaskIt Chrome Extension - Main Content Script
 * Orchestrates all modules to provide blur/solid masking functionality
 */

(function () {
  const win = window;

  // ========== FAST PATH (re-inject → skip re-initialization) ==========
  if (win.__maskitInitialized) {
    // Already initialized, nothing more to do on re-inject
    return;
  }

  // ========== FIRST RUN SETUP ===================================
  win.__maskitInitialized = true;
  win.__maskitCurrentUrl = new URL(location.href);

  // Expose removeAll function globally
  win.__maskitRemoveAll = function () {
    const currentUrl = win.__maskitCurrentUrl || new URL(location.href);
    removeAllMasks(currentUrl);
  };

  // Expose createMask function for manual additions
  win.__maskitCreateMask = function(data) {
    createMaskFromData(data || {}, win.__maskitCurrentUrl);
  };

  // ---------------------------------------------------------------
  // Initialize navigation hooks
  // ---------------------------------------------------------------
  injectPageNavigationHook();

  // ---------------------------------------------------------------
  // Restore masks on page load
  // ---------------------------------------------------------------
  function restoreCurrent() {
    const saved = loadMasksFor(win.__maskitCurrentUrl);
    console.log('[MaskIt] Restoring masks for:', win.__maskitCurrentUrl.href, 'Found:', saved);
    if (saved && saved.length) {
      saved.forEach((m) => createMaskFromData(m, win.__maskitCurrentUrl));
      console.log('[MaskIt] Restored', saved.length, 'mask(s)');
    } else {
      console.log('[MaskIt] No saved masks to restore');
    }
  }

  // Wait for DOM to be ready before restoring
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreCurrent);
  } else {
    restoreCurrent();
  }

  // ---------------------------------------------------------------
  // Listen for messages from background script to add new masks
  // ---------------------------------------------------------------
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "addNewMask") {
      // Refresh settings cache before creating new mask
      if (typeof window.loadSettings === 'function') {
        window.loadSettings().then(settings => {
          window.__maskitSettingsCache = settings;
          console.log('[MaskIt] Refreshed settings before creating new mask:', settings);
          createMaskFromData({}, win.__maskitCurrentUrl);
          sendResponse({ success: true });
        });
        return true; // Will respond asynchronously
      } else {
        createMaskFromData({}, win.__maskitCurrentUrl);
        sendResponse({ success: true });
      }
    }
  });

  // ---------------------------------------------------------------
  // Setup navigation handlers (URL change detection, auto-save, etc.)
  // ---------------------------------------------------------------
  setupNavigationHandlers(win.__maskitCurrentUrl);

})();
