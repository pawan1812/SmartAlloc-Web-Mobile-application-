/**
 * =============================================================================
 * SMARTALLOC - ALLOCATION LIST PAGE
 * =============================================================================
 * Page displaying all allocations in a table format.
 * 
 * Features:
 * - Table with Resource, Assigned To, Start, End, Status columns
 * - Status badges (Active, Upcoming, Completed)
 * - Delete allocation functionality
 * - Empty state when no allocations exist
 * 
 * API: GET /api/allocations
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';

/**
 * API Base URL
 */
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * AllocationList Component
 */
function AllocationList() {
    // Allocations state
    const [allocations, setAllocations] = useState([]);

    // Loading state
    const [loading, setLoading] = useState(true);

    // Error state
    const [error, setError] = useState(null);

    // Message state for feedback
    const [message, setMessage] = useState({ type: '', text: '' });

    /**
     * Fetch allocations on component mount
     */
    useEffect(() => {
        fetchAllocations();
    }, []);

    /**
     * Fetch all allocations from API
     */
    const fetchAllocations = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/allocations`);
            const data = await response.json();

            if (data.success) {
                setAllocations(data.data);
            } else {
                setError('Failed to load allocations');
            }
        } catch (err) {
            console.error('Error fetching allocations:', err);
            setError('Unable to connect to server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle allocation deletion
     */
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this allocation?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/allocations/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Allocation deleted successfully' });
                // Refresh the list
                fetchAllocations();
                // Clear message after 3 seconds
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to delete allocation' });
            }
        } catch (err) {
            console.error('Error deleting allocation:', err);
            setMessage({ type: 'error', text: 'Failed to delete allocation' });
        }
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Get status badge class based on status
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

    // Show error
    if (error) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Allocations</h1>
                    <p className="page-subtitle">View all resource allocations</p>
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
                <h1 className="page-title">Allocations</h1>
                <p className="page-subtitle">View and manage all resource allocations</p>
            </div>

            {/* Feedback Message */}
            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                </div>
            )}

            {/* Allocations Table Card */}
            <div className="card">
                <div className="card-body">
                    {allocations.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Resource</th>
                                        <th>Assigned To</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                        <th>Purpose</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allocations.map((allocation) => (
                                        <tr key={allocation._id}>
                                            {/* Resource Name */}
                                            <td>
                                                <strong>
                                                    {allocation.resourceId?.name || 'Unknown Resource'}
                                                </strong>
                                                <br />
                                                <small style={{ color: 'var(--text-muted)' }}>
                                                    {allocation.resourceId?.type || ''}
                                                </small>
                                            </td>

                                            {/* Assigned To */}
                                            <td>{allocation.assignedTo}</td>

                                            {/* Start Time */}
                                            <td>{formatDate(allocation.startTime)}</td>

                                            {/* End Time */}
                                            <td>{formatDate(allocation.endTime)}</td>

                                            {/* Purpose */}
                                            <td>{allocation.purpose || '-'}</td>

                                            {/* Status Badge */}
                                            <td>
                                                <span className={`status-badge ${getStatusClass(allocation.status)}`}>
                                                    <span className="status-dot"></span>
                                                    {allocation.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(allocation._id)}
                                                    title="Delete allocation"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <h3>No Allocations Found</h3>
                            <p>Start by assigning resources to create allocations.</p>
                            <a href="/assign-resource" className="btn btn-primary" style={{ marginTop: '16px' }}>
                                📝 Assign Resource
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Stats */}
            {allocations.length > 0 && (
                <div style={{
                    marginTop: '20px',
                    display: 'flex',
                    gap: '20px',
                    flexWrap: 'wrap'
                }}>
                    <div className="stat-card" style={{ flex: '1', minWidth: '200px' }}>
                        <div className="stat-icon info">📊</div>
                        <div className="stat-content">
                            <div className="stat-value">{allocations.length}</div>
                            <div className="stat-label">Total Allocations</div>
                        </div>
                    </div>
                    <div className="stat-card" style={{ flex: '1', minWidth: '200px' }}>
                        <div className="stat-icon success">⚡</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {allocations.filter(a => a.status === 'Active').length}
                            </div>
                            <div className="stat-label">Active Now</div>
                        </div>
                    </div>
                    <div className="stat-card" style={{ flex: '1', minWidth: '200px' }}>
                        <div className="stat-icon warning">📅</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {allocations.filter(a => a.status === 'Upcoming').length}
                            </div>
                            <div className="stat-label">Upcoming</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AllocationList;
