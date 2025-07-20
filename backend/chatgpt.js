// chatgpt.js
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in .env');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Ask OpenAI’s best reasoning model for operation‑optimization advice.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export async function askChatGPT(prompt) {
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    // you can tune max_tokens, temperature, etc. here
  });
  return resp.choices[0].message.content;
}
