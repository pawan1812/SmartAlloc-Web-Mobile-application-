/**
 * =============================================================================
 * SMARTALLOC - DASHBOARD PAGE
 * =============================================================================
 * Main dashboard page displaying system statistics.
 * 
 * Features:
 * - Total Resources count
 * - Active Allocations count
 * - Available Resources count
 * - Upcoming Allocations count
 * - Recent allocations preview
 * 
 * Data is fetched from: GET /api/dashboard
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';

/**
 * API Base URL
 * Change this if backend is running on a different port
 */
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Dashboard Component
 */
function Dashboard() {
    // State for dashboard statistics
    const [stats, setStats] = useState({
        totalResources: 0,
        totalAllocations: 0,
        activeAllocations: 0,
        availableResources: 0,
        upcomingAllocations: 0,
        recentAllocations: []
    });

    // Loading state
    const [loading, setLoading] = useState(true);

    // Error state
    const [error, setError] = useState(null);

    /**
     * Fetch dashboard data on component mount
     */
    useEffect(() => {
        fetchDashboardData();
    }, []);

    /**
     * Fetch dashboard statistics from API
     */
    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/dashboard`);
            const data = await response.json();

            if (data.success) {
                setStats(data.data);
            } else {
                setError('Failed to load dashboard data');
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('Unable to connect to server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Get status badge class
     */
    const getStatusClass = (status) => {
        const statusMap = {
            'Active': 'active',
            'Upcoming': 'upcoming',
            'Completed': 'completed'
        };
        return statusMap[status] || 'completed';
    };

    // Show loading spinner
    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    // Show error message
    if (error) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Welcome to SmartAlloc - Your Resource Management Hub</p>
                </div>
                <div className="alert alert-error">
                    ⚠️ {error}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome to SmartAlloc - Your Resource Management Hub</p>
            </div>

            {/* Statistics Cards Grid */}
            <div className="stats-grid">
                {/* Total Resources Card */}
                <div className="stat-card">
                    <div className="stat-icon primary">
                        📦
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalResources}</div>
                        <div className="stat-label">Total Resources</div>
                    </div>
                </div>

                {/* Active Allocations Card */}
                <div className="stat-card">
                    <div className="stat-icon info">
                        ⚡
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.activeAllocations}</div>
                        <div className="stat-label">Active Allocations</div>
                    </div>
                </div>

                {/* Available Resources Card */}
                <div className="stat-card">
                    <div className="stat-icon success">
                        ✅
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.availableResources}</div>
                        <div className="stat-label">Available Resources</div>
                    </div>
                </div>

                {/* Upcoming Allocations Card */}
                <div className="stat-card">
                    <div className="stat-icon warning">
                        📅
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.upcomingAllocations}</div>
                        <div className="stat-label">Upcoming Allocations</div>
                    </div>
                </div>
            </div>

            {/* Recent Allocations Section */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Recent Allocations</h2>
                </div>
                <div className="card-body">
                    {stats.recentAllocations && stats.recentAllocations.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Resource</th>
                                        <th>Assigned To</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentAllocations.map((allocation) => (
                                        <tr key={allocation._id}>
                                            <td>{allocation.resource}</td>
                                            <td>{allocation.assignedTo}</td>
                                            <td>{formatDate(allocation.startTime)}</td>
                                            <td>{formatDate(allocation.endTime)}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(allocation.status)}`}>
                                                    <span className="status-dot"></span>
                                                    {allocation.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <h3>No Allocations Yet</h3>
                            <p>Start by adding resources and creating allocations.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
