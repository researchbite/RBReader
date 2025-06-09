/**
 * Bionic Reading Service
 * Handles text transformation for bionic reading
 */

import { SKIP_WORDS } from '../config/constants';

export class BionicReadingService {
  /**
   * Apply bionic reading to a text string
   */
  static applyBionicReadingToText(text: string): string {
    return text.split(' ').map(word => {
      // Skip bionic reading for common words
      if (word.length <= 1 || SKIP_WORDS.has(word.toLowerCase())) return word;
      
      const midPoint = Math.min(Math.floor(word.length / 2), 3);
      const firstHalf = word.slice(0, midPoint);
      const secondHalf = word.slice(midPoint);
      return `<strong>${firstHalf}</strong>${secondHalf}`;
    }).join(' ');
  }

  /**
   * Apply bionic reading to an HTML element
   */
  static applyBionicReadingToHTML(element: HTMLElement): void {
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
      span.innerHTML = this.applyBionicReadingToText(textNode.textContent || '');
      textNode.replaceWith(span);
    });
  }

  /**
   * Remove bionic reading formatting from an element
   */
  static removeBionicFormatting(element: HTMLElement): void {
    const bionicSpans = element.querySelectorAll('span strong');
    bionicSpans.forEach(strong => {
      const parent = strong.parentElement;
      if (parent && parent.tagName === 'SPAN') {
        parent.replaceWith(parent.textContent || '');
      }
    });
  }

  /**
   * Toggle bionic reading on an element
   */
  static toggleBionicReading(element: HTMLElement, enable: boolean): void {
    const tempContent = element.cloneNode(true) as HTMLElement;
    
    // Remove existing bionic formatting
    this.removeBionicFormatting(tempContent);
    
    // Apply bionic reading if enabled
    if (enable) {
      this.applyBionicReadingToHTML(tempContent);
    }
    
    // Replace content
    element.innerHTML = tempContent.innerHTML;
  }
} 