/**
 * Navigation handling for URL changes and page transitions
 */

if (typeof window.__maskitNavigationLoaded === 'undefined') {
  window.__maskitNavigationLoaded = true;

/**
 * Setup navigation handlers for URL changes
 * @param {URL} currentUrl - Current page URL object (will be mutated)
 */
function setupNavigationHandlers(currentUrl) {
  let lastHref = location.href;
  let isNavigating = false;

  // Polling for URL changes (SPA navigation)
  setInterval(() => {
    const currentUrlObj = new URL(location.href);

    // case 1: URL changed silently (SPA navigation or back/forward)
    if (location.href !== lastHref) {
      isNavigating = true;
      
      const oldUrl = currentUrl;
      const currentMasks = captureDomMasks();
      console.log('[MaskIt] URL changed from', oldUrl.href, 'to', location.href);
      saveMasksFor(oldUrl, currentMasks);
      removeDomMasks();

      // Update the URL reference
      currentUrl.href = currentUrlObj.href;
      
      const newMasks = loadMasksFor(currentUrlObj);
      if (newMasks && newMasks.length) {
        newMasks.forEach((m) => createMaskFromData(m, currentUrlObj));
      }
      lastHref = location.href;
      
      // Clear navigation flag after a short delay
      setTimeout(() => {
        isNavigating = false;
      }, 500);
      return;
    }

    // case 2: URL same but masks got wiped by hydration
    const domMasks = document.querySelectorAll('[id^="maskit-mask-"]');
    const saved = loadMasksFor(currentUrlObj);
    if (!domMasks.length && saved && saved.length) {
      saved.forEach((m) => createMaskFromData(m, currentUrlObj));
    }
  }, 200);

  // Periodic auto-save
  setInterval(() => {
    if (isNavigating) return;
    
    const currentMasks = captureDomMasks();
    if (currentMasks.length > 0) {
      saveMasksFor(currentUrl, currentMasks);
    }
  }, 2000);

  // Save on page unload
  window.addEventListener("beforeunload", () => {
    if (!isNavigating) {
      const masks = captureDomMasks();
      saveMasksFor(currentUrl, masks);
    }
  });

  window.addEventListener("pagehide", () => {
    if (!isNavigating) {
      const masks = captureDomMasks();
      saveMasksFor(currentUrl, masks);
    }
  });
}

/**
 * Inject page-context script to catch pushState/replaceState
 * Note: This is currently disabled due to CSP restrictions
 * URL changes are still detected via the polling mechanism
 */
function injectPageNavigationHook() {
  // Disabled: inline script injection violates CSP on many sites
  // The polling mechanism in setupNavigationHandlers handles URL changes
  return;
}

} // End of initialization guard
