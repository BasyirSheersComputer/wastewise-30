// gemini.js
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,   // or omit this entirely if you only rely on the env var
});

async function askGemini(prompt, retries = 3) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in .env');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Gemini request (attempt ${attempt}):`, prompt);
      const start = Date.now();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        // disable “thinking” to reduce latency and variance :contentReference[oaicite:0]{index=0}
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      console.log(`Gemini response time: ${Date.now() - start}ms`);
      return response.text;
    } catch (error) {
      console.error(`Gemini API error on attempt ${attempt}:`, error);
      if (attempt === retries) {
        return 'Error getting recommendations from AI service';
      }
      // wait longer on each retry
      await new Promise(res => setTimeout(res, 500 * attempt));
    }
  }
}

export { askGemini };
