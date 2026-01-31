# SmartAlloc Web Client
 
The React web frontend for the SmartAlloc system, featuring a modern Glassmorphism UI and Role-Based Access Control.

## 📁 Key Directories

```
client/src/
├── components/           
│   ├── Navbar.jsx        # Top bar with Theme Toggle & User Profile
│   ├── Sidebar.jsx       # Navigation (Changes based on Admin/User role)
│   └── ProtectedRoute.jsx # HOC for securing routes
├── context/
│   └── AuthContext.jsx   # Manages Login, Logout & User State
├── pages/
│   ├── Login.jsx         # Authentication page
│   ├── AdminDashboard.jsx # Admin control center
│   └── ...
└── styles/
    └── index.css         # Global Glassmorphism & Theme Variables
```

## 🔐 Authentication Flow

1. **Login**: User submits credentials to `/api/auth/login`.
2. **Token**: JWT received and stored in `localStorage`.
3. **Context**: `AuthContext` updates state to `isAuthenticated: true`.
4. **Routing**: `ProtectedRoute` checks state/role before rendering private pages.
5. **UI**: Sidebar and Navbar adapt to show Admin vs User options.

## 🎨 Design System

The app relies heavily on **CSS Variables** for theming, located in `styles/index.css`.

- **Effect**: Glassmorphism (`backdrop-filter: blur`, translucent backgrounds).
- **Dark Mode**: Rich mesh gradients (Radial + Linear blends).
- **Light Mode**: Clean, soft gradients.

## 🚀 Setup

```bash
cd client
npm install
npm start
```
Runs on `http://localhost:3000`
