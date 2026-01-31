# SmartAlloc Backend

Node.js/Express API handling authentication, resource management, and complex scheduling logic for both **Web** and **Mobile** clients.

## 📁 Key Modules

```
server/
├── controllers/
│   ├── authController.js      # Login logic
│   ├── userController.js      # CRUD for Users
│   ├── allocationController.js # Scheduling & Conflicts
│   └── dashboardController.js # Aggregated Stats
├── middleware/
│   └── authMiddleware.js      # Verify JWT & Check Admin Role
├── models/                    # Mongoose Schemas (User, Resource, Allocation)
├── database/                  
│   ├── init-db.js             # 👈 Run this to seed DB
│   └── README.md              # 👈 List of Generated Credentials
```

## 🔐 Security Features

1. **Password Hashing**: Uses `bcryptjs` (Salt round: 10).
2. **JWT Authentication**: Protected routes require a valid Bearer token.
3. **RBAC**: Middleware ensures only 'Super User' access to Admin endpoints.

## 🚀 Setup & Seeding

**Important:** Before starting, you MUST seed the database to get the Admin account.

```bash
# 1. Install
npm install

# 2. Seed Database (Creates 50 users & 100 resources)
node database/init-db.js

# 3. Start
npm start
```

## 📡 Key API Routes

### Auth
- `POST /api/auth/login` - Returns `{ token, user }`

### Users (Admin Only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Remove user

### Allocations
- `POST /api/allocations` - Request resource (Includes overlap check)
- `PUT /api/allocations/:id/status` - Approve/Reject (Admin only)

*(See main README for full list)*
