const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// Initialize Database connection (Phase 2 connects safely if available)
connectDB();

// Core Middleware
// Dynamic CORS configuration supporting local development and Vercel cloud deployments
const allowedOrigins = [
  'http://localhost:3000',
  'https://staff-sync-sand.vercel.app',
];
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) allowedOrigins.push(trimmed);
  });
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base API Routes (supports both direct /api prefix and serverless rewrite routing)
app.use('/api', apiRoutes);
app.use(apiRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'StaffSync',
    type: 'Human Resource Management System (HRMS) REST API',
    status: 'Ready',
    healthCheck: '/api/health',
  });
});

// Central Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only spin up HTTP listener in persistent server environments (skipped on Vercel Serverless)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[StaffSync Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
