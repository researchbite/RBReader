/**
 * Timer Service
 * Handles reading time tracking functionality
 */

import { ReaderStateService } from './reader-state.service';
import { TIMING, SELECTORS } from '../config/constants';

export class TimerService {
  private stateService: ReaderStateService;

  constructor() {
    this.stateService = ReaderStateService.getInstance();
  }

  /**
   * Format seconds into MM:SS format
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Update stats display
   */
  updateStats(): void {
    const currentTimeElement = document.querySelector(SELECTORS.currentTime);
    const totalTimeElement = document.querySelector(SELECTORS.totalTime);
    const articlesReadElement = document.querySelector(SELECTORS.articlesRead);
    
    const state = this.stateService.getState();
    
    if (state.startTime) {
      const currentElapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
      
      // Update current article time
      if (currentTimeElement) {
        currentTimeElement.textContent = this.formatTime(currentElapsedSeconds);
      }
      
      // Update total time (historical + current)
      if (totalTimeElement) {
        const totalSeconds = state.historicalTime + currentElapsedSeconds;
        totalTimeElement.textContent = this.formatTime(totalSeconds);
      }
    } else {
      // When not reading, just show historical time
      if (totalTimeElement) {
        totalTimeElement.textContent = this.formatTime(state.historicalTime);
      }
      if (currentTimeElement) {
        currentTimeElement.textContent = '00:00';
      }
    }
    
    if (articlesReadElement) {
      articlesReadElement.textContent = state.historicalArticles.length.toString();
    }
  }

  /**
   * Start the reading timer
   */
  startTimer(): void {
    const state = this.stateService.getState();
    if (state.timerInterval) return;
    
    this.stateService.updateState({
      startTime: Date.now(),
      lastPauseTime: null,
      currentArticleTime: 0
    });
    
    const interval = window.setInterval(() => {
      if (!this.stateService.get('startTime')) return;
      this.updateStats();
    }, TIMING.statsUpdateInterval);
    
    this.stateService.set('timerInterval', interval);
  }

  /**
   * Pause the reading timer
   */
  pauseTimer(): void {
    const state = this.stateService.getState();
    
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      this.stateService.set('timerInterval', null);
      
      // Calculate and save the total time spent reading
      if (state.startTime) {
        const currentElapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
        this.stateService.updateHistoricalTime(currentElapsedSeconds);
        this.stateService.set('currentArticleTime', 0);
        this.updateStats();
      }
    }
  }

  /**
   * Reset the reading timer
   */
  resetTimer(): void {
    const state = this.stateService.getState();
    
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }
    
    this.stateService.updateState({
      timerInterval: null,
      startTime: null,
      lastPauseTime: null,
      currentArticleTime: 0
    });
    
    this.updateStats();
  }
} 