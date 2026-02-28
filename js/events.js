/**
 * @file js/events.js
 * @description Event handling utilities for the Deadline Hub application.
 * Manages DOM event listeners and UI interactions.
 */

import { appState } from './state.js';
import { renderDeadlines } from './rendering.js';
import { downloadICS, generateGoogleCalendarUrl } from './calendar.js';

export function setupGlobalEventListeners() {
    const clearBtn = document.getElementById('clearFiltersButton');
    if (clearBtn) clearBtn.addEventListener('click', clearFilters);

    const cardViewRadio = document.getElementById('cardView');
    const listViewRadio = document.getElementById('listView');
    if (cardViewRadio) cardViewRadio.addEventListener('change', renderDeadlines);
    if (listViewRadio) listViewRadio.addEventListener('change', renderDeadlines);

    const searchInput = document.getElementById('searchInput');
    const showPastSwitch = document.getElementById('showPastConferencesSwitch');
    if (searchInput) searchInput.addEventListener('keyup', renderDeadlines);
    if (showPastSwitch) showPastSwitch.addEventListener('change', renderDeadlines);

    document.addEventListener('change', (e) => {
        const checkbox = e.target.closest('.filter-checkbox');
        if (!checkbox) return;
        const filterType = checkbox.dataset.filterType;
        const value = checkbox.dataset.filterValue;
        switch (filterType) {
            case 'topics':          appState.toggleTopic(value);          break;
            case 'submissionTypes': appState.toggleSubmissionType(value); break;
            case 'venueTypes':      appState.toggleVenueType(value);      break;
            case 'archivalTypes':   appState.toggleArchivalType(value);   break;
        }
        updateFilterBadge(filterType);
        renderDeadlines();
    });

    document.addEventListener('click', (e) => {
        const icalBtn = e.target.closest('.ical-download-btn');
        if (icalBtn) {
            const datum = appState.getDeadlines().find(d => d.id === parseInt(icalBtn.dataset.deadlineId, 10));
            if (datum) downloadICS(datum);
            return;
        }

        const gcalBtn = e.target.closest('.gcal-btn');
        if (gcalBtn) {
            const datum = appState.getDeadlines().find(d => d.id === parseInt(gcalBtn.dataset.deadlineId, 10));
            const url = datum && generateGoogleCalendarUrl(datum);
            if (url) window.open(url, '_blank', 'noopener');
        }
    });
}


function updateFilterBadge(filterType) {
    const counts = {
        topics:          appState.getSelectedTopics().length,
        submissionTypes: appState.getSelectedSubmissionTypes().length,
        venueTypes:      appState.getSelectedVenueTypes().length,
        archivalTypes:   appState.getSelectedArchivalTypes().length,
    };
    const badge = document.getElementById(`${filterType}Badge`);
    if (!badge) return;
    const count = counts[filterType] || 0;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

function updateAllFilterBadges() {
    ['topics', 'submissionTypes', 'venueTypes', 'archivalTypes'].forEach(updateFilterBadge);
}

function clearFilters() {
    appState.clearAllFilters();
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.filter-checkbox').forEach(cb => { cb.checked = false; });
    updateAllFilterBadges();
    renderDeadlines();
}
