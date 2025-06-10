/**
 * AI Highlighting Service
 * Handles AI-powered important sentence highlighting
 */

import { AUTO_HIGHLIGHT_PROMPTS, AUTO_HIGHLIGHT_CONFIG, HIGHLIGHT_ANIMATION } from '../config/ai-prompts';
import { IMPORTANT_KEYWORDS } from '../config/constants';
import { StorageService } from './storage.service';

export class AIHighlightingService {
  private static highlightIndex = 0;

  /**
   * Add CSS styles for AI highlights with animations
   */
  static addHighlightStyles(): void {
    if (!document.getElementById('ai-highlight-styles')) {
      const style = document.createElement('style');
      style.id = 'ai-highlight-styles';
      style.textContent = `
        @keyframes highlightFadeIn {
          0% {
            background-color: #fff59d;
            transform: scale(1.05);
            box-shadow: 0 4px 20px rgba(255, 235, 59, 0.6);
          }
          50% {
            background-color: #fff176;
            transform: scale(1.02);
            box-shadow: 0 4px 16px rgba(255, 235, 59, 0.4);
          }
          100% {
            background-color: #ffeb3b;
            transform: scale(1);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        }

        @keyframes highlightPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .ai-highlight {
          background-color: #ffeb3b !important;
          padding: 2px 0 !important;
          border-radius: 0 !important;
          color: black !important;
          font-weight: normal !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
          position: relative !important;
          display: inline !important;
          animation: highlightFadeIn ${HIGHLIGHT_ANIMATION.duration}ms ${HIGHLIGHT_ANIMATION.easing} !important;
          transition: all 0.3s ease !important;
        }

        .ai-highlight:hover {
          background-color: #fdd835 !important;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
          transform: translateY(-1px) !important;
        }

        .ai-highlight.streaming {
          animation: highlightPulse 1s ease-in-out infinite !important;
        }

        mark.ai-highlight {
          background-color: #ffeb3b !important;
        }

        /* Hide badge numbers */
        .ai-highlight::before {
          display: none !important;
        }

        /* Remove gap between consecutive highlight elements */
        .ai-highlight + .ai-highlight {
          margin-left: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Highlight important lines using AI with streaming
   */
  static async highlightImportantLines(element: HTMLElement): Promise<void> {
    console.log('🎯 highlightImportantLines called');
    this.highlightIndex = 0; // Reset counter
    
    try {
      // Get API key from user settings
      const apiKey = await StorageService.getOpenAIApiKey();
      console.log('🔑 API Key status:', apiKey ? 'Found' : 'Not found');
      
      if (!apiKey) {
        console.warn('⚠️ OpenAI API key not configured. Please set it in extension options. Skipping AI highlighting.');
        return;
      }

      const articleText = element.innerText;
      console.log('📝 Article text length:', articleText.length);
      console.log('📝 Article preview:', articleText.substring(0, 200) + '...');

      this.addHighlightStyles();

      // Try real AI highlighting with streaming
      try {
        console.log('🤖 Starting streaming AI highlighting...');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: AUTO_HIGHLIGHT_CONFIG.model,
            messages: [
              { role: 'system', content: AUTO_HIGHLIGHT_PROMPTS.system },
              { role: 'user', content: AUTO_HIGHLIGHT_PROMPTS.user(articleText) }
            ],
            temperature: AUTO_HIGHLIGHT_CONFIG.temperature,
            max_tokens: AUTO_HIGHLIGHT_CONFIG.maxTokens,
            stream: AUTO_HIGHLIGHT_CONFIG.stream
          })
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        // Process streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let highlightCount = 0;

        // Accumulate pieces that may contain partial <hl> tags
        let partialHighlightBuffer = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode chunk
            buffer += decoder.decode(value, { stream: true });

            // Each SSE event is separated by a newline
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Preserve incomplete line

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;

              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const contentFragment = parsed.choices?.[0]?.delta?.content ?? '';

                if (!contentFragment) continue;


                // Append fragment to the partial buffer which might contain unfinished <hl> tags
                partialHighlightBuffer += contentFragment;

                // Look for one or more complete <hl>...</hl> tags in the buffer
                const tagRegex = /<hl\b[^>]*>(.*?)<\/hl>/g;
                let match: RegExpExecArray | null;

                while ((match = tagRegex.exec(partialHighlightBuffer)) !== null) {
                  const sentence = match[1].trim();
                  console.log(`🔍 Extracted complete <hl> tag (${sentence.length} chars)`);

                  // Schedule highlighting with staggered animation
                  const currentIndex = highlightCount + 1;
                  setTimeout(() => {
                    const ok = this.highlightSentenceInElement(element, sentence, currentIndex);
                    console[ok ? 'log' : 'warn'](`➡️ Highlight ${currentIndex} ${ok ? 'applied' : 'not found in DOM'}`);
                  }, highlightCount * HIGHLIGHT_ANIMATION.stagger);

                  highlightCount++;
                }

                // Remove processed highlights from buffer to keep it small
                if (highlightCount > 0) {
                  // Keep anything after the last complete </hl>
                  const lastCloseTagIdx = partialHighlightBuffer.lastIndexOf('</hl>');
                  if (lastCloseTagIdx !== -1) {
                    partialHighlightBuffer = partialHighlightBuffer.slice(lastCloseTagIdx + 5);
                  }
                }

              } catch (err) {
                console.error('❌ Failed to parse SSE chunk:', err, line);
              }
            }
          }
        }

        console.log(`✅ Streaming AI highlighting completed - ${highlightCount} highlights applied`);

      } catch (aiError) {
        console.error('❌ AI highlighting failed, falling back to simulation:', aiError);
        
        // Fallback to improved simulation
        console.log('🤖 Using improved simulation highlighting...');
        this.simulateHighlighting(element);
      }

    } catch (error) {
      console.error('❌ Auto highlighting failed:', error);
    }
  }

  /**
   * Extract highlights from streamed content
   */
  private static extractHighlights(content: string): string[] {
    const highlights: string[] = [];
    const regex = /<hl\b[^>]*>(.*?)<\/hl>/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      highlights.push(match[1].trim());
    }
    
    return highlights;
  }

  /**
   * Highlight a specific sentence in the DOM with animation
   */
  private static highlightSentenceInElement(element: HTMLElement, sentence: string, index: number): boolean {
    // Normalize the sentence for matching
    const normalizedSentence = sentence.trim().replace(/\s+/g, ' ').toLowerCase();
    if (normalizedSentence.length < 10) return false;

    console.log(`🔎 Looking for: "${normalizedSentence.substring(0, 50)}..."`);

    // Search within paragraphs and other block elements
    const blockElements = element.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6, blockquote');
    
    for (const block of blockElements) {
      // Collect all text nodes in this block
      const { nodes, totalText } = this.collectTextNodes(block);
      
      // Build a whitespace-tolerant regular expression for the exact sentence.
      // 1. Escape regex metacharacters in the sentence.
      // 2. Replace all runs of whitespace with the pattern "\s+" so that we
      //    can match across line-breaks and multiple spaces.
      const flexiblePattern = this.escapeRegex(sentence).replace(/\s+/g, "\\s+");
      const flexibleRegex = new RegExp(flexiblePattern, 'i');

      const match = totalText.match(flexibleRegex);

      if (match && typeof match.index === 'number') {
        // Compute actual start/end indices in the raw text
        let actualStart = match.index;
        let actualEnd = match.index + match[0].length;

        // Trim leading/trailing whitespace so we highlight only the words
        while (actualStart < actualEnd && /\s/.test(totalText[actualStart])) {
          actualStart++;
        }
        while (actualEnd > actualStart && /\s/.test(totalText[actualEnd - 1])) {
          actualEnd--;
        }

        console.log(`📍 Found match in block at position ${actualStart}`);

        // Highlight the range with animation
        if (this.highlightRange(nodes, actualStart, actualEnd, index)) {
          console.log(`✅ Successfully highlighted in block`);
          return true;
        }
      }
    }
    
    console.log(`⚠️ Sentence not found in any block`);
    return false;
  }

  /**
   * Collect text nodes from an element
   */
  private static collectTextNodes(
    node: Node, 
    textNodes: { node: Node, text: string, offset: number }[] = [], 
    currentOffset: number = 0
  ): { nodes: { node: Node, text: string, offset: number }[], totalText: string } {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      textNodes.push({ node, text, offset: currentOffset });
      return { nodes: textNodes, totalText: text };
    } else if (node.nodeType === Node.ELEMENT_NODE && 
               node.nodeName !== 'MARK' && 
               node.nodeName !== 'SCRIPT' && 
               node.nodeName !== 'STYLE') {
      let totalText = '';
      const children = Array.from(node.childNodes);
      for (const child of children) {
        const result = this.collectTextNodes(child, textNodes, currentOffset + totalText.length);
        totalText += result.totalText;
      }
      return { nodes: textNodes, totalText };
    }
    return { nodes: textNodes, totalText: '' };
  }

  /**
   * Highlight a range of text across multiple nodes with animation
   */
  private static highlightRange(
    nodes: { node: Node, text: string, offset: number }[], 
    startOffset: number, 
    endOffset: number,
    highlightIndex: number
  ): boolean {
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
          mark.setAttribute('data-highlight-index', String(highlightIndex));
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

  /**
   * Simulate highlighting when AI is not available
   */
  private static simulateHighlighting(element: HTMLElement): void {
    const paragraphs = element.querySelectorAll('p');
    console.log('📊 Found paragraphs for simulation:', paragraphs.length);
    
    let highlightCount = 0;
    const highlightsToApply: { paragraph: HTMLElement, sentence: string }[] = [];
    
    // Collect important-looking sentences first
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
          IMPORTANT_KEYWORDS.importance.test(trimmedSentence) ||
          IMPORTANT_KEYWORDS.research.test(trimmedSentence) ||
          IMPORTANT_KEYWORDS.transition.test(trimmedSentence);
        
        if (isImportant && highlightsToApply.length < 10) {
          highlightsToApply.push({ paragraph, sentence: trimmedSentence });
        }
      });
    });
    
    // Apply highlights with staggered animation
    highlightsToApply.forEach((item, index) => {
      setTimeout(() => {
        const highlighted = this.highlightTextInParagraph(item.paragraph, item.sentence, index + 1);
        if (highlighted) {
          highlightCount++;
          console.log('✨ Simulated highlight:', item.sentence.substring(0, 50) + '...');
        }
      }, index * HIGHLIGHT_ANIMATION.stagger);
    });
    
    console.log(`✅ Simulation highlighting scheduled - ${highlightsToApply.length} highlights`);
  }

  /**
   * Highlight text within a paragraph with animation
   */
  private static highlightTextInParagraph(paragraph: HTMLElement, text: string, index: number): boolean {
    // Normalize the text for matching
    const normalizedText = text.trim().replace(/\s+/g, ' ');
    if (normalizedText.length < 10) return false;

    return this.highlightInNode(paragraph, normalizedText, index);
  }

  /**
   * Recursively highlight text in a node with animation
   */
  private static highlightInNode(node: Node, normalizedText: string, highlightIndex: number): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
      const nodeText = node.textContent || '';
      const normalizedNodeText = nodeText.replace(/\s+/g, ' ');
      
      // Check if this text contains our sentence (case-insensitive)
      const index = normalizedNodeText.toLowerCase().indexOf(normalizedText.toLowerCase());
      if (index !== -1) {
        // Find the actual position in the original text
        const { actualStart, actualEnd } = this.mapNormalizedToActual(nodeText, normalizedText, index);
        
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
          mark.setAttribute('data-highlight-index', String(highlightIndex));
          mark.textContent = match;
          parent.insertBefore(mark, node);
          
          if (after) {
            parent.insertBefore(document.createTextNode(after), node);
          }
          
          parent.removeChild(node);
          return true;
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && 
               node.nodeName !== 'MARK' && 
               node.nodeName !== 'SCRIPT' && 
               node.nodeName !== 'STYLE') {
      // Recursively process child nodes
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (this.highlightInNode(child, normalizedText, highlightIndex)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Map normalized position to actual position in text
   */
  private static mapNormalizedToActual(
    nodeText: string, 
    normalizedText: string, 
    normalizedIndex: number
  ): { actualStart: number, actualEnd: number } {
    let actualStart = 0;
    let normalizedPos = 0;
    
    // Map normalized position to actual position
    for (let i = 0; i < nodeText.length && normalizedPos < normalizedIndex; i++) {
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
    
    return { actualStart, actualEnd };
  }

  /**
   * Escape special characters so that a plain sentence can be safely inserted
   * into a dynamic regular expression.
   */
  private static escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
} 