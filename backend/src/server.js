const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Root health & diagnostic endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Apparel Group Scavenger Hunt REST API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Apparel Group Scavenger Hunt REST API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Apparel Group Scavenger Hunt REST API listening on port ${PORT}`);
});
