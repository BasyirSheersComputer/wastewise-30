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
  console.log('Client connected to analytics stream');
  
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  res.flushHeaders();

  const sendUpdate = async () => {
    try {
      console.log('Fetching analytics data...');
      const analytics = await getAnalyticsData();
      console.log('Analytics data:', analytics);
      
      console.log('Getting recommendations...');
      const recommendations = await getRecommendations(analytics);
      console.log('Recommendations:', recommendations);
      
      const data = { analytics, recommendations };
      console.log('Sending data to client:', data);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      console.error('Error in sendUpdate:', e);
      res.write(`data: {"error":"${e.message}"}\n\n`);
    }
  };

  // Send initial data immediately
  await sendUpdate();
  
  // Send updates every 30 seconds
  const interval = setInterval(sendUpdate, 30000);
  
  req.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

// Add a simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.listen(4000, () => console.log('Backend running on port 4000'));
