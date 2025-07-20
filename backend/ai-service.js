// aiService.js
import { askGemini } from './gemini.js';
import { askChatGPT } from './chatgpt.js';

/**
 * Unified entrypoint for all LLM calls.
 * @param {string} prompt
 * @param {'gemini'|'chatgpt'} provider
 */
export async function askAI(prompt, provider = 'gemini') {
  switch (provider) {
    case 'gemini':
      return askGemini(prompt);
    case 'chatgpt':
      return askChatGPT(prompt);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
