/**
 * AI Prompts Configuration
 * Contains all prompts used for AI-powered article highlighting and jargon translation
 */

export const AUTO_HIGHLIGHT_PROMPTS = {
  system: `You are an expert reader who identifies the most important and insightful sentences in articles. Your task is to:
1. Carefully read and understand the entire article
2. Identify the 5-10 most important sentences that contain key insights, main arguments, or crucial information
3. Focus on sentences that would help a reader quickly understand the core message
4. Prefer sentences that are self-contained and meaningful on their own
5. Output each important sentence wrapped in <hl prefix="{first10}" suffix="{last10}"></hl> tags, where {first10} is the 10 characters that immediately precede the sentence in the article and {last10} is the 10 characters that immediately follow it. Escape any quotes in these attributes.
6. Do not include any newlines within the <hl> tags or attribute values
7. Output the highlights as you identify them for streaming`,

  user: (articleText: string) => `Please analyze this article and identify the most important sentences. Wrap each important sentence in <hl prefix="{first10}" suffix="{last10}"></hl> tags (see system prompt for details). Do not add newlines inside the tags or attribute values.

Article:
${articleText}

Output format: <hl prefix="..." suffix="...">Important sentence here</hl><hl prefix="..." suffix="...">Another important sentence</hl>`
};

export type TranslatorLevel = 'highSchool' | 'college' | 'academia';

export const JARGON_TRANSLATION_PROMPTS: Record<TranslatorLevel, { system: string; user: (text: string) => string }> = {
  highSchool: {
    system: `Rewrite the following text in simple language for a high school student (age 14-18). Remove complex jargon and keep sentences short and clear without extra commentary.`,
    user: (text: string) => `${text}`
  },
  college: {
    system: `Rewrite the following text for readers with some college experience. Use accessible language while keeping key details intact. Do not add any commentary.`,
    user: (text: string) => `${text}`
  },
  academia: {
    system: `Clarify the following text for an academic audience. Reduce unnecessary jargon but preserve technical nuance and formal tone. Return only the rewritten text.`,
    user: (text: string) => `${text}`
  }
};

export const AUTO_HIGHLIGHT_CONFIG = {
  model: 'gpt-4.1',
  temperature: 0.7,
  maxTokens: 8096,
  minSentenceLength: 20,
  stream: true // Enable streaming
};

export const JARGON_TRANSLATION_CONFIG = {
  model: 'gpt-4.1',
  temperature: 0.3,
  maxTokens: 4096,
  stream: true // Enable streaming
};

export const HIGHLIGHT_ANIMATION = {
  duration: 600, // milliseconds
  stagger: 150, // delay between highlights
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
}; 