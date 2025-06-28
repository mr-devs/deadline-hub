/**
 * @file /Users/mdeverna/Documents/Projects/deadline-hub/js/script.js
 * @description This script dynamically generates card and modal elements for deadlines using data from a JSON file.
 */

import {fetchData} from './utils.js';
import {createCard, createModal, createListItem, generateTopicButtons, generateSubmissionTypeButtons, generateVenueTypeButtons, generateArchivalButtons} from './elements.js';

let deadlines = [];
let selectedTopics = [];
let selectedSubmissionTypes = [];
let selectedVenueTypes = [];
let selectedArchivalTypes = [];

// Fetch deadlines data from JSON file
// fetchData('../data/deadlines.json') // for local testing!
fetchData('https://raw.githubusercontent.com/mr-devs/deadline-hub/refs/heads/main/data/deadlines.json')
    .then(data => {
        // Add an "id" field equal to the index for each record.
        deadlines = data.map((item, index) => ({ ...item, id: index }));
        renderTopicButtons();
        renderSubmissionTypeButtons();
        renderVenueTypeButtons();
        renderArchivalButtons();
        renderDeadlines();
    })
    .catch(error => {
        console.error('Error loading deadlines data:', error);
    });

/**
 * Renders the topic buttons and attaches click event listeners for multi-topic filtering.
 */
function renderTopicButtons() {
    try {
        const topicsContainer = document.getElementById('topicsContainer');
        topicsContainer.innerHTML = generateTopicButtons(deadlines);
        // Toggle hidden topics when clicking the "Show More" link
        const toggleLink = document.getElementById('toggleTopics');
        if (toggleLink) {
            toggleLink.addEventListener('click', (e) => {
                e.preventDefault();
                const hiddenDiv = document.getElementById('topicsHidden');
                if (hiddenDiv.style.display === "none") {
                    hiddenDiv.style.display = "block";
                    toggleLink.textContent = "Show Less";
                } else {
                    hiddenDiv.style.display = "none";
                    toggleLink.textContent = "Show More";
                }
            });
        }
        // Attach click listeners to topic buttons after rendering
        const topicButtons = topicsContainer.querySelectorAll('button');
        topicButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.classList.toggle('active'); // toggles the button's active state
                const topic = button.textContent.trim();
                if (selectedTopics.includes(topic)) {
                    selectedTopics = selectedTopics.filter(t => t !== topic);
                } else {
                    selectedTopics.push(topic);
                }
                renderDeadlines();
            });
        });
    } catch (error) {
        console.error('Error rendering topic buttons:', error);
    }
}

/**
 * Renders the submission type buttons and attaches click event listeners for multi-type filtering.
 */
function renderSubmissionTypeButtons() {
    const container = document.getElementById('submissionTypesContainer');
    container.innerHTML = generateSubmissionTypeButtons(deadlines);
    const toggleLink = document.getElementById('toggleSubmissionTypes');
    if (toggleLink) {
        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            const hiddenDiv = document.getElementById('submissionTypesHidden');
            if (hiddenDiv.style.display === "none") {
                hiddenDiv.style.display = "block";
                toggleLink.textContent = "Show Less";
            } else {
                hiddenDiv.style.display = "none";
                toggleLink.textContent = "Show More";
            }
        });
    }
    container.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const value = btn.textContent.trim();
            if (selectedSubmissionTypes.includes(value)) {
                selectedSubmissionTypes = selectedSubmissionTypes.filter(v => v !== value);
            } else {
                selectedSubmissionTypes.push(value);
            }
            renderDeadlines();
        });
    });
}

/**
 * Renders the venue type buttons and attaches click event listeners for multi-type filtering.
 */
function renderVenueTypeButtons() {
    const container = document.getElementById('venueTypesContainer');
    container.innerHTML = generateVenueTypeButtons(deadlines);
    const toggleLink = document.getElementById('toggleVenueTypes');
    if (toggleLink) {
        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            const hiddenDiv = document.getElementById('venueTypesHidden');
            if (hiddenDiv.style.display === "none") {
                hiddenDiv.style.display = "block";
                toggleLink.textContent = "Show Less";
            } else {
                hiddenDiv.style.display = "none";
                toggleLink.textContent = "Show More";
            }
        });
    }
    container.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const value = btn.textContent.trim();
            if (selectedVenueTypes.includes(value)) {
                selectedVenueTypes = selectedVenueTypes.filter(v => v !== value);
            } else {
                selectedVenueTypes.push(value);
            }
            renderDeadlines();
        });
    });
}

/**
 * Renders the archival type buttons and attaches click event listeners for multi-type filtering.
 */
function renderArchivalButtons() {
    const container = document.getElementById('archivalTypesContainer');
    container.innerHTML = generateArchivalButtons(deadlines);
    const toggleLink = document.getElementById('toggleArchivalTypes');
    if (toggleLink) {
        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            const hiddenDiv = document.getElementById('archivalTypesHidden');
            if (hiddenDiv.style.display === "none") {
                hiddenDiv.style.display = "block";
                toggleLink.textContent = "Show Less";
            } else {
                hiddenDiv.style.display = "none";
                toggleLink.textContent = "Show More";
            }
        });
    }
    container.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const value = btn.textContent.trim();
            if (selectedArchivalTypes.includes(value)) {
                selectedArchivalTypes = selectedArchivalTypes.filter(v => v !== value);
            } else {
                selectedArchivalTypes.push(value);
            }
            renderDeadlines();
        });
    });
}

/**
 * Renders the deadlines based on the current filters including selected topics, submission types, venue types, and archival types.
 */
function renderDeadlines() {
    try {
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        const showPastConferences = document.getElementById('showPastConferencesSwitch').checked;
        const isListView = document.getElementById('listView').checked;

        const filteredDeadlines = deadlines.filter(datum => {
            // Handle deadline values "Rolling", "N/A" or "n/a"
            const deadlineStr = typeof datum.deadline === 'string' ? datum.deadline.toLowerCase() : "";
            const deadlineDate = (deadlineStr === "rolling" || deadlineStr === "n/a") ? null : new Date(datum.deadline);
            const isPast = deadlineDate ? deadlineDate < new Date() : false;
            if (!showPastConferences && isPast) return false;
            if (searchInput && !Object.values(datum).some(value => value.toString().toLowerCase().includes(searchInput))) return false;

            // Topics filtering: if topics are selected, a datum must include at least one.
            if (selectedTopics.length > 0 && !selectedTopics.some(topic => datum.topics.includes(topic))) return false;
            // Submission type filtering: if submission types are selected, a datum must include at least one.
            if (selectedSubmissionTypes.length > 0 && !selectedSubmissionTypes.includes(datum.submission_type)) return false;
            // Venue type filtering: if venue types are selected, a datum must include at least one.
            if (selectedVenueTypes.length > 0 && !selectedVenueTypes.includes(datum.venue_type)) return false;
            // Archival type filtering: if archival types are selected, a datum must include at least one.
            if (selectedArchivalTypes.length > 0 && !selectedArchivalTypes.includes(datum.archival)) return false;

            return true;
        });

        // Sorting helper: treat "Rolling" and "N/A"/"n/a" as Infinity.
        const getDeadlineNumeric = (datum) => {
            const lower = datum.deadline.toLowerCase();
            return (lower === "rolling" || lower === "n/a") ? Infinity : new Date(datum.deadline).getTime();
        };

        filteredDeadlines.sort((a, b) => getDeadlineNumeric(a) - getDeadlineNumeric(b));

        if (isListView) {
            renderListView(filteredDeadlines);
        } else {
            renderCardView(filteredDeadlines);
        }

        // Reinitialize tooltips on dynamically added elements
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    } catch (error) {
        console.error('Error rendering deadlines:', error);
    }
}

/**
 * Renders deadlines in card view format.
 */
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

    // Render modals separately
    renderModals(filteredDeadlines);
}

/**
 * Renders deadlines in list view format.
 */
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

    // Render modals separately
    renderModals(filteredDeadlines);
}

/**
 * Renders all modals in the central modals container
 */
function renderModals(filteredDeadlines) {
    const modalsContainer = document.getElementById('modalsContainer');
    
    // Clear existing modals
    modalsContainer.innerHTML = '';

    // Add all modals
    filteredDeadlines.forEach(datum => {
        const modalHTML = createModal(datum);
        modalsContainer.innerHTML += modalHTML;
    });

    // Re-initialize Bootstrap tooltips for any new modal content
    const tooltipTriggerList = modalsContainer.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

// Add a function to clear all filters
function clearFilters() {
    // Clear filter arrays and search input
    selectedTopics = [];
    selectedSubmissionTypes = [];
    selectedVenueTypes = [];
    selectedArchivalTypes = [];
    document.getElementById('searchInput').value = "";
    
    // Remove active classes from all filter buttons
    document.querySelectorAll('#topicsContainer button.active').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#submissionTypesContainer button.active').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#venueTypesContainer button.active').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#archivalTypesContainer button.active').forEach(btn => btn.classList.remove('active'));

    renderDeadlines();
}

// Add an event listener for the clear filters button
document.addEventListener('DOMContentLoaded', function() {
    const clearBtn = document.getElementById('clearFiltersButton');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }

    // Add event listeners for view toggle
    const cardViewRadio = document.getElementById('cardView');
    const listViewRadio = document.getElementById('listView');
    
    if (cardViewRadio) {
        cardViewRadio.addEventListener('change', renderDeadlines);
    }
    if (listViewRadio) {
        listViewRadio.addEventListener('change', renderDeadlines);
    }
});

// Event listeners for filtering
document.getElementById('searchInput').addEventListener('keyup', renderDeadlines);
document.getElementById('showPastConferencesSwitch').addEventListener('change', renderDeadlines);

