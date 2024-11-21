import { Readability } from "@mozilla/readability";

function getMainContent() {
  let documentClone = document.cloneNode(true);  // Clone document to avoid mutating the page
  let reader = new Readability(documentClone);
  let article = reader.parse();  // Extract main content

  if (article) {
    return article.textContent;
  } else {
    return "No main content found.";
  }
}

// Listen for messages from the popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "extract_content") {
    const mainContent = getMainContent();
    sendResponse({ content: mainContent });
  }
});
