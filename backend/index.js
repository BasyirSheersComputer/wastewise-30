// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getAnalyticsData } from './analytics.js';
import { getRecommendations } from './recommendations.js';
dotenv.config();

const app = express();
app.use(cors());

app.get('/stream/analytics', async (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  const sendUpdate = async () => {
    try {
      const analytics = await getAnalyticsData();
      const recommendations = await getRecommendations(analytics);
      res.write(`data: ${JSON.stringify({ analytics, recommendations })}\n\n`);
    } catch (e) {
      res.write(`data: {\"error\":\"${e.message}\"}\n\n`);
    }
  };

  await sendUpdate();
  const interval = setInterval(sendUpdate, 30000);
  req.on('close', () => clearInterval(interval));
});

app.listen(4000, () => console.log('Backend running on port 4000'));
