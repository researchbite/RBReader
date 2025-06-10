/**
 * Jargon Translation Service
 * Rewrites paragraphs in plain language using OpenAI
 */

import { StorageService } from './storage.service';

export class JargonTranslationService {

  /**
   * Translate all paragraphs in the container using streaming
   */
  static async translateContent(container: HTMLElement): Promise<void> {
    const apiKey = await StorageService.getOpenAIApiKey();
    if (!apiKey) {
      console.warn('OpenAI API key not configured');
      return;
    }

    const paragraphs = Array.from(container.querySelectorAll('p')) as HTMLElement[];
    for (const p of paragraphs) {
      const original = p.textContent || '';
      if (!p.dataset.originalText) {
        p.dataset.originalText = original;
      }

      if (p.dataset.translatedText) {
        p.textContent = p.dataset.translatedText;
        continue;
      }

      p.textContent = '';
      try {
        const translated = await this.streamTranslation(p, original, apiKey);
        p.dataset.translatedText = translated;
      } catch (err) {
        console.error('Jargon translation failed:', err);
        p.textContent = original;
      }
    }
  }

  /**
   * Restore original paragraph text
   */
  static restoreOriginal(container: HTMLElement): void {
    const paragraphs = Array.from(container.querySelectorAll('p')) as HTMLElement[];
    for (const p of paragraphs) {
      const original = p.dataset.originalText;
      if (original !== undefined) {
        p.textContent = original;
      }
    }
  }

  private static async streamTranslation(element: HTMLElement, text: string, apiKey: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Rewrite the following academic text in plain language for a general audience.' },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalText = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const fragment = parsed.choices?.[0]?.delta?.content;
            if (fragment) {
              element.textContent += fragment;
              finalText += fragment;
            }
          } catch (err) {
            console.error('Failed to parse SSE chunk', err, line);
          }
        }
      }
    }
    return finalText;
  }
}
