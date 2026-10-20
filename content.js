(() => {
  const STYLE_ID = 'comic-sansify-custom-style';
  const RAINBOW_STYLE_ID = 'comic-sansify-rainbow-style';

  const regularFontUrl = chrome.runtime.getURL('fonts/ComicNeue-Regular.woff2');
  const boldFontUrl = chrome.runtime.getURL('fonts/ComicNeue-Bold.woff2');

  const FONT_FACE_CSS = `
    @font-face {
      font-family: 'Comic Neue Local';
      src: url('${regularFontUrl}') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Comic Neue Local';
      src: url('${boldFontUrl}') format('woff2');
      font-weight: bold;
      font-style: normal;
      font-display: swap;
    }
  `;

  // Selectors to exclude icon fonts, code, pre, SVG elements, and symbols
  const EXCLUSION_SELECTORS = [
    'code',
    'pre',
    'kbd',
    'samp',
    'var',
    'math',
    'svg',
    'svg *',
    '[class*="fa-"]',
    '[class*="fa"]',
    '[class*="fas"]',
    '[class*="far"]',
    '[class*="fab"]',
    '[class*="fal"]',
    '[class*="material-icons"]',
    '[class*="material-symbols"]',
    '[class*="icon"]',
    '[class*="glyphicon"]',
    '[class*="feather"]',
    '[class*="tabler"]',
    'i[class*="bi"]'
  ].join(', ');

  const BASE_COMIC_CSS = `
    ${FONT_FACE_CSS}

    *:not(${EXCLUSION_SELECTORS}) {
      font-family: "Comic Sans MS", "Comic Sans", "Comic Neue Local", "Comic Neue", cursive, sans-serif !important;
    }
  `;

  const RAINBOW_CSS = `
    @keyframes comic-rainbow-animation {
      0% { filter: hue-rotate(0deg); }
      50% { filter: hue-rotate(180deg); }
      100% { filter: hue-rotate(360deg); }
    }

    h1, h2, h3, h4, h5, h6, strong, b, a {
      background: linear-gradient(135deg, #ff007f, #ff7f00, #ffff00, #00ff00, #00ffff, #0000ff, #8b00ff) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      animation: comic-rainbow-animation 6s linear infinite !important;
      display: inline-block !important;
    }
  `;

  function getDomain(hostname) {
    return hostname || window.location.hostname;
  }

  function isDomainEnabled(hostname, globalEnabled, excludedDomains) {
    if (!globalEnabled) return false;
    const host = hostname.toLowerCase();
    return !excludedDomains.some((d) => host === d.toLowerCase() || host.endsWith('.' + d.toLowerCase()));
  }

  function applyStyles(active, rainbow) {
    // Comic Sans font style
    let styleEl = document.getElementById(STYLE_ID);
    if (active) {
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        styleEl.textContent = BASE_COMIC_CSS;
        (document.head || document.documentElement).appendChild(styleEl);
      }
    } else if (styleEl) {
      styleEl.remove();
    }

    // Rainbow mode style
    let rainbowEl = document.getElementById(RAINBOW_STYLE_ID);
    if (active && rainbow) {
      if (!rainbowEl) {
        rainbowEl = document.createElement('style');
        rainbowEl.id = RAINBOW_STYLE_ID;
        rainbowEl.textContent = RAINBOW_CSS;
        (document.head || document.documentElement).appendChild(rainbowEl);
      }
    } else if (rainbowEl) {
      rainbowEl.remove();
    }
  }

  function syncState() {
    chrome.storage.sync.get(
      {
        enabled: true,
        excludedDomains: [],
        rainbowMode: false
      },
      (data) => {
        const active = isDomainEnabled(window.location.hostname, data.enabled, data.excludedDomains);
        applyStyles(active, data.rainbowMode);
      }
    );
  }

  // Initial sync
  syncState();

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      syncState();
    }
  });
})();
