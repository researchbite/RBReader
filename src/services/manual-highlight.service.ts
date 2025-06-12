import { StorageService } from './storage.service';

export class ManualHighlightService {
  private static button: HTMLButtonElement | null = null;
  private static container: HTMLElement | null = null;

  static init(container: HTMLElement): void {
    this.container = container;
    if (!this.button) this.createButton();
    container.addEventListener('mouseup', (e) => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && container.contains(selection.anchorNode)) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        this.showButton(rect.right + window.scrollX, rect.bottom + window.scrollY);
      } else {
        this.hideButton();
      }
    });
  }

  static applyStoredHighlights(container: HTMLElement): void {
    const url = window.location.href;
    const highlights = StorageService.getManualHighlights(url);
    highlights.forEach(text => {
      this.highlightText(container, text);
    });
  }

  private static createButton(): void {
    const btn = document.createElement('button');
    btn.id = 'rb-highlight-btn';
    btn.textContent = 'Highlight';
    btn.style.position = 'absolute';
    btn.style.display = 'none';
    btn.style.zIndex = '10003';
    btn.style.padding = '4px 8px';
    btn.style.fontSize = '12px';
    btn.style.background = '#ffeb3b';
    btn.style.border = '1px solid #d0d0d0';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', () => this.applyHighlight());
    document.body.appendChild(btn);
    this.button = btn;
  }

  private static showButton(x: number, y: number): void {
    if (!this.button) return;
    this.button.style.top = `${y + 5}px`;
    this.button.style.left = `${x + 5}px`;
    this.button.style.display = 'block';
  }

  private static hideButton(): void {
    if (this.button) {
      this.button.style.display = 'none';
    }
  }

  private static applyHighlight(): void {
    if (!this.container) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    if (!this.container.contains(range.commonAncestorContainer)) return;
    const contents = range.extractContents();
    const mark = document.createElement('mark');
    mark.className = 'user-highlight';
    mark.appendChild(contents);
    range.insertNode(mark);
    const text = mark.textContent || '';
    StorageService.addManualHighlight(window.location.href, text);
    selection.removeAllRanges();
    this.hideButton();
  }

  private static highlightText(root: HTMLElement, text: string): boolean {
    const blockElements = root.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6, blockquote');
    for (const block of Array.from(blockElements)) {
      const { nodes, totalText } = this.collectTextNodes(block);
      const flexiblePattern = this.escapeRegex(text).replace(/\s+/g, "\\s+");
      const regex = new RegExp(flexiblePattern, 'i');
      const match = totalText.match(regex);
      if (match && typeof match.index === 'number') {
        let start = match.index;
        let end = match.index + match[0].length;
        while (start < end && /\s/.test(totalText[start])) start++;
        while (end > start && /\s/.test(totalText[end - 1])) end--;
        if (this.highlightRange(nodes, start, end)) return true;
      }
    }
    return false;
  }

  private static collectTextNodes(
    node: Node,
    textNodes: { node: Node; text: string; offset: number }[] = [],
    currentOffset: number = 0
  ): { nodes: { node: Node; text: string; offset: number }[]; totalText: string } {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      textNodes.push({ node, text, offset: currentOffset });
      return { nodes: textNodes, totalText: text };
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.nodeName !== 'MARK' &&
      node.nodeName !== 'SCRIPT' &&
      node.nodeName !== 'STYLE'
    ) {
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

  private static highlightRange(
    nodes: { node: Node; text: string; offset: number }[],
    startOffset: number,
    endOffset: number
  ): boolean {
    let highlighted = false;
    for (const { node, text, offset } of nodes) {
      const nodeStart = offset;
      const nodeEnd = offset + text.length;
      if (nodeEnd <= startOffset || nodeStart >= endOffset) continue;
      const highlightStart = Math.max(0, startOffset - nodeStart);
      const highlightEnd = Math.min(text.length, endOffset - nodeStart);
      if (highlightStart < highlightEnd && node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        const parent = textNode.parentNode;
        if (parent) {
          const before = text.substring(0, highlightStart);
          const middle = text.substring(highlightStart, highlightEnd);
          const after = text.substring(highlightEnd);
          if (before) parent.insertBefore(document.createTextNode(before), textNode);
          const mark = document.createElement('mark');
          mark.className = 'user-highlight';
          mark.textContent = middle;
          parent.insertBefore(mark, textNode);
          if (after) parent.insertBefore(document.createTextNode(after), textNode);
          parent.removeChild(textNode);
          highlighted = true;
        }
      }
    }
    return highlighted;
  }

  private static escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
