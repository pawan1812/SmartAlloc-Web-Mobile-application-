/**
 * =============================================================================
 * SMARTALLOC - DASHBOARD CONTROLLER
 * =============================================================================
 * Controller handling dashboard statistics and overview data.
 * 
 * This controller provides functionality for:
 * - Fetching aggregated statistics for the dashboard
 * - Calculating active allocations
 * - Determining available resources
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

const Resource = require('../models/Resource');
const Allocation = require('../models/Allocation');

/**
 * =============================================================================
 * GET DASHBOARD STATISTICS
 * =============================================================================
 * Retrieves overview statistics for the dashboard.
 * 
 * Route: GET /api/dashboard
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "totalResources": 10,
 *     "totalAllocations": 25,
 *     "activeAllocations": 3,
 *     "availableResources": 7,
 *     "upcomingAllocations": 5
 *   }
 * }
 * 
 * Definitions:
 * - totalResources: Total count of all resources in the system
 * - totalAllocations: Total count of all allocations (past, present, future)
 * - activeAllocations: Allocations where currentTime is between startTime and endTime
 * - availableResources: Resources with no active allocation currently
 * - upcomingAllocations: Allocations where startTime > currentTime
 */
const getDashboardStats = async (req, res) => {
    try {
        const currentTime = new Date();

        // =========================================================================
        // Count Total Resources
        // =========================================================================
        const totalResources = await Resource.countDocuments();

        // =========================================================================
        // Count Total Allocations
        // =========================================================================
        const totalAllocations = await Allocation.countDocuments();

        // =========================================================================
        // Count Active Allocations
        // Active = currentTime is between startTime and endTime
        // =========================================================================
        const activeAllocations = await Allocation.countDocuments({
            startTime: { $lte: currentTime },
            endTime: { $gte: currentTime }
        });

        // =========================================================================
        // Count Upcoming Allocations
        // Upcoming = startTime is in the future
        // =========================================================================
        const upcomingAllocations = await Allocation.countDocuments({
            startTime: { $gt: currentTime }
        });

        // =========================================================================
        // Calculate Available Resources
        // Available = Resources without any current active allocation
        // =========================================================================

        /**
         * Find all resources that have an active allocation
         * Then subtract from total to get available count
         */
        const resourcesWithActiveAllocation = await Allocation.distinct('resourceId', {
            startTime: { $lte: currentTime },
            endTime: { $gte: currentTime }
        });

        const allocatedResourceCount = resourcesWithActiveAllocation.length;
        const availableResources = totalResources - allocatedResourceCount;

        // =========================================================================
        // Get Recent Allocations (for quick preview)
        // =========================================================================
        const recentAllocations = await Allocation.find()
            .populate('resourceId', 'name type')
            .sort({ createdAt: -1 })
            .limit(5);

        // Process recent allocations to add status
        const recentAllocationsWithStatus = recentAllocations.map(alloc => {
            let status;
            if (currentTime < alloc.startTime) {
                status = 'Upcoming';
            } else if (currentTime >= alloc.startTime && currentTime <= alloc.endTime) {
                status = 'Active';
            } else {
                status = 'Completed';
            }

            return {
                _id: alloc._id,
                resource: alloc.resourceId ? alloc.resourceId.name : 'Unknown',
                assignedTo: alloc.assignedTo,
                startTime: alloc.startTime,
                endTime: alloc.endTime,
                status: status
            };
        });

        // =========================================================================
        // Send Response
        // =========================================================================
        res.status(200).json({
            success: true,
            data: {
                totalResources,
                totalAllocations,
                activeAllocations,
                availableResources,
                upcomingAllocations,
                recentAllocations: recentAllocationsWithStatus
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};

// Export controller functions
module.exports = {
    getDashboardStats
};
