/**
 * @file js/filters.js
 * @description Filter management utilities for the Deadline Hub application.
 * Handles data filtering and button generation logic.
 */

import { appState } from './state.js';
import { setupFilterButtonEvents, setupToggleEvents } from './events.js';

export function createFilterButtons(datums, fieldName, containerName) {
    const counts = {};
    datums.forEach(datum => {
        const key = fieldName === 'topics' ? null : datum[fieldName];
        if (fieldName === 'topics') {
            datum.topics.forEach(topic => {
                counts[topic] = (counts[topic] || 0) + 1;
            });
        } else {
            counts[key] = (counts[key] || 0) + 1;
        }
    });
    
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    const visible = sorted.slice(0, 10)
        .map(key => `<button class="btn btn-outline-dark btn-sm mx-1 my-1">${key}</button>`)
        .join('');
    const hidden = sorted.slice(10)
        .map(key => `<button class="btn btn-outline-dark btn-sm mx-1 my-1">${key}</button>`)
        .join('');
    
    if (fieldName === 'topics' && hidden) {
        return `
            <div id="topics">
                ${visible}<span id="topicsHidden" style="display:none;"> ${hidden} </span>
            </div>
            <a href="#" id="toggleTopics" class="btn btn-link btn-sm">Show More</a>
        `;
    } else if (hidden) {
        return `
            <div id="${containerName}Visible">${visible}</div>
            <div id="${containerName}Hidden" style="display:none;">${hidden}</div>
            <a href="#" id="toggle${containerName.charAt(0).toUpperCase() + containerName.slice(1)}" class="btn btn-link btn-sm">Show More</a>
        `;
    }
    
    return visible;
}

export function renderFilterButtons(containerName, fieldName, toggleName) {
    try {
        const container = document.getElementById(`${containerName}Container`);
        const datums = appState.getDeadlines();
        
        container.innerHTML = createFilterButtons(datums, fieldName, containerName);
        
        if (toggleName) {
            setupToggleEvents(`toggle${toggleName}`, `${containerName}Hidden`);
        }
        
        setupFilterButtonEvents(container, containerName);
    } catch (error) {
        console.error(`Error rendering ${containerName} buttons:`, error);
    }
}

export function filterDeadlines() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const showPastConferences = document.getElementById('showPastConferencesSwitch').checked;
    const selectedTopics = appState.getSelectedTopics();
    const selectedSubmissionTypes = appState.getSelectedSubmissionTypes();
    const selectedVenueTypes = appState.getSelectedVenueTypes();
    const selectedArchivalTypes = appState.getSelectedArchivalTypes();
    
    return appState.getDeadlines().filter(datum => {
        const deadlineStr = typeof datum.deadline === 'string' ? datum.deadline.toLowerCase() : "";
        const deadlineDate = (deadlineStr === "rolling" || deadlineStr === "n/a") ? null : new Date(datum.deadline);
        const isPast = deadlineDate ? deadlineDate < new Date() : false;
        
        if (!showPastConferences && isPast) return false;
        if (searchInput && !Object.values(datum).some(value => value.toString().toLowerCase().includes(searchInput))) return false;
        if (selectedTopics.length > 0 && !selectedTopics.some(topic => datum.topics.includes(topic))) return false;
        if (selectedSubmissionTypes.length > 0 && !selectedSubmissionTypes.includes(datum.submission_type)) return false;
        if (selectedVenueTypes.length > 0 && !selectedVenueTypes.includes(datum.venue_type)) return false;
        if (selectedArchivalTypes.length > 0 && !selectedArchivalTypes.includes(datum.archival)) return false;
        
        return true;
    });
}

export function sortDeadlines(deadlines) {
    const getDeadlineNumeric = (datum) => {
        const lower = datum.deadline.toLowerCase();
        return (lower === "rolling" || lower === "n/a") ? Infinity : new Date(datum.deadline).getTime();
    };
    
    return deadlines.sort((a, b) => getDeadlineNumeric(a) - getDeadlineNumeric(b));
}