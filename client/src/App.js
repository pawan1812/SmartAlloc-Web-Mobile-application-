/**
 * =============================================================================
 * SMARTALLOC - MAIN APP COMPONENT (WITH AUTHENTICATION)
 * =============================================================================
 * Root component with routing, authentication, and theme management.
 * 
 * Features:
 * - React Router for navigation
 * - AuthContext for authentication state
 * - Protected routes for authenticated users
 * - Admin-only routes
 * - Theme context for dark/light mode
 * 
 * @author SmartAlloc Team
 * @version 2.0.0
 * =============================================================================
 */

import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Auth Provider
import { AuthProvider, useAuth } from './context/AuthContext';

// Import layout components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Import page components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddResource from './pages/AddResource';
import AssignResource from './pages/AssignResource';
import AllocationList from './pages/AllocationList';
import ResourceStatus from './pages/ResourceStatus';
import AdminDashboard from './pages/AdminDashboard';

/**
 * Theme Context
 * Provides theme state and toggle function to all components
 */
export const ThemeContext = createContext();

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

/**
 * Admin Route Component
 * Redirects to dashboard if user is not an admin
 */
const AdminRoute = ({ children }) => {
    const { isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAdmin()) {
        return <Navigate to="/" replace />;
    }

    return children;
};

/**
 * Main Layout Component
 * Wraps authenticated pages with sidebar and navbar
 */
const MainLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="app-container">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
                <Navbar onMenuClick={() => setSidebarOpen(prev => !prev)} />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

/**
 * App Routes Component
 * Contains all route definitions
 */
const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Public Route - Login */}
            <Route
                path="/login"
                element={
                    isAuthenticated ? <Navigate to="/" replace /> : <Login />
                }
            />

            {/* Protected Routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <MainLayout>
                        <Dashboard />
                    </MainLayout>
                </ProtectedRoute>
            } />

            <Route path="/add-resource" element={
                <ProtectedRoute>
                    <AdminRoute>
                        <MainLayout>
                            <AddResource />
                        </MainLayout>
                    </AdminRoute>
                </ProtectedRoute>
            } />

            <Route path="/assign-resource" element={
                <ProtectedRoute>
                    <MainLayout>
                        <AssignResource />
                    </MainLayout>
                </ProtectedRoute>
            } />

            <Route path="/allocations" element={
                <ProtectedRoute>
                    <MainLayout>
                        <AllocationList />
                    </MainLayout>
                </ProtectedRoute>
            } />

            <Route path="/resources" element={
                <ProtectedRoute>
                    <MainLayout>
                        <ResourceStatus />
                    </MainLayout>
                </ProtectedRoute>
            } />

            {/* Admin Only Routes */}
            <Route path="/admin" element={
                <ProtectedRoute>
                    <AdminRoute>
                        <MainLayout>
                            <AdminDashboard />
                        </MainLayout>
                    </AdminRoute>
                </ProtectedRoute>
            } />

            {/* Fallback - Redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

/**
 * Main Application Component
 */
function App() {
    /**
     * Theme State
     */
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('smartalloc-theme');
        return savedTheme || 'light';
    });

    /**
     * Apply theme to document root
     */
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('smartalloc-theme', theme);
    }, [theme]);

    /**
     * Toggle between light and dark theme
     */
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeContext.Provider>
    );
}

export default App;
