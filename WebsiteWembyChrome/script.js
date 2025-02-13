// script.js
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0) {
      chrome.storage.sync.get(['blockedUrls'], (result) => {
        const blockedUrls = result.blockedUrls || [];
        try {
          const url = new URL(details.url);
          const hostname = url.hostname.replace('www.', '');
          
          // Find matching blocked URL including subdomains
          const blockedSite = blockedUrls.find(blocked => {
            const blockedUrl = (blocked.url || blocked).replace('www.', '');
            // Match exact domain or any subdomain
            return hostname === blockedUrl || hostname.endsWith('.' + blockedUrl);
          });
  
        } catch (error) {
          console.log('Invalid URL', error);
        }
      });
    }
  });
