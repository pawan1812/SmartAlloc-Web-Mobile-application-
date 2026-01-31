/**
 * =============================================================================
 * SMARTALLOC - RESOURCE ROUTES
 * =============================================================================
 * Express router for resource-related API endpoints.
 * 
 * Available Routes:
 * - POST /api/resources   → Create a new resource
 * - GET  /api/resources   → Get all resources with status
 * - GET  /api/resources/:id → Get single resource by ID
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

const express = require('express');
const router = express.Router();

// Import controller functions
const {
    createResource,
    getAllResources,
    getResourceById
} = require('../controllers/resourceController');

/**
 * Route: POST /api/resources
 * Description: Create a new resource
 * Access: Admin
 * 
 * Request Body:
 * {
 *   "name": "Conference Room A",
 *   "type": "Room",
 *   "description": "10-person meeting room"
 * }
 */
router.post('/', createResource);

/**
 * Route: GET /api/resources
 * Description: Get all resources with current availability status
 * Access: Public
 * 
 * Response includes status (Available/Allocated) for each resource
 */
router.get('/', getAllResources);

/**
 * Route: GET /api/resources/:id
 * Description: Get a single resource by ID with status
 * Access: Public
 * 
 * URL Parameter: id (MongoDB ObjectId)
 */
router.get('/:id', getResourceById);

// Export router
module.exports = router;
