// script.js
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId === 0) {
    try {
      const { blockedUrls = [] } = await chrome.storage.sync.get(['blockedUrls']);
      const url = new URL(details.url);
      const hostname = url.hostname.replace('www.', '');
      
      // Find matching blocked URL including subdomains
      const blockedSite = blockedUrls.find(blocked => {
        const blockedUrl = (blocked.url || blocked).replace('www.', '');
        return hostname === blockedUrl || hostname.endsWith('.' + blockedUrl);
      });

      if (blockedSite) {
        // Redirect to blocked page
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL('blocked.html')
        });
      }
    } catch (error) {
      console.error('Error in navigation handler:', error);
    }
  }
});