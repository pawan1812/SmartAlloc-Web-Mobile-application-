/**
 * =============================================================================
 * SMARTALLOC - LOGIN PAGE
 * =============================================================================
 * Modern login page with dynamic gradient background.
 * 
 * Features:
 * - Dynamic animated gradient background
 * - Clean login form (Email + Password)
 * - Demo credentials display
 * - No "Forgot Password" link as per requirements
 * - Responsive design
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    /**
     * Handle form submission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Validation
        if (!email || !password) {
            setError('Please enter email and password');
            setIsLoading(false);
            return;
        }

        // Attempt login
        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    /**
     * Quick login with demo credentials
     */
    const quickLogin = (type) => {
        if (type === 'admin') {
            setEmail('alice@smartalloc.com');
            setPassword('123456');
        } else {
            setEmail('frank@smartalloc.com');
            setPassword('123456');
        }
    };

    return (
        <div className="login-container">
            {/* Animated Gradient Background */}
            <div className="gradient-bg">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            {/* Login Card */}
            <div className="login-card">
                {/* Logo/Brand */}
                <div className="login-header">
                    <img
                        src="/logo-new.png"
                        alt="SmartAlloc Logo"
                        className="login-logo-img"
                        style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1rem' }}
                    />
                    <h1>SmartAlloc</h1>
                    <p>Allocate Smart. Operate Efficiently.</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="login-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Signing In...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Demo Credentials */}
                <div className="demo-credentials">
                    <h3>🔐 Demo Credentials</h3>
                    <div className="demo-cards">
                        <div className="demo-card admin" onClick={() => quickLogin('admin')}>
                            <span className="demo-badge">ADMIN</span>
                            <p className="demo-email">alice@smartalloc.com</p>
                            <p className="demo-pass">Password: 123456</p>
                        </div>
                        <div className="demo-card user" onClick={() => quickLogin('user')}>
                            <span className="demo-badge">USER</span>
                            <p className="demo-email">frank@smartalloc.com</p>
                            <p className="demo-pass">Password: 123456</p>
                        </div>
                    </div>
                    <p className="demo-hint">Click a card to auto-fill credentials</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
