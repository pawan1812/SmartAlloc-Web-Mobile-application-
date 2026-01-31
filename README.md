# 🚀 SmartAlloc

<div align="center">

### Allocate Smart. Operate Efficiently.

A modern, full-stack resource allocation system with Role-Based Access Control (RBAC), Real-time Dashboard, and Glassmorphism UI.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node](https://img.shields.io/badge/node-18+-green)
![MongoDB](https://img.shields.io/badge/mongodb-6.0+-green)
![React](https://img.shields.io/badge/react-18+-blue)

</div>

---

## ✨ Key Features

- **🔐 Authentication & Authorization**: Secure JWT-based login with Admin and User roles (Web & Mobile).
- **🎨 Modern UI**: 
    - **Web**: Beautiful Glassmorphism design with dynamic gradients.
    - **Mobile**: Animated Floating Backgrounds and native glass effects.
- **📊 Admin Dashboard**:
    - Real-time statistics (Total Resources, Active Allocations, etc.)
    - Allocation approval workflow (Approve/Reject requests).
    - User Management (Create, Delete, Block users).
- **📅 Resource Management**: Create resources (Rooms, Equipment) and prevent double-booking with conflict detection.
- **📱 Platforms**:
    - **Web App**: Responsive React application.
    - **Mobile App**: Featured-packed React Native (Expo) app for iOS/Android.

---

## 📁 Project Structure

```
SmartAlloc/
├── server/                 # Backend API (Node.js/Express)
│   ├── ...
├── client/                 # Frontend Web App (React + Vite)
│   ├── ...
├── mobile/                 # Mobile App (React Native + Expo) 👈 [NEW]
│   ├── src/
│   │   ├── screens/        # Native Screens (Dashboard, Login, Lists)
│   │   ├── navigation/     # Stack Navigator
│   │   └── components/     # Native Components (AnimatedBackground)
│   └── README.md           # Mobile-specific docs
└── README.md               # Main documentation
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Running locally on port 27017)

### 2. Setup Backend
```bash
cd server
npm install
node database/init-db.js  # 👈 CRITICAL: Seeds DB & Hashed Passwords
npm start
```
*Backend runs on `http://localhost:5000`*

### 3. Setup Frontend (Web)
```bash
cd client
npm install
npm start
```
*Frontend runs on `http://localhost:3000`*

### 4. Setup Mobile App
```bash
cd mobile
npm install
npx expo start
```
*Scan the QR code with Expo Go app.*

---

## 🔐 Login Credentials

**⚠️ IMPORTANT:** The default password for ALL users is `123456`.

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `alice@smartalloc.com` | `123456` |
| **Admin** | `bob@smartalloc.com` | `123456` |
| **User** | `frank@smartalloc.com` | `123456` |

📄 **[View Full List of 50+ Users](server/database/README.md)**  
*(Check `server/database/README.md` for a complete table of generated users)*

---

## 📡 API Endpoints

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | Public | User login & token generation |
| `/api/users` | POST | Admin | Create new user |
| `/api/allocations` | POST | User/Admin | Request allocation |
| `/api/dashboard` | GET | Admin | Fetch system stats |

---

## 🌗 Themes

The app includes a sophisticated theme system:
- **Glassmorphism**: Translucent cards with backdrop blur.
- **Mesh Gradients**: Complex, animated-style backgrounds in Dark Mode.
- **Toggle**: Switch instantly using the moon/sun icon in the navbar.

---

## � Tech Stack

| Layer | Tools |
|-------|-------|
| **Frontend** | React, React Router, Context API, CSS Variables |
| **Backend** | Node.js, Express, JSON Web Token (JWT), Bcrypt |
| **Database** | MongoDB, Mongoose |

---

<div align="center">
<b>Made by pawan1812</b>
</div>
