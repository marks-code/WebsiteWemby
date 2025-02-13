document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('url-input');
  const addButton = document.getElementById('add-url');
  const blockedUrlsDiv = document.getElementById('blocked-urls');

  async function loadBlockedUrls() {
      try {
          const { blockedUrls = [] } = await chrome.storage.sync.get(['blockedUrls']);
          displayBlockedUrls(blockedUrls);
      } catch (error) {
      }
  }

  function displayBlockedUrls(urls) {
      blockedUrlsDiv.innerHTML = '<h3>Blocked URLs:</h3>';
      urls.forEach(url => {
          const div = document.createElement('div');
          div.className = 'url-item';
          
          const urlValue = typeof url === 'string' ? url : url.url;
          div.innerHTML = `
              <div class="url-info">
                  <span>${urlValue}</span>
              </div>
              <button class="remove-btn" data-url="${urlValue}">×</button>
          `;
          blockedUrlsDiv.appendChild(div);
      });
  }

  function normalizeUrl(inputUrl) {
      // Remove common prefixes and www
      let cleanUrl = inputUrl.toLowerCase()
          .replace(/^(https?:\/\/)?(www\.)?/i, '')
          .replace(/\/+$/, ''); // Remove trailing slashes
      
      // Remove everything after the first slash if present
      cleanUrl = cleanUrl.split('/')[0];
      
      return cleanUrl;
  }

  async function addUrl() {
      const inputUrl = urlInput.value.trim();
      if (inputUrl) {
          try {
              const normalizedUrl = normalizeUrl(inputUrl);
              const { blockedUrls = [] } = await chrome.storage.sync.get(['blockedUrls']);
              const exists = blockedUrls.some(blocked => 
                  normalizeUrl(blocked.url || blocked) === normalizedUrl
              );

              if (!exists) {
                  blockedUrls.push({ url: normalizedUrl });
                  await chrome.storage.sync.set({ blockedUrls });
                  await loadBlockedUrls();
                  urlInput.value = '';
              }
          } catch (error) {
              console.error('Error adding URL:', error);
          }
      }
  }

  urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          addUrl();
      }
  });

  addButton.addEventListener('click', addUrl);

  blockedUrlsDiv.addEventListener('click', async (e) => {
      if (e.target.classList.contains('remove-btn')) {
          try {
              const urlToRemove = e.target.dataset.url;
              const { blockedUrls = [] } = await chrome.storage.sync.get(['blockedUrls']);
              const updatedUrls = blockedUrls.filter(blocked => 
                  (blocked.url || blocked) !== urlToRemove
              );
              await chrome.storage.sync.set({ blockedUrls: updatedUrls });
              await loadBlockedUrls();
          } catch (error) {
              console.error('Error removing URL:', error);
          }
      }
  });

  loadBlockedUrls();
});