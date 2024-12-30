// Import Readability from the package
import { Readability } from '@mozilla/readability';

interface ReaderState {
  isOpen: boolean;
  originalBody: string;
}

const state: ReaderState = {
  isOpen: false,
  originalBody: '',
};

function createReaderOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = 'bionic-reader-overlay';
  overlay.innerHTML = `
    <div class="reader-container">
      <button class="close-button">×</button>
      <div class="reader-content"></div>
    </div>
  `;

  return overlay;
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

async function initializeReader(): Promise<void> {
  const overlay = createReaderOverlay();
  document.body.appendChild(overlay);

  const closeButton = overlay.querySelector('.close-button');
  closeButton?.addEventListener('click', () => {
    overlay.style.display = 'none';
    state.isOpen = false;
  });
}

async function showReader(): Promise<void> {
  const overlay = document.getElementById('bionic-reader-overlay');
  if (!overlay) return;

  try {
    const article = new Readability(document.cloneNode(true) as Document).parse();
    if (!article) return;

    const content = overlay.querySelector('.reader-content');
    if (!content) return;

    // Create a temporary container for the article content
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = article.content;

    // Apply bionic reading to the HTML content
    applyBionicReadingToHTML(tempContainer);

    // Add title
    if (article.title) {
      const titleElement = document.createElement('h1');
      titleElement.className = 'reader-title';
      titleElement.textContent = article.title;
      content.appendChild(titleElement);
    }

    // Add the processed content
    content.appendChild(tempContainer);
    
    overlay.style.display = 'flex';
    state.isOpen = true;
  } catch (error) {
    console.error('Error parsing article:', error);
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleReader') {
    if (!state.isOpen) {
      showReader().catch(console.error);
    }
  }
  return false;
});

// Initialize the reader
initializeReader().catch(console.error); 