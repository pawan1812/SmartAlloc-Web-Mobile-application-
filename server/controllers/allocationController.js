/**
 * =============================================================================
 * SMARTALLOC - ALLOCATION CONTROLLER
 * =============================================================================
 * Controller handling all allocation-related business logic.
 * 
 * This controller provides functionality for:
 * - Creating new allocations with CONFLICT DETECTION
 * - Fetching all allocations with resource details
 * 
 * CRITICAL BUSINESS LOGIC:
 * The createAllocation function implements conflict detection to prevent
 * double-booking of resources. This is the core functionality of SmartAlloc.
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

const Allocation = require('../models/Allocation');
const Resource = require('../models/Resource');

/**
 * =============================================================================
 * CREATE ALLOCATION (WITH CONFLICT DETECTION)
 * =============================================================================
 * Creates a new allocation after validating for time conflicts.
 * 
 * Route: POST /api/allocations
 * 
 * Request Body:
 * {
 *   "resourceId": "65abc123...",
 *   "assignedTo": "John Doe",
 *   "startTime": "2024-01-15T09:00:00Z",
 *   "endTime": "2024-01-15T11:00:00Z",
 *   "purpose": "Team Meeting"
 * }
 * 
 * VALIDATION RULES:
 * 1. endTime must be greater than startTime
 * 2. startTime must be >= current time (can't book in the past)
 * 3. No time overlap with existing allocations for the same resource
 * 
 * CONFLICT DETECTION LOGIC:
 * A conflict exists if for the same resourceId:
 *   existing.startTime < newEndTime AND existing.endTime > newStartTime
 * 
 * If conflict found → Return error: "Resource already allocated in this time range"
 * If no conflict → Create the allocation
 */
const createAllocation = async (req, res) => {
    try {
        // Extract allocation data from request body
        const { resourceId, assignedTo, startTime, endTime, purpose } = req.body;

        // =========================================================================
        // STEP 1: Validate Required Fields
        // =========================================================================
        if (!resourceId || !assignedTo || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'resourceId, assignedTo, startTime, and endTime are required fields'
            });
        }

        // Convert to Date objects for comparison
        const newStartTime = new Date(startTime);
        const newEndTime = new Date(endTime);
        const currentTime = new Date();

        // =========================================================================
        // STEP 2: Validate Time Range - endTime must be greater than startTime
        // =========================================================================
        if (newEndTime <= newStartTime) {
            return res.status(400).json({
                success: false,
                message: 'End time must be after start time'
            });
        }

        // =========================================================================
        // STEP 3: Validate Start Time - Must be >= current time (no past bookings)
        // =========================================================================
        if (newStartTime < currentTime) {
            return res.status(400).json({
                success: false,
                message: 'Start time cannot be in the past'
            });
        }

        // =========================================================================
        // STEP 4: Verify Resource Exists
        // =========================================================================
        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // =========================================================================
        // STEP 5: CONFLICT DETECTION - Check for overlapping allocations
        // =========================================================================
        /**
         * CRITICAL BUSINESS LOGIC
         * 
         * Two time ranges overlap if:
         *   existing.startTime < new.endTime AND existing.endTime > new.startTime
         * 
         * Visual representation:
         * 
         * Case 1: New allocation starts during existing
         * Existing:  |-------|
         * New:           |-------|
         * Overlap!
         * 
         * Case 2: New allocation ends during existing
         * Existing:      |-------|
         * New:       |-------|
         * Overlap!
         * 
         * Case 3: New allocation completely contains existing
         * Existing:    |---|
         * New:       |-------|
         * Overlap!
         * 
         * Case 4: New allocation is completely within existing
         * Existing:  |---------|
         * New:          |---|
         * Overlap!
         * 
         * Case 5: No overlap
         * Existing:  |---|
         * New:             |---|
         * No conflict!
         */
        // Only check conflicts for approved allocations
        const conflictingAllocations = await Allocation.find({
            resourceId: resourceId,
            approvalStatus: 'approved', // Only approved allocations cause conflicts
            startTime: { $lt: newEndTime },
            endTime: { $gt: newStartTime }
        });

        // If conflicts found, return error
        if (conflictingAllocations.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Resource already allocated in this time range',
                conflictDetails: {
                    resourceName: resource.name,
                    existingAllocations: conflictingAllocations.map(alloc => ({
                        assignedTo: alloc.assignedTo,
                        startTime: alloc.startTime,
                        endTime: alloc.endTime,
                        purpose: alloc.purpose
                    }))
                }
            });
        }

        // =========================================================================
        // STEP 6: No Conflicts - Create the Allocation
        // =========================================================================
        // Determine approval status based on user role
        // If user is Super User (Admin), auto-approve
        // If regular User, set to pending
        const isAdmin = req.user && req.user.role === 'Super User';
        const approvalStatus = isAdmin ? 'approved' : 'pending';

        const newAllocation = new Allocation({
            resourceId,
            assignedTo,
            startTime: newStartTime,
            endTime: newEndTime,
            purpose: purpose || '',
            approvalStatus: approvalStatus,
            requestedBy: req.user ? req.user._id : null
        });

        // Save to database
        const savedAllocation = await newAllocation.save();

        // Populate resource details for response
        await savedAllocation.populate('resourceId', 'name type');

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Allocation created successfully',
            data: savedAllocation
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

        // Handle invalid ObjectId error
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid resource ID format'
            });
        }

        // Handle other errors
        console.error('Error creating allocation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create allocation',
            error: error.message
        });
    }
};

/**
 * =============================================================================
 * GET ALL ALLOCATIONS
 * =============================================================================
 * Fetches all allocations with resource details and calculated status.
 * 
 * Route: GET /api/allocations
 * 
 * Response includes:
 * - Full allocation details
 * - Populated resource information (name, type)
 * - Status: "Active", "Upcoming", or "Completed"
 * 
 * Response:
 * {
 *   "success": true,
 *   "count": 10,
 *   "data": [
 *     {
 *       "_id": "...",
 *       "resourceId": { "name": "Room A", "type": "Room" },
 *       "assignedTo": "John Doe",
 *       "startTime": "...",
 *       "endTime": "...",
 *       "status": "Active"
 *     },
 *     ...
 *   ]
 * }
 */
const getAllAllocations = async (req, res) => {
    try {
        // Fetch all allocations with resource details
        const allocations = await Allocation.find()
            .populate('resourceId', 'name type') // Populate resource name and type
            .sort({ startTime: -1 });            // Sort by start time (newest first)

        // Get current time for status calculation
        const currentTime = new Date();

        // Calculate status for each allocation
        const allocationsWithStatus = allocations.map(allocation => {
            let status;

            if (currentTime < allocation.startTime) {
                status = 'Upcoming';
            } else if (currentTime >= allocation.startTime && currentTime <= allocation.endTime) {
                status = 'Active';
            } else {
                status = 'Completed';
            }

            return {
                _id: allocation._id,
                resourceId: allocation.resourceId,
                assignedTo: allocation.assignedTo,
                startTime: allocation.startTime,
                endTime: allocation.endTime,
                purpose: allocation.purpose,
                createdAt: allocation.createdAt,
                approvalStatus: allocation.approvalStatus,
                requestedBy: allocation.requestedBy,
                timeStatus: status
            };
        });

        // Send success response
        res.status(200).json({
            success: true,
            count: allocationsWithStatus.length,
            data: allocationsWithStatus
        });

    } catch (error) {
        console.error('Error fetching allocations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch allocations',
            error: error.message
        });
    }
};

/**
 * =============================================================================
 * DELETE ALLOCATION
 * =============================================================================
 * Deletes an allocation by ID.
 * 
 * Route: DELETE /api/allocations/:id
 * 
 * @param {String} req.params.id - Allocation ID to delete
 */
const deleteAllocation = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedAllocation = await Allocation.findByIdAndDelete(id);

        if (!deletedAllocation) {
            return res.status(404).json({
                success: false,
                message: 'Allocation not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Allocation deleted successfully',
            data: deletedAllocation
        });

    } catch (error) {
        console.error('Error deleting allocation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete allocation',
            error: error.message
        });
    }
};

/**
 * =============================================================================
 * APPROVE / REJECT ALLOCATION
 * =============================================================================
 * Admin only - Changes allocation status.
 * 
 * Route: PUT /api/allocations/:id/status
 */
const updateAllocationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be "approved" or "rejected"'
            });
        }

        const allocation = await Allocation.findById(id);

        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: 'Allocation not found'
            });
        }

        // If approving, check for conflicts
        if (status === 'approved') {
            const conflicts = await Allocation.find({
                _id: { $ne: id },
                resourceId: allocation.resourceId,
                approvalStatus: 'approved',
                startTime: { $lt: allocation.endTime },
                endTime: { $gt: allocation.startTime }
            });

            if (conflicts.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Cannot approve - conflicts with existing approved allocation'
                });
            }
        }

        allocation.approvalStatus = status;
        await allocation.save();
        await allocation.populate('resourceId', 'name type');

        res.status(200).json({
            success: true,
            message: `Allocation ${status} successfully`,
            data: allocation
        });

    } catch (error) {
        console.error('Error updating allocation status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update allocation status',
            error: error.message
        });
    }
};

/**
 * Get allocations for current user (My Requests)
 * Route: GET /api/allocations/my
 */
const getMyAllocations = async (req, res) => {
    try {
        const allocations = await Allocation.find({ requestedBy: req.user._id })
            .populate('resourceId', 'name type')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: allocations.length,
            data: allocations
        });
    } catch (error) {
        console.error('Error fetching my allocations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your allocations',
            error: error.message
        });
    }
};

/**
 * Get pending allocations (Admin Dashboard)
 * Route: GET /api/allocations/pending
 */
const getPendingAllocations = async (req, res) => {
    try {
        const allocations = await Allocation.find({ approvalStatus: 'pending' })
            .populate('resourceId', 'name type')
            .populate('requestedBy', 'name email department')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: allocations.length,
            data: allocations
        });
    } catch (error) {
        console.error('Error fetching pending allocations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending allocations',
            error: error.message
        });
    }
};

// Export all controller functions
module.exports = {
    createAllocation,
    getAllAllocations,
    deleteAllocation,
    updateAllocationStatus,
    getMyAllocations,
    getPendingAllocations
};
