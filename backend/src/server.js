const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Apparel Group Scavenger Hunt REST API', timestamp: new Date().toISOString(), host: '192.168.100.92' });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Apparel Group Scavenger Hunt REST API listening on http://192.168.100.92:${PORT} (0.0.0.0:${PORT})`);
});
