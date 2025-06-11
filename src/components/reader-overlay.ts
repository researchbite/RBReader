/**
 * Reader Overlay Component
 * Handles the creation and management of the reader overlay
 */

import { ReaderStateService } from '../services/reader-state.service';
import { StorageService } from '../services/storage.service';
import { BionicReadingService } from '../services/bionic-reading.service';
import { AIHighlightingService } from '../services/ai-highlighting.service';
import { JargonTranslationService } from '../services/jargon-translation.service';
import { TranslatorLevel } from '../config/ai-prompts';
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
          <button id="stats-button" class="icon-button stats-button" title="Menu & Stats">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M1 7H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M1 13H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="bionic-toggle-container jargon-toggle-container">
            <label class="bionic-toggle-label">Jargon Free</label>
            <label class="bionic-toggle">
              <input type="checkbox" id="jargon-toggle-switch">
              <span class="toggle-slider"></span>
            </label>
            <select id="translator-level-select" class="translator-select">
              <option value="highSchool">High School</option>
              <option value="college">College</option>
              <option value="academia">Academia</option>
            </select>
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

    // Initialize jargon translator state
    await this.stateService.initializeJargonTranslatorState();
    const jargonToggle = document.getElementById('jargon-toggle-switch') as HTMLInputElement;
    if (jargonToggle) {
      jargonToggle.checked = this.stateService.get('isJargonTranslatorEnabled');
    }

    await this.stateService.initializeTranslatorLevel();
    const levelSelect = document.getElementById('translator-level-select') as HTMLSelectElement;
    if (levelSelect) {
      levelSelect.value = this.stateService.get('translatorLevel');
      levelSelect.classList.toggle('show', jargonToggle?.checked);
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

    // Jargon translator toggle handler
    const jargonToggle = document.getElementById('jargon-toggle-switch') as HTMLInputElement;
    if (jargonToggle) {
      jargonToggle.addEventListener('change', async (event) => {
        const isEnabled = (event.target as HTMLInputElement).checked;
        this.stateService.set('isJargonTranslatorEnabled', isEnabled);
        await StorageService.setJargonTranslatorEnabled(isEnabled);

        const content = document.querySelector(SELECTORS.readerContent) as HTMLElement;
        const container = document.querySelector(SELECTORS.readerContainer) as HTMLElement | null;
        const levelSel = document.getElementById('translator-level-select') as HTMLSelectElement;
        if (levelSel) {
          levelSel.classList.toggle('show', isEnabled);
        }
        if (content && this.stateService.get('isOpen')) {
          if (isEnabled) {
            await JargonTranslationService.translateContent(content, this.stateService.get('translatorLevel') as TranslatorLevel);
            container?.classList.add('jargon-free');
          } else {
            JargonTranslationService.restoreOriginal(content);
            container?.classList.remove('jargon-free');
          }

          // Re-apply bionic reading if enabled
          if (this.stateService.get('isBionicEnabled')) {
            BionicReadingService.toggleBionicReading(content, true);
          }
        }
      });
    }

    const levelSelect = document.getElementById('translator-level-select') as HTMLSelectElement;
    if (levelSelect) {
      levelSelect.addEventListener('change', async (event) => {
        const level = (event.target as HTMLSelectElement).value as TranslatorLevel;
        this.stateService.set('translatorLevel', level);
        await StorageService.setTranslatorLevel(level);
        if (this.stateService.get('isOpen') && this.stateService.get('isJargonTranslatorEnabled')) {
          const content = document.querySelector(SELECTORS.readerContent) as HTMLElement;
          if (content) {
            JargonTranslationService.restoreOriginal(content);
            await JargonTranslationService.translateContent(content, level);
            if (this.stateService.get('isBionicEnabled')) {
              BionicReadingService.toggleBionicReading(content, true);
            }
          }
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