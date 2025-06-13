# Jargon Translator Feature

The Jargon Translator rewrites complex paragraphs in plain language and remembers the results so you can toggle between the original and jargon‑free versions instantly.

## Overview

- **Paragraph streaming**: Each paragraph is overlaid with a translucent span while tokens stream in from OpenAI. The original text stays visible until the stream finishes, then it is seamlessly replaced.
- **Caching**: Translated paragraphs are stored in `data-translated-text` attributes so switching the toggle doesn't retranslate.
- **Restoration**: Original text is kept in `data-original-text` attributes, allowing the translator to revert to the exact source wording.
- **Design**: When enabled the reader container receives a `.jargon-free` class that applies a clean sans-serif font and relaxed line height.
- **Levels**: Select *High School*, *College*, or *Academia* to control how much the text is simplified.

## Implementation Details

1. **Toggle and State**
   - A new toggle labelled *Jargon Translator* is inserted in `reader-overlay.ts`.
   - The toggle state persists using `ReaderStateService` and `StorageService` with key `jargonTranslatorEnabled`.

2. **Translation Logic** – `JargonTranslationService`
   - Iterates through every `<p>` inside the reader content.
   - For each paragraph:
     1. Store its original text in `data-original-text` if not already saved.
     2. If a translated version exists in `data-translated-text`, apply it immediately.
      3. Otherwise call OpenAI's chat API with `stream: true`. Incoming tokens append to an absolutely positioned overlay above the paragraph.
      4. Once streaming completes, replace the paragraph text with the overlay content and cache it in `data-translated-text`.

3. **Restoring Original Text**
   - When the toggle is disabled, `restoreOriginal()` replaces paragraph text with the `data-original-text` values.

4. **Styling**
   - The `.jargon-free` class in `reader.css` switches the font to **Inter**/Segoe UI, increases line height and darkens the text color for a cleaner feel.

## Usage

1. Open any article and launch Jargon Translator reader mode.
2. Enable the *Jargon Translator* toggle in the control bar.
3. Watch the overlayed translation stream in and replace the paragraph when complete. Toggle off to return to the original instantly.

This feature helps make dense academic writing more approachable while respecting the original content.
