/**
 * Stats Popup Component
 * Handles the creation and management of the reading statistics popup
 */

import { ReaderStateService } from '../services/reader-state.service';
import { SELECTORS } from '../config/constants';

export class StatsPopup {
  private stateService: ReaderStateService;

  constructor() {
    this.stateService = ReaderStateService.getInstance();
  }

  /**
   * Create the stats popup element
   */
  createStatsPopup(): HTMLElement {
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

    this.attachEventListeners(popup);
    return popup;
  }

  /**
   * Attach event listeners to the popup
   */
  private attachEventListeners(popup: HTMLElement): void {
    const toggleButton = popup.querySelector(SELECTORS.toggleHistory);
    const historyList = popup.querySelector(SELECTORS.historyList);
    const historyUrls = popup.querySelector(SELECTORS.historyUrls);

    if (toggleButton && historyList && historyUrls) {
      toggleButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const isVisible = (historyList as HTMLElement).style.display === 'block';
        (historyList as HTMLElement).style.display = isVisible ? 'none' : 'block';
        (toggleButton as HTMLElement).textContent = isVisible ? 'Show' : 'Hide';
        
        if (!isVisible) {
          this.renderHistoryList(historyUrls as HTMLElement);
        }
      });
    }
  }

  /**
   * Render the history list
   */
  private renderHistoryList(container: HTMLElement): void {
    const state = this.stateService.getState();
    // Sort articles by timestamp, most recent first
    const sortedArticles = [...state.historicalArticles].sort((a, b) => b.timestamp - a.timestamp);
    
    container.innerHTML = sortedArticles
      .map(article => `
        <a href="${article.url}" target="_blank" class="history-url">
          <span class="history-title">${article.title}</span>
          <span class="history-domain">${new URL(article.url).hostname}</span>
        </a>
      `)
      .join('');
  }

  /**
   * Setup stats button click handler
   */
  setupStatsButton(statsButton: HTMLElement): void {
    statsButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const popup = statsButton.querySelector(SELECTORS.statsPopup) as HTMLElement;
      if (popup) {
        this.stateService.toggleStats();
        const isOpen = this.stateService.get('isStatsOpen');
        popup.style.display = isOpen ? 'block' : 'none';
      }
    });
  }

  /**
   * Setup global click handler to close stats popup
   */
  setupGlobalClickHandler(): void {
    document.addEventListener('click', () => {
      if (this.stateService.get('isStatsOpen')) {
        const popup = document.querySelector(SELECTORS.statsPopup) as HTMLElement;
        if (popup) {
          popup.style.display = 'none';
          this.stateService.set('isStatsOpen', false);
        }
      }
    });
  }
} 