chrome.action.onClicked.addListener((tab) => {
  // Perform actions when the extension icon is clicked
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']  // Inject content script if needed
  });
});
