# MaskIt Chrome Extension - Code Structure

This document explains the modular architecture of the MaskIt extension.

## File Structure

```
MaskIt/
├── manifest.json          # Extension manifest
├── background.js          # Background service worker
├── settings.html          # Settings page UI
├── settings.js            # Settings storage utilities
├── settings-ui.js         # Settings page interaction handlers
├── inject.js              # Main content script orchestrator
├── storage.js             # LocalStorage utilities for masks
├── mask-utils.js          # Mask DOM manipulation utilities
├── context-menu.js        # Context menu UI and handlers
├── mask-creator.js        # Mask creation and interactions
└── navigation.js          # URL change detection and handlers
```

## Module Descriptions

### 1. **settings.js**
Manages user preferences and default values for new masks.

**Functions:**
- `loadSettings()` - Load settings from localStorage
- `saveSettings(settings)` - Save settings to localStorage
- `getSetting(key)` - Get a specific setting value
- `updateSetting(key, value)` - Update a specific setting

**Default Settings:**
- `defaultBlur`: 24px
- `defaultOpacity`: 1 (100%)
- `defaultMode`: "blur"
- `defaultPositionType`: "absolute"
- `defaultWidth`: 300px
- `defaultHeight`: 300px

### 2. **settings.html** & **settings-ui.js**
Settings page UI accessible via extension options. Allows users to configure:
- Default blur amount (0-80px)
- Default opacity (0-100%)
- Default mode (blur or solid)
- Default position type (fixed or absolute)
- Default mask size (width and height)

### 3. **storage.js**
Handles all localStorage operations for saving and loading mask data per URL.

**Functions:**
- `storageKeyFor(urlObj)` - Generate storage key for a URL
- `loadMasksFor(urlObj)` - Load saved masks for a URL
- `saveMasksFor(urlObj, masks)` - Save masks for a URL

### 4. **mask-utils.js**
Utilities for capturing and removing mask DOM elements.

**Functions:**
- `captureDomMasks()` - Capture all mask data from DOM
- `removeDomMasks()` - Remove all mask elements from DOM
- `removeAllMasks(currentUrl)` - Remove all masks and clear storage

### 5. **context-menu.js**
Creates and manages the right-click context menu for each mask.

**Functions:**
- `createContextMenu(blurMask, maskIndex, state, currentUrl)` - Main menu creator
- `createMenuOption(text, onClick, styles)` - Helper to create menu items
- `handlePositionToggle(...)` - Toggle fixed/absolute positioning
- `handleModeToggle(...)` - Toggle blur/solid mode
- `createBlurControls(...)` - Create blur slider UI
- `createOpacityControls(...)` - Create opacity slider UI

**Features:**
- Close button (×)
- Remove mask / Remove all masks
- Position toggle (fixed vs absolute)
- Mode toggle (blur vs solid)
- Blur slider (0-80px)
- Opacity slider (0-100%)

### 6. **mask-creator.js**
Creates mask elements and handles drag/resize interactions. Uses settings for default values.

**Functions:**
- `createMaskFromData(data, currentUrl)` - Main mask creator
- `createResizeHandle()` - Create resize handle element
- `setupDragAndResize(...)` - Setup mouse event handlers

**Features:**
- Draggable masks (works with both fixed and absolute positioning)
- Resizable masks via corner handle
- Auto-save on position/size changes
- Uses user-configured defaults from settings

### 7. **navigation.js**
Handles URL changes, page transitions, and auto-save.

**Functions:**
- `setupNavigationHandlers(currentUrl)` - Setup all navigation listeners
- `injectPageNavigationHook()` - Inject page-context history hooks

**Features:**
- SPA navigation detection (polling)
- Hydration recovery (restore if masks disappear)
- Auto-save every 2 seconds
- beforeunload/pagehide handlers
- Race condition prevention during navigation

### 6. **inject.js**
Main orchestrator that initializes all modules and coordinates functionality.

**Responsibilities:**
- Check if already initialized (fast path)
- Setup global functions (`__maskitRemoveAll`, `__maskitCreateMask`)
- Inject page navigation hooks
- Restore masks on page load
- Listen for messages from background script
- Initialize navigation handlers

## Data Flow

### On Page Load:
1. `background.js` detects page load → injects all scripts (including settings.js)
2. `inject.js` runs → checks if already initialized
3. `settings.js` loads user preferences
4. Restores masks from `storage.js` via `loadMasksFor()`
5. Creates mask elements via `mask-creator.js` using user's default settings
6. Attaches context menus via `context-menu.js`
7. Starts navigation monitoring via `navigation.js`

### On User Action (Button Click):
1. `background.js` injects scripts + sends "addNewMask" message
2. `inject.js` receives message
3. Calls `createMaskFromData({})` to create new mask
4. Mask is immediately saved via `saveMasksFor()`

### On Navigation:
1. `navigation.js` detects URL change
2. Captures current masks via `captureDomMasks()`
3. Saves to storage via `saveMasksFor(oldUrl, masks)`
4. Removes DOM masks via `removeDomMasks()`
5. Loads masks for new URL via `loadMasksFor(newUrl)`
6. Recreates masks via `createMaskFromData()`

## Benefits of Modular Structure

1. **Separation of Concerns** - Each module has a single, clear responsibility
2. **Maintainability** - Easier to locate and fix bugs
3. **Testability** - Individual modules can be tested in isolation
4. **Readability** - Smaller files are easier to understand
5. **Reusability** - Modules can be reused in other projects
6. **Collaboration** - Multiple developers can work on different modules

## Migration Notes

The original monolithic file has been split into 6 focused modules:
- `storage.js` (~50 lines)
- `mask-utils.js` (~60 lines)
- `context-menu.js` (~280 lines)
- `mask-creator.js` (~190 lines)
- `navigation.js` (~120 lines)
- `inject.js` (~70 lines)

The functionality remains identical, but the code is now much more organized and maintainable.
