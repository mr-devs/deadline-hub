/**
 * @file js/rendering.js
 * @description Rendering utilities for the Deadline Hub application.
 * Manages DOM rendering for different view modes and UI updates.
 */

import { createCard } from './card.js';
import { createModal } from './modal.js';
import { createListItem } from './list-item.js';
import { renderFilterButtons, filterDeadlines, sortDeadlines, updateFilterCounts } from './filters.js';

export function renderDeadlines() {
    try {
        const listViewElement = document.getElementById('listView');
        const isListView = listViewElement ? listViewElement.checked : false;
        const filteredDeadlines = filterDeadlines();
        const sortedDeadlines = sortDeadlines(filteredDeadlines);

        if (isListView) {
            renderListView(sortedDeadlines);
        } else {
            renderCardView(sortedDeadlines);
        }

        updateFilterCounts(filteredDeadlines);
    } catch (error) {
        console.error('Error rendering deadlines:', error);
    }
}

function renderCardView(deadlines) {
    const cardsContainer = document.getElementById('cardsContainer');
    const listContainer = document.getElementById('listContainer');

    cardsContainer.style.display = 'flex';
    listContainer.style.display = 'none';
    cardsContainer.innerHTML = deadlines.map(d => createCard(d)).join('');
    cardsContainer.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));

    renderModals(deadlines);
}

function renderListView(deadlines) {
    const cardsContainer = document.getElementById('cardsContainer');
    const listContainer = document.getElementById('listContainer');
    const listTableBody = document.getElementById('listTableBody');

    cardsContainer.style.display = 'none';
    listContainer.style.display = 'block';
    listTableBody.innerHTML = deadlines.map(d => createListItem(d)).join('');
    listTableBody.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));

    renderModals(deadlines);
}

function renderModals(deadlines) {
    const modalsContainer = document.getElementById('modalsContainer');
    modalsContainer.innerHTML = deadlines.map(d => createModal(d)).join('');

    modalsContainer.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
}

export function renderAllFilterButtons() {
    renderFilterButtons('topics', 'topics');
    renderFilterButtons('submissionTypes', 'submission_type');
    renderFilterButtons('venueTypes', 'venue_type');
    renderFilterButtons('archivalTypes', 'archival');
}
