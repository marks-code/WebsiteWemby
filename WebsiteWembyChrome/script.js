chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      chrome.storage.sync.get(['blockedUrls'], (result) => {
        const blockedUrls = result.blockedUrls || [];
        
        try {
          const url = new URL(tab.url);
          
          // Check if any blocked URL matches the current hostname
          const isBlocked = blockedUrls.some(blockedUrl => 
            url.hostname.includes(blockedUrl) || 
            url.href.includes(blockedUrl)
          );
  
          if (isBlocked) {
            chrome.tabs.update(tabId, {
              url: chrome.runtime.getURL('blocked.html')
            });
          }
        } catch (error) {
          // Invalid URL, ignore
          console.log('Invalid URL', error);
        }
      });
    }
  });
