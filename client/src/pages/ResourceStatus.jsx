/**
 * =============================================================================
 * SMARTALLOC - RESOURCE STATUS PAGE
 * =============================================================================
 * Page displaying all resources with their current availability status.
 * 
 * Features:
 * - Card-based resource display
 * - Status badges (🟢 Available / 🔴 Allocated)
 * - Current allocation details for allocated resources
 * - Real-time status based on current time
 * 
 * API: GET /api/resources
 * 
 * Status Rule:
 * - If allocation exists where startTime <= now AND endTime >= now → Allocated
 * - Otherwise → Available
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
 * ResourceStatus Component
 */
function ResourceStatus() {
    // Resources state
    const [resources, setResources] = useState([]);

    // Loading state
    const [loading, setLoading] = useState(true);

    // Error state
    const [error, setError] = useState(null);

    // Filter state
    const [filter, setFilter] = useState('all'); // 'all', 'available', 'allocated'

    /**
     * Fetch resources on component mount
     */
    useEffect(() => {
        fetchResources();
    }, []);

    /**
     * Fetch all resources from API
     */
    const fetchResources = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/resources`);
            const data = await response.json();

            if (data.success) {
                setResources(data.data);
            } else {
                setError('Failed to load resources');
            }
        } catch (err) {
            console.error('Error fetching resources:', err);
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
     * Filter resources based on selected filter
     */
    const filteredResources = resources.filter(resource => {
        if (filter === 'all') return true;
        if (filter === 'available') return resource.status === 'Available';
        if (filter === 'allocated') return resource.status === 'Allocated';
        return true;
    });

    /**
     * Count resources by status
     */
    const availableCount = resources.filter(r => r.status === 'Available').length;
    const allocatedCount = resources.filter(r => r.status === 'Allocated').length;

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
                    <h1 className="page-title">Resource Status</h1>
                    <p className="page-subtitle">View real-time availability of all resources</p>
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
                <h1 className="page-title">Resource Status</h1>
                <p className="page-subtitle">View real-time availability of all resources</p>
            </div>

            {/* Filter Buttons and Stats */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '24px'
            }}>
                {/* Filter Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({resources.length})
                    </button>
                    <button
                        className={`btn ${filter === 'available' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('available')}
                    >
                        🟢 Available ({availableCount})
                    </button>
                    <button
                        className={`btn ${filter === 'allocated' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('allocated')}
                    >
                        🔴 Allocated ({allocatedCount})
                    </button>
                </div>

                {/* Refresh Button */}
                <button
                    className="btn btn-secondary"
                    onClick={fetchResources}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Resources Grid */}
            {filteredResources.length > 0 ? (
                <div className="resource-grid">
                    {filteredResources.map((resource) => (
                        <div key={resource._id} className="resource-card">
                            {/* Card Header */}
                            <div className="resource-card-header">
                                <div className="resource-info">
                                    <h3>{resource.name}</h3>
                                    <span className="resource-type">{resource.type}</span>
                                </div>

                                {/* Status Badge */}
                                <span className={`status-badge ${resource.status === 'Available' ? 'available' : 'allocated'}`}>
                                    <span className="status-dot"></span>
                                    {resource.status}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="resource-description">
                                {resource.description || 'No description available.'}
                            </p>

                            {/* Current Allocation Info (if allocated) */}
                            {resource.status === 'Allocated' && resource.currentAllocation && (
                                <div style={{
                                    background: 'var(--danger-bg)',
                                    padding: '12px',
                                    borderRadius: 'var(--border-radius-sm)',
                                    marginBottom: '16px'
                                }}>
                                    <h4 style={{
                                        fontSize: '12px',
                                        color: 'var(--danger-color)',
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Currently Allocated To
                                    </h4>
                                    <p style={{ fontWeight: '600', marginBottom: '4px' }}>
                                        {resource.currentAllocation.assignedTo}
                                    </p>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        {formatDate(resource.currentAllocation.startTime)} - {formatDate(resource.currentAllocation.endTime)}
                                    </p>
                                    {resource.currentAllocation.purpose && (
                                        <p style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '8px' }}>
                                            "{resource.currentAllocation.purpose}"
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Card Footer */}
                            <div className="resource-footer">
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    Added: {new Date(resource.createdAt).toLocaleDateString()}
                                </span>

                                {resource.status === 'Available' && (
                                    <a href="/assign-resource" className="btn btn-primary btn-sm">
                                        Assign
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>No Resources Found</h3>
                    <p>
                        {filter === 'all'
                            ? 'Start by adding resources to the system.'
                            : `No ${filter} resources at the moment.`
                        }
                    </p>
                    {filter === 'all' && (
                        <a href="/add-resource" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            ➕ Add Resource
                        </a>
                    )}
                </div>
            )}

            {/* Legend */}
            <div className="card" style={{ marginTop: '30px' }}>
                <div className="card-body" style={{ padding: '16px 24px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Status Legend</h4>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="status-badge available">
                                <span className="status-dot"></span>
                                Available
                            </span>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                - No active allocation, ready to be assigned
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="status-badge allocated">
                                <span className="status-dot"></span>
                                Allocated
                            </span>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                - Currently in use, cannot be assigned until freed
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResourceStatus;
