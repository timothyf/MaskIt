/**
 * Settings UI interaction handlers
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[MaskIt Settings UI] Page loaded');
  console.log('[MaskIt Settings UI] window.loadSettings available?', typeof window.loadSettings);
  
  // Load current settings
  const settings = await window.loadSettings();
  console.log('[MaskIt Settings UI] Loaded settings:', settings);
  
  // Get UI elements
  const blurSlider = document.getElementById('defaultBlur');
  const blurValue = document.getElementById('blurValue');
  const opacitySlider = document.getElementById('defaultOpacity');
  const opacityValue = document.getElementById('opacityValue');
  const modeSelect = document.getElementById('defaultMode');
  const positionSelect = document.getElementById('defaultPositionType');
  const widthInput = document.getElementById('defaultWidth');
  const heightInput = document.getElementById('defaultHeight');
  const resetButton = document.getElementById('resetButton');
  const saveStatus = document.getElementById('saveStatus');
  const debugInfo = document.getElementById('debugInfo');
  
  // Update debug info
  async function updateDebugInfo() {
    const currentSettings = await window.loadSettings();
    debugInfo.innerHTML = `
      Storage: chrome.storage.sync (key: maskitSettings)<br>
      Blur: ${currentSettings.defaultBlur}px<br>
      Opacity: ${Math.round(currentSettings.defaultOpacity * 100)}%<br>
      Mode: ${currentSettings.defaultMode}<br>
      Position: ${currentSettings.defaultPositionType}<br>
      Size: ${currentSettings.defaultWidth}x${currentSettings.defaultHeight}
    `;
  }
  
  // Initial debug info
  updateDebugInfo();
  
  // Initialize UI with current settings
  blurSlider.value = settings.defaultBlur;
  blurValue.textContent = settings.defaultBlur + 'px';
  opacitySlider.value = settings.defaultOpacity * 100;
  opacityValue.textContent = Math.round(settings.defaultOpacity * 100) + '%';
  modeSelect.value = settings.defaultMode;
  positionSelect.value = settings.defaultPositionType;
  widthInput.value = settings.defaultWidth;
  heightInput.value = settings.defaultHeight;
  
  // Show save status temporarily
  function showSaveStatus() {
    saveStatus.classList.add('show');
    updateDebugInfo();
    setTimeout(() => {
      saveStatus.classList.remove('show');
    }, 2000);
  }
  
  // Blur slider handler
  blurSlider.addEventListener('input', async (e) => {
    const value = parseInt(e.target.value);
    blurValue.textContent = value + 'px';
    console.log('[MaskIt Settings UI] Updating defaultBlur to:', value);
    await window.updateSetting('defaultBlur', value);
    showSaveStatus();
  });
  
  // Opacity slider handler
  opacitySlider.addEventListener('input', async (e) => {
    const value = parseInt(e.target.value) / 100;
    opacityValue.textContent = Math.round(value * 100) + '%';
    await window.updateSetting('defaultOpacity', value);
    showSaveStatus();
  });
  
  // Mode select handler
  modeSelect.addEventListener('change', async (e) => {
    await window.updateSetting('defaultMode', e.target.value);
    showSaveStatus();
  });
  
  // Position select handler
  positionSelect.addEventListener('change', async (e) => {
    await window.updateSetting('defaultPositionType', e.target.value);
    showSaveStatus();
  });
  
  // Width input handler
  widthInput.addEventListener('change', async (e) => {
    const value = parseInt(e.target.value);
    if (value >= 50 && value <= 2000) {
      await window.updateSetting('defaultWidth', value);
      showSaveStatus();
    }
  });
  
  // Height input handler
  heightInput.addEventListener('change', async (e) => {
    const value = parseInt(e.target.value);
    if (value >= 50 && value <= 2000) {
      await window.updateSetting('defaultHeight', value);
      showSaveStatus();
    }
  });
  
  // Reset button handler
  resetButton.addEventListener('click', async () => {
    if (confirm('Reset all settings to defaults?')) {
      await window.saveSettings(window.DEFAULT_SETTINGS);
      
      // Update UI
      blurSlider.value = window.DEFAULT_SETTINGS.defaultBlur;
      blurValue.textContent = window.DEFAULT_SETTINGS.defaultBlur + 'px';
      opacitySlider.value = window.DEFAULT_SETTINGS.defaultOpacity * 100;
      opacityValue.textContent = Math.round(window.DEFAULT_SETTINGS.defaultOpacity * 100) + '%';
      modeSelect.value = window.DEFAULT_SETTINGS.defaultMode;
      positionSelect.value = window.DEFAULT_SETTINGS.defaultPositionType;
      widthInput.value = window.DEFAULT_SETTINGS.defaultWidth;
      heightInput.value = window.DEFAULT_SETTINGS.defaultHeight;
      
      showSaveStatus();
    }
  });
});
