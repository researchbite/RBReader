// Options page functionality for Jargon Translator Extension

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('optionsForm');
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('saveButton');
    const closeButton = document.getElementById('closeButton');
    const status = document.getElementById('status');
    const autoOpenNotice = document.getElementById('autoOpenNotice');

    // Check if this page was opened automatically (no referrer means opened by extension)
    const wasOpenedAutomatically = !document.referrer || document.referrer === '';
    
    if (wasOpenedAutomatically) {
        autoOpenNotice.style.display = 'block';
        closeButton.style.display = 'inline-block';
        // Focus on the API key input for better UX
        setTimeout(() => apiKeyInput.focus(), 100);
    }

    // Load saved settings
    loadSettings();

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });

    // Handle close button
    closeButton.addEventListener('click', function() {
        // Check if API key was saved before closing
        chrome.storage.sync.get(['openaiApiKey'], function(result) {
            if (result.openaiApiKey && result.openaiApiKey.trim().length > 0) {
                window.close();
            } else {
                showStatus('Please save your API key before closing.', 'error');
            }
        });
    });

    function loadSettings() {
        chrome.storage.sync.get(['openaiApiKey'], function(result) {
            if (result.openaiApiKey) {
                apiKeyInput.value = result.openaiApiKey;
            }
        });
    }

    function saveSettings() {
        const apiKey = apiKeyInput.value.trim();
        
        // Basic validation
        if (apiKey && !apiKey.startsWith('sk-')) {
            showStatus('Please enter a valid OpenAI API key (starts with "sk-")', 'error');
            return;
        }

        // Save to Chrome storage
        chrome.storage.sync.set({
            openaiApiKey: apiKey
        }, function() {
            if (chrome.runtime.lastError) {
                showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
            } else {
                showStatus('Settings saved successfully!', 'success');
                
                // If this was opened automatically and API key is now set, show close option
                if (wasOpenedAutomatically && apiKey) {
                    setTimeout(() => {
                        showStatus('Settings saved! You can now close this page and try the extension again.', 'success');
                        closeButton.textContent = 'Close & Try Extension';
                    }, 1000);
                } else {
                    // Clear the status after 3 seconds for normal usage
                    setTimeout(() => {
                        status.style.display = 'none';
                    }, 3000);
                }
            }
        });
    }

    function showStatus(message, type) {
        status.textContent = message;
        status.className = 'status ' + type;
        status.style.display = 'block';
    }
}); 