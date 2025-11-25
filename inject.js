/**
 * MaskIt Chrome Extension - Main Content Script
 * Orchestrates all modules to provide blur/solid masking functionality
 */

(function () {
  const win = window;

  // ========== FAST PATH (re-inject → skip re-initialization) ==========
  if (win.__maskitInitialized) {
    // Already initialized, nothing more to do on re-inject
    console.log('[MaskIt] Already initialized, skipping re-initialization');
    return;
  }

  console.log('[MaskIt] Initializing content script');

  // ========== FIRST RUN SETUP ===================================
  win.__maskitInitialized = true;
  win.__maskitCurrentUrl = new URL(location.href);
  
  console.log('[MaskIt] Initialized for URL:', win.__maskitCurrentUrl.href);

  // Check if required functions are available
  console.log('[MaskIt] Function availability check:');
  console.log('  - loadMasksFor:', typeof loadMasksFor);
  console.log('  - saveMasksFor:', typeof saveMasksFor);
  console.log('  - createMaskFromData:', typeof createMaskFromData);
  console.log('  - removeAllMasks:', typeof removeAllMasks);
  console.log('  - setupNavigationHandlers:', typeof setupNavigationHandlers);

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
    console.log('[MaskIt] restoreCurrent() called');
    console.log('[MaskIt] Current URL:', win.__maskitCurrentUrl);
    console.log('[MaskIt] typeof loadMasksFor:', typeof loadMasksFor);
    
    // List all mask keys in localStorage for debugging
    console.log('[MaskIt] Checking all mask keys in localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('__maskit_masks__')) {
        const value = localStorage.getItem(key);
        console.log('  Found:', key, '→', value ? JSON.parse(value).length + ' mask(s)' : 'empty');
      }
    }
    
    const saved = loadMasksFor(win.__maskitCurrentUrl);
    console.log('[MaskIt] Restoring masks for:', win.__maskitCurrentUrl.href, 'Found:', saved);
    if (saved && saved.length) {
      console.log('[MaskIt] About to restore', saved.length, 'mask(s)');
      saved.forEach((m, index) => {
        console.log('[MaskIt] Restoring mask', index + 1, ':', m);
        createMaskFromData(m, win.__maskitCurrentUrl);
      });
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
