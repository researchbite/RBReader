# AI Auto Highlight Feature

The extension automatically highlights key sentences when you enter the reader mode, helping you quickly identify the most important information in articles.

## How it works

1. **API Key Configuration**: Users must set their OpenAI API key in the extension options. The key is stored securely in Chrome's sync storage.

2. **Article Analysis**: When the reader opens, `content.ts` extracts the article text and sends it to OpenAI's GPT-4o-mini model for analysis.

3. **AI Processing**: The AI identifies 5-10 most important sentences containing:
   - Key insights and main arguments
   - Crucial information
   - Self-contained, meaningful statements

4. **DOM Highlighting**: The extension searches for each identified sentence in the article and wraps it with `<mark class="ai-highlight">` tags.

5. **Fallback Mode**: If AI highlighting fails (e.g., no API key, network issues), the extension falls back to a rule-based simulation that highlights sentences based on:
   - Position (first/second paragraphs, topic sentences)
   - Keywords (important, research, however, etc.)
   - Structural indicators

## Technical Details

- **Model**: OpenAI GPT-4o-mini (direct API calls)
- **Styling**: Yellow background (#ffeb3b) with subtle shadow
- **Timing**: 500ms delay after reader opens to ensure DOM is ready
- **Limit**: Article text capped at 8000 characters to prevent token overflow
- **Temperature**: 0.3 for consistent, focused results

## User Experience

- Highlights appear automatically when entering reader mode
- No user interaction required (except initial API key setup)
- Works alongside bionic reading feature without conflicts
- Graceful degradation with simulation fallback

