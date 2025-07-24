/**
 * @file js/events.js
 * @description Event handling utilities for the Deadline Hub application.
 * Manages DOM event listeners and UI interactions.
 */

import { appState } from './state.js';
import { renderDeadlines } from './rendering.js';

export function setupFilterButtonEvents(container, filterType) {
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
            const value = button.textContent.trim();
            
            switch(filterType) {
                case 'topics':
                    appState.toggleTopic(value);
                    break;
                case 'submissionTypes':
                    appState.toggleSubmissionType(value);
                    break;
                case 'venueTypes':
                    appState.toggleVenueType(value);
                    break;
                case 'archivalTypes':
                    appState.toggleArchivalType(value);
                    break;
            }
            
            renderDeadlines();
        });
    });
}

export function setupToggleEvents(toggleLinkId, hiddenDivId) {
    const toggleLink = document.getElementById(toggleLinkId);
    if (toggleLink) {
        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            const hiddenDiv = document.getElementById(hiddenDivId);
            if (hiddenDiv.style.display === "none") {
                hiddenDiv.style.display = "block";
                toggleLink.textContent = "Show Less";
            } else {
                hiddenDiv.style.display = "none";
                toggleLink.textContent = "Show More";
            }
        });
    }
}

export function setupGlobalEventListeners() {
    document.addEventListener('DOMContentLoaded', function() {
        const clearBtn = document.getElementById('clearFiltersButton');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearFilters);
        }

        const cardViewRadio = document.getElementById('cardView');
        const listViewRadio = document.getElementById('listView');
        
        if (cardViewRadio) {
            cardViewRadio.addEventListener('change', renderDeadlines);
        }
        if (listViewRadio) {
            listViewRadio.addEventListener('change', renderDeadlines);
        }

        const searchInput = document.getElementById('searchInput');
        const showPastSwitch = document.getElementById('showPastConferencesSwitch');
        
        if (searchInput) {
            searchInput.addEventListener('keyup', renderDeadlines);
        }
        if (showPastSwitch) {
            showPastSwitch.addEventListener('change', renderDeadlines);
        }
    });
}

function clearFilters() {
    appState.clearAllFilters();
    
    document.getElementById('searchInput').value = "";
    
    document.querySelectorAll('#topicsContainer button.active').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#submissionTypesContainer button.active').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#venueTypesContainer button.active').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#archivalTypesContainer button.active').forEach(btn => btn.classList.remove('active'));

    renderDeadlines();
}