/**
 * DOM Helpers
 * Utility functions for DOM manipulation
 */

/**
 * Safely query selector with type assertion
 */
export function querySelector<T extends HTMLElement>(selector: string, parent: Document | HTMLElement = document): T | null {
  return parent.querySelector(selector) as T | null;
}

/**
 * Safely query selector all with type assertion
 */
export function querySelectorAll<T extends HTMLElement>(selector: string, parent: Document | HTMLElement = document): NodeListOf<T> {
  return parent.querySelectorAll(selector) as NodeListOf<T>;
}

/**
 * Create element with optional attributes and content
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attributes?: Record<string, string>,
  content?: string
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  
  if (content) {
    element.innerHTML = content;
  }
  
  return element;
}

/**
 * Wait for element to appear in DOM
 */
export function waitForElement(selector: string, timeout: number = 5000): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
} 