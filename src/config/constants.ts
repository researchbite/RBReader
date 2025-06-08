/**
 * Application Constants
 * Contains all constants used throughout the Research Bites extension
 */

// Common words to skip in bionic reading
export const SKIP_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 
  'is', 'it', 'of', 'on', 'or', 'the', 'to', 'up', 'was'
]);

// Simulation highlighting keywords
export const IMPORTANT_KEYWORDS = {
  importance: /\b(important|key|crucial|significant|main|primary|essential|critical)\b/i,
  research: /\b(research|study|found|discovered|shows|demonstrates|proves)\b/i,
  transition: /\b(however|therefore|thus|consequently|moreover|furthermore)\b/i
};

// DOM selectors
export const SELECTORS = {
  readerOverlay: 'bionic-reader-overlay',
  readerContent: '.reader-content',
  statsButton: '#stats-button',
  statsPopup: '.stats-popup',
  bionicToggle: '#bionic-toggle-switch',
  closeButton: '.close-button',
  currentTime: '.current-time',
  totalTime: '.total-time',
  articlesRead: '.articles-read',
  toggleHistory: '.toggle-history',
  historyList: '.history-list',
  historyUrls: '.history-urls'
};

// Storage keys
export const STORAGE_KEYS = {
  openaiApiKey: 'openaiApiKey',
  bionicEnabled: 'bionicEnabled',
  bionicReadingTime: 'bionicReadingTime',
  bionicReadingArticles: 'bionicReadingArticles'
};

// Timing constants
export const TIMING = {
  statsUpdateInterval: 1000,
  aiHighlightDelay: 500
}; 