# AI Auto Highlight Feature

The extension can automatically mark key lines when you enter the reader. It streams
the highlighted HTML using the Vercel AI SDK so updates appear progressively.

## How it works
1. `content.ts` collects the article text and sends it to the AI model.
2. The model responds in a stream containing the article HTML with `<mark class="ai-highlight">`
   tags around important sentences.
3. As chunks arrive they replace the reader content so highlights show up one by one.
4. The `ai-highlight` style in `reader.css` renders the marks with a yellow background.

This uses `experimental_streamText` from the Vercel SDK with the `openai/gpt-3.5-turbo` model.

