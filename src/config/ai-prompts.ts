/**
 * AI Prompts Configuration
 * Contains all prompts used for AI-powered article highlighting
 */

export const AI_PROMPTS = {
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

export const AI_CONFIG = {
  model: 'gpt-4.1',
  temperature: 0.7,
  maxTokens: 8096,
  minSentenceLength: 20,
  stream: true // Enable streaming
};

export const HIGHLIGHT_ANIMATION = {
  duration: 600, // milliseconds
  stagger: 150, // delay between highlights
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
}; 