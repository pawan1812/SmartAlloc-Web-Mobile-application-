/**
 * =============================================================================
 * SMARTALLOC - DASHBOARD ROUTES
 * =============================================================================
 * Express router for dashboard-related API endpoints.
 * 
 * Available Routes:
 * - GET /api/dashboard → Get dashboard statistics
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

const express = require('express');
const router = express.Router();

// Import controller functions
const { getDashboardStats } = require('../controllers/dashboardController');

/**
 * Route: GET /api/dashboard
 * Description: Get dashboard statistics and overview data
 * Access: Public
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "totalResources": 10,
 *     "totalAllocations": 25,
 *     "activeAllocations": 3,
 *     "availableResources": 7,
 *     "upcomingAllocations": 5,
 *     "recentAllocations": [...]
 *   }
 * }
 */
router.get('/', getDashboardStats);

// Export router
module.exports = router;
