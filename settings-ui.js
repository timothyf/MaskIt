/**
 * Settings UI interaction handlers
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[MaskIt Settings UI] Page loaded');
  console.log('[MaskIt Settings UI] window.loadSettings available?', typeof window.loadSettings);
  
  // Tab switching
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      tabContents.forEach(content => content.classList.remove('active'));
      document.getElementById(tabName + 'Tab').classList.add('active');
      
      // Load pages if switching to pages tab
      if (tabName === 'pages') {
        loadSavedPages();
      }
    });
  });
  
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
  
  // Load saved pages function
  async function loadSavedPages() {
    const pagesList = document.getElementById('pagesList');
    pagesList.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">Loading...</div>';
    
    try {
      // Get page registry from chrome.storage.local
      const result = await chrome.storage.local.get('maskitPageRegistry');
      const registry = result.maskitPageRegistry || {};
      
      if (Object.keys(registry).length === 0) {
        pagesList.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <div>No saved pages yet</div>
            <div style="font-size: 12px; margin-top: 8px;">Create masks on any webpage to see them here</div>
          </div>
        `;
        return;
      }
      
      // Convert registry to array and sort by domain
      const pageData = [];
      Object.keys(registry).forEach(origin => {
        Object.keys(registry[origin]).forEach(path => {
          const data = registry[origin][path];
          pageData.push({
            origin: origin,
            path: path,
            domain: new URL(origin).hostname,
            fullUrl: origin + path,
            maskCount: data.maskCount,
            lastUpdated: data.lastUpdated
          });
        });
      });
      
      // Sort by domain, then by path
      pageData.sort((a, b) => {
        const domainCompare = a.domain.localeCompare(b.domain);
        if (domainCompare !== 0) return domainCompare;
        return a.path.localeCompare(b.path);
      });
      
      // Group pages by domain
      const domainGroups = {};
      pageData.forEach(page => {
        if (!domainGroups[page.domain]) {
          domainGroups[page.domain] = [];
        }
        domainGroups[page.domain].push(page);
      });
      
      // Render list with collapsible domains
      let html = '';
      
      Object.keys(domainGroups).sort().forEach(domain => {
        const pages = domainGroups[domain];
        const totalMasks = pages.reduce((sum, p) => sum + p.maskCount, 0);
        
        html += `
          <div class="domain-section" data-domain="${escapeHtml(domain)}">
            <div class="domain-header">
              <div class="domain-header-left">
                <span class="domain-toggle">▼</span>
                <span>${escapeHtml(domain)}</span>
              </div>
              <span class="domain-count">${pages.length} page${pages.length !== 1 ? 's' : ''} • ${totalMasks} mask${totalMasks !== 1 ? 's' : ''}</span>
            </div>
            <div class="domain-pages">
        `;
        
        pages.forEach(page => {
        
          html += `
            <div class="page-item" data-origin="${escapeHtml(page.origin)}" data-path="${escapeHtml(page.path)}" data-url="${escapeHtml(page.fullUrl)}">
              <div class="page-info">
                <div class="page-url">${escapeHtml(page.path)}</div>
                <div class="page-masks-count">${page.maskCount} mask${page.maskCount !== 1 ? 's' : ''} • Updated ${formatDate(page.lastUpdated)}</div>
              </div>
              <div class="page-actions">
                <button class="open-page-button">Open</button>
                <button class="delete-button delete-page-button">Delete</button>
              </div>
            </div>
          `;
        });
        
        html += `
            </div>
          </div>
        `;
      });
      
      pagesList.innerHTML = html;
      
      // Set initial max-height for domain-pages divs for animation
      document.querySelectorAll('.domain-pages').forEach(el => {
        el.style.maxHeight = el.scrollHeight + 'px';
      });
      
      // Add event listeners for domain header toggles
      document.querySelectorAll('.domain-header').forEach(header => {
        header.addEventListener('click', function() {
          const section = this.closest('.domain-section');
          const pagesDiv = section.querySelector('.domain-pages');
          
          if (section.classList.contains('collapsed')) {
            // Expand
            section.classList.remove('collapsed');
            pagesDiv.style.maxHeight = pagesDiv.scrollHeight + 'px';
          } else {
            // Collapse
            section.classList.add('collapsed');
          }
        });
      });
      
      // Add event listeners for Open and Delete buttons
      document.querySelectorAll('.open-page-button').forEach(button => {
        button.addEventListener('click', function() {
          const pageItem = this.closest('.page-item');
          const url = pageItem.getAttribute('data-url');
          chrome.tabs.create({ url: url });
        });
      });
      
      document.querySelectorAll('.delete-page-button').forEach(button => {
        button.addEventListener('click', async function() {
          const pageItem = this.closest('.page-item');
          const origin = pageItem.getAttribute('data-origin');
          const path = pageItem.getAttribute('data-path');
          
          if (confirm('Delete all masks for this page?\n\n' + origin + path)) {
            try {
              // Remove from registry
              const result = await chrome.storage.local.get('maskitPageRegistry');
              const registry = result.maskitPageRegistry || {};
              
              if (registry[origin] && registry[origin][path]) {
                delete registry[origin][path];
                if (Object.keys(registry[origin]).length === 0) {
                  delete registry[origin];
                }
                await chrome.storage.local.set({ maskitPageRegistry: registry });
              }
              
              // Reload the list
              await loadSavedPages();
              
              alert('Masks deleted for this page. Note: You may need to reload the page to see the change take effect.');
            } catch (e) {
              console.error('Error deleting page:', e);
              alert('Error deleting page: ' + e.message);
            }
          }
        });
      });
      
    } catch (e) {
      console.error('Error loading saved pages:', e);
      pagesList.innerHTML = '<div style="text-align: center; padding: 20px; color: #f44336;">Error loading pages</div>';
    }
  }
  
  // Helper to format date
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return date.toLocaleDateString();
  }
  
  // Helper to extract domain from URL path
  function extractDomain(urlPath) {
    // URL path doesn't include domain, so we need to get it from the full URL
    // For now, we'll just group by the first part of the path
    const parts = urlPath.split('/').filter(p => p);
    return parts[0] || 'unknown';
  }
  
  // Helper to escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
