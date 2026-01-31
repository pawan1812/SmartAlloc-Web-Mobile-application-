/**
 * =============================================================================
 * SMARTALLOC - AUTHENTICATION CONTEXT
 * =============================================================================
 * Provides global authentication state management using React Context.
 * 
 * Features:
 * - User state (logged in user data)
 * - Token management (localStorage persistence)
 * - Login/Logout functions
 * - Loading state for initial auth check
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the Auth Context
const AuthContext = createContext(null);

// API Base URL
const API_URL = 'http://localhost:5000/api';

/**
 * Auth Provider Component
 * Wraps the app and provides authentication state to all children
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    /**
     * Check for existing token on app load
     * If token exists, verify it and get user data
     */
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');

            if (storedToken) {
                try {
                    const response = await fetch(`${API_URL}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.data);
                        setToken(storedToken);
                    } else {
                        // Token invalid, clear storage
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setToken(null);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            }

            setLoading(false);
        };

        checkAuth();
    }, []);

    /**
     * Login Function
     * Authenticates user with email and password
     * 
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Object} Result with success status and message/data
     */
    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store token and user in localStorage
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data));

                setToken(data.data.token);
                setUser(data.data);

                return { success: true, user: data.data };
            } else {
                return {
                    success: false,
                    message: data.message || 'Login failed'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    };

    /**
     * Logout Function
     * Clears user session and redirects to login
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    /**
     * Check if user is admin (Super User)
     */
    const isAdmin = () => {
        return user && user.role === 'Super User';
    };

    // Context value
    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to use Auth Context
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
