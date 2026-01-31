/**
 * =============================================================================
 * SMARTALLOC - MAIN ENTRY POINT
 * =============================================================================
 * This is the React application entry point.
 * Renders the App component into the DOM.
 * 
 * @author SmartAlloc Team
 * @version 1.0.0
 * =============================================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import global styles
import './styles/index.css';

// Get the root DOM element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
