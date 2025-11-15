/**
 * Utilities for capturing and removing mask DOM elements
 */

if (typeof window.__blurblockMaskUtilsLoaded === 'undefined') {
  window.__blurblockMaskUtilsLoaded = true;

/**
 * Capture all mask data from the DOM
 * @returns {Array} Array of mask data objects
 */
function captureDomMasks() {
  const nodes = document.querySelectorAll('[id^="blurblock-mask-"]');
  const result = [];
  nodes.forEach((node) => {
    const style = node.style;
    const backdrop = style.backdropFilter || style.webkitBackdropFilter || "";
    const background = style.background || "";
    
    console.log('[BlurBlock] Raw styles - backdropFilter:', style.backdropFilter, 'webkitBackdropFilter:', style.webkitBackdropFilter, 'background:', background);
    
    // Determine mode: if backdrop filter has blur, it's blur mode; otherwise solid
    const hasBlurFilter = backdrop && backdrop.includes("blur(") && backdrop !== "none";
    const isSolid = !hasBlurFilter;
    
    let blur = 50;
    const m = backdrop.match(/blur\((\d+)px\)/);
    if (m) blur = parseInt(m[1], 10);
    
    // Extract opacity from background for solid mode ONLY
    let opacity = 1;
    if (isSolid) {
      const opacityMatch = background.match(/rgba\(0,\s*0,\s*0,\s*([\d.]+)\)/);
      if (opacityMatch) opacity = parseFloat(opacityMatch[1]);
    }
    
    const maskData = {
      top: style.top,
      left: style.left,
      width: style.width,
      height: style.height,
      blur: blur,
      mode: isSolid ? "solid" : "blur",
      positionType: style.position || "fixed",
      opacity: opacity,
    };
    
    console.log('[BlurBlock] Captured mask:', maskData, 'hasBlurFilter:', hasBlurFilter);
    result.push(maskData);
  });
  return result;
}

/**
 * Remove all mask and context menu elements from the DOM
 */
function removeDomMasks() {
  document.querySelectorAll('[id^="blurblock-mask-"]').forEach((m) => m.remove());
  document.querySelectorAll('[id^="blurblock-context-menu-"]').forEach((m) => m.remove());
  window.__blurblockMaskCount = 0;
}

/**
 * Remove all masks for the current page
 * @param {URL} currentUrl - Current page URL
 */
function removeAllMasks(currentUrl) {
  removeDomMasks();
  saveMasksFor(currentUrl, []);
}

} // End of initialization guard
