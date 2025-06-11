/**
 * Storage Service
 * Handles all storage operations for the extension
 */

import { STORAGE_KEYS } from '../config/constants';

export interface HistoricalArticle {
  url: string;
  title: string;
  timestamp: number;
}

export class StorageService {
  /**
   * Get OpenAI API key from Chrome storage
   */
  static async getOpenAIApiKey(): Promise<string | null> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEYS.openaiApiKey], (result) => {
        resolve(result[STORAGE_KEYS.openaiApiKey] || null);
      });
    });
  }

  /**
   * Get bionic reading enabled state from Chrome storage
   */
  static async getBionicEnabled(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEYS.bionicEnabled], (result) => {
        resolve(result[STORAGE_KEYS.bionicEnabled] || false);
      });
    });
  }

  /**
   * Get auto highlight enabled state from Chrome storage
   */
  static async getAutoHighlightEnabled(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEYS.autoHighlightEnabled], (result) => {
        resolve(result[STORAGE_KEYS.autoHighlightEnabled] || false);
      });
    });
  }

  /**
   * Get jargon translator enabled state from Chrome storage
   */
  static async getJargonTranslatorEnabled(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEYS.jargonTranslatorEnabled], (result) => {
        resolve(result[STORAGE_KEYS.jargonTranslatorEnabled] || false);
      });
    });
  }

  /**
   * Get translator level from Chrome storage
   */
  static async getTranslatorLevel(): Promise<string> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEYS.translatorLevel], (result) => {
        resolve(result[STORAGE_KEYS.translatorLevel] || 'highSchool');
      });
    });
  }

  /**
   * Set bionic reading enabled state in Chrome storage
   */
  static async setBionicEnabled(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [STORAGE_KEYS.bionicEnabled]: enabled }, resolve);
    });
  }

  /**
   * Set auto highlight enabled state in Chrome storage
   */
  static async setAutoHighlightEnabled(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [STORAGE_KEYS.autoHighlightEnabled]: enabled }, resolve);
    });
  }

  /**
   * Set jargon translator enabled state in Chrome storage
   */
  static async setJargonTranslatorEnabled(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [STORAGE_KEYS.jargonTranslatorEnabled]: enabled }, resolve);
    });
  }

  /**
   * Set translator level in Chrome storage
   */
  static async setTranslatorLevel(level: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [STORAGE_KEYS.translatorLevel]: level }, resolve);
    });
  }

  /**
   * Get historical reading time from localStorage
   */
  static getHistoricalTime(): number {
    return Number(localStorage.getItem(STORAGE_KEYS.bionicReadingTime) || '0');
  }

  /**
   * Set historical reading time in localStorage
   */
  static setHistoricalTime(time: number): void {
    localStorage.setItem(STORAGE_KEYS.bionicReadingTime, time.toString());
  }

  /**
   * Get historical articles from localStorage
   */
  static getHistoricalArticles(): HistoricalArticle[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.bionicReadingArticles) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Set historical articles in localStorage
   */
  static setHistoricalArticles(articles: HistoricalArticle[]): void {
    localStorage.setItem(STORAGE_KEYS.bionicReadingArticles, JSON.stringify(articles));
  }

  /**
   * Add article to history if not already present
   */
  static addArticleToHistory(url: string, title: string): void {
    const articles = this.getHistoricalArticles();
    if (!articles.some(article => article.url === url)) {
      articles.push({
        url,
        title,
        timestamp: Date.now()
      });
      this.setHistoricalArticles(articles);
    }
  }
} 