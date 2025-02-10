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
  
          if (blockedSite) {
            // Check time settings if they exist
            const withinTime = isWithinTimeRange(blockedSite.startTime, blockedSite.endTime);
            if (withinTime) {
              chrome.tabs.update(details.tabId, {
                url: chrome.runtime.getURL('blocked.html')
              });
            }
          }
        } catch (error) {
          console.log('Invalid URL', error);
        }
      });
    }
  });
  
  function isWithinTimeRange(startTime, endTime) {
    if (!startTime || !endTime) return true;
    
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    
    return current >= start && current <= end;
  }