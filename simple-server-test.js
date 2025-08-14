#!/usr/bin/env node

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: './server/.env' });

const app = express();

// Basic middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'QuillTide API is running!', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Test auth route
app.post('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth endpoint working', body: req.body });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Database connection
const startServer = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/QuillTide');
    console.log('✅ Connected to MongoDB');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log('Press Ctrl+C to stop');
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

startServer();