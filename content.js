(() => {
  const STYLE_ID = 'comic-sansify-custom-style';

  const CSS = `
    * {
      font-family: "Comic Sans MS", "Comic Sans", cursive, sans-serif !important;
    }
  `;

  function applyComicSans(enabled) {
    let styleEl = document.getElementById(STYLE_ID);
    if (enabled) {
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        styleEl.textContent = CSS;
        (document.head || document.documentElement).appendChild(styleEl);
      }
    } else {
      if (styleEl) {
        styleEl.remove();
      }
    }
  }

  // Hent gemt status ved indlæsning (standard: aktiv / true)
  chrome.storage.sync.get({ enabled: true }, (data) => {
    applyComicSans(data.enabled);
  });

  // Lyt efter ændringer fra popup-menuen
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.enabled !== undefined) {
      applyComicSans(changes.enabled.newValue);
    }
  });
})();
