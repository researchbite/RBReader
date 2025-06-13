console.log('🔧 Jargon Translator background script loaded');

/**
 * Check if OpenAI API key is configured, and open options page if not
 */
async function checkApiKeyAndOpenOptions(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['openaiApiKey'], (result) => {
      const hasApiKey = result.openaiApiKey && result.openaiApiKey.trim().length > 0;
      
      if (!hasApiKey) {
        console.log('🔑 OpenAI API key not found, opening options page...');
        chrome.runtime.openOptionsPage();
        resolve(false);
      } else {
        console.log('🔑 OpenAI API key found, proceeding...');
        resolve(true);
      }
    });
  });
}

/**
 * Handle extension activation (icon click or keyboard shortcut)
 */
async function handleExtensionActivation(tab: chrome.tabs.Tab): Promise<void> {
  if (!tab.id) {
    console.error('❌ No tab ID available');
    return;
  }

  // Check API key first
  const hasApiKey = await checkApiKeyAndOpenOptions();
  if (!hasApiKey) {
    return; // Options page opened, stop here
  }

  try {
    console.log('💓 Checking if content script is alive...');
    // Check if content script is already injected
    const isInjected = await chrome.tabs.sendMessage(tab.id, { action: 'isAlive' }).catch(() => {
      console.log('📤 Content script not responding, needs injection');
      return false;
    });
    
    if (!isInjected) {
      console.log('💉 Injecting content script...');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      console.log('✅ Content script injected successfully');
    } else {
      console.log('✅ Content script already active');
    }
    
    console.log('📨 Sending toggleReader message...');
    chrome.tabs.sendMessage(tab.id, { action: 'toggleReader' });
    console.log('✅ Message sent successfully');
  } catch (error) {
    console.error('❌ Failed to inject content script:', error);
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  console.log('🖱️ Extension icon clicked, tab:', tab.id, tab.url);
  await handleExtensionActivation(tab);
});

// Add command listener
chrome.commands.onCommand.addListener(async (command, tab) => {
  console.log('⌨️ Keyboard command received:', command, 'tab:', tab?.id);
  
  if (command === 'toggle-reader' && tab?.id) {
    await handleExtensionActivation(tab);
  }
}); 