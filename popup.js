document.addEventListener('DOMContentLoaded', () => {
  const globalToggle = document.getElementById('global-toggle');
  const siteToggle = document.getElementById('site-toggle');
  const rainbowToggle = document.getElementById('rainbow-toggle');
  const rainbowImagesToggle = document.getElementById('rainbow-images-toggle');
  const domainLabel = document.getElementById('domain-name');
  const statusBanner = document.getElementById('status-banner');
  const siteSection = document.getElementById('site-section');

  let currentHostname = '';

  function getHostname(url) {
    try {
      const u = new URL(url);
      if (u.protocol === 'http:' || u.protocol === 'https:') {
        return u.hostname.toLowerCase();
      }
      return '';
    } catch {
      return '';
    }
  }

  function updateUI(globalEnabled, excludedDomains, rainbowHeadings, rainbowImages) {
    globalToggle.checked = globalEnabled;
    rainbowToggle.checked = rainbowHeadings;
    rainbowImagesToggle.checked = rainbowImages;

    if (!currentHostname) {
      siteSection.style.opacity = '0.5';
      siteToggle.disabled = true;
      domainLabel.textContent = 'Special browser page';
      statusBanner.textContent = 'Extension inactive on this page';
      statusBanner.className = 'status-banner off';
      return;
    }

    siteSection.style.opacity = '1';
    siteToggle.disabled = false;
    domainLabel.textContent = currentHostname;

    const isExcluded = excludedDomains.some(
      (d) => currentHostname === d || currentHostname.endsWith('.' + d)
    );
    siteToggle.checked = !isExcluded;

    const isActiveHere = globalEnabled && !isExcluded;

    if (isActiveHere) {
      const modes = [];
      if (rainbowHeadings) modes.push('🌈 Headings');
      if (rainbowImages) modes.push('🎨 Images');
      const extra = modes.length > 0 ? ` (${modes.join(' + ')})` : '';
      statusBanner.textContent = `✨ Comic Sans Active${extra}!`;
      statusBanner.className = 'status-banner';
    } else {
      statusBanner.textContent = !globalEnabled
        ? 'Disabled globally'
        : 'Disabled for this domain';
      statusBanner.className = 'status-banner off';
    }
  }

  // Fetch active tab URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab && activeTab.url) {
      currentHostname = getHostname(activeTab.url);
    }

    // Load current configuration
    chrome.storage.sync.get(
      {
        enabled: true,
        excludedDomains: [],
        rainbowMode: false,
        rainbowImages: false
      },
      (data) => {
        updateUI(data.enabled, data.excludedDomains, data.rainbowMode, data.rainbowImages);
      }
    );
  });

  // Handle global toggle
  globalToggle.addEventListener('change', () => {
    const enabled = globalToggle.checked;
    chrome.storage.sync.set({ enabled }, () => {
      chrome.storage.sync.get(
        { excludedDomains: [], rainbowMode: false, rainbowImages: false },
        (data) => {
          updateUI(enabled, data.excludedDomains, data.rainbowMode, data.rainbowImages);
        }
      );
    });
  });

  // Handle site toggle
  siteToggle.addEventListener('change', () => {
    if (!currentHostname) return;

    chrome.storage.sync.get(
      { enabled: true, excludedDomains: [], rainbowMode: false, rainbowImages: false },
      (data) => {
        let excluded = [...data.excludedDomains];
        if (siteToggle.checked) {
          // Remove from excluded
          excluded = excluded.filter(
            (d) => d !== currentHostname && !currentHostname.endsWith('.' + d)
          );
        } else {
          // Add to excluded
          if (!excluded.includes(currentHostname)) {
            excluded.push(currentHostname);
          }
        }

        chrome.storage.sync.set({ excludedDomains: excluded }, () => {
          updateUI(data.enabled, excluded, data.rainbowMode, data.rainbowImages);
        });
      }
    );
  });

  // Handle rainbow headings toggle
  rainbowToggle.addEventListener('change', () => {
    const rainbowMode = rainbowToggle.checked;
    chrome.storage.sync.set({ rainbowMode }, () => {
      chrome.storage.sync.get(
        { enabled: true, excludedDomains: [], rainbowImages: false },
        (data) => {
          updateUI(data.enabled, data.excludedDomains, rainbowMode, data.rainbowImages);
        }
      );
    });
  });

  // Handle rainbow images toggle
  rainbowImagesToggle.addEventListener('change', () => {
    const rainbowImages = rainbowImagesToggle.checked;
    chrome.storage.sync.set({ rainbowImages }, () => {
      chrome.storage.sync.get(
        { enabled: true, excludedDomains: [], rainbowMode: false },
        (data) => {
          updateUI(data.enabled, data.excludedDomains, data.rainbowMode, rainbowImages);
        }
      );
    });
  });
});
