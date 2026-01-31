/**
 * =============================================================================
 * SMARTALLOC - SIDEBAR COMPONENT (WITH AUTH)
 * =============================================================================
 * Left navigation sidebar with role-based navigation.
 * 
 * Features:
 * - Brand logo with tagline
 * - Role-based navigation sections
 * - Admin-only links visible only to Super Users
 * - Active link highlighting
 * - Responsive collapse for mobile
 * 
 * @author SmartAlloc Team
 * @version 2.0.0
 * =============================================================================
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Sidebar Component
 */
function Sidebar({ isOpen, onClose }) {
    const { isAdmin } = useAuth();

    /**
     * Navigation Links Configuration
     */
    const mainNavLinks = [
        { path: '/', icon: '📊', label: 'Dashboard' },
        { path: '/resources', icon: '📦', label: 'Resources' },
        { path: '/allocations', icon: '📋', label: 'Allocations' },
        { path: '/assign-resource', icon: '📝', label: 'Request Resource' },
    ];

    const adminNavLinks = [
        { path: '/admin', icon: '🛡️', label: 'Admin Panel' },
        { path: '/add-resource', icon: '➕', label: 'Add Resource' },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 99
                    }}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Logo Section */}
                <div className="sidebar-header">
                    <a href="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
                        <img
                            src="/logo-new.png"
                            alt="SmartAlloc Logo"
                            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                        />
                        <div className="logo-text">
                            <span className="logo-title">SmartAlloc</span>
                            <span className="logo-tagline">Allocate Smart</span>
                        </div>
                    </a>
                </div>

                {/* Navigation Links */}
                <nav className="sidebar-nav">
                    {/* Main Navigation Section */}
                    <div className="nav-section">
                        <h3 className="nav-section-title">Main</h3>

                        {mainNavLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? 'active' : ''}`
                                }
                                onClick={onClose}
                            >
                                <span className="nav-link-icon">{link.icon}</span>
                                <span>{link.label}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* Admin Navigation Section - Only visible to Super Users */}
                    {isAdmin() && (
                        <div className="nav-section">
                            <h3 className="nav-section-title">Admin</h3>

                            {adminNavLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? 'active' : ''}`
                                    }
                                    onClick={onClose}
                                >
                                    <span className="nav-link-icon">{link.icon}</span>
                                    <span>{link.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    )}
                </nav>

                {/* Sidebar Footer */}
                <div style={{
                    padding: '20px 24px',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                }}>
                    SmartAlloc v2.0.0
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
