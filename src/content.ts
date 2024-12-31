// Import Readability from the package
import { Readability } from '@mozilla/readability';

interface ReaderState {
  isOpen: boolean;
  originalBody: string;
  startTime: number | null;
  timerInterval: number | null;
  totalElapsedTime: number;
  lastPauseTime: number | null;
  historicalTime: number;
}

const state: ReaderState = {
  isOpen: false,
  originalBody: '',
  startTime: null,
  timerInterval: null,
  totalElapsedTime: 0,
  lastPauseTime: null,
  historicalTime: Number(localStorage.getItem('bionicReadingTime') || '0')
};

function createReaderOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = 'bionic-reader-overlay';
  overlay.innerHTML = `
    <div class="reader-container">
      <button class="close-button">×</button>
      <div class="reader-content"></div>
      <div class="reading-timer">Reading time: 00:00</div>
    </div>
  `;

  return overlay;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function startTimer(): void {
  if (state.timerInterval) return;
  
  if (state.lastPauseTime) {
    state.totalElapsedTime += Math.floor((state.lastPauseTime - (state.startTime || 0)) / 1000);
  }
  
  state.startTime = Date.now();
  state.lastPauseTime = null;
  const timerElement = document.querySelector('.reading-timer');
  
  state.timerInterval = window.setInterval(() => {
    if (!state.startTime || !timerElement) return;
    
    const currentElapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
    const totalSeconds = state.historicalTime + state.totalElapsedTime + currentElapsedSeconds;
    timerElement.textContent = `Total reading time: ${formatTime(totalSeconds)}`;
  }, 1000);
}

function pauseTimer(): void {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    state.lastPauseTime = Date.now();
    
    // Calculate and save the total time spent reading
    if (state.startTime) {
      const currentElapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
      state.historicalTime += state.totalElapsedTime + currentElapsedSeconds;
      localStorage.setItem('bionicReadingTime', state.historicalTime.toString());
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
  state.totalElapsedTime = 0;
  
  const timerElement = document.querySelector('.reading-timer');
  if (timerElement) {
    timerElement.textContent = `Total reading time: ${formatTime(state.historicalTime)}`;
  }
}

function applyBionicReadingToText(text: string): string {
  return text.split(' ').map(word => {
    if (word.length <= 1) return word;
    const midPoint = Math.ceil(word.length / 2);
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

    // Clear all content including the timer
    content.innerHTML = '';
    
    // Remove any existing timer elements
    const existingTimer = overlay.querySelector('.reading-timer');
    if (existingTimer) {
      existingTimer.remove();
    }

    // Create a new timer element
    const timerElement = document.createElement('div');
    timerElement.className = 'reading-timer';
    timerElement.textContent = `Total reading time: ${formatTime(state.historicalTime)}`;
    overlay.querySelector('.reader-container')?.appendChild(timerElement);

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = article.content;

    applyBionicReadingToHTML(tempContainer);

    if (article.title) {
      const titleElement = document.createElement('h1');
      titleElement.className = 'reader-title';
      titleElement.textContent = article.title;
      content.appendChild(titleElement);
    }

    content.appendChild(tempContainer);
    
    overlay.style.display = 'flex';
    state.isOpen = true;
    startTimer();
  } catch (error) {
    console.error('Error parsing article:', error);
  }
  return Promise.resolve();
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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