/**
 * =============================================================================
 * SMARTALLOC - USER ROUTES
 * =============================================================================
 * Express router for user-related API endpoints.
 * 
 * Available Routes:
 * - POST /api/users           → Create a new user (Admin)
 * - GET  /api/users           → Get all users
 * - GET  /api/users/:id       → Get single user
 * - PUT  /api/users/:id/status    → Update user status (Admin)
 * - PUT  /api/users/:id/password  → Reset user password (Admin)
 * - DELETE /api/users/:id     → Delete user (Admin)
 * 
 * @author SmartAlloc Team
 * @version 2.0.0
 * =============================================================================
 */

const express = require('express');
const router = express.Router();

const {
    createUser,
    getAllUsers,
    getUserById,
    updateUserStatus,
    resetUserPassword,
    deleteUser
} = require('../controllers/userController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route (for getting users list for dropdown)
router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Admin only routes
router.post('/', protect, adminOnly, createUser);
router.put('/:id/status', protect, adminOnly, updateUserStatus);
router.put('/:id/password', protect, adminOnly, resetUserPassword);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
