// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getAnalyticsData } from './analytics.js';
import { getRecommendations } from './recommendations.js';
dotenv.config();

const app = express();
app.use(cors());

// --- WebSocket server for inventory ---
import { WebSocketServer } from 'ws';
import http from 'http';

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/inventory' });

// In-memory inventory for demo (replace with DB in production)
let inventory = [
  { id: '1', name: 'Tomatoes', batch: 'A1', quantity: 50, expiry: '2024-07-20', received: '2024-07-01' },
  { id: '2', name: 'Chicken Breast', batch: 'B2', quantity: 30, expiry: '2024-07-18', received: '2024-07-02' },
  { id: '3', name: 'Mozzarella Cheese', batch: 'C3', quantity: 10, expiry: '2024-07-15', received: '2024-07-01' },
];

function broadcastInventory() {
  const msg = JSON.stringify({ type: 'inventory_update', inventory });
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(msg);
  });
}

wss.on('connection', (ws) => {
  console.log('Inventory WebSocket client connected');
  ws.send(JSON.stringify({ type: 'inventory_update', inventory }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'log') {
        // Add new inventory log
        const newItem = {
          id: Date.now().toString(),
          name: data.item,
          batch: data.batch,
          quantity: data.quantity,
          expiry: data.expiry,
          received: data.received,
        };
        inventory.push(newItem);
        broadcastInventory();
      }
      // Add more message types as needed
    } catch (e) {
      console.error('WebSocket message error:', e);
    }
  });

  ws.on('close', () => {
    console.log('Inventory WebSocket client disconnected');
  });
});

// --- Existing analytics SSE endpoint ---
app.get('/stream/analytics', async (req, res) => {
  console.log('Client connected to analytics stream');
  const section = req.query.section || 'dashboard';
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
      console.log('Getting recommendations for section:', section);
      const recommendations = await getRecommendations(analytics, section);
      console.log('Recommendations:', recommendations);
      const data = { analytics, recommendations };
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
