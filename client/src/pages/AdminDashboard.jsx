/**
 * =============================================================================
 * SMARTALLOC - ADMIN DASHBOARD
 * =============================================================================
 * Admin-only dashboard for managing allocation requests and users.
 * 
 * Features:
 * - Pending Allocation Requests with Approve/Reject
 * - User Management (Block/Unblock, Delete, Reset Password)
 * - Quick Statistics
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('requests');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Add User Modal State
    const [showUserModal, setShowUserModal] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'User',
        department: ''
    });

    // Fetch data on mount
    useEffect(() => {
        fetchPendingRequests();
        fetchUsers();
    }, []);

    /**
     * Fetch pending allocation requests
     */
    const fetchPendingRequests = async () => {
        try {
            const response = await fetch(`${API_URL}/allocations/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setPendingRequests(data.data);
            }
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetch all users
     */
    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/users`);
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    /**
     * Handle allocation approval/rejection
     */
    const handleAllocationStatus = async (id, status) => {
        setActionLoading(id);
        try {
            const response = await fetch(`${API_URL}/allocations/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: `Request ${status} successfully!` });
                fetchPendingRequests();
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update request' });
        } finally {
            setActionLoading(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    /**
     * Handle user status update (block/unblock)
     */
    const handleUserStatus = async (id, status) => {
        setActionLoading(id);
        try {
            const response = await fetch(`${API_URL}/users/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: `User ${status === 'blocked' ? 'blocked' : 'activated'}!` });
                fetchUsers();
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update user' });
        } finally {
            setActionLoading(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    /**
     * Handle Create User
     */
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setActionLoading('create');

        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });
            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'User created successfully!' });
                setShowUserModal(false);
                setNewUser({ name: '', email: '', password: '', role: 'User', department: '' });
                fetchUsers();
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to create user' });
        } finally {
            setActionLoading(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    /**
     * Handle password reset
     */
    const handleResetPassword = async (id, name) => {
        const newPassword = prompt(`Enter new password for ${name}:`, '123456');
        if (!newPassword || newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setActionLoading(id);
        try {
            const response = await fetch(`${API_URL}/users/${id}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword })
            });
            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Password reset successfully!' });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to reset password' });
        } finally {
            setActionLoading(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    /**
     * Handle user deletion
     */
    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

        setActionLoading(id);
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'User deleted successfully!' });
                fetchUsers();
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete user' });
        } finally {
            setActionLoading(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    /**
     * Format date for display
     */
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>🛡️ Admin Dashboard</h1>
                <p>Manage allocation requests and users</p>
            </div>

            {/* Message Toast */}
            {message.text && (
                <div className={`admin-toast ${message.type}`}>
                    {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
            )}

            {/* Quick Stats */}
            <div className="admin-stats">
                <div className="stat-card pending">
                    <span className="stat-icon">⏳</span>
                    <div className="stat-info">
                        <h3>{pendingRequests.length}</h3>
                        <p>Pending Requests</p>
                    </div>
                </div>
                <div className="stat-card users">
                    <span className="stat-icon">👥</span>
                    <div className="stat-info">
                        <h3>{users.length}</h3>
                        <p>Total Users</p>
                    </div>
                </div>
                <div className="stat-card active">
                    <span className="stat-icon">✅</span>
                    <div className="stat-info">
                        <h3>{users.filter(u => u.status === 'active').length}</h3>
                        <p>Active Users</p>
                    </div>
                </div>
                <div className="stat-card blocked">
                    <span className="stat-icon">🚫</span>
                    <div className="stat-info">
                        <h3>{users.filter(u => u.status === 'blocked').length}</h3>
                        <p>Blocked Users</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    📋 Allocation Requests
                    {pendingRequests.length > 0 && (
                        <span className="tab-badge">{pendingRequests.length}</span>
                    )}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    👤 User Management
                </button>
            </div>

            {/* Tab Content */}
            <div className="admin-content">
                {activeTab === 'requests' && (
                    <div className="requests-section">
                        {loading ? (
                            <div className="loading-state">Loading requests...</div>
                        ) : pendingRequests.length === 0 ? (
                            <div className="empty-state">
                                <span>🎉</span>
                                <p>No pending requests! All caught up.</p>
                            </div>
                        ) : (
                            <div className="requests-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Resource</th>
                                            <th>Requested By</th>
                                            <th>Time</th>
                                            <th>Purpose</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingRequests.map(req => (
                                            <tr key={req._id}>
                                                <td>
                                                    <strong>{req.resourceId?.name || 'Unknown'}</strong>
                                                    <span className="resource-type">{req.resourceId?.type}</span>
                                                </td>
                                                <td>
                                                    <strong>{req.requestedBy?.name || req.assignedTo}</strong>
                                                    <span className="user-email">{req.requestedBy?.email}</span>
                                                </td>
                                                <td>
                                                    <span className="time-range">
                                                        {formatDate(req.startTime)} - {formatDate(req.endTime)}
                                                    </span>
                                                </td>
                                                <td>{req.purpose || '-'}</td>
                                                <td className="actions-cell">
                                                    <button
                                                        className="action-btn approve"
                                                        onClick={() => handleAllocationStatus(req._id, 'approved')}
                                                        disabled={actionLoading === req._id}
                                                    >
                                                        {actionLoading === req._id ? '...' : '✅ Approve'}
                                                    </button>
                                                    <button
                                                        className="action-btn reject"
                                                        onClick={() => handleAllocationStatus(req._id, 'rejected')}
                                                        disabled={actionLoading === req._id}
                                                    >
                                                        {actionLoading === req._id ? '...' : '❌ Reject'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="users-section">
                        <div className="section-actions">
                            <button className="btn-primary" onClick={() => setShowUserModal(true)}>
                                ➕ Add New User
                            </button>
                        </div>
                        <div className="users-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Department</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td><strong>{user.name}</strong></td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`role-badge ${user.role === 'Super User' ? 'admin' : 'user'}`}>
                                                    {user.role === 'Super User' ? '👑 Admin' : '👤 User'}
                                                </span>
                                            </td>
                                            <td>{user.department}</td>
                                            <td>
                                                <span className={`status-badge ${user.status}`}>
                                                    {user.status === 'active' ? '🟢 Active' : '🔴 Blocked'}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                {user.status === 'active' ? (
                                                    <button
                                                        className="action-btn block"
                                                        onClick={() => handleUserStatus(user._id, 'blocked')}
                                                        disabled={actionLoading === user._id}
                                                    >
                                                        🚫 Block
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="action-btn unblock"
                                                        onClick={() => handleUserStatus(user._id, 'active')}
                                                        disabled={actionLoading === user._id}
                                                    >
                                                        ✅ Unblock
                                                    </button>
                                                )}
                                                <button
                                                    className="action-btn reset"
                                                    onClick={() => handleResetPassword(user._id, user.name)}
                                                    disabled={actionLoading === user._id}
                                                >
                                                    🔑 Reset
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleDeleteUser(user._id, user.name)}
                                                    disabled={actionLoading === user._id}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {showUserModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h2>Add New User</h2>
                            <button className="close-btn" onClick={() => setShowUserModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateUser} className="modal-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    placeholder="Minimum 6 characters"
                                    minLength="6"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="User">User</option>
                                        <option value="Super User">Admin (Super User)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <input
                                        type="text"
                                        value={newUser.department}
                                        onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                                        placeholder="e.g. Marketing"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowUserModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={actionLoading === 'create'}>
                                    {actionLoading === 'create' ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
