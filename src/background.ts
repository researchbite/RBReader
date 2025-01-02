chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });

  chrome.tabs.sendMessage(tab.id, { action: 'toggleReader' });
});

// Add command listener
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'toggle-reader' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggleReader' });
  }
}); 