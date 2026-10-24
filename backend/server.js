// backend/server.js
// Express Server for Smart Road Infrastructure Monitoring System

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded demo images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', reportsRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Smart Road Infrastructure Monitoring System',
    scope: 'Uppal X Roads to Ghatkesar (NH163) Corridor',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  Smart Road Infrastructure Backend running on http://localhost:${PORT}`);
  console.log(`  Corridor Scope: Uppal X Roads -> Ghatkesar (NH163)`);
  console.log(`  Health Check:   http://localhost:${PORT}/api/health`);
  console.log(`  Reports API:    http://localhost:${PORT}/api/reports`);
  console.log(`=======================================================`);
});
