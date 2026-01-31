/**
 * =============================================================================
 * SMARTALLOC - USER MODEL
 * =============================================================================
 * Mongoose schema and model for the User entity.
 * 
 * Users can be:
 * - Super Users (Admins): Can manage everything
 * - Normal Users: Can view resources and allocations
 * 
 * Collection Name: users
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema Definition
 * 
 * @property {String} name - Full name of the user
 * @property {String} email - Email address (unique)
 * @property {String} password - Hashed password
 * @property {String} role - User role ('Super User' or 'User')
 * @property {String} status - Account status ('active' or 'blocked')
 * @property {String} department - Optional department/team name
 * @property {Date} createdAt - Registration date
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },

    role: {
        type: String,
        enum: ['Super User', 'User'],
        default: 'User'
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },

    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    },

    department: {
        type: String,
        trim: true,
        default: 'General'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false,
    collection: 'users'
});

/**
 * Pre-save middleware to hash password
 */
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/**
 * Method to compare password for login
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Create and export the User model
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
