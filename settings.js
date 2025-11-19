/**
 * Settings management for MaskIt
 * Uses chrome.storage.sync for cross-context persistence
 */

if (typeof window.__maskitSettingsLoaded === 'undefined') {
  window.__maskitSettingsLoaded = true;

  const SETTINGS_KEY = 'maskitSettings';

  // Default settings
  const DEFAULT_SETTINGS = {
    defaultBlur: 24,
    defaultOpacity: 1,
    defaultMode: 'blur',
    defaultPositionType: 'absolute',
    defaultWidth: 300,
    defaultHeight: 300
  };

  /**
   * Load settings from chrome.storage.sync
   * @returns {Promise<Object>} Settings object
   */
  window.loadSettings = async function() {
    try {
      const result = await chrome.storage.sync.get(SETTINGS_KEY);
      console.log('[MaskIt Settings] Raw stored data:', result);
      if (result[SETTINGS_KEY]) {
        const settings = { ...DEFAULT_SETTINGS, ...result[SETTINGS_KEY] };
        console.log('[MaskIt Settings] Loaded settings:', settings);
        return settings;
      }
    } catch (e) {
      console.error('[MaskIt] Failed to load settings:', e);
    }
    console.log('[MaskIt Settings] Using defaults:', DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS };
  };

  /**
   * Load settings synchronously (for content scripts that can't use async)
   * Returns cached value or defaults. If no cache, triggers async load.
   */
  window.loadSettingsSync = function() {
    // Return cached value if available
    if (window.__maskitSettingsCache) {
      console.log('[MaskIt Settings] Using cached settings:', window.__maskitSettingsCache);
      return window.__maskitSettingsCache;
    }
    // No cache yet, trigger async load for next time and return defaults for now
    console.log('[MaskIt Settings] No cache, triggering async load and using defaults');
    window.loadSettings().then(settings => {
      window.__maskitSettingsCache = settings;
    });
    return { ...DEFAULT_SETTINGS };
  };

  /**
   * Save settings to chrome.storage.sync
   * @param {Object} settings - Settings object to save
   */
  window.saveSettings = async function(settings) {
    try {
      await chrome.storage.sync.set({ [SETTINGS_KEY]: settings });
      window.__maskitSettingsCache = settings;
      console.log('[MaskIt] Settings saved:', settings);
    } catch (e) {
      console.error('[MaskIt] Failed to save settings:', e);
    }
  };

  /**
   * Get a specific setting value
   * @param {string} key - Setting key
   * @returns {Promise<*>} Setting value
   */
  window.getSetting = async function(key) {
    const settings = await window.loadSettings();
    return settings[key] !== undefined ? settings[key] : DEFAULT_SETTINGS[key];
  };

  /**
   * Update a specific setting
   * @param {string} key - Setting key
   * @param {*} value - New value
   */
  window.updateSetting = async function(key, value) {
    const settings = await window.loadSettings();
    settings[key] = value;
    await window.saveSettings(settings);
  };

  // Initialize cache on load
  window.loadSettings().then(settings => {
    window.__maskitSettingsCache = settings;
    console.log('[MaskIt Settings] Cache initialized:', settings);
  });

  // Listen for storage changes to update cache
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes[SETTINGS_KEY]) {
        const newSettings = changes[SETTINGS_KEY].newValue;
        if (newSettings) {
          window.__maskitSettingsCache = { ...DEFAULT_SETTINGS, ...newSettings };
          console.log('[MaskIt Settings] Cache updated from storage change:', window.__maskitSettingsCache);
        }
      }
    });
  }

  // Expose DEFAULT_SETTINGS for reset functionality
  window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;

} // End of initialization guard
