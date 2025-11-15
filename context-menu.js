/**
 * Context menu creation and management
 */

if (typeof window.__blurblockContextMenuLoaded === 'undefined') {
  window.__blurblockContextMenuLoaded = true;

// Global constant for z-index base (shared with mask-creator.js)
if (typeof window.BASE_Z === 'undefined') {
  window.BASE_Z = 70; // mask below most app overlays; our menu above
}
const BASE_Z = window.BASE_Z;

/**
 * Create and attach a context menu to a mask
 * @param {HTMLElement} blurMask - The mask element
 * @param {number} maskIndex - Index of the mask
 * @param {Object} state - Current state (blur, mode, positionType, opacity)
 * @param {URL} currentUrl - Current page URL
 * @returns {HTMLElement} The context menu element
 */
function createContextMenu(blurMask, maskIndex, state, currentUrl) {
  const { currentBlur, currentMode, currentPositionType, currentOpacity } = state;
  
  // Create context menu container
  const contextMenu = document.createElement("div");
  contextMenu.id = "blurblock-context-menu-" + maskIndex;
  Object.assign(contextMenu.style, {
    position: "fixed",
    display: "none",
    background: "#fff",
    color: "#333",
    padding: "6px 10px",
    paddingTop: "24px", // Extra space for close button
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    borderRadius: "6px",
    fontSize: "14px",
    zIndex: String(BASE_Z + 1000),
    cursor: "default",
    userSelect: "none",
    minWidth: "150px",
  });

  // Close button (X)
  const closeButton = document.createElement("div");
  closeButton.textContent = "×";
  Object.assign(closeButton.style, {
    position: "absolute",
    top: "4px",
    right: "6px",
    fontSize: "20px",
    lineHeight: "16px",
    cursor: "pointer",
    color: "#666",
    fontWeight: "bold",
  });
  closeButton.addEventListener("click", () => {
    contextMenu.style.display = "none";
  });
  closeButton.addEventListener("mouseenter", () => {
    closeButton.style.color = "#000";
  });
  closeButton.addEventListener("mouseleave", () => {
    closeButton.style.color = "#666";
  });
  contextMenu.appendChild(closeButton);

  // Remove this mask option
  const removeOption = createMenuOption("Remove Mask", () => {
    blurMask.remove();
    contextMenu.remove();
    const masks = captureDomMasks();
    saveMasksFor(currentUrl, masks);
  });

  // Remove all masks option
  const removeAllOption = createMenuOption("Remove All Masks", () => {
    removeAllMasks(currentUrl);
  }, { color: "#b00020" });

  // Toggle position type option
  const togglePositionOption = createMenuOption(
    state.currentPositionType === "fixed" 
      ? "Stick to Page (scroll with content)" 
      : "Stay in View (fixed position)",
    () => handlePositionToggle(blurMask, state, togglePositionOption, currentUrl)
  );

  // Toggle solid/blur mode option
  const toggleModeOption = createMenuOption(
    state.currentMode === "solid" ? "Set to Blur Mode" : "Set to Solid Black",
    () => handleModeToggle(blurMask, state, toggleModeOption, currentUrl, updateSliderEnabled)
  );

  // Blur controls
  const { blurLabel, blurSlider, blurValue } = createBlurControls(
    state,
    blurMask,
    currentUrl
  );

  // Opacity controls
  const { opacityLabel, opacitySlider, opacityValue } = createOpacityControls(
    state,
    blurMask,
    currentUrl
  );

  // Function to enable/disable sliders based on mode
  function updateSliderEnabled() {
    const isSolid = state.currentMode === "solid";
    blurSlider.disabled = isSolid;
    blurSlider.style.opacity = isSolid ? "0.4" : "1";
    blurLabel.style.opacity = isSolid ? "0.4" : "1";
    blurValue.style.opacity = isSolid ? "0.4" : "1";
    
    opacitySlider.disabled = !isSolid;
    opacitySlider.style.opacity = isSolid ? "1" : "0.4";
    opacityLabel.style.opacity = isSolid ? "1" : "0.4";
    opacityValue.style.opacity = isSolid ? "1" : "0.4";
  }
  updateSliderEnabled();

  // Append all menu items
  contextMenu.appendChild(removeOption);
  contextMenu.appendChild(removeAllOption);
  contextMenu.appendChild(togglePositionOption);
  contextMenu.appendChild(toggleModeOption);
  contextMenu.appendChild(blurLabel);
  contextMenu.appendChild(blurSlider);
  contextMenu.appendChild(blurValue);
  contextMenu.appendChild(opacityLabel);
  contextMenu.appendChild(opacitySlider);
  contextMenu.appendChild(opacityValue);

  // Show context menu on right-click
  blurMask.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    if (contextMenu.style.display === "block") {
      contextMenu.style.display = "none";
    } else {
      contextMenu.style.left = e.clientX + "px";
      contextMenu.style.top = e.clientY + "px";
      contextMenu.style.display = "block";
    }
  });

  // Close context menu on outside click
  document.addEventListener("click", (e) => {
    if (
      e.target !== contextMenu &&
      !contextMenu.contains(e.target) &&
      e.target !== blurMask &&
      !blurMask.contains(e.target)
    ) {
      contextMenu.style.display = "none";
    }
  });

  return contextMenu;
}

/**
 * Create a menu option element
 */
function createMenuOption(text, onClick, styles = {}) {
  const option = document.createElement("div");
  option.textContent = text;
  Object.assign(option.style, {
    cursor: "pointer",
    marginBottom: "6px",
    ...styles
  });
  option.addEventListener("click", onClick);
  return option;
}

/**
 * Handle position toggle between fixed and absolute
 */
function handlePositionToggle(blurMask, state, toggleOption, currentUrl) {
  if (state.currentPositionType === "fixed") {
    state.currentPositionType = "absolute";
    const currentTop = parseInt(blurMask.style.top) || 0;
    const currentLeft = parseInt(blurMask.style.left) || 0;
    blurMask.style.position = "absolute";
    blurMask.style.top = (currentTop + window.scrollY) + "px";
    blurMask.style.left = (currentLeft + window.scrollX) + "px";
    toggleOption.textContent = "Stay in View (fixed position)";
  } else {
    state.currentPositionType = "fixed";
    const currentTop = parseInt(blurMask.style.top) || 0;
    const currentLeft = parseInt(blurMask.style.left) || 0;
    blurMask.style.position = "fixed";
    blurMask.style.top = (currentTop - window.scrollY) + "px";
    blurMask.style.left = (currentLeft - window.scrollX) + "px";
    toggleOption.textContent = "Stick to Page (scroll with content)";
  }
  const masks = captureDomMasks();
  saveMasksFor(currentUrl, masks);
}

/**
 * Handle mode toggle between blur and solid
 */
function handleModeToggle(blurMask, state, toggleOption, currentUrl, updateCallback) {
  state.currentMode = state.currentMode === "blur" ? "solid" : "blur";
  blurMask.style.backdropFilter = state.currentMode === "blur" ? `blur(${state.currentBlur}px)` : "none";
  blurMask.style.background = state.currentMode === "blur" 
    ? "rgba(0, 0, 0, 0.3)" 
    : `rgba(0, 0, 0, ${state.currentOpacity})`;
  toggleOption.textContent = state.currentMode === "solid" ? "Set to Blur Mode" : "Set to Solid Black";
  updateCallback();
  const masks = captureDomMasks();
  saveMasksFor(currentUrl, masks);
}

/**
 * Create blur control elements
 */
function createBlurControls(state, blurMask, currentUrl) {
  const blurLabel = document.createElement("div");
  blurLabel.textContent = "Blur:";
  Object.assign(blurLabel.style, {
    fontSize: "12px",
    marginBottom: "2px",
  });

  const blurSlider = document.createElement("input");
  blurSlider.type = "range";
  blurSlider.min = "0";
  blurSlider.max = "80";
  blurSlider.value = String(state.currentBlur);
  Object.assign(blurSlider.style, {
    width: "100%",
  });

  const blurValue = document.createElement("div");
  blurValue.textContent = state.currentBlur + "px";
  Object.assign(blurValue.style, {
    fontSize: "11px",
    textAlign: "right",
    marginTop: "2px",
  });

  blurSlider.addEventListener("input", () => {
    state.currentBlur = Number(blurSlider.value);
    if (state.currentMode === "blur") {
      blurMask.style.backdropFilter = `blur(${state.currentBlur}px)`;
    }
    blurValue.textContent = state.currentBlur + "px";
    const masks = captureDomMasks();
    saveMasksFor(currentUrl, masks);
  });

  return { blurLabel, blurSlider, blurValue };
}

/**
 * Create opacity control elements
 */
function createOpacityControls(state, blurMask, currentUrl) {
  const opacityLabel = document.createElement("div");
  opacityLabel.textContent = "Opacity:";
  Object.assign(opacityLabel.style, {
    fontSize: "12px",
    marginBottom: "2px",
    marginTop: "6px",
  });

  const opacitySlider = document.createElement("input");
  opacitySlider.type = "range";
  opacitySlider.min = "0";
  opacitySlider.max = "100";
  opacitySlider.value = String(state.currentOpacity * 100);
  Object.assign(opacitySlider.style, {
    width: "100%",
  });

  const opacityValue = document.createElement("div");
  opacityValue.textContent = Math.round(state.currentOpacity * 100) + "%";
  Object.assign(opacityValue.style, {
    fontSize: "11px",
    textAlign: "right",
    marginTop: "2px",
  });

  opacitySlider.addEventListener("input", () => {
    state.currentOpacity = Number(opacitySlider.value) / 100;
    if (state.currentMode === "solid") {
      blurMask.style.background = `rgba(0, 0, 0, ${state.currentOpacity})`;
    }
    opacityValue.textContent = Math.round(state.currentOpacity * 100) + "%";
    const masks = captureDomMasks();
    saveMasksFor(currentUrl, masks);
  });

  return { opacityLabel, opacitySlider, opacityValue };
}

} // End of initialization guard
