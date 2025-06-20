/**
 * Styles Component
 * Contains all CSS styles for the Jargon Translator extension
 */

export const READER_STYLES = `
  #bionic-reader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #eae8e2;
    z-index: 999999;
    display: none;
    justify-content: center;
    align-items: flex-start;
    overflow-y: auto;
    padding: 2rem 0;
  }

  /*
   * Responsive Reader Container Design
   * 
   * This design adapts to all screen sizes using a combination of viewport width (vw) 
   * and maximum pixel constraints to ensure optimal reading experience:
   * 
   * - 4K+ displays (3840px+): 70vw max, up to 1400px - Prevents overly wide text
   * - 2K displays (2560-3839px): 75vw max, up to 1300px - Good for large monitors
   * - Large displays/Mac 15" (1920-2559px): 80vw max, up to 1200px - Balanced width
   * - Mac 13"/Standard desktop (1440-1919px): 85vw max, up to 1000px - Optimal for 13" Mac
   * - Smaller desktop (1200-1439px): 88vw max, up to 900px - Efficient space usage
   * - Laptop screens (1024-1199px): 90vw max, up to 800px - Compact but readable
   * - Tablet landscape (768-1023px): 92vw max, up to 720px - Touch-friendly
   * - Mobile/tablet portrait (<768px): 100vw - Full width for small screens
   * 
   * The min() function ensures the container never exceeds either the viewport 
   * percentage or the pixel maximum, whichever is smaller.
   */
  .reader-container {
    position: relative;
    max-width: min(90vw, 1200px);
    width: 100%;
    background: #f9f8f1;
    padding: 2rem 3rem;
    margin: 0 auto;
    line-height: 1.6;
    font-family: ui-serif;
    color: #2c2c2c;
    min-height: calc(100vh - 4rem);
    display: flex;
    flex-direction: column;
    border-radius: 3px;
    box-shadow: 0px 6px 12px 3px var(--paper-shadow-color);
  }

  .reader-container.jargon-free {
    font-family: "Inter", "Segoe UI", sans-serif;
    line-height: 1.8;
    color: #1a1a1a;
  }

  .jf-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    font-family: sans-serif;
    white-space: pre-wrap;
    opacity: 0;
    backdrop-filter: blur(6px);
    transition: opacity .15s linear, backdrop-filter .2s;
    border-radius: 0.25rem;
  }
  .jf-overlay.done {
    opacity: 1;
    backdrop-filter: none;
  }

  @keyframes jfFlash {
    0% { box-shadow: 0 0 0 0 #00b17600; }
    50% { box-shadow: 0 0 0 6px #00b17640; }
    100% { box-shadow: 0 0 0 0 #00b17600; }
  }
  .jf-flash {
    animation: jfFlash .8s ease-out;
  }

  :root {
    --paper-shadow-color: rgba(0, 0, 0, 0.1);
  }
  .reader-controls {
    position: absolute;
    top: 2rem;
    left: 3rem;
    right: 3rem;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: nowrap;
    gap: 16px;
    z-index: 10001;
    width: calc(100% - 6rem);
    line-height: 1;
  }
  .bionic-toggle-container {
    display: flex;
    align-items: center;
    gap: 12px;
    background: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }
  .bionic-toggle-label {
    font-size: 14px;
    font-weight: 500;
    color: #2c2c2c;
    user-select: none;
    text-transform: none;
  }
  .bionic-toggle {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 26px;
  }
  .bionic-toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #e5e5e7;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 26px;
  }
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
  .bionic-toggle input:checked + .toggle-slider {
    background-color: #8b7355;
  }
  .bionic-toggle input:checked + .toggle-slider:before {
    transform: translateX(18px);
  }
  .bionic-toggle input:focus + .toggle-slider {
    box-shadow: 0 0 0 3px rgba(139, 115, 85, 0.3);
  }
  .translator-select {
    display: none;
    padding: 4px 32px 4px 10px;
    border: 1px solid #d0d0d0;
    border-radius: 8px;
    font-size: 14px;
    height: 28px;
    line-height: 19px;
    background: #ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%232c2c2c' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center;
    background-size: 12px 8px;
    color: #2c2c2c;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .translator-select.show {
    display: inline-block;
  }
  .translator-select:focus {
    outline: none;
    border-color: #8b7355;
    box-shadow: 0 0 0 2px rgba(139, 115, 85, 0.25);
  }
  .settings-menu {
    position: absolute;
    right: 3rem;
    top: calc(100% + 8px);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    display: none;
    flex-direction: column;
    gap: 12px;
  }
  .icon-button {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #2c2c2c;
    font-size: 20px;
    transition: all 0.2s ease;
    box-shadow: none;
    position: relative;
  }
  .stats-button {
    position: relative;
  }
  .close-button {
    position: relative !important;
    margin-left: auto;
    align-self: center;
    top: auto !important;
    right: auto !important;
    width: 32px !important;
    height: 32px !important;
    padding: 0 !important;
    background: none !important;
    border-radius: 8px !important;
  }
  .icon-button:hover {
    background: none;
    transform: translateY(-2px);
    box-shadow: none;
  }
  .icon-button:active {
    transform: translateY(0);
    box-shadow: none;
  }
  /* Fine-tune stats button hover separately if needed */
  .stats-button:hover {
    background: none;
    transform: scale(1.05);
  }
  /* Ensure bionic strong tags don't interfere with highlights */
  .reader-content strong {
    font-weight: 600;
    color: inherit;
    background: none;
  }
  .reader-content mark.ai-highlight strong {
    background: none;
    color: inherit;
  }
  /* 4K and Ultra-wide displays (3840px+) */
  @media (min-width: 3840px) {
    .reader-container {
      max-width: min(70vw, 1400px);
      padding: 3rem 4rem;
    }
  }

  /* 2K displays and large monitors (2560px - 3839px) */
  @media (min-width: 2560px) and (max-width: 3839px) {
    .reader-container {
      max-width: min(75vw, 1300px);
      padding: 2.5rem 3.5rem;
    }
  }

  /* Large displays and Mac 15-inch+ (1920px - 2559px) */
  @media (min-width: 1920px) and (max-width: 2559px) {
    .reader-container {
      max-width: min(80vw, 1200px);
    }
  }

  /* Standard desktop and Mac 13-inch (1440px - 1919px) */
  @media (min-width: 1440px) and (max-width: 1919px) {
    .reader-container {
      max-width: min(85vw, 1000px);
    }
  }

  /* Smaller desktop (1200px - 1439px) */
  @media (min-width: 1200px) and (max-width: 1439px) {
    .reader-container {
      max-width: min(88vw, 900px);
    }
  }

  /* Laptop screens (1024px - 1199px) */
  @media (min-width: 1024px) and (max-width: 1199px) {
    .reader-container {
      max-width: min(90vw, 800px);
      padding: 2rem 2.5rem;
    }
  }

  /* Tablet landscape (768px - 1023px) */
  @media (min-width: 768px) and (max-width: 1023px) {
    .reader-container {
      max-width: min(92vw, 720px);
      padding: 1.5rem 2rem;
    }
  }

  /* Mobile and tablet portrait (max-width: 767px) */
  @media (max-width: 767px) {
    #bionic-reader-overlay {
      padding: 0;
    }

    .reader-container {
      min-height: 100vh;
      border-radius: 0;
      box-shadow: none;
      padding: 1.5rem;
      max-width: 100%;
    }
    .reader-controls {
      top: 1.5rem;
      left: 1.5rem;
      right: 1.5rem;
      width: calc(100% - 3rem);
    }
    .bionic-toggle-container {
      padding: 6px 12px;
    }
    .bionic-toggle-label {
      font-size: 13px;
    }
  }
`;

export const STATS_POPUP_STYLES = `
  .stats-popup {
    position: absolute;
    left: 0;
    top: calc(100% + 8px);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    min-width: 220px;
    transform-origin: top left;
    animation: popupFadeIn 0.2s ease;
    display: none;
  }
  @keyframes popupFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  .stats-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
  }
  .stat-label {
    color: #6c6c70;
    font-size: 13px;
  }
  .stat-value {
    color: #1c1c1e;
    font-size: 14px;
    font-weight: 500;
  }
  .history-item {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: 4px;
    padding-top: 8px;
  }
  .toggle-history {
    background: none;
    border: 1px solid #6c6c70;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 12px;
    color: #6c6c70;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .toggle-history:hover {
    background: #6c6c70;
    color: white;
  }
  .history-list {
    margin-top: 8px;
    max-height: 200px;
    overflow-y: auto;
  }
  .history-urls {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .history-url {
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: #1c1c1e;
    text-decoration: none;
    font-size: 13px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 6px;
    transition: all 0.2s ease;
  }
  .history-url:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  .history-title {
    font-weight: 500;
    color: #1c1c1e;
    line-height: 1.3;
  }
  .history-domain {
    color: #6c6c70;
    font-size: 11px;
  }
`;

export function injectStyles(): void {
  const style = document.createElement('style');
  style.textContent = READER_STYLES + STATS_POPUP_STYLES;
  document.head.appendChild(style);
} 