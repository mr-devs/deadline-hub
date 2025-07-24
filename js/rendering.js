/**
 * @file js/rendering.js
 * @description Rendering utilities for the Deadline Hub application.
 * Manages DOM rendering for different view modes and UI updates.
 */

import { createCard, createModal, createListItem } from './elements.js';
import { renderFilterButtons, filterDeadlines, sortDeadlines } from './filters.js';

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

        reinitializeTooltips();
    } catch (error) {
        console.error('Error rendering deadlines:', error);
    }
}

function renderCardView(filteredDeadlines) {
    const cardsContainer = document.getElementById('cardsContainer');
    const listContainer = document.getElementById('listContainer');
    
    cardsContainer.style.display = 'flex';
    listContainer.style.display = 'none';
    cardsContainer.innerHTML = '';

    filteredDeadlines.forEach(datum => {
        const cardHTML = createCard(datum);
        cardsContainer.innerHTML += cardHTML;
    });

    renderModals(filteredDeadlines);
}

function renderListView(filteredDeadlines) {
    const cardsContainer = document.getElementById('cardsContainer');
    const listContainer = document.getElementById('listContainer');
    const listTableBody = document.getElementById('listTableBody');
    
    cardsContainer.style.display = 'none';
    listContainer.style.display = 'block';
    listTableBody.innerHTML = '';

    filteredDeadlines.forEach(datum => {
        const listItemHTML = createListItem(datum);
        listTableBody.innerHTML += listItemHTML;
    });

    renderModals(filteredDeadlines);
}

function renderModals(filteredDeadlines) {
    const modalsContainer = document.getElementById('modalsContainer');
    
    modalsContainer.innerHTML = '';

    filteredDeadlines.forEach(datum => {
        const modalHTML = createModal(datum);
        modalsContainer.innerHTML += modalHTML;
    });

    const tooltipTriggerList = modalsContainer.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function reinitializeTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

export function renderAllFilterButtons() {
    renderFilterButtons('topics', 'topics', 'Topics');
    renderFilterButtons('submissionTypes', 'submission_type', 'SubmissionTypes');
    renderFilterButtons('venueTypes', 'venue_type', 'VenueTypes');
    renderFilterButtons('archivalTypes', 'archival', 'ArchivalTypes');
}