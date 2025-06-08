# Research Bites

Research Bites is a browser extension that presents articles in a clean overlay and highlights the beginning of each word to aid focus. It is built with TypeScript and Mozilla's Readability library.

## Features

- **Bionic Reading** – emphasises the first letters of words for easier scanning.
- Extracts readable content using Readability.
- **Auto Highlighter** *(planned)* – uses AI to mark the most important lines on a page.
- **Jargon Free Translator** *(planned)* – simplifies text by removing complex jargon.
- Distraction‑free overlay with a reading timer and stats.
- Keyboard shortcut and toolbar icon for quick access.

## Repository structure

- `src/` – TypeScript sources for the extension
  - `content.ts` – implements the overlay and highlighting logic
  - `background.ts` – injects the content script and handles shortcuts
  - `reader.css` – styles for the reader overlay
  - `icons/` – extension icons
- `manifest.json` – Chrome extension manifest
- `webpack.config.js` – build configuration
- `research-bites-extension/` – prebuilt version of the extension

## Development

1. Install dependencies with `npm install`.
2. Build the extension using `npm run build`.
3. Load the `dist` folder as an unpacked extension in Chrome.

## How it works

1. Clicking the icon or using the shortcut injects the reader overlay.
2. Readability parses the current page to extract the main article.
3. The script highlights the first portion of each word.
4. The overlay displays the result with options to close or view stats.
