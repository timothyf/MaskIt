/**
 * MaskIt Chrome Extension - Main Content Script
 * Orchestrates all modules to provide blur/solid masking functionality
 */

(function () {
  const win = window;

  // ========== FAST PATH (re-inject → skip re-initialization) ==========
  if (win.__blurblockInitialized) {
    // Already initialized, nothing more to do on re-inject
    return;
  }

  // ========== FIRST RUN SETUP ===================================
  win.__blurblockInitialized = true;
  win.__blurblockCurrentUrl = new URL(location.href);

  // Expose removeAll function globally
  win.__blurblockRemoveAll = function () {
    const currentUrl = win.__blurblockCurrentUrl || new URL(location.href);
    removeAllMasks(currentUrl);
  };

  // Expose createMask function for manual additions
  win.__blurblockCreateMask = function(data) {
    createMaskFromData(data || {}, win.__blurblockCurrentUrl);
  };

  // ---------------------------------------------------------------
  // Initialize navigation hooks
  // ---------------------------------------------------------------
  injectPageNavigationHook();

  // ---------------------------------------------------------------
  // Restore masks on page load
  // ---------------------------------------------------------------
  function restoreCurrent() {
    const saved = loadMasksFor(win.__blurblockCurrentUrl);
    console.log('[BlurBlock] Restoring masks for:', win.__blurblockCurrentUrl.href, 'Found:', saved);
    if (saved && saved.length) {
      saved.forEach((m) => createMaskFromData(m, win.__blurblockCurrentUrl));
      console.log('[BlurBlock] Restored', saved.length, 'mask(s)');
    } else {
      console.log('[BlurBlock] No saved masks to restore');
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
      createMaskFromData({}, win.__blurblockCurrentUrl);
      sendResponse({ success: true });
    }
  });

  // ---------------------------------------------------------------
  // Setup navigation handlers (URL change detection, auto-save, etc.)
  // ---------------------------------------------------------------
  setupNavigationHandlers(win.__blurblockCurrentUrl);

})();
