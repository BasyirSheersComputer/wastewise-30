// aiService.js
import { askGemini } from './gemini.js';
import { askChatGPT } from './chatgpt.js';

/**
 * Unified entrypoint for all LLM calls with fallback mechanism.
 * @param {string} prompt
 * @param {'gemini'|'chatgpt'|'auto'} provider - 'auto' tries Gemini first, then ChatGPT
 */
export async function askAI(prompt, provider = 'auto') {
  if (provider === 'auto') {
    return await askAIWithFallback(prompt);
  }
  
  switch (provider) {
    case 'gemini':
      return await askGemini(prompt);
    case 'chatgpt':
      return await askChatGPT(prompt);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Ask AI with automatic fallback from Gemini to ChatGPT
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function askAIWithFallback(prompt) {
  try {
    // Try Gemini first
    console.log('Trying Gemini...');
    const geminiResponse = await askGemini(prompt);
    
    // Check if Gemini returned an error message
    if (geminiResponse.includes('Error') || geminiResponse.includes('error')) {
      throw new Error('Gemini returned error response');
    }
    
    console.log('Gemini successful');
    return geminiResponse;
    
  } catch (error) {
    console.log('Gemini failed, falling back to ChatGPT:', error.message);
    
    try {
      // Fallback to ChatGPT
      const chatgptResponse = await askChatGPT(prompt);
      console.log('ChatGPT successful');
      return chatgptResponse;
      
    } catch (chatgptError) {
      console.error('Both Gemini and ChatGPT failed:', chatgptError);
      throw new Error(`AI service unavailable: ${chatgptError.message}`);
    }
  }
}

/**
 * Get AI response with metadata about which provider was used
 * @param {string} prompt
 * @param {'gemini'|'chatgpt'|'auto'} provider
 * @returns {Promise<{response: string, provider: string, timestamp: string}>}
 */
export async function askAIWithMetadata(prompt, provider = 'auto') {
  const startTime = Date.now();
  
  try {
    let response;
    let usedProvider;
    
    if (provider === 'auto') {
      try {
        response = await askGemini(prompt);
        usedProvider = 'gemini';
      } catch (error) {
        console.log('Gemini failed, trying ChatGPT:', error.message);
        response = await askChatGPT(prompt);
        usedProvider = 'chatgpt';
      }
    } else {
      response = await askAI(prompt, provider);
      usedProvider = provider;
    }
    
    return {
      response,
      provider: usedProvider,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      response: `Error: ${error.message}`,
      provider: 'none',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}
