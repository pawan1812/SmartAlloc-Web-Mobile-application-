/**
 * =============================================================================
 * SMARTALLOC - ADD RESOURCE PAGE
 * =============================================================================
 * Form page for adding new resources to the system.
 * 
 * Features:
 * - Form with Name, Type, and Description fields
 * - Form validation
 * - Success/Error feedback
 * - Redirect after successful creation
 * 
 * API: POST /api/resources
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * API Base URL
 */
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Resource Types for dropdown
 */
const RESOURCE_TYPES = [
    'Meeting Room',
    'Conference Hall',
    'Equipment',
    'Vehicle',
    'Laptop',
    'Projector',
    'Other'
];

/**
 * AddResource Component
 */
function AddResource() {
    // Navigation hook
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        description: ''
    });

    // Loading state
    const [loading, setLoading] = useState(false);

    // Message state for success/error feedback
    const [message, setMessage] = useState({ type: '', text: '' });

    /**
     * Handle input changes
     * Updates form state when user types
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
     * Handle form submission
     * Validates and sends data to API
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name.trim()) {
            setMessage({ type: 'error', text: 'Resource name is required' });
            return;
        }

        if (!formData.type) {
            setMessage({ type: 'error', text: 'Please select a resource type' });
            return;
        }

        try {
            setLoading(true);

            // Send POST request to create resource
            const response = await fetch(`${API_BASE_URL}/resources`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Show success message
                setMessage({ type: 'success', text: 'Resource created successfully!' });

                // Reset form
                setFormData({ name: '', type: '', description: '' });

                // Redirect to resources page after delay
                setTimeout(() => {
                    navigate('/resources');
                }, 1500);
            } else {
                // Show error from API
                setMessage({ type: 'error', text: data.message || 'Failed to create resource' });
            }
        } catch (err) {
            console.error('Error creating resource:', err);
            setMessage({
                type: 'error',
                text: 'Unable to connect to server. Make sure the backend is running.'
            });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Reset form
     */
    const handleReset = () => {
        setFormData({ name: '', type: '', description: '' });
        setMessage({ type: '', text: '' });
    };

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Add Resource</h1>
                <p className="page-subtitle">Create a new resource to be available for allocation</p>
            </div>

            {/* Form Card */}
            <div className="card" style={{ maxWidth: '600px' }}>
                <div className="card-body">
                    {/* Success/Error Message */}
                    {message.text && (
                        <div className={`alert alert-${message.type}`}>
                            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                        </div>
                    )}

                    {/* Resource Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Resource Name Field */}
                        <div className="form-group">
                            <label className="form-label">
                                Resource Name <span>*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., Conference Room A"
                                disabled={loading}
                            />
                        </div>

                        {/* Resource Type Field */}
                        <div className="form-group">
                            <label className="form-label">
                                Resource Type <span>*</span>
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="form-select"
                                disabled={loading}
                            >
                                <option value="">Select a type...</option>
                                {RESOURCE_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description Field */}
                        <div className="form-group">
                            <label className="form-label">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-textarea"
                                placeholder="Enter a brief description of the resource..."
                                rows="4"
                                disabled={loading}
                            />
                        </div>

                        {/* Form Buttons */}
                        <div className="flex gap-10">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : '➕ Add Resource'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleReset}
                                disabled={loading}
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddResource;
