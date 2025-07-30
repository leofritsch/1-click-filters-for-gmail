/**
 * Background script for Gmail Filter Extension
 * Handles installation welcome page and content script injection
 */

/**
 * Handle extension installation and updates
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open welcome page on first install
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
  
  // Inject content script into existing Gmail tabs (fixes refresh issue)
  injectIntoExistingGmailTabs();
});

/**
 * Handle extension startup (when browser starts with extension already installed)
 */
chrome.runtime.onStartup.addListener(() => {
  // Inject content script into existing Gmail tabs on startup
  injectIntoExistingGmailTabs();
});

/**
 * Inject content script into all existing Gmail tabs
 * This fixes the issue where users need to refresh Gmail after installing
 */
async function injectIntoExistingGmailTabs() {
  try {
    // Query all tabs that match Gmail
    const tabs = await chrome.tabs.query({
      url: ['https://mail.google.com/*']
    });
    
    // Inject content script into each Gmail tab
    for (const tab of tabs) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        console.log(`Content script injected into Gmail tab: ${tab.id}`);
      } catch (error) {
        console.log(`Could not inject into tab ${tab.id}:`, error);
      }
    }
  } catch (error) {
    console.log('Error injecting into existing tabs:', error);
  }
}

/**
 * Handle extension action button clicks
 */
function executeContentScript(tab) {
  chrome.tabs.sendMessage(tab.id, { toggle: true });
}

if (chrome.action && chrome.action.onClicked) {
  // Manifest V3
  chrome.action.onClicked.addListener(executeContentScript);
} else if (chrome.browserAction && chrome.browserAction.onClicked) {
  // Manifest V2 (fallback)
  chrome.browserAction.onClicked.addListener(executeContentScript);
}