// chatgpt.js
import OpenAI from 'openai';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    logger.info('OpenAI client created successfully');
  } else {
    logger.warn('OPENAI_API_KEY not found, AI features will be disabled');
  }
} catch (error) {
  logger.error('Failed to create OpenAI client:', error.message);
}

/**
 * Ask OpenAI's best reasoning model for operation‑optimization advice.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export async function askChatGPT(prompt) {
  if (!openai) {
    throw new Error('OpenAI is not configured. Please check environment variables.');
  }
  
  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      // you can tune max_tokens, temperature, etc. here
    });
    return resp.choices[0].message.content;
  } catch (error) {
    logger.error('OpenAI API error:', error.message);
    throw new Error('Failed to get response from OpenAI');
  }
}
