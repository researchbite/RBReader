// Import Readability from the package
import { Readability } from '@mozilla/readability';

interface HistoricalArticle {
  url: string;
  title: string;
  timestamp: number;
}

interface ReaderState {
  isOpen: boolean;
  originalBody: string;
  startTime: number | null;
  timerInterval: number | null;
  totalElapsedTime: number;
  lastPauseTime: number | null;
  historicalTime: number;
  currentArticleTime: number;
  historicalArticles: HistoricalArticle[];
  isStatsOpen: boolean;
}

const state: ReaderState = {
  isOpen: false,
  originalBody: '',
  startTime: null,
  timerInterval: null,
  totalElapsedTime: 0,
  lastPauseTime: null,
  historicalTime: Number(localStorage.getItem('bionicReadingTime') || '0'),
  currentArticleTime: 0,
  historicalArticles: JSON.parse(localStorage.getItem('bionicReadingArticles') || '[]'),
  isStatsOpen: false
};

function createReaderOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = 'bionic-reader-overlay';
  overlay.innerHTML = `
    <div class="reader-container">
      <button id="stats-button" class="icon-button stats-button">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 3C2 2.44772 2.44772 2 3 2H17C17.5523 2 18 2.44772 18 3V17C18 17.5523 17.5523 18 17 18H3C2.44772 18 2 17.5523 2 17V3Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M6 6H14M6 10H14M6 14H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="icon-button close-button" title="Exit Reader Mode (Esc)">×</button>
      <div class="reader-content"></div>
    </div>
  `;

  // Add styles for the header and buttons
  const style = document.createElement('style');
  style.textContent = `
    .icon-button {
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #1c1c1e;
      font-size: 20px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      position: fixed;
    }
    .stats-button {
      top: 1.5rem;
      left: 1.5rem;
      z-index: 10001;
    }
    .close-button {
      top: 1.5rem;
      right: 1.5rem;
      z-index: 10001;
    }
    .icon-button:hover {
      background: rgba(255, 255, 255, 0.9);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .stats-popup {
      position: absolute;
      left: 0;
      top: calc(100% + 8px);
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      padding: 12px;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      min-width: 220px;
      transform-origin: top left;
      animation: popupFadeIn 0.2s ease;
      display: none;
    }
    @keyframes popupFadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    .stats-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
    }
    .stat-label {
      color: #6c6c70;
      font-size: 13px;
    }
    .stat-value {
      color: #1c1c1e;
      font-size: 14px;
      font-weight: 500;
    }
    .history-item {
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      margin-top: 4px;
      padding-top: 8px;
    }
    .toggle-history {
      background: none;
      border: 1px solid #6c6c70;
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 12px;
      color: #6c6c70;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .toggle-history:hover {
      background: #6c6c70;
      color: white;
    }
    .history-list {
      margin-top: 8px;
      max-height: 200px;
      overflow-y: auto;
    }
    .history-urls {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .history-url {
      display: flex;
      flex-direction: column;
      gap: 2px;
      color: #1c1c1e;
      text-decoration: none;
      font-size: 13px;
      padding: 8px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 6px;
      transition: all 0.2s ease;
    }
    .history-url:hover {
      background: rgba(0, 0, 0, 0.1);
    }
    .history-title {
      font-weight: 500;
      color: #1c1c1e;
      line-height: 1.3;
    }
    .history-domain {
      color: #6c6c70;
      font-size: 11px;
    }
  `;
  document.head.appendChild(style);

  return overlay;
}

function createStatsPopup(): HTMLElement {
  const popup = document.createElement('div');
  popup.className = 'stats-popup';
  popup.innerHTML = `
    <div class="stats-content">
      <div class="stat-item">
        <span class="stat-label">Current Reading Time</span>
        <span class="current-time stat-value">00:00</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Reading Time</span>
        <span class="total-time stat-value">00:00</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Articles Read</span>
        <span class="articles-read stat-value">0</span>
      </div>
      <div class="stat-item history-item">
        <span class="stat-label">Reading History</span>
        <button class="toggle-history">Show</button>
      </div>
      <div class="history-list" style="display: none;">
        <div class="history-urls"></div>
      </div>
    </div>
  `;

  // Add click handler for toggle history button
  const toggleButton = popup.querySelector('.toggle-history');
  const historyList = popup.querySelector('.history-list');
  const historyUrls = popup.querySelector('.history-urls');

  if (toggleButton && historyList && historyUrls) {
    toggleButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const isVisible = (historyList as HTMLElement).style.display === 'block';
      (historyList as HTMLElement).style.display = isVisible ? 'none' : 'block';
      (toggleButton as HTMLElement).textContent = isVisible ? 'Show' : 'Hide';
      
      if (!isVisible) {
        // Sort articles by timestamp, most recent first
        const sortedArticles = [...state.historicalArticles].sort((a, b) => b.timestamp - a.timestamp);
        historyUrls.innerHTML = sortedArticles
          .map(article => `
            <a href="${article.url}" target="_blank" class="history-url">
              <span class="history-title">${article.title}</span>
              <span class="history-domain">${new URL(article.url).hostname}</span>
            </a>
          `)
          .join('');
      }
    });
  }

  return popup;
}

function updateStats(): void {
  const currentTimeElement = document.querySelector('.current-time');
  const totalTimeElement = document.querySelector('.total-time');
  const articlesReadElement = document.querySelector('.articles-read');
  
  if (state.startTime) {
    const currentElapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
    
    // Update current article time
    if (currentTimeElement) {
      currentTimeElement.textContent = formatTime(currentElapsedSeconds);
    }
    
    // Update total time (historical + current)
    if (totalTimeElement) {
      const totalSeconds = state.historicalTime + currentElapsedSeconds;
      totalTimeElement.textContent = formatTime(totalSeconds);
    }
  } else {
    // When not reading, just show historical time
    if (totalTimeElement) {
      totalTimeElement.textContent = formatTime(state.historicalTime);
    }
    if (currentTimeElement) {
      currentTimeElement.textContent = '00:00';
    }
  }
  
  if (articlesReadElement) {
    articlesReadElement.textContent = state.historicalArticles.length.toString();
  }
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function startTimer(): void {
  if (state.timerInterval) return;
  
  state.startTime = Date.now();
  state.lastPauseTime = null;
  state.currentArticleTime = 0;
  
  state.timerInterval = window.setInterval(() => {
    if (!state.startTime) return;
    updateStats();
  }, 1000);
}

function pauseTimer(): void {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    
    // Calculate and save the total time spent reading
    if (state.startTime) {
      const currentElapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
      state.historicalTime += currentElapsedSeconds;
      state.currentArticleTime = 0;
      localStorage.setItem('bionicReadingTime', state.historicalTime.toString());
      updateStats();
    }
  }
}

function resetTimer(): void {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  state.startTime = null;
  state.lastPauseTime = null;
  state.currentArticleTime = 0;
  updateStats();
}

// Common words to skip bionic highlighting
const SKIP_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 
  'is', 'it', 'of', 'on', 'or', 'the', 'to', 'up', 'was'
]);

function applyBionicReadingToText(text: string): string {
  return text.split(' ').map(word => {
    // Skip bionic reading for common words
    if (word.length <= 1 || SKIP_WORDS.has(word.toLowerCase())) return word;
    
    const midPoint = Math.min(Math.floor(word.length / 2), 3);
    const firstHalf = word.slice(0, midPoint);
    const secondHalf = word.slice(midPoint);
    return `<strong>${firstHalf}</strong>${secondHalf}`;
  }).join(' ');
}

function applyBionicReadingToHTML(element: HTMLElement): void {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );

  const textNodes: Text[] = [];
  let node: Text | null;
  while (node = walker.nextNode() as Text) {
    textNodes.push(node);
  }

  textNodes.forEach(textNode => {
    if (textNode.parentElement?.tagName === 'SCRIPT' || 
        textNode.parentElement?.tagName === 'STYLE') {
      return;
    }
    
    const span = document.createElement('span');
    span.innerHTML = applyBionicReadingToText(textNode.textContent || '');
    textNode.replaceWith(span);
  });
}

function clearReaderContent(): void {
  const content = document.querySelector('.reader-content');
  if (content) {
    content.innerHTML = '';
  }
  
  const timerElement = document.querySelector('.reading-timer');
  if (timerElement) {
    timerElement.textContent = 'Reading time: 00:00';
  }
}

async function initializeReader(): Promise<void> {
  const overlay = createReaderOverlay();
  document.body.appendChild(overlay);

  const statsButton = overlay.querySelector('#stats-button') as HTMLElement;
  const statsPopup = createStatsPopup();
  statsButton.appendChild(statsPopup);

  // Add click handler for stats button
  statsButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const popup = statsButton.querySelector('.stats-popup') as HTMLElement;
    if (popup) {
      state.isStatsOpen = !state.isStatsOpen;
      popup.style.display = state.isStatsOpen ? 'block' : 'none';
      updateStats();
    }
  });

  // Close stats popup when clicking outside
  document.addEventListener('click', () => {
    if (state.isStatsOpen) {
      const popup = statsButton.querySelector('.stats-popup') as HTMLElement;
      if (popup) {
        popup.style.display = 'none';
        state.isStatsOpen = false;
      }
    }
  });

  const closeButton = overlay.querySelector('.close-button');
  closeButton?.addEventListener('click', () => {
    overlay.style.display = 'none';
    state.isOpen = false;
    pauseTimer();
  });
}

async function showReader(): Promise<void> {
  const overlay = document.getElementById('bionic-reader-overlay');
  if (!overlay) return Promise.resolve();

  try {
    const article = new Readability(document.cloneNode(true) as Document).parse();
    if (!article) return Promise.resolve();

    const content = overlay.querySelector('.reader-content');
    if (!content) return Promise.resolve();

    content.innerHTML = '';
    
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = article.content;

    // Only apply bionic reading if content hasn't been processed
    if (!tempContainer.querySelector('strong')) {
      applyBionicReadingToHTML(tempContainer);
    }

    if (article.title) {
      const titleElement = document.createElement('h1');
      titleElement.className = 'reader-title';
      titleElement.textContent = article.title;
      content.appendChild(titleElement);
    }

    content.appendChild(tempContainer);
    
    // Add current article to history if not already present
    const currentUrl = window.location.href;
    if (!state.historicalArticles.some(article => article.url === currentUrl)) {
      state.historicalArticles.push({
        url: currentUrl,
        title: article.title || document.title,
        timestamp: Date.now()
      });
      localStorage.setItem('bionicReadingArticles', JSON.stringify(state.historicalArticles));
    }
    
    overlay.style.display = 'flex';
    state.isOpen = true;
    updateStats();
    startTimer();
  } catch (error) {
    console.error('Error parsing article:', error);
  }
  return Promise.resolve();
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'isAlive') {
    sendResponse(true);
    return true;
  }
  
  if (message.action === 'toggleReader') {
    if (!state.isOpen) {
      showReader().catch(console.error);
    } else {
      const overlay = document.getElementById('bionic-reader-overlay');
      if (overlay) {
        overlay.style.display = 'none';
        state.isOpen = false;
        pauseTimer();
      }
    }
  }
  return false;
});

// Initialize the reader
initializeReader().catch(console.error);

// Add keyboard shortcut listeners
document.addEventListener('keydown', (event: KeyboardEvent) => {
  // Escape to exit reading mode
  if (event.key === 'Escape') {
    if (state.isOpen) {
      const overlay = document.getElementById('bionic-reader-overlay');
      if (overlay) {
        overlay.style.display = 'none';
        state.isOpen = false;
        pauseTimer();
      }
    }
  }
}); 