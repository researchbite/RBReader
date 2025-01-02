chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    
    chrome.tabs.sendMessage(tab.id, { action: 'toggleReader' });
  } catch (error) {
    console.error('Failed to inject content script:', error);
  }
});

// Add command listener
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === 'toggle-reader' && tab?.id) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      chrome.tabs.sendMessage(tab.id, { action: 'toggleReader' });
    } catch (error) {
      console.error('Failed to handle keyboard shortcut:', error);
    }
  }
}); 