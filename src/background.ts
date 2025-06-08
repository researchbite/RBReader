console.log('🔧 Research Bites background script loaded');

chrome.action.onClicked.addListener(async (tab) => {
  console.log('🖱️ Extension icon clicked, tab:', tab.id, tab.url);
  
  if (!tab.id) {
    console.error('❌ No tab ID available');
    return;
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
});

// Add command listener
chrome.commands.onCommand.addListener(async (command, tab) => {
  console.log('⌨️ Keyboard command received:', command, 'tab:', tab?.id);
  
  if (command === 'toggle-reader' && tab?.id) {
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
      console.error('❌ Failed to handle keyboard shortcut:', error);
    }
  }
}); 