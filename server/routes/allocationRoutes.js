/**
 * =============================================================================
 * SMARTALLOC - ALLOCATION ROUTES
 * =============================================================================
 * Express router for allocation-related API endpoints.
 * 
 * Available Routes:
 * - POST /api/allocations           → Create allocation (Protected)
 * - GET  /api/allocations           → Get all allocations
 * - GET  /api/allocations/my        → Get current user's allocations (Protected)
 * - GET  /api/allocations/pending   → Get pending allocations (Admin)
 * - PUT  /api/allocations/:id/status → Approve/Reject (Admin)
 * - DELETE /api/allocations/:id     → Delete allocation (Admin)
 * 
 * @author SmartAlloc Team
 * @version 2.0.0
 * =============================================================================
 */

const express = require('express');
const router = express.Router();

const {
    createAllocation,
    getAllAllocations,
    deleteAllocation,
    updateAllocationStatus,
    getMyAllocations,
    getPendingAllocations
} = require('../controllers/allocationController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllAllocations);

// Protected routes (requires login)
router.post('/', protect, createAllocation);
router.get('/my', protect, getMyAllocations);

// Admin only routes
router.get('/pending', protect, adminOnly, getPendingAllocations);
router.put('/:id/status', protect, adminOnly, updateAllocationStatus);
router.delete('/:id', protect, adminOnly, deleteAllocation);

module.exports = router;
