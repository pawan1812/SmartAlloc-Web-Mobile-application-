/**
 * =============================================================================
 * SMARTALLOC - USER CONTROLLER
 * =============================================================================
 * Controller handling user-related operations including Admin functions.
 * 
 * Features:
 * - Create new user (Admin)
 * - Get all users
 * - Get user by ID
 * - Update user status (Block/Unblock) - Admin only
 * - Reset user password - Admin only
 * - Delete user - Admin only
 * 
 * @author SmartAlloc Team
 * @version 2.0.0
 * =============================================================================
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Create a new user
 * Route: POST /api/users
 * Admin Only
 */
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: password || '123456', // Default password
            role: role || 'User',
            department: department || 'General'
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                department: savedUser.department,
                status: savedUser.status
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message
        });
    }
};

/**
 * Get all users
 * Route: GET /api/users
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

/**
 * Get user by ID
 * Route: GET /api/users/:id
 */
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
};

/**
 * Update User Status (Block/Unblock)
 * Route: PUT /api/users/:id/status
 * Admin Only
 */
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be "active" or "blocked"'
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent blocking yourself
        if (req.user && req.user._id.toString() === id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot change your own status'
            });
        }

        user.status = status;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${status === 'blocked' ? 'blocked' : 'activated'} successfully`,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: error.message
        });
    }
};

/**
 * Reset User Password
 * Route: PUT /api/users/:id/password
 * Admin Only
 */
const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.password = newPassword; // Will be hashed by pre-save hook
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
            error: error.message
        });
    }
};

/**
 * Delete User
 * Route: DELETE /api/users/:id
 * Admin Only
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (req.user && req.user._id.toString() === id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUserStatus,
    resetUserPassword,
    deleteUser
};
