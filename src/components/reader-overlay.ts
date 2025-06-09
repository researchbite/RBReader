/**
 * Reader Overlay Component
 * Handles the creation and management of the reader overlay
 */

import { ReaderStateService } from '../services/reader-state.service';
import { StorageService } from '../services/storage.service';
import { BionicReadingService } from '../services/bionic-reading.service';
import { AIHighlightingService } from '../services/ai-highlighting.service';
import { SELECTORS } from '../config/constants';
import { injectStyles } from './styles';
import { StatsPopup } from './stats-popup';

export class ReaderOverlay {
  private stateService: ReaderStateService;
  private statsPopup: StatsPopup;

  constructor() {
    this.stateService = ReaderStateService.getInstance();
    this.statsPopup = new StatsPopup();
  }

  /**
   * Create the reader overlay element
   */
  createReaderOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = SELECTORS.readerOverlay;
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
          <div class="bionic-toggle-container auto-highlight-toggle-container">
            <label class="bionic-toggle-label">Auto Highlight</label>
            <label class="bionic-toggle">
              <input type="checkbox" id="auto-highlight-toggle-switch">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <button class="icon-button close-button" title="Exit Reader Mode (Esc)">×</button>
        </div>
        <div class="reader-content"></div>
      </div>
    `;

    // Inject styles
    injectStyles();

    return overlay;
  }

  /**
   * Initialize the reader overlay
   */
  async initialize(): Promise<void> {
    const overlay = this.createReaderOverlay();
    document.body.appendChild(overlay);

    // Add stats popup
    const statsButton = overlay.querySelector(SELECTORS.statsButton) as HTMLElement;
    const statsPopupElement = this.statsPopup.createStatsPopup();
    statsButton.appendChild(statsPopupElement);

    // Initialize bionic reading state
    await this.stateService.initializeBionicState();
    const bionicToggle = document.getElementById('bionic-toggle-switch') as HTMLInputElement;
    if (bionicToggle) {
      bionicToggle.checked = this.stateService.get('isBionicEnabled');
    }

    // Initialize auto highlight state
    await this.stateService.initializeAutoHighlightState();
    const autoHighlightToggle = document.getElementById('auto-highlight-toggle-switch') as HTMLInputElement;
    if (autoHighlightToggle) {
      autoHighlightToggle.checked = this.stateService.get('isAutoHighlightEnabled');
    }

    // Setup event listeners
    this.setupEventListeners();
    this.statsPopup.setupStatsButton(statsButton);
    this.statsPopup.setupGlobalClickHandler();
  }

  /**
   * Setup event listeners for the overlay
   */
  private setupEventListeners(): void {
    // Bionic toggle handler
    const bionicToggle = document.getElementById('bionic-toggle-switch') as HTMLInputElement;
    if (bionicToggle) {
      bionicToggle.addEventListener('change', async (event) => {
        const isEnabled = (event.target as HTMLInputElement).checked;
        this.stateService.set('isBionicEnabled', isEnabled);
        await StorageService.setBionicEnabled(isEnabled);
        
        // Re-render content with or without bionic reading
        const content = document.querySelector(SELECTORS.readerContent) as HTMLElement;
        if (content && this.stateService.get('isOpen')) {
          BionicReadingService.toggleBionicReading(content, isEnabled);
        }
      });
    }

    // Auto highlight toggle handler
    const autoToggle = document.getElementById('auto-highlight-toggle-switch') as HTMLInputElement;
    if (autoToggle) {
      autoToggle.addEventListener('change', async (event) => {
        const isEnabled = (event.target as HTMLInputElement).checked;
        this.stateService.set('isAutoHighlightEnabled', isEnabled);
        await StorageService.setAutoHighlightEnabled(isEnabled);

        const content = document.querySelector(SELECTORS.readerContent) as HTMLElement;
        if (content && this.stateService.get('isOpen') && isEnabled) {
          AIHighlightingService.highlightImportantLines(content).catch(console.error);
        }
      });
    }

    // Close button handler
    const closeButton = document.querySelector(SELECTORS.closeButton);
    closeButton?.addEventListener('click', () => {
      this.hide();
    });

    // Escape key handler
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.stateService.get('isOpen')) {
        console.log('⌨️ Escape key pressed, closing reader');
        this.hide();
      }
    });
  }

  /**
   * Show the reader overlay
   */
  show(): void {
    const overlay = document.getElementById(SELECTORS.readerOverlay);
    if (overlay) {
      overlay.style.display = 'flex';
      this.stateService.set('isOpen', true);
    }
  }

  /**
   * Hide the reader overlay
   */
  hide(): void {
    const overlay = document.getElementById(SELECTORS.readerOverlay);
    if (overlay) {
      overlay.style.display = 'none';
      this.stateService.set('isOpen', false);
    }
  }

  /**
   * Clear the reader content
   */
  clearContent(): void {
    const content = document.querySelector(SELECTORS.readerContent);
    if (content) {
      content.innerHTML = '';
    }
  }

  /**
   * Get the reader content element
   */
  getContentElement(): HTMLElement | null {
    return document.querySelector(SELECTORS.readerContent);
  }
} 