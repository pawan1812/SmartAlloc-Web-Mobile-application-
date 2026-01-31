/**
 * =============================================================================
 * SMARTALLOC - RESOURCE CONTROLLER
 * =============================================================================
 * Controller handling all resource-related business logic.
 * 
 * This controller provides functionality for:
 * - Creating new resources
 * - Fetching all resources with their current allocation status
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

const Resource = require('../models/Resource');
const Allocation = require('../models/Allocation');

/**
 * =============================================================================
 * CREATE RESOURCE
 * =============================================================================
 * Creates a new resource in the database.
 * 
 * Route: POST /api/resources
 * 
 * Request Body:
 * {
 *   "name": "Conference Room A",
 *   "type": "Room",
 *   "description": "10-person meeting room with projector"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Resource created successfully",
 *   "data": { ...resourceDocument }
 * }
 */
const createResource = async (req, res) => {
    try {
        // Extract resource data from request body
        const { name, type, description } = req.body;

        // Validate required fields
        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: 'Name and type are required fields'
            });
        }

        // Create new resource document
        const newResource = new Resource({
            name,
            type,
            description: description || ''
        });

        // Save to database
        const savedResource = await newResource.save();

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Resource created successfully',
            data: savedResource
        });

    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        // Handle other errors
        console.error('Error creating resource:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create resource',
            error: error.message
        });
    }
};

/**
 * =============================================================================
 * GET ALL RESOURCES (WITH STATUS)
 * =============================================================================
 * Fetches all resources and calculates their current availability status.
 * 
 * Route: GET /api/resources
 * 
 * Status Calculation Logic:
 * For each resource, check if there's an active allocation where:
 *   startTime <= currentTime AND endTime >= currentTime
 * 
 * If an active allocation exists → Status = "Allocated" (Red badge)
 * If no active allocation → Status = "Available" (Green badge)
 * 
 * Response:
 * {
 *   "success": true,
 *   "count": 5,
 *   "data": [
 *     {
 *       "_id": "...",
 *       "name": "Conference Room A",
 *       "type": "Room",
 *       "description": "...",
 *       "status": "Available",
 *       "currentAllocation": null
 *     },
 *     ...
 *   ]
 * }
 */
const getAllResources = async (req, res) => {
    try {
        // Fetch all resources from database
        const resources = await Resource.find().sort({ createdAt: -1 });

        // Get current time for status calculation
        const currentTime = new Date();

        // Process each resource to add status information
        const resourcesWithStatus = await Promise.all(
            resources.map(async (resource) => {
                /**
                 * Find active allocation for this resource
                 * 
                 * An allocation is active if:
                 * - startTime <= currentTime (allocation has started)
                 * - endTime >= currentTime (allocation hasn't ended)
                 */
                const activeAllocation = await Allocation.findOne({
                    resourceId: resource._id,
                    startTime: { $lte: currentTime },
                    endTime: { $gte: currentTime }
                }).populate('resourceId', 'name');

                // Determine status based on active allocation
                const status = activeAllocation ? 'Allocated' : 'Available';

                // Return resource with status information
                return {
                    _id: resource._id,
                    name: resource.name,
                    type: resource.type,
                    description: resource.description,
                    createdAt: resource.createdAt,
                    status: status,
                    currentAllocation: activeAllocation ? {
                        assignedTo: activeAllocation.assignedTo,
                        startTime: activeAllocation.startTime,
                        endTime: activeAllocation.endTime,
                        purpose: activeAllocation.purpose
                    } : null
                };
            })
        );

        // Send success response
        res.status(200).json({
            success: true,
            count: resourcesWithStatus.length,
            data: resourcesWithStatus
        });

    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch resources',
            error: error.message
        });
    }
};

/**
 * =============================================================================
 * GET SINGLE RESOURCE BY ID
 * =============================================================================
 * Fetches a single resource by its ID with current status.
 * 
 * Route: GET /api/resources/:id
 * 
 * @param {String} req.params.id - Resource ID
 */
const getResourceById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find resource by ID
        const resource = await Resource.findById(id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Check for active allocation
        const currentTime = new Date();
        const activeAllocation = await Allocation.findOne({
            resourceId: resource._id,
            startTime: { $lte: currentTime },
            endTime: { $gte: currentTime }
        });

        // Return resource with status
        res.status(200).json({
            success: true,
            data: {
                ...resource.toObject(),
                status: activeAllocation ? 'Allocated' : 'Available',
                currentAllocation: activeAllocation || null
            }
        });

    } catch (error) {
        console.error('Error fetching resource:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch resource',
            error: error.message
        });
    }
};

// Export all controller functions
module.exports = {
    createResource,
    getAllResources,
    getResourceById
};
