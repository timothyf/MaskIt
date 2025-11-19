/**
 * Mask creation and interaction handling
 * BASE_Z is defined in context-menu.js and shared via window.BASE_Z
 */

if (typeof window.__maskitMaskCreatorLoaded === 'undefined') {
  window.__maskitMaskCreatorLoaded = true;

const BASE_Z = window.BASE_Z || 70;

/**
 * Create a blur/solid mask from data
 * @param {Object} data - Mask configuration data
 * @param {URL} currentUrl - Current page URL
 * @returns {HTMLElement} The created mask element
 */
function createMaskFromData(data, currentUrl) {
  if (!window.__maskitMaskCount) {
    window.__maskitMaskCount = 0;
  }
  window.__maskitMaskCount += 1;
  const maskIndex = window.__maskitMaskCount;
  const maskId = "maskit-mask-" + maskIndex;

  // Load settings for defaults (use cached sync version)
  const settings = typeof window.loadSettingsSync === 'function' ? window.loadSettingsSync() : {
    defaultBlur: 24,
    defaultOpacity: 1,
    defaultMode: 'blur',
    defaultPositionType: 'absolute',
    defaultWidth: 300,
    defaultHeight: 300
  };

  console.log('[MaskIt] Creating mask #' + maskIndex);
  console.log('[MaskIt] Input data:', data);
  console.log('[MaskIt] Loaded settings:', settings);
  console.log('[MaskIt] Cache status:', window.__maskitSettingsCache);

  // Initialize state from data (use saved data or settings defaults)
  const state = {
    currentBlur: typeof data.blur === "number" ? data.blur : settings.defaultBlur,
    currentMode: data.mode || settings.defaultMode,
    currentPositionType: data.positionType || settings.defaultPositionType,
    currentOpacity: typeof data.opacity === "number" ? data.opacity : settings.defaultOpacity,
  };

  console.log('[MaskIt] Creating mask with data:', data, 'state:', state);

  // Create mask element
  const blurMask = document.createElement("div");
  blurMask.id = maskId;
  Object.assign(blurMask.style, {
    width: data.width || settings.defaultWidth + "px",
    height: data.height || settings.defaultHeight + "px",
    position: state.currentPositionType,
    top: data.top || 100 + maskIndex * 10 + "px",
    left: data.left || 100 + maskIndex * 10 + "px",
    backdropFilter: state.currentMode === "blur" ? `blur(${state.currentBlur}px)` : "none",
    background: state.currentMode === "blur" 
      ? "rgba(0, 0, 0, 0.3)" 
      : `rgba(0, 0, 0, ${state.currentOpacity})`,
    zIndex: String(BASE_Z + maskIndex),
    cursor: "move",
    userSelect: "none",
  });

  // Create resize handle
  const resizeHandle = createResizeHandle();
  blurMask.appendChild(resizeHandle);

  document.body.appendChild(blurMask);

  // Create and attach context menu
  const contextMenu = createContextMenu(blurMask, maskIndex, state, currentUrl);
  document.body.appendChild(contextMenu);

  // Setup drag and resize interactions
  setupDragAndResize(blurMask, resizeHandle, maskIndex, state, currentUrl);

  // Save immediately after creating
  const allNow = captureDomMasks();
  saveMasksFor(currentUrl, allNow);

  return blurMask;
}

/**
 * Create the resize handle element
 */
function createResizeHandle() {
  const resizeHandle = document.createElement("div");
  Object.assign(resizeHandle.style, {
    position: "absolute",
    width: "14px",
    height: "14px",
    right: "0",
    bottom: "0",
    cursor: "se-resize",
    background: "rgba(255,255,255,0.8)",
    borderTop: "1px solid #aaa",
    borderLeft: "1px solid #aaa",
    borderTopLeftRadius: "4px",
  });
  return resizeHandle;
}

/**
 * Setup drag and resize interactions for a mask
 */
function setupDragAndResize(blurMask, resizeHandle, maskIndex, state, currentUrl) {
  let isDragging = false;
  let isResizing = false;
  let offsetX, offsetY;
  let startX, startY, startWidth, startHeight;

  // Drag start
  blurMask.addEventListener("mousedown", function (e) {
    if (e.button === 2) return; // Right-click
    if (e.target === resizeHandle) return;
    isDragging = true;
    
    // Calculate offset based on position type
    if (state.currentPositionType === "fixed") {
      offsetX = e.clientX - blurMask.offsetLeft;
      offsetY = e.clientY - blurMask.offsetTop;
    } else {
      // For absolute positioning, account for scroll
      offsetX = e.pageX - (parseInt(blurMask.style.left) || 0);
      offsetY = e.pageY - (parseInt(blurMask.style.top) || 0);
    }
    blurMask.style.zIndex = String(BASE_Z + maskIndex);
    e.preventDefault();
  });

  // Resize start
  resizeHandle.addEventListener("mousedown", function (e) {
    e.stopPropagation();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = blurMask.offsetWidth;
    startHeight = blurMask.offsetHeight;
    blurMask.style.zIndex = String(BASE_Z + maskIndex);
    e.preventDefault();
  });

  // Mouse move
  document.addEventListener("mousemove", function (e) {
    if (isDragging) {
      let newX, newY;
      if (state.currentPositionType === "fixed") {
        newX = e.clientX - offsetX;
        newY = e.clientY - offsetY;
        newX = Math.min(Math.max(newX, 0), window.innerWidth - blurMask.offsetWidth);
        newY = Math.min(Math.max(newY, 0), window.innerHeight - blurMask.offsetHeight);
      } else {
        // For absolute positioning, use pageX/Y
        newX = e.pageX - offsetX;
        newY = e.pageY - offsetY;
        newX = Math.max(0, newX);
        newY = Math.max(0, newY);
      }
      blurMask.style.left = newX + "px";
      blurMask.style.top = newY + "px";
    } else if (isResizing) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const minWidth = 120;
      const minHeight = 80;
      let newWidth = startWidth + dx;
      let newHeight = startHeight + dy;
      newWidth = Math.max(minWidth, newWidth);
      newHeight = Math.max(minHeight, newHeight);
      blurMask.style.width = newWidth + "px";
      blurMask.style.height = newHeight + "px";
    }
  });

  // Mouse up - save changes
  document.addEventListener("mouseup", function () {
    if (isDragging || isResizing) {
      isDragging = false;
      isResizing = false;
      const masks = captureDomMasks();
      saveMasksFor(currentUrl, masks);
    }
  });
}

} // End of initialization guard
