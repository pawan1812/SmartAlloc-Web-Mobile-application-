/**
 * =============================================================================
 * SMARTALLOC DATABASE INITIALIZATION SCRIPT (LARGE SCALE)
 * =============================================================================
 * 
 * This script initializes the database with LARGE SCALE demo data.
 * 
 * FEATURES:
 * 1. Clears existing data
 * 2. Creates 50 Users (5 Admin + 45 Normal)
 * 3. Creates 100 Resources (Rooms, Devices, Vehicles, etc)
 * 4. Creates 200 Allocations (Past, Active, Future)
 * 
 * =============================================================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Import Models
const User = require('../models/User');
const Resource = require('../models/Resource');
const Allocation = require('../models/Allocation');

// Configuration
const MONGODB_URI = 'mongodb://localhost:27017/smartalloc_db';
const DEFAULT_PASSWORD = '123456';

// Arrays for generating data
const DEPARTMENTS = ['IT', 'HR', 'Sales', 'Marketing', 'Engineering', 'Operations', 'Finance', 'Design', 'Legal', 'Support'];
const ROLES = ['User', 'User', 'User', 'User', 'User', 'Super User']; // Weighted heavily towards User
const FIRST_NAMES = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Edward', 'Deborah'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

const RESOURCE_TYPES = ['Meeting Room', 'Laptop', 'Projector', 'Vehicle', 'Equipment', 'Tablet', 'Camera', 'Workstation'];
const RESOURCE_PREFIXES = {
    'Meeting Room': ['Conference Room', 'Huddle Room', 'Boardroom', 'Meeting Space', 'Quiet Pod'],
    'Laptop': ['MacBook Pro', 'Dell XPS', 'Lenovo ThinkPad', 'HP EliteBook'],
    'Projector': ['Epson 4K', 'BenQ 1080p', 'Sony Laser'],
    'Vehicle': ['Tesla Model 3', 'Ford Transit', 'Toyota Camry', 'Honda CR-V'],
    'Equipment': ['VR Headset', 'Podcast Kit', 'Green Screen', 'Drone'],
    'Tablet': ['iPad Pro', 'Samsung Galaxy Tab', 'Wacom Cintiq'],
    'Camera': ['Sony Alpha', 'Canon EOS', 'Nikon Z'],
    'Workstation': ['High-End PC', 'Mac Studio', 'Render Farm Node']
};

const PURPOSES = [
    'Client meeting', 'Team sprint planning', 'Weekly sync', 'Interview',
    'Project kickoff', 'Client site visit', 'Equipment testing', 'Video recording session',
    'Remote work setup', 'Conference travel', 'Emergency requirement', 'Training session',
    'Code review', 'Product demo', 'Workshop', 'Vendor meeting'
];

/**
 * Helper to get random item from array
 */
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * MAIN INIT FUNCTION
 */
async function initializeDatabase() {
    console.log('🚀 Starting SmartAlloc LARGE SCALE Database Initialization...');
    console.log('===================================================');

    try {
        // 1. Connect to MongoDB
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        // 2. Clear existing data
        console.log('🧹 Clearing existing collections...');
        await User.deleteMany({});
        await Resource.deleteMany({});
        await Allocation.deleteMany({});
        console.log('✅ Data cleared.');

        // 3. Create Users
        console.log('👤 Generating 50 Users...');
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        // Define specific admins
        const users = [
            { name: 'Admin Alice', email: 'alice@smartalloc.com', password: hashedPassword, role: 'Super User', department: 'IT', status: 'active' },
            { name: 'User Frank', email: 'frank@smartalloc.com', password: hashedPassword, role: 'User', department: 'Sales', status: 'active' }
        ];

        // Generate remaining 48 users
        for (let i = 0; i < 48; i++) {
            const firstName = getRandom(FIRST_NAMES);
            const lastName = getRandom(LAST_NAMES);
            const name = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@smartalloc.com`;
            const role = Math.random() < 0.1 ? 'Super User' : 'User'; // 10% admins

            users.push({
                name,
                email,
                password: hashedPassword,
                role,
                department: getRandom(DEPARTMENTS),
                status: Math.random() < 0.9 ? 'active' : 'blocked', // 10% blocked
                createdAt: new Date()
            });
        }

        const createdUsers = await User.insertMany(users);
        console.log(`✅ Created ${createdUsers.length} users.`);

        // 4. Create Resources
        console.log('📦 Generating 100 Resources...');
        const resources = [];

        for (let i = 0; i < 100; i++) {
            const type = getRandom(RESOURCE_TYPES);
            const prefixes = RESOURCE_PREFIXES[type];
            const prefix = getRandom(prefixes);
            const id = 100 + i;

            resources.push({
                name: `${prefix} #${id}`,
                type: type,
                description: `Standard ${type} unit for general use. ID: ${id}`,
                createdAt: new Date()
            });
        }

        const createdResources = await Resource.insertMany(resources);
        console.log(`✅ Created ${createdResources.length} resources.`);

        // 5. Create Allocations
        console.log('📋 Generating 200 Allocations...');
        const allocations = [];
        let attempts = 0;

        // Loop more than needed to account for overlaps
        while (allocations.length < 200 && attempts < 1000) {
            attempts++;
            const resource = getRandom(createdResources);
            const user = getRandom(createdUsers);

            const timeframe = Math.random();
            let start, end;

            if (timeframe < 0.2) { // 20% Active
                start = new Date();
                start.setMinutes(start.getMinutes() - getRandomInt(10, 120));
                end = new Date();
                end.setMinutes(end.getMinutes() + getRandomInt(30, 240));
            } else if (timeframe < 0.6) { // 40% Past
                const pastDays = getRandomInt(1, 14);
                start = new Date();
                start.setDate(start.getDate() - pastDays);
                start.setHours(getRandomInt(8, 17), 0, 0);
                end = new Date(start);
                end.setHours(start.getHours() + getRandomInt(1, 4));
            } else { // 40% Future
                const futureDays = getRandomInt(1, 30);
                start = new Date();
                start.setDate(start.getDate() + futureDays);
                start.setHours(getRandomInt(8, 17), 0, 0);
                end = new Date(start);
                end.setHours(start.getHours() + getRandomInt(1, 4));
            }

            // Conflict check
            const hasOverlap = allocations.some(a =>
                a.resourceId.toString() === resource._id.toString() &&
                a.startTime < end && a.endTime > start
            );

            if (!hasOverlap) {
                // Determine status based on timeframe
                let approvalStatus = 'pending';
                const now = new Date();

                if (end < now) {
                    // Past allocations mostly approved or rejected
                    approvalStatus = Math.random() < 0.8 ? 'approved' : 'rejected';
                } else {
                    // Current/Future mixed
                    const r = Math.random();
                    if (r < 0.5) approvalStatus = 'approved';
                    else if (r < 0.9) approvalStatus = 'pending';
                    else approvalStatus = 'rejected';
                }

                allocations.push({
                    resourceId: resource._id,
                    assignedTo: user.name,
                    requestedBy: user._id,
                    startTime: start,
                    endTime: end,
                    purpose: getRandom(PURPOSES),
                    approvalStatus: approvalStatus,
                    createdAt: new Date()
                });
            }
        }

        const createdAllocations = await Allocation.insertMany(allocations);
        console.log(`✅ Created ${createdAllocations.length} allocations.`);

        console.log('===================================================');
        console.log('🎉 LARGE SCALE INITIALIZATION COMPLETE!');
        console.log('===================================================');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected');
        process.exit(0);
    }
}

initializeDatabase();
