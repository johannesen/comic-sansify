(() => {
  const STYLE_ID = 'comic-sansify-custom-style';
  const RAINBOW_HEADINGS_STYLE_ID = 'comic-sansify-rainbow-headings-style';
  const RAINBOW_IMAGES_STYLE_ID = 'comic-sansify-rainbow-images-style';

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

  // Fixed Rainbow Headings:
  // - box-decoration-break: clone ensures multi-line inline wraps don't get clipped
  // - line-height: 1.35 and padding avoids descenders/ascenders (like g, j, p, q, y) clipping
  // - overflow: visible so bounding boxes never slice off letters
  const RAINBOW_HEADINGS_CSS = `
    @keyframes comic-rainbow-animation {
      0% { filter: hue-rotate(0deg); }
      50% { filter: hue-rotate(180deg); }
      100% { filter: hue-rotate(360deg); }
    }

    h1, h2, h3, h4, h5, h6 {
      background: linear-gradient(135deg, #ff007f, #ff7f00, #ffff00, #00ff00, #00ffff, #0000ff, #8b00ff) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      color: transparent !important;
      animation: comic-rainbow-animation 6s linear infinite !important;
      -webkit-box-decoration-break: clone !important;
      box-decoration-break: clone !important;
      line-height: 1.35 !important;
      padding-top: 0.1em !important;
      padding-bottom: 0.18em !important;
      overflow: visible !important;
    }
  `;

  // Rainbow Images CSS:
  // Animated hue-rotate cycle with staggered animation-delay using nth-of-type
  // so different images on the page start at completely different places in the rainbow cycle!
  const RAINBOW_IMAGES_CSS = `
    @keyframes comic-rainbow-image-cycle {
      0% { filter: hue-rotate(0deg); }
      50% { filter: hue-rotate(180deg); }
      100% { filter: hue-rotate(360deg); }
    }

    img, picture, video, canvas, [role="img"] {
      animation: comic-rainbow-image-cycle 7s linear infinite !important;
    }

    img:nth-of-type(6n+1), picture:nth-of-type(6n+1) { animation-delay: 0s !important; }
    img:nth-of-type(6n+2), picture:nth-of-type(6n+2) { animation-delay: -1.2s !important; }
    img:nth-of-type(6n+3), picture:nth-of-type(6n+3) { animation-delay: -2.4s !important; }
    img:nth-of-type(6n+4), picture:nth-of-type(6n+4) { animation-delay: -3.6s !important; }
    img:nth-of-type(6n+5), picture:nth-of-type(6n+5) { animation-delay: -4.8s !important; }
    img:nth-of-type(6n+6), picture:nth-of-type(6n+6) { animation-delay: -6.0s !important; }
  `;

  function isDomainEnabled(hostname, globalEnabled, excludedDomains) {
    if (!globalEnabled) return false;
    const host = (hostname || window.location.hostname).toLowerCase();
    return !excludedDomains.some((d) => host === d.toLowerCase() || host.endsWith('.' + d.toLowerCase()));
  }

  function setStyleElement(id, active, cssContent) {
    let el = document.getElementById(id);
    if (active) {
      if (!el) {
        el = document.createElement('style');
        el.id = id;
        el.textContent = cssContent;
        (document.head || document.documentElement).appendChild(el);
      }
    } else if (el) {
      el.remove();
    }
  }

  function syncState() {
    chrome.storage.sync.get(
      {
        enabled: true,
        excludedDomains: [],
        rainbowMode: false,
        rainbowImages: false
      },
      (data) => {
        const active = isDomainEnabled(window.location.hostname, data.enabled, data.excludedDomains);
        setStyleElement(STYLE_ID, active, BASE_COMIC_CSS);
        setStyleElement(RAINBOW_HEADINGS_STYLE_ID, active && data.rainbowMode, RAINBOW_HEADINGS_CSS);
        setStyleElement(RAINBOW_IMAGES_STYLE_ID, active && data.rainbowImages, RAINBOW_IMAGES_CSS);
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
