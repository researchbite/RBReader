// Import Readability from the package
import { Readability } from '@mozilla/readability';
// Temporarily disable AI SDK to fix compilation issues
// import { streamText } from 'ai';
// import { openai } from '@ai-sdk/openai';

// Function to get API key from Chrome storage
async function getOpenAIApiKey(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['openaiApiKey'], (result) => {
      resolve(result.openaiApiKey || null);
    });
  });
}

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
  isBionicEnabled: boolean;
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
  isStatsOpen: false,
  isBionicEnabled: false // Disabled by default
};

function createReaderOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = 'bionic-reader-overlay';
  overlay.innerHTML = `
    <div class="reader-container">
      <div class="reader-controls">
        <button id="stats-button" class="icon-button stats-button">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 3C2 2.44772 2.44772 2 3 2H17C17.5523 2 18 2.44772 18 3V17C18 17.5523 17.5523 18 17 18H3C2.44772 18 2 17.5523 2 17V3Z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M6 6H14M6 10H14M6 14H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="bionic-toggle-container">
          <label class="bionic-toggle-label">Bionic Reading</label>
          <label class="bionic-toggle">
            <input type="checkbox" id="bionic-toggle-switch">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <button class="icon-button close-button" title="Exit Reader Mode (Esc)">×</button>
      </div>
      <div class="reader-content"></div>
    </div>
  `;

  // Add styles for the header and buttons
  const style = document.createElement('style');
  style.textContent = `
    .reader-controls {
      position: fixed;
      top: 1.5rem;
      left: 1.5rem;
      right: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: nowrap;
      z-index: 10001;
      max-width: 680px;
      margin: 0 auto;
      width: calc(100% - 3rem);
    }
    .bionic-toggle-container {
      display: flex;
      align-items: center;
      gap: 12px;
      background: none;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      padding: 0;
      border-radius: 0;
      box-shadow: none;
    }
    .bionic-toggle-label {
      font-size: 14px;
      font-weight: 500;
      color: #1c1c1e;
      user-select: none;
    }
    .bionic-toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 26px;
    }
    .bionic-toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #e5e5e7;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 26px;
    }
    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }
    .bionic-toggle input:checked + .toggle-slider {
      background-color: #007aff;
    }
    .bionic-toggle input:checked + .toggle-slider:before {
      transform: translateX(18px);
    }
    .bionic-toggle input:focus + .toggle-slider {
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
    }
    .icon-button {
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #1c1c1e;
      font-size: 20px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      position: relative;
    }
    .stats-button {
      position: relative;
    }
    .close-button {
      position: relative;
      margin-left: auto;
      align-self: center;
    }
    .icon-button:hover {
      background: rgba(255, 255, 255, 0.95);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .icon-button:active {
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    }
    /* Ensure bionic strong tags don't interfere with highlights */
    .reader-content strong {
      font-weight: 600;
      color: inherit;
      background: none;
    }
    .reader-content mark.ai-highlight strong {
      background: none;
      color: inherit;
    }
    @media (max-width: 768px) {
      .reader-controls {
        top: 1rem;
        left: 1rem;
        right: 1rem;
        width: calc(100% - 2rem);
      }
      .bionic-toggle-container {
        padding: 6px 12px;
      }
      .bionic-toggle-label {
        font-size: 13px;
      }
    }
    .stats-popup {
      position: absolute;
      left: 0;
      top: calc(100% + 8px);
      background: rgba(255, 255, 255, 0.9);
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

async function highlightImportantLines(element: HTMLElement): Promise<void> {
  console.log('🎯 highlightImportantLines called');
  
  try {
    // Get API key from user settings
    const apiKey = await getOpenAIApiKey();
    console.log('🔑 API Key status:', apiKey ? 'Found' : 'Not found');
    
    if (!apiKey) {
      console.warn('⚠️ OpenAI API key not configured. Please set it in extension options. Skipping AI highlighting.');
      return;
    }

    const articleText = element.innerText;
    console.log('📝 Article text length:', articleText.length);
    console.log('📝 Article preview:', articleText.substring(0, 200) + '...');

    // Add CSS for highlights if not already added
    if (!document.getElementById('ai-highlight-styles')) {
      const style = document.createElement('style');
      style.id = 'ai-highlight-styles';
      style.textContent = `
        .ai-highlight {
          background-color: #ffeb3b !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
          color: black !important;
          font-weight: normal !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }
        mark.ai-highlight {
          background-color: #ffeb3b !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Try real AI highlighting first
    try {
      console.log('🤖 Attempting real AI highlighting...');
      
      // Craft the system prompt
      const systemPrompt = `You are an expert reader who identifies the most important and insightful sentences in articles. Your task is to:
1. Carefully read and understand the entire article
2. Identify the 5-10 most important sentences that contain key insights, main arguments, or crucial information
3. Focus on sentences that would help a reader quickly understand the core message
4. Prefer sentences that are self-contained and meaningful on their own`;

      const userPrompt = `Please analyze this article and return ONLY the most important sentences, exactly as they appear in the text. Return one sentence per line, with no additional formatting or explanation.

Article:
${articleText.substring(0, 8000)} // Limit to prevent token overflow

Important sentences (one per line):`;

      console.log('📤 Sending request to AI...');
      
      // Make direct API call since AI SDK has issues
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      console.log('✅ AI response received:', aiResponse.substring(0, 200) + '...');

      // Parse the important sentences
      const importantSentences = aiResponse
        .split('\n')
        .filter((line: string) => line.trim().length > 20)
        .map((line: string) => line.trim());

      console.log('📊 Important sentences identified:', importantSentences.length);

      // Highlight the sentences in the DOM
      let highlightCount = 0;
      importantSentences.forEach((sentence: string, index: number) => {
        console.log(`🔍 Attempting to highlight sentence ${index + 1}:`, sentence);
        const highlighted = highlightSentenceInElement(element, sentence);
        if (highlighted) {
          highlightCount++;
          console.log(`✨ Successfully highlighted sentence ${index + 1}`);
        } else {
          console.log(`❌ Failed to highlight sentence ${index + 1}`);
        }
      });

      console.log(`✅ AI highlighting completed - ${highlightCount} highlights applied`);

    } catch (aiError) {
      console.error('❌ AI highlighting failed, falling back to simulation:', aiError);
      
      // Fallback to improved simulation
      console.log('🤖 Using improved simulation highlighting...');
      simulateHighlighting(element);
    }

  } catch (error) {
    console.error('❌ Auto highlighting failed:', error);
  }
}

// Helper function to highlight a sentence in the DOM
function highlightSentenceInElement(element: HTMLElement, sentence: string): boolean {
  // Normalize the sentence for matching
  const normalizedSentence = sentence.trim().replace(/\s+/g, ' ').toLowerCase();
  if (normalizedSentence.length < 10) return false;

  console.log(`🔎 Looking for: "${normalizedSentence.substring(0, 50)}..."`);

  // Function to collect text content from an element, preserving structure
  function collectTextNodes(node: Node, textNodes: { node: Node, text: string, offset: number }[] = [], currentOffset: number = 0): { nodes: { node: Node, text: string, offset: number }[], totalText: string } {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      textNodes.push({ node, text, offset: currentOffset });
      return { nodes: textNodes, totalText: text };
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'MARK' && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
      let totalText = '';
      const children = Array.from(node.childNodes);
      for (const child of children) {
        const result = collectTextNodes(child, textNodes, currentOffset + totalText.length);
        totalText += result.totalText;
      }
      return { nodes: textNodes, totalText };
    }
    return { nodes: textNodes, totalText: '' };
  }

  // Function to highlight a range of text across multiple nodes
  function highlightRange(nodes: { node: Node, text: string, offset: number }[], startOffset: number, endOffset: number): boolean {
    let highlighted = false;
    
    for (const { node, text, offset } of nodes) {
      const nodeStart = offset;
      const nodeEnd = offset + text.length;
      
      // Skip if this node is outside our range
      if (nodeEnd <= startOffset || nodeStart >= endOffset) continue;
      
      // Calculate what part of this node to highlight
      const highlightStart = Math.max(0, startOffset - nodeStart);
      const highlightEnd = Math.min(text.length, endOffset - nodeStart);
      
      if (highlightStart < highlightEnd && node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        const parent = textNode.parentNode;
        
        if (parent) {
          // Split the text node if needed
          const before = text.substring(0, highlightStart);
          const middle = text.substring(highlightStart, highlightEnd);
          const after = text.substring(highlightEnd);
          
          if (before) {
            parent.insertBefore(document.createTextNode(before), textNode);
          }
          
          const mark = document.createElement('mark');
          mark.className = 'ai-highlight';
          mark.textContent = middle;
          parent.insertBefore(mark, textNode);
          
          if (after) {
            parent.insertBefore(document.createTextNode(after), textNode);
          }
          
          parent.removeChild(textNode);
          highlighted = true;
        }
      }
    }
    
    return highlighted;
  }

  // Search within paragraphs and other block elements
  const blockElements = element.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6, blockquote');
  
  for (const block of blockElements) {
    // Collect all text nodes in this block
    const { nodes, totalText } = collectTextNodes(block);
    const normalizedBlockText = totalText.replace(/\s+/g, ' ').toLowerCase();
    
    // Check if this block contains our sentence
    const index = normalizedBlockText.indexOf(normalizedSentence);
    if (index !== -1) {
      console.log(`📍 Found match in block at position ${index}`);
      
      // Map the normalized position back to actual position
      let actualStart = 0;
      let normalizedPos = 0;
      const lowerTotalText = totalText.toLowerCase();
      
      // Find actual start position
      for (let i = 0; i < totalText.length && normalizedPos <= index; i++) {
        if (i === 0 || totalText[i-1] === ' ' || totalText[i] !== ' ') {
          if (normalizedPos === index) {
            actualStart = i;
            break;
          }
          normalizedPos++;
        }
      }
      
      // Find actual end position
      let actualEnd = actualStart;
      let matchLength = 0;
      for (let i = actualStart; i < totalText.length && matchLength < normalizedSentence.length; i++) {
        if (lowerTotalText.substring(i, i + normalizedSentence.length - matchLength) === normalizedSentence.substring(matchLength)) {
          actualEnd = i + normalizedSentence.length - matchLength;
          break;
        }
        if (i === actualStart || totalText[i-1] === ' ' || totalText[i] !== ' ') {
          matchLength++;
        }
        actualEnd = i + 1;
      }
      
      console.log(`📏 Highlighting from ${actualStart} to ${actualEnd} in text of length ${totalText.length}`);
      
      // Highlight the range
      if (highlightRange(nodes, actualStart, actualEnd)) {
        console.log(`✅ Successfully highlighted in block`);
        return true;
      }
    }
  }
  
  console.log(`⚠️ Sentence not found in any block`);
  return false;
}

// Improved simulation function
function simulateHighlighting(element: HTMLElement): void {
  const paragraphs = element.querySelectorAll('p');
  console.log('📊 Found paragraphs for simulation:', paragraphs.length);
  
  let highlightCount = 0;
  
  // Highlight important-looking sentences
  paragraphs.forEach((paragraph, index) => {
    const text = paragraph.textContent || '';
    
    // Skip short paragraphs
    if (text.length < 50) return;
    
    // Look for sentences that seem important
    const sentences: string[] = text.match(/[^.!?]+[.!?]+/g) || [];
    
    sentences.forEach((sentence) => {
      const trimmedSentence = sentence.trim();
      
      // Highlight sentences that contain important keywords or are at strategic positions
      const isImportant = 
        index === 0 || // First paragraph
        index === 1 || // Second paragraph often has thesis
        (index % 4 === 0 && sentences.indexOf(sentence) === 0) || // First sentence of every 4th paragraph
        /\b(important|key|crucial|significant|main|primary|essential|critical)\b/i.test(trimmedSentence) ||
        /\b(research|study|found|discovered|shows|demonstrates|proves)\b/i.test(trimmedSentence) ||
        /\b(however|therefore|thus|consequently|moreover|furthermore)\b/i.test(trimmedSentence);
      
      if (isImportant && highlightCount < 10) {
        const highlighted = highlightTextInParagraph(paragraph, trimmedSentence);
        if (highlighted) {
          highlightCount++;
          console.log('✨ Simulated highlight:', trimmedSentence.substring(0, 50) + '...');
        }
      }
    });
  });
  
  console.log(`✅ Simulation highlighting completed - ${highlightCount} highlights applied`);
}

// Helper to highlight text within a paragraph
function highlightTextInParagraph(paragraph: HTMLElement, text: string): boolean {
  // Normalize the text for matching
  const normalizedText = text.trim().replace(/\s+/g, ' ');
  if (normalizedText.length < 10) return false;

  // Function to wrap matching text in highlights
  function highlightInNode(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
      const nodeText = node.textContent || '';
      const normalizedNodeText = nodeText.replace(/\s+/g, ' ');
      
      // Check if this text contains our sentence (case-insensitive)
      const index = normalizedNodeText.toLowerCase().indexOf(normalizedText.toLowerCase());
      if (index !== -1) {
        // Find the actual position in the original text
        let actualStart = 0;
        let normalizedPos = 0;
        
        // Map normalized position to actual position
        for (let i = 0; i < nodeText.length && normalizedPos < index; i++) {
          if (nodeText[i] !== ' ' || (i > 0 && nodeText[i-1] !== ' ')) {
            normalizedPos++;
          }
          actualStart++;
        }
        
        // Calculate actual end position
        let actualEnd = actualStart;
        let matchedLength = 0;
        for (let i = actualStart; i < nodeText.length && matchedLength < normalizedText.length; i++) {
          if (nodeText[i] !== ' ' || (i > 0 && nodeText[i-1] !== ' ')) {
            matchedLength++;
          }
          actualEnd++;
        }
        
        // Create the highlighted version
        const before = nodeText.substring(0, actualStart);
        const match = nodeText.substring(actualStart, actualEnd);
        const after = nodeText.substring(actualEnd);
        
        // Create new nodes
        const parent = node.parentNode;
        if (parent) {
          if (before) {
            parent.insertBefore(document.createTextNode(before), node);
          }
          
          const mark = document.createElement('mark');
          mark.className = 'ai-highlight';
          mark.textContent = match;
          parent.insertBefore(mark, node);
          
          if (after) {
            parent.insertBefore(document.createTextNode(after), node);
          }
          
          parent.removeChild(node);
          return true;
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'MARK' && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
      // Recursively process child nodes
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (highlightInNode(child)) {
          return true;
        }
      }
    }
    return false;
  }

  // Start highlighting from the paragraph
  return highlightInNode(paragraph);
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

  // Load bionic reading preference from Chrome storage
  chrome.storage.sync.get(['bionicEnabled'], (result) => {
    state.isBionicEnabled = result.bionicEnabled || false;
    const bionicToggle = document.getElementById('bionic-toggle-switch') as HTMLInputElement;
    if (bionicToggle) {
      bionicToggle.checked = state.isBionicEnabled;
    }
  });

  // Add bionic toggle handler
  const bionicToggle = document.getElementById('bionic-toggle-switch') as HTMLInputElement;
  if (bionicToggle) {
    bionicToggle.addEventListener('change', (event) => {
      state.isBionicEnabled = (event.target as HTMLInputElement).checked;
      chrome.storage.sync.set({ bionicEnabled: state.isBionicEnabled });
      
      // Re-render content with or without bionic reading
      const content = document.querySelector('.reader-content');
      if (content && state.isOpen) {
        const tempContent = content.cloneNode(true) as HTMLElement;
        
        // Remove existing bionic formatting
        const bionicSpans = tempContent.querySelectorAll('span strong');
        bionicSpans.forEach(strong => {
          const parent = strong.parentElement;
          if (parent && parent.tagName === 'SPAN') {
            parent.replaceWith(parent.textContent || '');
          }
        });
        
        // Apply bionic reading if enabled
        if (state.isBionicEnabled) {
          applyBionicReadingToHTML(tempContent);
        }
        
        // Replace content
        content.innerHTML = tempContent.innerHTML;
      }
    });
  }

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
  console.log('🚀 showReader called');
  const overlay = document.getElementById('bionic-reader-overlay');
  if (!overlay) {
    console.error('❌ Reader overlay not found');
    return Promise.resolve();
  }

  try {
    console.log('📖 Parsing article with Readability...');
    const article = new Readability(document.cloneNode(true) as Document).parse();
    if (!article) {
      console.error('❌ Failed to parse article with Readability');
      return Promise.resolve();
    }
    
    console.log('✅ Article parsed successfully:', {
      title: article.title,
      contentLength: article.content.length,
      textLength: article.textContent?.length
    });

    const content = overlay.querySelector('.reader-content');
    if (!content) {
      console.error('❌ Reader content container not found');
      return Promise.resolve();
    }

    content.innerHTML = '';
    
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = article.content;
    
    // Only apply bionic reading if enabled
    if (state.isBionicEnabled) {
      console.log('📝 Content container created, applying bionic reading...');
      applyBionicReadingToHTML(tempContainer);
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
    
    // Add current article to history if not already present
    const currentUrl = window.location.href;
    if (!state.historicalArticles.some(article => article.url === currentUrl)) {
      state.historicalArticles.push({
        url: currentUrl,
        title: article.title || document.title,
        timestamp: Date.now()
      });
      localStorage.setItem('bionicReadingArticles', JSON.stringify(state.historicalArticles));
      console.log('📚 Article added to history');
    }
    
    overlay.style.display = 'flex';
    state.isOpen = true;
    updateStats();
    startTimer();
    console.log('⏰ Timer started, reader opened');
    
    // Trigger AI highlighting with a small delay to ensure DOM is ready
    console.log('🎯 Scheduling AI highlighting...');
    setTimeout(() => {
      console.log('🎯 Starting AI highlighting after delay...');
      console.log('📊 Content element children:', tempContainer.children.length);
      console.log('📊 Content element HTML preview:', tempContainer.innerHTML.substring(0, 200) + '...');
      highlightImportantLines(tempContainer).catch(console.error);
    }, 500); // 500ms delay to ensure DOM is settled
  } catch (error) {
    console.error('❌ Error parsing article:', error);
  }
  return Promise.resolve();
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received:', message);
  
  if (message.action === 'isAlive') {
    console.log('💓 Responding to isAlive check');
    sendResponse(true);
    return true;
  }
  
  if (message.action === 'toggleReader') {
    console.log('🔄 Toggle reader requested, current state:', state.isOpen ? 'open' : 'closed');
    
    if (!state.isOpen) {
      console.log('🚀 Opening reader...');
      showReader().catch(console.error);
    } else {
      console.log('🚪 Closing reader...');
      const overlay = document.getElementById('bionic-reader-overlay');
      if (overlay) {
        overlay.style.display = 'none';
        state.isOpen = false;
        pauseTimer();
        console.log('✅ Reader closed');
      }
    }
  }
  return false;
});

// Initialize the reader
console.log('🏁 Initializing Research Bites extension...');
initializeReader().catch(console.error);

// Add keyboard shortcut listeners
document.addEventListener('keydown', (event: KeyboardEvent) => {
  // Escape to exit reading mode
  if (event.key === 'Escape') {
    if (state.isOpen) {
      console.log('⌨️ Escape key pressed, closing reader');
      const overlay = document.getElementById('bionic-reader-overlay');
      if (overlay) {
        overlay.style.display = 'none';
        state.isOpen = false;
        pauseTimer();
      }
    }
  }
}); 
