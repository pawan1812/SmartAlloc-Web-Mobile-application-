/**
 * =============================================================================
 * SMARTALLOC - MAIN SERVER FILE
 * =============================================================================
 * This is the entry point for the SmartAlloc backend API server.
 * 
 * Features:
 * - Express.js server running on port 5000
 * - MongoDB connection using Mongoose
 * - CORS enabled for frontend communication
 * - RESTful API routes for resources, allocations, and dashboard
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

// Import required dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import route modules
const resourceRoutes = require('./routes/resourceRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// Initialize Express application
const app = express();

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

/**
 * CORS Middleware
 * Enables Cross-Origin Resource Sharing to allow frontend (React) 
 * to communicate with this backend API
 */
app.use(cors());

/**
 * JSON Parser Middleware
 * Parses incoming request bodies in JSON format
 * Required for POST/PUT requests with JSON data
 */
app.use(express.json());

/**
 * URL Encoded Parser Middleware
 * Parses incoming requests with URL-encoded payloads
 */
app.use(express.urlencoded({ extended: true }));

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

/**
 * MongoDB Connection String
 * Connects to local MongoDB instance
 * Database name: smartalloc_db
 * 
 * IMPORTANT: Make sure MongoDB is running locally on port 27017
 * You can verify connection using MongoDB Compass
 */
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartalloc_db';

/**
 * Connect to MongoDB using Mongoose
 * - useNewUrlParser: Use new URL string parser
 * - useUnifiedTopology: Use new Server Discover and Monitoring engine
 */
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📁 Database: smartalloc_db`);
    console.log(`🔗 Connection URI: ${MONGODB_URI}`);
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('💡 Make sure MongoDB is running on localhost:27017');
    process.exit(1); // Exit process with failure
  });

// =============================================================================
// API ROUTES
// =============================================================================

/**
 * Resource Routes - /api/resources
 * Handles CRUD operations for resources (rooms, equipment, etc.)
 */
app.use('/api/resources', resourceRoutes);

/**
 * Allocation Routes - /api/allocations
 * Handles resource allocation with conflict detection
 */
app.use('/api/allocations', allocationRoutes);

/**
 * Dashboard Routes - /api/dashboard
 * Provides statistics and overview data for the dashboard
 */
app.use('/api/dashboard', dashboardRoutes);

/**
 * User Routes - /api/users
 * Handles user management
 */
app.use('/api/users', userRoutes);

/**
 * Auth Routes - /api/auth
 * Handles user authentication (login/logout)
 */
app.use('/api/auth', authRoutes);

/**
 * Root Route - Health Check
 * Simple endpoint to verify server is running
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SmartAlloc API Server is running!',
    version: '1.0.0',
    endpoints: {
      resources: '/api/resources',
      allocations: '/api/allocations',
      dashboard: '/api/dashboard'
    }
  });
});

/**
 * 404 Not Found Handler
 * Catches all undefined routes
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedPath: req.originalUrl
  });
});

/**
 * Global Error Handler
 * Catches all unhandled errors in the application
 */
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error.message);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

/**
 * Server Port Configuration
 * Uses environment variable PORT or defaults to 5000
 */
const PORT = process.env.PORT || 5000;

/**
 * Start the Express server
 */
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('       🚀 SMARTALLOC API SERVER STARTED SUCCESSFULLY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   📡 Server running on: http://localhost:${PORT}`);
  console.log(`   🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log('═══════════════════════════════════════════════════════════');
});

// Export app for testing purposes
module.exports = app;
