/**
 * Reader State Service
 * Manages the state of the reader application
 */

import { StorageService, HistoricalArticle } from './storage.service';
import { TranslatorLevel } from '../config/ai-prompts';

export interface ReaderState {
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
  isAutoHighlightEnabled: boolean;
  isJargonTranslatorEnabled: boolean;
  translatorLevel: TranslatorLevel;
}

export class ReaderStateService {
  private static instance: ReaderStateService;
  private state: ReaderState;

  private constructor() {
    this.state = {
      isOpen: false,
      originalBody: '',
      startTime: null,
      timerInterval: null,
      totalElapsedTime: 0,
      lastPauseTime: null,
      historicalTime: StorageService.getHistoricalTime(),
      currentArticleTime: 0,
      historicalArticles: StorageService.getHistoricalArticles(),
      isStatsOpen: false,
      isBionicEnabled: false,
      isAutoHighlightEnabled: false,
      isJargonTranslatorEnabled: false,
      translatorLevel: 'highSchool'
    };
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ReaderStateService {
    if (!ReaderStateService.instance) {
      ReaderStateService.instance = new ReaderStateService();
    }
    return ReaderStateService.instance;
  }

  /**
   * Get current state
   */
  getState(): ReaderState {
    return this.state;
  }

  /**
   * Update state properties
   */
  updateState(updates: Partial<ReaderState>): void {
    this.state = { ...this.state, ...updates };
  }

  /**
   * Get specific state property
   */
  get<K extends keyof ReaderState>(key: K): ReaderState[K] {
    return this.state[key];
  }

  /**
   * Set specific state property
   */
  set<K extends keyof ReaderState>(key: K, value: ReaderState[K]): void {
    this.state[key] = value;
  }

  /**
   * Initialize bionic enabled state from storage
   */
  async initializeBionicState(): Promise<void> {
    // Always start with bionic reading disabled
    this.state.isBionicEnabled = false;
    await StorageService.setBionicEnabled(false);
  }

  /**
   * Initialize auto highlight state from storage
   */
  async initializeAutoHighlightState(): Promise<void> {
    // Always start with auto highlight disabled
    this.state.isAutoHighlightEnabled = false;
    await StorageService.setAutoHighlightEnabled(false);
  }

  /**
   * Initialize jargon translator state from storage
   */
  async initializeJargonTranslatorState(): Promise<void> {
    // Always start with jargon translator disabled
    this.state.isJargonTranslatorEnabled = false;
    await StorageService.setJargonTranslatorEnabled(false);
  }

  /**
   * Initialize translator level from storage
   */
  async initializeTranslatorLevel(): Promise<void> {
    this.state.translatorLevel = await StorageService.getTranslatorLevel() as TranslatorLevel;
  }

  /**
   * Toggle reader open/closed
   */
  toggleReader(): void {
    this.state.isOpen = !this.state.isOpen;
  }

  /**
   * Toggle stats popup
   */
  toggleStats(): void {
    this.state.isStatsOpen = !this.state.isStatsOpen;
  }

  /**
   * Update historical time and save to storage
   */
  updateHistoricalTime(additionalTime: number): void {
    this.state.historicalTime += additionalTime;
    StorageService.setHistoricalTime(this.state.historicalTime);
  }

  /**
   * Add article to history
   */
  addArticleToHistory(url: string, title: string): void {
    StorageService.addArticleToHistory(url, title);
    this.state.historicalArticles = StorageService.getHistoricalArticles();
  }
} 