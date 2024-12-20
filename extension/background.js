// background.js
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });
});

chrome.webNavigation.onCompleted.addListener((details) => {
    chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ['content.js']
    });
}, { url: [{ urlMatches: 'https://*/*' }, { urlMatches: 'http://*/*' }] });
