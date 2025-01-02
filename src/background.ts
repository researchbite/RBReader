chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  
  try {
    // Check if content script is already injected
    const isInjected = await chrome.tabs.sendMessage(tab.id, { action: 'isAlive' }).catch(() => false);
    
    if (!isInjected) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    }
    
    chrome.tabs.sendMessage(tab.id, { action: 'toggleReader' });
  } catch (error) {
    console.error('Failed to inject content script:', error);
  }
});

// Add command listener
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === 'toggle-reader' && tab?.id) {
    try {
      // Check if content script is already injected
      const isInjected = await chrome.tabs.sendMessage(tab.id, { action: 'isAlive' }).catch(() => false);
      
      if (!isInjected) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      }
      
      chrome.tabs.sendMessage(tab.id, { action: 'toggleReader' });
    } catch (error) {
      console.error('Failed to handle keyboard shortcut:', error);
    }
  }
}); 