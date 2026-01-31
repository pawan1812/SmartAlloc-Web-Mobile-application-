/**
 * =============================================================================
 * SMARTALLOC - AUTHENTICATION ROUTES
 * =============================================================================
 * Express router for authentication API endpoints.
 * 
 * Available Routes:
 * - POST /api/auth/login  → User login
 * - GET  /api/auth/me     → Get current user profile (protected)
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

const express = require('express');
const router = express.Router();

const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
