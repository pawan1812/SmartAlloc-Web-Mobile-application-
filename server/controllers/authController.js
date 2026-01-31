/**
 * =============================================================================
 * SMARTALLOC - AUTHENTICATION CONTROLLER
 * =============================================================================
 * Controller handling user authentication (login/register).
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

/**
 * Login User
 * Route: POST /api/auth/login
 * 
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} User data and JWT token
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is blocked
        if (user.status === 'blocked') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked. Contact administrator.'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token and send response
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                status: user.status,
                token: token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};

/**
 * Get Current User Profile
 * Route: GET /api/auth/me
 * Protected - Requires token
 */
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

module.exports = { login, getMe };
