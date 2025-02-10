// script.js
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    // Only check main frame navigation (not iframes, etc)
    if (details.frameId === 0) {
      chrome.storage.sync.get(['blockedUrls'], (result) => {
        const blockedUrls = result.blockedUrls || [];
        try {
          const url = new URL(details.url);
          
          // Check if any blocked URL matches the current hostname
          const isBlocked = blockedUrls.some(blockedUrl =>
            url.hostname.includes(blockedUrl) ||
            url.href.includes(blockedUrl)
          );
  
          if (isBlocked) {
            // Redirect immediately to blocked page
            chrome.tabs.update(details.tabId, {
              url: chrome.runtime.getURL('blocked.html')
            });
          }
        } catch (error) {
          console.log('Invalid URL', error);
        }
      });
    }
  });