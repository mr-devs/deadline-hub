/**
 * @file /Users/mdeverna/Documents/Projects/deadline-hub/js/script.js
 * @description This script dynamically generates card and modal elements for deadlines using data from a JSON file.
 */

import {fetchData} from './utils.js';
import {createCard, createModal, generateTopicButtons} from './elements.js';

let deadlines = [];
let selectedTopics = []; // New global variable to store selected topics

// Fetch deadlines data from JSON file
fetchData('../data/deadlines.json')
    .then(data => {
        deadlines = data;
        renderTopicButtons();
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
 * Renders the deadlines based on the current filters including selected topics.
 */
function renderDeadlines() {
    try {
        const cardsContainer = document.getElementById('deadlinesContainer');
        cardsContainer.innerHTML = '';

        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        const showPastConferences = document.getElementById('showPastConferencesSwitch').checked;
        // Get checkbox states
        const journalSelected = document.getElementById('journalCheckbox').checked;
        const conferenceSelected = document.getElementById('conferenceCheckbox').checked;
        const archivalSelected = document.getElementById('archivalCheckbox').checked;
        const nonArchivalSelected = document.getElementById('nonArchivalCheckbox').checked;

        const filteredDeadlines = deadlines.filter(datum => {
            // Handle deadline values "Rolling", "N/A" or "n/a"
            const deadlineStr = typeof datum.deadline === 'string' ? datum.deadline.toLowerCase() : "";
            const deadlineDate = (deadlineStr === "rolling" || deadlineStr === "n/a") ? null : new Date(datum.deadline);
            const isPast = deadlineDate ? deadlineDate < new Date() : false;
            if (!showPastConferences && isPast) return false;
            if (searchInput && !Object.values(datum).some(value => value.toString().toLowerCase().includes(searchInput))) return false;

            // Venue type filter: apply filtering only if one is selected
            if (journalSelected !== conferenceSelected) {
                if (journalSelected && datum.venue_type !== 'Journal') return false;
                if (conferenceSelected && datum.venue_type !== 'Conference') return false;
            }

            // Archival filter: apply filtering only if one is selected
            if (archivalSelected !== nonArchivalSelected) {
                if (archivalSelected && datum.archival !== 'Yes') return false;
                if (nonArchivalSelected && datum.archival !== 'No') return false;
            }

            // Topics filtering: if topics are selected, a datum must include at least one.
            if (selectedTopics.length > 0 && !selectedTopics.some(topic => datum.topics.includes(topic))) return false;

            return true;
        });

        // Sorting helper: treat "Rolling" and "N/A"/"n/a" as Infinity.
        const getDeadlineNumeric = (datum) => {
            const lower = datum.deadline.toLowerCase();
            return (lower === "rolling" || lower === "n/a") ? Infinity : new Date(datum.deadline).getTime();
        };

        filteredDeadlines.sort((a, b) => getDeadlineNumeric(a) - getDeadlineNumeric(b));

        filteredDeadlines.forEach(datum => {
            const cardHTML = createCard(datum);
            const modalHTML = createModal(datum);
            cardsContainer.innerHTML += cardHTML;
            cardsContainer.innerHTML += modalHTML;
        });

        // Reinitialize tooltips on dynamically added elements
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    } catch (error) {
        console.error('Error rendering deadlines:', error);
    }
}

// Event listeners for filtering
document.getElementById('searchInput').addEventListener('keyup', renderDeadlines);
document.getElementById('showPastConferencesSwitch').addEventListener('change', renderDeadlines);
document.getElementById('journalCheckbox').addEventListener('change', renderDeadlines);
document.getElementById('conferenceCheckbox').addEventListener('change', renderDeadlines);
document.getElementById('archivalCheckbox').addEventListener('change', renderDeadlines);
document.getElementById('nonArchivalCheckbox').addEventListener('change', renderDeadlines);
