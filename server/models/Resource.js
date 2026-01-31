/**
 * =============================================================================
 * SMARTALLOC - RESOURCE MODEL
 * =============================================================================
 * Mongoose schema and model for the Resource entity.
 * 
 * A Resource represents any allocatable item in the system such as:
 * - Meeting rooms
 * - Conference halls
 * - Equipment (projectors, laptops, etc.)
 * - Vehicles
 * - Any other bookable resource
 * 
 * Collection Name: resources
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

const mongoose = require('mongoose');

/**
 * Resource Schema Definition
 * 
 * @property {String} name - Name of the resource (required)
 *                           Example: "Conference Room A", "Projector #1"
 * 
 * @property {String} type - Category/type of the resource (required)
 *                           Example: "Room", "Equipment", "Vehicle"
 * 
 * @property {String} description - Optional detailed description
 *                                  Example: "10-person meeting room with whiteboard"
 * 
 * @property {Date} createdAt - Timestamp when the resource was created
 *                              Automatically set to current date/time
 */
const resourceSchema = new mongoose.Schema({

    // Resource name - unique identifier for users
    name: {
        type: String,
        required: [true, 'Resource name is required'],
        trim: true,           // Remove leading/trailing whitespace
        maxlength: [100, 'Resource name cannot exceed 100 characters']
    },

    // Resource type/category
    type: {
        type: String,
        required: [true, 'Resource type is required'],
        trim: true,
        maxlength: [50, 'Resource type cannot exceed 50 characters']
    },

    // Optional description
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''           // Default to empty string if not provided
    },

    // Timestamp for when the resource was added
    createdAt: {
        type: Date,
        default: Date.now     // Automatically set to current date/time
    }

}, {
    // Schema options
    timestamps: false,      // We're using createdAt manually
    collection: 'resources' // Explicitly set collection name
});

/**
 * Virtual property to get formatted creation date
 * Useful for displaying dates in a user-friendly format
 */
resourceSchema.virtual('formattedCreatedAt').get(function () {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

/**
 * Pre-save middleware (hook)
 * Runs before saving a document to the database
 * Can be used for additional validation or data transformation
 */
resourceSchema.pre('save', function (next) {
    // Example: Capitalize first letter of name
    if (this.name) {
        this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
    }
    next();
});

/**
 * Create and export the Resource model
 * This model will interact with the 'resources' collection in MongoDB
 */
const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
