// Service worker to handle dynamic icon state (active / grayscale)

const ICONS_ACTIVE = {
  16: 'icons/icon16.png',
  48: 'icons/icon48.png',
  128: 'icons/icon128.png'
};

const ICONS_INACTIVE = {
  16: 'icons/icon16_gray.png',
  48: 'icons/icon48_gray.png',
  128: 'icons/icon128_gray.png'
};

function getHostname(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function isDomainActive(hostname, globalEnabled, excludedDomains) {
  if (!globalEnabled) return false;
  if (!hostname) return globalEnabled;
  return !excludedDomains.some((d) => hostname === d || hostname.endsWith('.' + d));
}

function updateTabIcon(tabId, url, data) {
  const hostname = getHostname(url);
  const active = isDomainActive(hostname, data.enabled, data.excludedDomains);
  const path = active ? ICONS_ACTIVE : ICONS_INACTIVE;
  chrome.action.setIcon({ tabId, path }).catch(() => {});
}

function updateAllTabs() {
  chrome.storage.sync.get(
    {
      enabled: true,
      excludedDomains: []
    },
    (data) => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id && tab.url) {
            updateTabIcon(tab.id, tab.url, data);
          }
        });
      });
    }
  );
}

// When a tab is activated or updated
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError || !tab || !tab.url) return;
    chrome.storage.sync.get(
      {
        enabled: true,
        excludedDomains: []
      },
      (data) => {
        updateTabIcon(tab.id, tab.url, data);
      }
    );
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    chrome.storage.sync.get(
      {
        enabled: true,
        excludedDomains: []
      },
      (data) => {
        updateTabIcon(tabId, tab.url, data);
      }
    );
  }
});

// When storage changes (e.g. toggled from popup)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    updateAllTabs();
  }
});

// Run once on startup / install
chrome.runtime.onInstalled.addListener(() => {
  updateAllTabs();
});

chrome.runtime.onStartup.addListener(() => {
  updateAllTabs();
});
