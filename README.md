# Jargon Translator

Jargon Translator from [researchbites.com](https://researchbites.com) is a browser extension designed specifically for researchers to make dense academic writing more approachable. The core feature translates complex paragraphs into plain language with real-time streaming and instant toggling between original and simplified versions.

## Features

- **Jargon Translator** – the core feature that overlays a live plain-language stream on each paragraph and swaps in the final text. Supports High School, College and Academia levels and caches results for instant toggling between original and simplified versions.
- **Bionic Reading** – supporting feature that emphasises the first letters of words for easier scanning.
- **AI-Powered Highlighting** – supporting feature that uses OpenAI to identify and highlight the most important sentences in articles.
- **Reading Statistics** – tracks reading time and maintains a history of articles read.
- Extracts readable content using Mozilla's Readability library.
- Distraction-free overlay with customizable reading experience.
- Keyboard shortcuts (Esc to exit) and toolbar icon for quick access.
- Bionic Reading and Auto Highlight toggles are accessible from a compact settings menu.

## Repository Structure

```
src/
├── components/          # UI components
│   ├── reader-overlay.ts   # Main reader overlay component
│   ├── stats-popup.ts      # Reading statistics popup
│   └── styles.ts           # All CSS styles
├── config/              # Configuration files
│   ├── ai-prompts.ts       # AI system prompts and settings
│   └── constants.ts        # Application constants
├── services/            # Business logic services
│   ├── ai-highlighting.service.ts    # AI-powered text highlighting
│   ├── bionic-reading.service.ts     # Bionic reading transformation
│   ├── reader-state.service.ts       # Application state management
│   ├── storage.service.ts            # Chrome storage operations
│   └── timer.service.ts              # Reading time tracking
├── utils/               # Utility functions
│   └── dom-helpers.ts      # DOM manipulation utilities
├── content.ts           # Main content script entry point
├── background.ts        # Background script for extension
├── reader.css          # Reader overlay styles
└── icons/              # Extension icons
```

Additional files:
- `manifest.json` – Chrome extension manifest
- `webpack.config.js` – Build configuration
- `jargon-translator-extension/` – Pre-built version of the extension

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

3. Load the extension in Chrome:
   - Open Chrome Extensions page (`chrome://extensions/`)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Architecture

The extension follows a modular architecture with clear separation of concerns:

- **Services** handle business logic and data operations
- **Components** manage UI elements and user interactions
- **Config** centralizes configuration and constants
- **Utils** provide reusable helper functions

### Key Services

- **ReaderStateService**: Singleton service managing application state
- **AIHighlightingService**: Handles AI-powered sentence highlighting using OpenAI
- **BionicReadingService**: Transforms text for bionic reading
- **TimerService**: Tracks and displays reading time
- **StorageService**: Manages Chrome storage and localStorage operations
- **JargonTranslationService**: Streams plain-language translations of paragraphs

## How It Works

1. User clicks the extension icon or uses keyboard shortcut
2. Content script injects the reader overlay into the current page
3. Readability parses the page to extract the main article content
4. Jargon Translator can be enabled to stream plain-language translations of each paragraph
5. Optional bionic reading transformation and AI highlighting provide additional reading support
6. Reading timer starts tracking time spent on the article
7. User can view reading statistics and history through the stats popup

## Configuration

To enable AI highlighting:
1. Click on the extension icon in the toolbar
2. Go to extension options
3. Enter your OpenAI API key
4. The extension will use GPT-4 mini to identify important sentences

## Features in Detail

### Jargon Translator (Core Feature)
The primary feature designed for researchers working with dense academic content. Each paragraph receives a translucent overlay while tokens stream in from OpenAI. When the stream ends, the plain-language version replaces the original. Choose between **High School**, **College**, and **Academia** levels to control simplification. Translations are cached so later toggles are instant, and enabling the translator also applies a clean sans-serif font for better readability. Original text is preserved and can be restored instantly.

### Bionic Reading (Supporting Feature)
Emphasizes the beginning of words to help readers scan text more efficiently. Can be toggled on/off via the reader interface to complement the jargon translation experience.

### AI Highlighting (Supporting Feature)
Uses OpenAI's GPT-4 mini model to identify 5-10 most important sentences in an article. Falls back to keyword-based highlighting if API is unavailable. Works alongside jargon translation to help researchers focus on key points.

### Reading Statistics
- Tracks time spent reading current article
- Maintains total reading time across all articles
- Stores reading history with article titles and URLs
- Accessible via the stats button in the reader interface
