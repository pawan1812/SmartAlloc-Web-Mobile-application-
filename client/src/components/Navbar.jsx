/**
 * =============================================================================
 * SMARTALLOC - NAVBAR COMPONENT (WITH AUTH)
 * =============================================================================
 * Top navigation bar with user info, logout, and theme toggle.
 * 
 * Features:
 * - Dynamic page title based on current route
 * - User profile with name and role badge
 * - Logout button
 * - Dark/Light mode toggle
 * - Mobile menu button
 * 
 * @author SmartAlloc Team
 * @version 2.0.0
 * =============================================================================
 */

import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar Component
 */
function Navbar({ onMenuClick }) {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    /**
     * Get page title based on current route
     */
    const getPageTitle = () => {
        const titles = {
            '/': 'Dashboard',
            '/add-resource': 'Add Resource',
            '/assign-resource': 'Request Resource',
            '/allocations': 'Allocations',
            '/resources': 'Resource Status',
            '/admin': 'Admin Dashboard'
        };
        return titles[location.pathname] || 'SmartAlloc';
    };

    /**
     * Handle logout
     */
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="navbar">
            {/* Mobile Menu Button */}
            <button
                className="menu-toggle"
                onClick={onMenuClick}
                aria-label="Toggle menu"
            >
                ☰
            </button>

            {/* Page Title */}
            <h1 className="navbar-title">{getPageTitle()}</h1>

            {/* Navbar Actions */}
            <div className="navbar-actions">
                {/* User Info */}
                {user && (
                    <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className={`user-role ${isAdmin() ? 'admin' : 'user'}`}>
                            {isAdmin() ? '👑 Admin' : '👤 User'}
                        </span>
                    </div>
                )}

                {/* Theme Toggle Button */}
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                {/* Logout Button */}
                {user && (
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        🚪 Logout
                    </button>
                )}
            </div>
        </header>
    );
}

export default Navbar;
