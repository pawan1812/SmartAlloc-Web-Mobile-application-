/**
 * =============================================================================
 * SMARTALLOC - AUTHENTICATION MIDDLEWARE
 * =============================================================================
 * Middleware functions to protect routes and verify user roles.
 * 
 * Features:
 * - JWT Token Verification
 * - User Role Authorization
 * - Account Status Check
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret (In production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'smartalloc_secret_key_2024';

/**
 * Protect Route Middleware
 * Verifies JWT token and attaches user to request
 */
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            // Check if user exists
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if user is blocked
            if (req.user.status === 'blocked') {
                return res.status(403).json({
                    success: false,
                    message: 'Your account has been blocked. Contact administrator.'
                });
            }

            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided'
        });
    }
};

/**
 * Admin Only Middleware
 * Restricts access to Super Users only
 * Must be used AFTER protect middleware
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Super User') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

/**
 * Generate JWT Token
 * Creates a token with user ID that expires in 7 days
 */
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '7d'
    });
};

module.exports = { protect, adminOnly, generateToken, JWT_SECRET };
