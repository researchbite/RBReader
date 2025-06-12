/**
 * Research Bites Extension - Content Script
 * Main entry point for the extension
 */

import { Readability } from '@mozilla/readability';
import { ReaderStateService } from './services/reader-state.service';
import { TimerService } from './services/timer.service';
import { BionicReadingService } from './services/bionic-reading.service';
import { AIHighlightingService } from './services/ai-highlighting.service';
import { StorageService } from './services/storage.service';
import { ManualHighlightService } from './services/manual-highlight.service';
import { ReaderOverlay } from './components/reader-overlay';
import { TIMING, SELECTORS } from './config/constants';

// Initialize services
const stateService = ReaderStateService.getInstance();
const timerService = new TimerService();
const readerOverlay = new ReaderOverlay();

/**
 * Show the reader mode
 */
async function showReader(): Promise<void> {
  console.log('🚀 showReader called');
  const overlay = document.getElementById(SELECTORS.readerOverlay);
  if (!overlay) {
    console.error('❌ Reader overlay not found');
    return;
  }

  try {
    console.log('📖 Parsing article with Readability...');
    const article = new Readability(document.cloneNode(true) as Document).parse();
    if (!article) {
      console.error('❌ Failed to parse article with Readability');
      return;
    }
    
    console.log('✅ Article parsed successfully:', {
      title: article.title,
      contentLength: article.content.length,
      textLength: article.textContent?.length
    });

    const content = readerOverlay.getContentElement();
    if (!content) {
      console.error('❌ Reader content container not found');
      return;
    }

    content.innerHTML = '';
    
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = article.content;
    
    // Only apply bionic reading if enabled
    if (stateService.get('isBionicEnabled')) {
      console.log('📝 Content container created, applying bionic reading...');
      BionicReadingService.applyBionicReadingToHTML(tempContainer);
      console.log('✅ Bionic reading applied');
    } else {
      console.log('📝 Content container created, bionic reading disabled');
    }

    if (article.title) {
      const titleElement = document.createElement('h1');
      titleElement.className = 'reader-title';
      titleElement.textContent = article.title;
      content.appendChild(titleElement);
      console.log('📰 Title added:', article.title);
    }

    content.appendChild(tempContainer);

    // Initialize manual highlighting
    ManualHighlightService.init(tempContainer);
    ManualHighlightService.applyStoredHighlights(tempContainer);
    
    // Add current article to history
    stateService.addArticleToHistory(
      window.location.href,
      article.title || document.title
    );
    console.log('📚 Article added to history');
    
    readerOverlay.show();
    timerService.updateStats();
    timerService.startTimer();
    console.log('⏰ Timer started, reader opened');
    
    if (stateService.get('isAutoHighlightEnabled')) {
      // Trigger AI highlighting with a small delay to ensure DOM is ready
      console.log('🎯 Scheduling AI highlighting...');
      setTimeout(() => {
        console.log('🎯 Starting AI highlighting after delay...');
        console.log('📊 Content element children:', tempContainer.children.length);
        console.log('📊 Content element HTML preview:', tempContainer.innerHTML.substring(0, 200) + '...');
        AIHighlightingService.highlightImportantLines(tempContainer).catch(console.error);
      }, TIMING.aiHighlightDelay);
    }
  } catch (error) {
    console.error('❌ Error parsing article:', error);
  }
}

/**
 * Initialize the extension
 */
async function initializeExtension(): Promise<void> {
  console.log('🏁 Initializing Research Bites extension...');
  
  try {
    await readerOverlay.initialize();
    console.log('✅ Reader overlay initialized');
  } catch (error) {
    console.error('❌ Failed to initialize reader overlay:', error);
  }
}

/**
 * Handle messages from the background script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received:', message);
  
  if (message.action === 'isAlive') {
    console.log('💓 Responding to isAlive check');
    sendResponse(true);
    return true;
  }
  
  if (message.action === 'toggleReader') {
    console.log('🔄 Toggle reader requested, current state:', stateService.get('isOpen') ? 'open' : 'closed');
    
    if (!stateService.get('isOpen')) {
      console.log('🚀 Opening reader...');
      showReader().catch(console.error);
    } else {
      console.log('🚪 Closing reader...');
      readerOverlay.hide();
      timerService.pauseTimer();
      console.log('✅ Reader closed');
    }
  }
  return false;
});

// Initialize the extension when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension().catch(console.error);
} 
