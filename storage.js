/**
 * Storage utilities for managing mask data in localStorage
 */

if (typeof window.__maskitStorageLoaded === 'undefined') {
  window.__maskitStorageLoaded = true;

const STORAGE_PREFIX = "__maskit_masks__";

/**
 * Generate storage key for a given URL
 * @param {URL} urlObj - URL object
 * @returns {string} Storage key
 */
function storageKeyFor(urlObj) {
  return STORAGE_PREFIX + urlObj.pathname + (urlObj.search || "");
}

/**
 * Load saved masks for a given URL
 * @param {URL} urlObj - URL object
 * @returns {Array} Array of mask data objects
 */
function loadMasksFor(urlObj) {
  try {
    const key = storageKeyFor(urlObj);
    const raw = localStorage.getItem(key);
    //console.log('[MaskIt Storage] Loading masks for key:', key, 'Raw data:', raw);
    if (!raw) return [];
    const masks = JSON.parse(raw);
    //console.log('[MaskIt Storage] Loaded', masks.length, 'mask(s)');
    return masks;
  } catch (e) {
    console.error('[MaskIt Storage] Error loading masks:', e);
    return [];
  }
}

/**
 * Save masks for a given URL
 * @param {URL} urlObj - URL object
 * @param {Array} masks - Array of mask data objects to save
 */
function saveMasksFor(urlObj, masks) {
  try {
    const key = storageKeyFor(urlObj);
    localStorage.setItem(key, JSON.stringify(masks));
    console.log('[MaskIt] Saved', masks.length, 'mask(s) to', key, 'Current DOM masks:', document.querySelectorAll('[id^="maskit-mask-"]').length);
    
    // Also track in chrome.storage.local for settings page
    updatePageRegistry(urlObj.origin, urlObj.pathname + (urlObj.search || ''), masks.length);
  } catch (e) {
    console.error('[MaskIt] Failed to save masks:', e);
  }
}

/**
 * Update the registry of pages with masks in chrome.storage.local
 */
async function updatePageRegistry(origin, path, maskCount) {
  try {
    const result = await chrome.storage.local.get('maskitPageRegistry');
    const registry = result.maskitPageRegistry || {};
    
    if (!registry[origin]) {
      registry[origin] = {};
    }
    
    if (maskCount > 0) {
      registry[origin][path] = {
        maskCount: maskCount,
        lastUpdated: Date.now()
      };
    } else {
      // Remove entry if no masks
      delete registry[origin][path];
      if (Object.keys(registry[origin]).length === 0) {
        delete registry[origin];
      }
    }
    
    await chrome.storage.local.set({ maskitPageRegistry: registry });
    console.log('[MaskIt] Updated page registry:', origin, path, maskCount);
  } catch (e) {
    console.error('[MaskIt] Failed to update page registry:', e);
  }
}

} // End of initialization guard
