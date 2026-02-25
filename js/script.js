/**
 * @file js/script.js
 * @description Main application entry point for the Deadline Hub application.
 * Initializes the application and coordinates between modules.
 */

import { fetchData } from './utils.js';
import { appState } from './state.js';
import { setupGlobalEventListeners } from './events.js';
import { renderDeadlines, renderAllFilterButtons } from './rendering.js';

// Initialize application
async function initializeApp() {
    try {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const dataUrl = isLocal
            ? 'data/deadlines.json'
            : 'https://raw.githubusercontent.com/mr-devs/deadline-hub/refs/heads/main/data/deadlines.json';
        const data = await fetchData(dataUrl);
        
        appState.setDeadlines(data);
        renderAllFilterButtons();
        renderDeadlines();
    } catch (error) {
        console.error('Error loading deadlines data:', error);
    }
}

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupGlobalEventListeners();
        initializeApp();
    });
} else {
    setupGlobalEventListeners();
    initializeApp();
}


