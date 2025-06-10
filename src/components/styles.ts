/**
 * Styles Component
 * Contains all CSS styles for the Research Bites extension
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

  .reader-container {
    position: relative;
    max-width: 680px;
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
    z-index: 10001;
    width: calc(100% - 6rem);
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
    background: rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
    box-shadow: none;
  }
  .icon-button:active {
    transform: translateY(0);
    box-shadow: none;
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
  @media (max-width: 768px) {
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