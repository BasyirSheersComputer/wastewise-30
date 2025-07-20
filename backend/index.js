// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { askAI } from './ai-service.js';
import { getAnalyticsData } from './analytics.js';
import { prompts } from './recommendations.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/stream/analytics', (req, res) => {
  const section = req.query.section || 'dashboard';
  const provider = req.query.provider === 'chatgpt' ? 'chatgpt' : 'gemini';

  // Set up Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  // Send a comment to establish the stream
  res.write(': connected\n\n');

  const sendData = async () => {
    try {
      const analytics = await getAnalyticsData();
      const prompt = prompts[section](analytics);
      const recommendations = await askAI(prompt, provider);

      // Send combined analytics and recommendations
      res.write(`data: ${JSON.stringify({ analytics, recommendations })}\n\n`);
    } catch (error) {
      console.error('LLM error:', error);
      const isQuota = error.message.toLowerCase().includes('quota');
      const eventType = isQuota ? 'quota_exceeded' : 'llm_error';

      res.write(`event: error\ndata: ${JSON.stringify({
        type: eventType,
        message: error.message,
      })}\n\n`);

      // If desired, stop the stream on fatal errors:
      // clearInterval(interval);
      // res.end();
    }
  };

  // Send immediately, then every 2 seconds
  sendData();
  const interval = setInterval(sendData, 2000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
<<<<<<< HEAD

// --- Start both HTTP and WebSocket server ---
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Backend (HTTP+WS) running on port ${PORT}`))
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is busy, trying port ${PORT + 1}...`);
      server.listen(PORT + 1, () => console.log(`Backend (HTTP+WS) running on port ${PORT + 1}`));
    } else {
      console.error('Server error:', err);
    }
  });
=======
>>>>>>> f7924341dde2cf06c089e4b07f8654bf575ec654
