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
          <button id="stats-button" class="icon-button stats-button">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3C2 2.44772 2.44772 2 3 2H17C17.5523 2 18 2.44772 18 3V17C18 17.5523 17.5523 18 17 18H3C2.44772 18 2 17.5523 2 17V3Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 6H14M6 10H14M6 14H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="bionic-toggle-container jargon-toggle-container">
            <label class="bionic-toggle-label">Jargon Translator</label>
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
          <button id="settings-button" class="icon-button settings-button" title="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 10 5.09V5a2 2 0 1 1 4 0v.09c0 .68.39 1.3 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.41.41-.53 1-.33 1.54.21.54.74.9 1.33.9H21a2 2 0 1 1 0 4h-.09c-.59 0-1.12.36-1.33.9z" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
          <div class="settings-menu">
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
        if (content && this.stateService.get('isOpen')) {
          if (isEnabled) {
            await JargonTranslationService.translateContent(content, this.stateService.get('translatorLevel'));
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
        const level = (event.target as HTMLSelectElement).value;
        this.stateService.set('translatorLevel', level);
        await StorageService.setTranslatorLevel(level);
        if (this.stateService.get('isOpen') && this.stateService.get('isJargonTranslatorEnabled')) {
          const content = document.querySelector(SELECTORS.readerContent) as HTMLElement;
          if (content) {
            JargonTranslationService.restoreOriginal(content);
            await JargonTranslationService.translateContent(content, level as TranslatorLevel);
            if (this.stateService.get('isBionicEnabled')) {
              BionicReadingService.toggleBionicReading(content, true);
            }
          }
        }
      });
    }

    const settingsButton = document.getElementById('settings-button');
    const settingsMenu = document.querySelector('.settings-menu') as HTMLElement | null;
    if (settingsButton && settingsMenu) {
      settingsButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const open = settingsMenu.style.display === 'block';
        settingsMenu.style.display = open ? 'none' : 'block';
      });
      settingsMenu.addEventListener('click', (e) => e.stopPropagation());
      document.addEventListener('click', () => {
        if (settingsMenu.style.display === 'block') {
          settingsMenu.style.display = 'none';
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