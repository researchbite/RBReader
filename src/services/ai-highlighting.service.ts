/**
 * AI Highlighting Service
 * Handles AI-powered important sentence highlighting
 */

import { AI_PROMPTS, AI_CONFIG } from '../config/ai-prompts';
import { IMPORTANT_KEYWORDS } from '../config/constants';
import { StorageService } from './storage.service';

export class AIHighlightingService {
  /**
   * Add CSS styles for AI highlights
   */
  static addHighlightStyles(): void {
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
  }

  /**
   * Highlight important lines using AI
   */
  static async highlightImportantLines(element: HTMLElement): Promise<void> {
    console.log('🎯 highlightImportantLines called');
    
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

      // Try real AI highlighting first
      try {
        console.log('🤖 Attempting real AI highlighting...');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: AI_CONFIG.model,
            messages: [
              { role: 'system', content: AI_PROMPTS.system },
              { role: 'user', content: AI_PROMPTS.user(articleText) }
            ],
            temperature: AI_CONFIG.temperature,
            max_tokens: AI_CONFIG.maxTokens
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
          .filter((line: string) => line.trim().length > AI_CONFIG.minSentenceLength)
          .map((line: string) => line.trim());

        console.log('📊 Important sentences identified:', importantSentences.length);

        // Highlight the sentences in the DOM
        let highlightCount = 0;
        importantSentences.forEach((sentence: string, index: number) => {
          console.log(`🔍 Attempting to highlight sentence ${index + 1}:`, sentence);
          const highlighted = this.highlightSentenceInElement(element, sentence);
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
        this.simulateHighlighting(element);
      }

    } catch (error) {
      console.error('❌ Auto highlighting failed:', error);
    }
  }

  /**
   * Highlight a specific sentence in the DOM
   */
  private static highlightSentenceInElement(element: HTMLElement, sentence: string): boolean {
    // Normalize the sentence for matching
    const normalizedSentence = sentence.trim().replace(/\s+/g, ' ').toLowerCase();
    if (normalizedSentence.length < 10) return false;

    console.log(`🔎 Looking for: "${normalizedSentence.substring(0, 50)}..."`);

    // Search within paragraphs and other block elements
    const blockElements = element.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6, blockquote');
    
    for (const block of blockElements) {
      // Collect all text nodes in this block
      const { nodes, totalText } = this.collectTextNodes(block);
      const normalizedBlockText = totalText.replace(/\s+/g, ' ').toLowerCase();
      
      // Check if this block contains our sentence
      const index = normalizedBlockText.indexOf(normalizedSentence);
      if (index !== -1) {
        console.log(`📍 Found match in block at position ${index}`);
        
        // Map the normalized position back to actual position
        const { actualStart, actualEnd } = this.findActualPositions(
          totalText, 
          normalizedSentence, 
          index
        );
        
        console.log(`📏 Highlighting from ${actualStart} to ${actualEnd} in text of length ${totalText.length}`);
        
        // Highlight the range
        if (this.highlightRange(nodes, actualStart, actualEnd)) {
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
   * Find actual positions in text
   */
  private static findActualPositions(
    totalText: string, 
    normalizedSentence: string, 
    normalizedIndex: number
  ): { actualStart: number, actualEnd: number } {
    let actualStart = 0;
    let normalizedPos = 0;
    const lowerTotalText = totalText.toLowerCase();
    
    // Find actual start position
    for (let i = 0; i < totalText.length && normalizedPos <= normalizedIndex; i++) {
      if (i === 0 || totalText[i-1] === ' ' || totalText[i] !== ' ') {
        if (normalizedPos === normalizedIndex) {
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
    
    return { actualStart, actualEnd };
  }

  /**
   * Highlight a range of text across multiple nodes
   */
  private static highlightRange(
    nodes: { node: Node, text: string, offset: number }[], 
    startOffset: number, 
    endOffset: number
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
          IMPORTANT_KEYWORDS.importance.test(trimmedSentence) ||
          IMPORTANT_KEYWORDS.research.test(trimmedSentence) ||
          IMPORTANT_KEYWORDS.transition.test(trimmedSentence);
        
        if (isImportant && highlightCount < 10) {
          const highlighted = this.highlightTextInParagraph(paragraph, trimmedSentence);
          if (highlighted) {
            highlightCount++;
            console.log('✨ Simulated highlight:', trimmedSentence.substring(0, 50) + '...');
          }
        }
      });
    });
    
    console.log(`✅ Simulation highlighting completed - ${highlightCount} highlights applied`);
  }

  /**
   * Highlight text within a paragraph
   */
  private static highlightTextInParagraph(paragraph: HTMLElement, text: string): boolean {
    // Normalize the text for matching
    const normalizedText = text.trim().replace(/\s+/g, ' ');
    if (normalizedText.length < 10) return false;

    return this.highlightInNode(paragraph, normalizedText);
  }

  /**
   * Recursively highlight text in a node
   */
  private static highlightInNode(node: Node, normalizedText: string): boolean {
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
        if (this.highlightInNode(child, normalizedText)) {
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
} 