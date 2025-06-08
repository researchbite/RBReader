// Options page functionality for Research Bites Extension

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('optionsForm');
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('saveButton');
    const status = document.getElementById('status');

    // Load saved settings
    loadSettings();

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
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
                
                // Clear the status after 3 seconds
                setTimeout(() => {
                    status.style.display = 'none';
                }, 3000);
            }
        });
    }

    function showStatus(message, type) {
        status.textContent = message;
        status.className = 'status ' + type;
        status.style.display = 'block';
    }
}); 