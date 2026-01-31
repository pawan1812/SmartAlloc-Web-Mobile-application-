const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const MONGODB_URI = 'mongodb://localhost:27017/smartalloc_db';
const README_PATH = path.join(__dirname, 'README.md');

async function generateReadme() {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    console.log('📥 Fetching users...');
    const users = await User.find().sort({ role: 1, name: 1 }); // Sort by Role (Super User first), then Name

    console.log(`📝 Found ${users.length} users. Generating README...`);

    let content = `# 🗄️ SmartAlloc Database Credentials

This document lists all users currently populated in the database.
**Default Password for ALL users:** \`123456\`

## 🔐 Super Users (Admins)
| Name | Email | Department | Status |
|------|-------|------------|--------|
`;

    const admins = users.filter(u => u.role === 'Super User');
    const normalUsers = users.filter(u => u.role !== 'Super User');

    admins.forEach(u => {
        content += `| ${u.name} | **${u.email}** | ${u.department} | ${u.status === 'active' ? '✅' : '🔴'} |\n`;
    });

    content += `
## 👤 Normal Users
| Name | Email | Department | Status |
|------|-------|------------|--------|
`;

    normalUsers.forEach(u => {
        content += `| ${u.name} | ${u.email} | ${u.department} | ${u.status === 'active' ? '✅' : '🔴'} |\n`;
    });

    content += `\n*Generated on: ${new Date().toLocaleString()}*\n`;

    fs.writeFileSync(README_PATH, content);
    console.log(`✅ README generated at: ${README_PATH}`);

    await mongoose.connection.close();
    process.exit(0);
}

generateReadme();
