// run-gemini-test.js
import dotenv from 'dotenv';
dotenv.config();

import { askGemini } from './gemini.js';

async function runTest() {
  const prompt = `
    You are a helpful assistant. 
    Suggest three actionable recommendations for reducing food waste in a mid‑size café chain.
  `.trim();

  console.log('=== GEMINI REQUEST ===');
  console.log(prompt);
  console.log('──────────────────────');

  try {
    const response = await askGemini(prompt);
    console.log('=== GEMINI RESPONSE ===');
    console.log(response);
  } catch (err) {
    console.error('=== UNCAUGHT ERROR ===');
    console.error(err);
  }
}

runTest();
