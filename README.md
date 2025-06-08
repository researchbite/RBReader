# Research Bites

Research Bites is a browser extension that presents articles in a clean overlay and highlights the beginning of each word to aid focus. It is built with TypeScript and Mozilla's Readability library.

## Features

- **Bionic Reading** – emphasises the first letters of words for easier scanning.
- **AI-Powered Highlighting** – uses OpenAI to identify and highlight the most important sentences in articles.
- **Reading Statistics** – tracks reading time and maintains a history of articles read.
- Extracts readable content using Mozilla's Readability library.
- Distraction-free overlay with customizable reading experience.
- Keyboard shortcuts (Esc to exit) and toolbar icon for quick access.

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
- `research-bites-extension/` – Pre-built version of the extension

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

## How It Works

1. User clicks the extension icon or uses keyboard shortcut
2. Content script injects the reader overlay into the current page
3. Readability parses the page to extract the main article content
4. Optional bionic reading transformation is applied to the text
5. AI analyzes the article and highlights important sentences (requires OpenAI API key)
6. Reading timer starts tracking time spent on the article
7. User can view reading statistics and history through the stats popup

## Configuration

To enable AI highlighting:
1. Click on the extension icon in the toolbar
2. Go to extension options
3. Enter your OpenAI API key
4. The extension will use GPT-4 mini to identify important sentences

## Features in Detail

### Bionic Reading
Emphasizes the beginning of words to help readers scan text more efficiently. Can be toggled on/off via the reader interface.

### AI Highlighting
Uses OpenAI's GPT-4 mini model to identify 5-10 most important sentences in an article. Falls back to keyword-based highlighting if API is unavailable.

### Reading Statistics
- Tracks time spent reading current article
- Maintains total reading time across all articles
- Stores reading history with article titles and URLs
- Accessible via the stats button in the reader interface
