/**
 * Storage utilities for managing mask data in localStorage
 */

if (typeof window.__blurblockStorageLoaded === 'undefined') {
  window.__blurblockStorageLoaded = true;

const STORAGE_PREFIX = "__blurblock_masks__";

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
    const raw = localStorage.getItem(storageKeyFor(urlObj));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
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
    console.log('[BlurBlock] Saved', masks.length, 'mask(s) to', key, 'Current DOM masks:', document.querySelectorAll('[id^="blurblock-mask-"]').length);
  } catch (e) {
    console.error('[BlurBlock] Failed to save masks:', e);
  }
}

} // End of initialization guard
