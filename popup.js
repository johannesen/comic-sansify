document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle');
  const status = document.getElementById('status');

  function updateStatusText(enabled) {
    status.textContent = enabled 
      ? 'Comic Sans er slået TIL!' 
      : 'Comic Sans er slået FRA.';
  }

  // Hent nuværende status (standard: true)
  chrome.storage.sync.get({ enabled: true }, (data) => {
    toggle.checked = data.enabled;
    updateStatusText(data.enabled);
  });

  // Gem ny status ved klik
  toggle.addEventListener('change', () => {
    const isEnabled = toggle.checked;
    chrome.storage.sync.set({ enabled: isEnabled }, () => {
      updateStatusText(isEnabled);
    });
  });
});
