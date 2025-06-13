/**
 * Jargon Translation Service
 * Rewrites paragraphs in plain language using OpenAI
 */

import { StorageService } from './storage.service';
import { JARGON_TRANSLATION_PROMPTS, JARGON_TRANSLATION_CONFIG, TranslatorLevel } from '../config/ai-prompts';

export class JargonTranslationService {

  static async translateContent(container: HTMLElement, level: TranslatorLevel): Promise<void> {
    const apiKey = await StorageService.getOpenAIApiKey();
    if (!apiKey) {
      console.warn('OpenAI API key not configured');
      return;
    }

    const paragraphs = Array.from(container.querySelectorAll('p')) as HTMLElement[];
    for (const p of paragraphs) {
      await this.translateParagraph(p, apiKey, level);
    }
  }

  static restoreOriginal(container: HTMLElement): void {
    const paragraphs = Array.from(container.querySelectorAll('p')) as HTMLElement[];
    for (const p of paragraphs) {
      const original = p.dataset.originalText;
      if (original !== undefined) {
        p.textContent = original;
      }
      p.querySelector('.jf-overlay')?.remove();
      p.classList.remove('jf-flash');
      delete p.dataset.translatedText;
    }
  }

  private static ensureOverlay(p: HTMLElement): HTMLSpanElement {
    let o = p.querySelector('.jf-overlay') as HTMLSpanElement | null;
    if (!o) {
      o = document.createElement('span');
      o.className = 'jf-overlay';
      if (getComputedStyle(p).position === 'static') {
        p.style.position = 'relative';
      }
      const computed = getComputedStyle(p);
      o.style.fontSize = computed.fontSize;
      o.style.lineHeight = computed.lineHeight;
      o.style.fontFamily = computed.fontFamily;

      p.appendChild(o);
    }
    return o;
  }

  private static wait(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }

  private static async translateParagraph(p: HTMLElement, apiKey: string, level: TranslatorLevel): Promise<void> {
    const original = p.textContent || '';
    if (!p.dataset.originalText) {
      p.dataset.originalText = original;
    }

    if (p.dataset.translatedText) {
      p.textContent = p.dataset.translatedText;
      p.classList.add('jf-flash');
      return;
    }

    const overlay = this.ensureOverlay(p);
    overlay.textContent = '';

    try {
      const translated = await this.streamTranslation(overlay, original, apiKey, level);
      p.textContent = translated;
      p.dataset.translatedText = translated;

      overlay.classList.add('done');
      await this.wait(300);
      overlay.remove();
      p.classList.add('jf-flash');
    } catch (err) {
      console.error('Jargon translation failed:', err);
      overlay.remove();
      p.textContent = original;
    }
  }

  private static async streamTranslation(element: HTMLElement, text: string, apiKey: string, level: TranslatorLevel): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: JARGON_TRANSLATION_CONFIG.model,
        messages: [
          { role: 'system', content: JARGON_TRANSLATION_PROMPTS[level].system },
          { role: 'user', content: JARGON_TRANSLATION_PROMPTS[level].user(text) }
        ],
        temperature: JARGON_TRANSLATION_CONFIG.temperature,
        max_tokens: JARGON_TRANSLATION_CONFIG.maxTokens,
        stream: JARGON_TRANSLATION_CONFIG.stream
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalText = '';
    let flushHandle = 0;
    let pending = '';

    const flush = () => {
      element.textContent += pending;
      pending = '';
      flushHandle = 0;
      element.style.opacity = '1';
    };

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
              pending += fragment;
              finalText += fragment;
              if (!flushHandle) {
                flushHandle = requestAnimationFrame(flush);
              }
            }
          } catch (err) {
            console.error('Failed to parse SSE chunk', err, line);
          }
        }
      }
    }

    if (pending) flush();
    return finalText;
  }
}
