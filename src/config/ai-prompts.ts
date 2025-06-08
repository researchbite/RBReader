/**
 * AI Prompts Configuration
 * Contains all prompts used for AI-powered article highlighting
 */

export const AI_PROMPTS = {
  system: `You are an expert reader who identifies the most important and insightful sentences in articles. Your task is to:
1. Carefully read and understand the entire article
2. Identify the 5-10 most important sentences that contain key insights, main arguments, or crucial information
3. Focus on sentences that would help a reader quickly understand the core message
4. Prefer sentences that are self-contained and meaningful on their own`,

  user: (articleText: string) => `Please analyze this article and return ONLY the most important sentences, exactly as they appear in the text. Return one sentence per line, with no additional formatting or explanation.

Article:
${articleText.substring(0, 8000)} // Limit to prevent token overflow

Important sentences (one per line):`
};

export const AI_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 1000,
  minSentenceLength: 20
}; 