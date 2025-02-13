document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const addButton = document.getElementById('add-url');
    const blockedUrlsDiv = document.getElementById('blocked-urls');
    const toggleAdvanced = document.getElementById('toggle-advanced');
    const advancedSettings = document.getElementById('advanced-settings');

    const startTime = document.getElementById('start-time');
    const endTime = document.getElementById('end-time');
    const timeLimit = document.getElementById('time-limit');
    const timeUnit = document.getElementById('time-unit');

    toggleAdvanced.addEventListener('click', () => {
        advancedSettings.classList.toggle('show');
    });

    function loadBlockedUrls() {
        chrome.storage.sync.get(['blockedUrls'], (result) => {
            const blockedUrls = result.blockedUrls || [];
            displayBlockedUrls(blockedUrls);
        });
    }

    function displayBlockedUrls(urls) {
        blockedUrlsDiv.innerHTML = '<h3>Blocked URLs:</h3>';
        urls.forEach(url => {
            const div = document.createElement('div');
            div.className = 'url-item';

            let timeInfo = '';
            if (url.startTime && url.endTime) {
                timeInfo += `<div class="time-info">${url.startTime} - ${url.endTime}</div>`;
            }
            if (url.timeLimit) {
                timeInfo += `<div class="time-info">${url.timeLimit} ${url.timeUnit}</div>`;
            }

            div.innerHTML = `
                <div class="url-info">
                    <span>${url.url}</span>
                    ${timeInfo}
                </div>
                <button class="remove-btn" data-url="${url.url}">×</button>
            `;
            blockedUrlsDiv.appendChild(div);
        });
    }

    function addUrl() {
        const url = urlInput.value.trim().toLowerCase();
        if (url) {
            chrome.storage.sync.get(['blockedUrls'], (result) => {
                const blockedUrls = result.blockedUrls || [];

                const urlObject = {
                    url: url,
                    startTime: startTime.value || null,
                    endTime: endTime.value || null,
                    timeLimit: timeLimit.value || null,
                    timeUnit: timeLimit.value ? timeUnit.value : null
                };

                const exists = blockedUrls.some(blocked => blocked.url === urlObject.url);

                if (!exists) {
                    blockedUrls.push(urlObject);
                    chrome.storage.sync.set({ blockedUrls }, () => {
                        loadBlockedUrls();
                        urlInput.value = '';
                        startTime.value = '';
                        endTime.value = '';
                        timeLimit.value = '';
                    });
                }
            });
        }
    }

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addUrl();
        }
    });

    addButton.addEventListener('click', addUrl);

    blockedUrlsDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const urlToRemove = e.target.dataset.url;
            chrome.storage.sync.get(['blockedUrls'], (result) => {
                const blockedUrls = result.blockedUrls || [];
                const updatedUrls = blockedUrls.filter(blocked => blocked.url !== urlToRemove);
                chrome.storage.sync.set({ blockedUrls: updatedUrls }, loadBlockedUrls);
            });
        }
    });

    loadBlockedUrls();
});