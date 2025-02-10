document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const addButton = document.getElementById('add-url');
    const blockedUrlsDiv = document.getElementById('blocked-urls');

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
            div.innerHTML = `
                <span>${url}</span>
                <button class="remove-btn" data-url="${url}" title="Unblock">&times;</button>
            `;
            blockedUrlsDiv.appendChild(div);
        });
    }

    addButton.addEventListener('click', () => {
        const url = urlInput.value.trim().toLowerCase();
        if (url) {
            chrome.storage.sync.get(['blockedUrls'], (result) => {
                const blockedUrls = result.blockedUrls || [];
                if (!blockedUrls.includes(url)) {
                    blockedUrls.push(url);
                    chrome.storage.sync.set({ blockedUrls }, () => {
                        loadBlockedUrls();
                        urlInput.value = '';
                    });
                }
            });
        }
    });

    blockedUrlsDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const urlToRemove = e.target.dataset.url;
            chrome.storage.sync.get(['blockedUrls'], (result) => {
                const blockedUrls = result.blockedUrls || [];
                const updatedUrls = blockedUrls.filter(url => url !== urlToRemove);
                chrome.storage.sync.set({ blockedUrls: updatedUrls }, loadBlockedUrls);
            });
        }
    });

    loadBlockedUrls();
});
