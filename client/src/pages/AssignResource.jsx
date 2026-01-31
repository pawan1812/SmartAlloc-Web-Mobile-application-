/**
 * =============================================================================
 * SMARTALLOC - ASSIGN RESOURCE PAGE
 * =============================================================================
 * Form page for creating new resource allocations.
 * 
 * Features:
 * - Resource dropdown (fetched from API)
 * - Assigned To, Start Time, End Time, Purpose fields
 * - Time validation (endTime > startTime, startTime >= now)
 * - Conflict detection feedback from API
 * 
 * API: 
 * - GET /api/resources (to populate dropdown)
 * - POST /api/allocations (to create allocation)
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * API Base URL
 */
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * AssignResource Component
 */
function AssignResource() {
    // Navigation hook
    const navigate = useNavigate();

    // Available resources state
    const [resources, setResources] = useState([]);
    const [users, setUsers] = useState([]);
    // Form state
    const [formData, setFormData] = useState({
        resourceId: '',
        assignedTo: '',
        startTime: '',
        endTime: '',
        purpose: ''
    });

    // Loading states
    const [loadingResources, setLoadingResources] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Message state for success/error feedback
    const [message, setMessage] = useState({ type: '', text: '' });

    /**
     * Fetch available resources and users on component mount
     */
    useEffect(() => {
        fetchResources();
        fetchUsers();
    }, []);

    /**
     * Fetch resources from API
     */
    const fetchResources = async () => {
        try {
            setLoadingResources(true);

            const response = await fetch(`${API_BASE_URL}/resources`);
            const data = await response.json();

            if (data.success) {
                // Filter to show only available resources (or all for selection)
                setResources(data.data);
            }
        } catch (err) {
            console.error('Error fetching resources:', err);
            setMessage({
                type: 'error',
                text: 'Unable to load resources. Make sure the backend is running.'
            });
        } finally {
            setLoadingResources(false);
        }
    };

    /**
     * Fetch users from API
     */
    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/users`);
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setMessage({
                type: 'error',
                text: 'Unable to load users. Make sure the backend is running.'
            });
        }
    };

    /**
     * Handle input changes
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear any previous messages
        setMessage({ type: '', text: '' });
    };

    /**
     * Validate form data
     * Returns true if valid, false otherwise
     */
    const validateForm = () => {
        // Check required fields
        if (!formData.resourceId) {
            setMessage({ type: 'error', text: 'Please select a resource' });
            return false;
        }

        if (!formData.assignedTo.trim()) {
            setMessage({ type: 'error', text: 'Assigned To field is required' });
            return false;
        }

        if (!formData.startTime) {
            setMessage({ type: 'error', text: 'Start time is required' });
            return false;
        }

        if (!formData.endTime) {
            setMessage({ type: 'error', text: 'End time is required' });
            return false;
        }

        // Validate time logic
        const startTime = new Date(formData.startTime);
        const endTime = new Date(formData.endTime);
        const now = new Date();

        // Check if start time is in the past
        if (startTime < now) {
            setMessage({ type: 'error', text: 'Start time cannot be in the past' });
            return false;
        }

        // Check if end time is after start time
        if (endTime <= startTime) {
            setMessage({ type: 'error', text: 'End time must be after start time' });
            return false;
        }

        return true;
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);

            // Send POST request to create allocation
            const response = await fetch(`${API_BASE_URL}/allocations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Success - show message and redirect
                setMessage({ type: 'success', text: 'Resource allocated successfully!' });

                // Reset form
                setFormData({
                    resourceId: '',
                    assignedTo: '',
                    startTime: '',
                    endTime: '',
                    purpose: ''
                });

                // Redirect to allocations page after delay
                setTimeout(() => {
                    navigate('/allocations');
                }, 1500);
            } else {
                // Error from API - likely a conflict
                // IMPORTANT: This is where conflict detection feedback is shown
                setMessage({
                    type: 'error',
                    text: data.message || 'Failed to create allocation'
                });
            }
        } catch (err) {
            console.error('Error creating allocation:', err);
            setMessage({
                type: 'error',
                text: 'Unable to connect to server. Make sure the backend is running.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Reset form
     */
    const handleReset = () => {
        setFormData({
            resourceId: '',
            assignedTo: '',
            startTime: '',
            endTime: '',
            purpose: ''
        });
        setMessage({ type: '', text: '' });
    };

    /**
     * Get minimum datetime for start time input
     * Should be current time
     */
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Assign Resource</h1>
                <p className="page-subtitle">Allocate a resource to a person or team for a specific time period</p>
            </div>

            {/* Form Card */}
            <div className="card" style={{ maxWidth: '700px' }}>
                <div className="card-body">
                    {/* Success/Error Message */}
                    {message.text && (
                        <div className={`alert alert-${message.type}`}>
                            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                        </div>
                    )}

                    {/* Loading state for resources */}
                    {loadingResources ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        /* Allocation Form */
                        <form onSubmit={handleSubmit}>
                            {/* Resource Selection */}
                            <div className="form-group">
                                <label className="form-label">
                                    Select Resource <span>*</span>
                                </label>
                                <select
                                    name="resourceId"
                                    value={formData.resourceId}
                                    onChange={handleChange}
                                    className="form-select"
                                    disabled={submitting}
                                >
                                    <option value="">Choose a resource...</option>
                                    {resources.map(resource => (
                                        <option key={resource._id} value={resource._id}>
                                            {resource.name} ({resource.type}) - {resource.status === 'Available' ? '🟢 Available' : '🔴 Allocated'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Assigned To Field */}
                            <div className="form-group">
                                <label className="form-label">
                                    Assigned To <span>*</span>
                                </label>
                                <select
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={handleChange}
                                    className="form-select"
                                    disabled={submitting}
                                    required
                                >
                                    <option value="">Select a user...</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user.name}>
                                            {user.name} ({user.role}) - {user.department}
                                        </option>
                                    ))}
                                </select>
                                <small className="form-hint">Select a user from the database</small>
                            </div>

                            {/* Time Selection Row */}
                            <div className="form-row">
                                {/* Start Time */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Start Time <span>*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className="form-input"
                                        min={getMinDateTime()}
                                        disabled={submitting}
                                    />
                                </div>

                                {/* End Time */}
                                <div className="form-group">
                                    <label className="form-label">
                                        End Time <span>*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className="form-input"
                                        min={formData.startTime || getMinDateTime()}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            {/* Purpose Field */}
                            <div className="form-group">
                                <label className="form-label">
                                    Purpose
                                </label>
                                <textarea
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    className="form-textarea"
                                    placeholder="Enter the purpose of this allocation..."
                                    rows="3"
                                    disabled={submitting}
                                />
                            </div>

                            {/* Form Buttons */}
                            <div className="flex gap-10">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Assigning...' : '📝 Assign Resource'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleReset}
                                    disabled={submitting}
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Help Text */}
            <div className="card" style={{ maxWidth: '700px', marginTop: '20px' }}>
                <div className="card-body">
                    <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>ℹ️ Allocation Rules</h3>
                    <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', paddingLeft: '20px' }}>
                        <li>Start time must be in the future</li>
                        <li>End time must be after start time</li>
                        <li>Resources cannot be double-booked for overlapping time periods</li>
                        <li>If a conflict is detected, an error message will be shown</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default AssignResource;
