/**
 * =============================================================================
 * SMARTALLOC - ALLOCATION MODEL
 * =============================================================================
 * Mongoose schema and model for the Allocation entity.
 * 
 * An Allocation represents a booking/reservation of a resource for a 
 * specific time period. It links a Resource to a user/person for a 
 * defined start and end time.
 * 
 * Key Features:
 * - References the Resource model (foreign key relationship)
 * - Stores time range (startTime to endTime)
 * - Tracks who the resource is assigned to
 * - Optional purpose/reason field
 * 
 * Collection Name: allocations
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

const mongoose = require('mongoose');

/**
 * Allocation Schema Definition
 * 
 * @property {ObjectId} resourceId - Reference to the Resource being allocated (required)
 *                                   Links to the 'Resource' model
 * 
 * @property {String} assignedTo - Name/identifier of person/team the resource is assigned to (required)
 *                                 Example: "John Doe", "Marketing Team"
 * 
 * @property {Date} startTime - When the allocation begins (required)
 *                              Must be a valid future date/time
 * 
 * @property {Date} endTime - When the allocation ends (required)
 *                            Must be after startTime
 * 
 * @property {String} purpose - Optional reason for the allocation
 *                              Example: "Weekly team meeting", "Client presentation"
 * 
 * @property {Date} createdAt - Timestamp when the allocation was created
 */
const allocationSchema = new mongoose.Schema({

    // Reference to the Resource being allocated
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',      // References the Resource model
        required: [true, 'Resource ID is required']
    },

    // Person or team the resource is assigned to
    assignedTo: {
        type: String,
        required: [true, 'Assigned To field is required'],
        trim: true,
        maxlength: [100, 'Assigned To cannot exceed 100 characters']
    },

    // Allocation start time
    startTime: {
        type: Date,
        required: [true, 'Start time is required']
    },

    // Allocation end time
    endTime: {
        type: Date,
        required: [true, 'End time is required']
    },

    // Optional purpose/reason for the allocation
    purpose: {
        type: String,
        trim: true,
        maxlength: [300, 'Purpose cannot exceed 300 characters'],
        default: ''
    },

    // Timestamp for when the allocation was created
    createdAt: {
        type: Date,
        default: Date.now
    },

    // Approval status for the allocation request
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    // Reference to the User who requested this allocation
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

}, {
    // Schema options
    timestamps: false,        // We're using createdAt manually
    collection: 'allocations' // Explicitly set collection name
});

/**
 * Virtual property to check if allocation is currently active
 * An allocation is active if current time is between startTime and endTime
 */
allocationSchema.virtual('isActive').get(function () {
    const now = new Date();
    return now >= this.startTime && now <= this.endTime;
});

/**
 * Virtual property to get allocation status as string
 * Returns 'Active', 'Upcoming', or 'Completed'
 */
allocationSchema.virtual('timeStatus').get(function () {
    const now = new Date();

    if (now < this.startTime) {
        return 'Upcoming';
    } else if (now >= this.startTime && now <= this.endTime) {
        return 'Active';
    } else {
        return 'Completed';
    }
});

/**
 * Virtual property to get formatted date range
 * Useful for displaying allocation period in UI
 */
allocationSchema.virtual('dateRange').get(function () {
    const options = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return `${this.startTime.toLocaleDateString('en-US', options)} - ${this.endTime.toLocaleDateString('en-US', options)}`;
});

/**
 * Pre-save validation middleware
 * Validates that endTime is after startTime
 */
allocationSchema.pre('save', function (next) {
    // Validate time range
    if (this.endTime <= this.startTime) {
        const error = new Error('End time must be after start time');
        next(error);
    } else {
        next();
    }
});

/**
 * Static method to find active allocations for a specific resource
 * Used for conflict detection
 * 
 * @param {ObjectId} resourceId - The resource to check
 * @returns {Array} Array of active allocations for the resource
 */
allocationSchema.statics.findActiveForResource = function (resourceId) {
    const now = new Date();
    return this.find({
        resourceId: resourceId,
        startTime: { $lte: now },
        endTime: { $gte: now }
    });
};

/**
 * Static method to check for overlapping allocations
 * CRITICAL: This is used for conflict detection to prevent double-booking
 * 
 * Overlap exists when:
 * existing.startTime < newEndTime AND existing.endTime > newStartTime
 * 
 * @param {ObjectId} resourceId - The resource to check
 * @param {Date} startTime - Proposed start time
 * @param {Date} endTime - Proposed end time
 * @param {ObjectId} excludeId - Optional allocation ID to exclude (for updates)
 * @returns {Array} Array of conflicting allocations
 */
allocationSchema.statics.findOverlapping = function (resourceId, startTime, endTime, excludeId = null) {
    const query = {
        resourceId: resourceId,
        startTime: { $lt: endTime },    // Existing start is before new end
        endTime: { $gt: startTime }     // Existing end is after new start
    };

    // Exclude a specific allocation (useful when updating an existing allocation)
    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    return this.find(query);
};

/**
 * Ensure virtuals are included when converting to JSON
 * This allows the status and isActive properties to be included in API responses
 */
allocationSchema.set('toJSON', { virtuals: true });
allocationSchema.set('toObject', { virtuals: true });

/**
 * Create and export the Allocation model
 * This model will interact with the 'allocations' collection in MongoDB
 */
const Allocation = mongoose.model('Allocation', allocationSchema);

module.exports = Allocation;
