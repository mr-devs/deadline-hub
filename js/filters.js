/**
 * @file js/filters.js
 * @description Filter management utilities for the Deadline Hub application.
 * Handles data filtering and dropdown checkbox item generation.
 */

import { appState } from './state.js';

export function createFilterButtons(datums, fieldName, containerName) {
    const counts = {};
    datums.forEach(datum => {
        if (fieldName === 'topics') {
            datum.topics.forEach(topic => { counts[topic] = (counts[topic] || 0) + 1; });
        } else {
            const key = datum[fieldName];
            counts[key] = (counts[key] || 0) + 1;
        }
    });
    const sorted = Object.keys(counts).sort((a, b) => a.localeCompare(b));
    return sorted.map(key => `
        <li>
          <label class="dropdown-item d-flex align-items-center gap-2">
            <input type="checkbox" class="form-check-input filter-checkbox"
                   data-filter-type="${containerName}" data-filter-value="${key}">
            <span class="flex-grow-1">${key}</span>
            <span class="filter-count">${counts[key]}</span>
          </label>
        </li>
    `).join('');
}

export function renderFilterButtons(containerName, fieldName) {
    const menu = document.getElementById(`${containerName}DropdownMenu`);
    if (!menu) return;
    const datums = appState.getDeadlines();
    menu.innerHTML = createFilterButtons(datums, fieldName, containerName);
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
        if (searchInput && !Object.values(datum).some(value =>
            (Array.isArray(value) ? value.join(' ') : value.toString()).toLowerCase().includes(searchInput)
        )) return false;
        if (selectedTopics.length > 0 && !selectedTopics.some(topic => datum.topics.includes(topic))) return false;
        if (selectedSubmissionTypes.length > 0 && !selectedSubmissionTypes.includes(datum.submission_type)) return false;
        if (selectedVenueTypes.length > 0 && !selectedVenueTypes.includes(datum.venue_type)) return false;
        if (selectedArchivalTypes.length > 0 && !selectedArchivalTypes.includes(datum.archival)) return false;

        return true;
    });
}

export function updateFilterCounts(filteredDeadlines) {
    const topicCounts = {};
    const submissionCounts = {};
    const venueCounts = {};
    const archivalCounts = {};

    filteredDeadlines.forEach(datum => {
        datum.topics.forEach(topic => {
            topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
        const s = datum.submission_type;
        submissionCounts[s] = (submissionCounts[s] || 0) + 1;
        const v = datum.venue_type;
        venueCounts[v] = (venueCounts[v] || 0) + 1;
        const a = datum.archival;
        archivalCounts[a] = (archivalCounts[a] || 0) + 1;
    });

    const countMap = {
        topics:          topicCounts,
        submissionTypes: submissionCounts,
        venueTypes:      venueCounts,
        archivalTypes:   archivalCounts,
    };

    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
        const filterType = checkbox.dataset.filterType;
        const value = checkbox.dataset.filterValue;
        const countEl = checkbox.closest('label').querySelector('.filter-count');
        if (countEl && countMap[filterType]) {
            countEl.textContent = countMap[filterType][value] || 0;
        }
    });
}

export function sortDeadlines(deadlines) {
    const getDeadlineNumeric = (datum) => {
        const lower = datum.deadline.toLowerCase();
        return (lower === "rolling" || lower === "n/a") ? Infinity : new Date(datum.deadline).getTime();
    };

    return [...deadlines].sort((a, b) => getDeadlineNumeric(a) - getDeadlineNumeric(b));
}
