/**
 * @file js/elements.js
 * @description UI element generation functions for the Deadline Hub application.
 * Creates HTML elements for cards, modals, list items, and countdown timers.
 * 
 * Functions:
 * - updateCountdownSecond(deadlineDate, elementId): Updates detailed countdown timer display
 * - updateCountdown(deadlineDate, elementId): Updates simplified countdown timer display
 * - createCard(datum): Creates deadline card HTML
 * - createModal(datum): Creates modal dialog HTML
 * - createListItem(datum): Creates table row HTML for list view
 */

import { downloadICS } from './calendar.js';

/**
 * Updates the countdown timer every second and displays the full breakdown
 * of months, days, hours, minutes, and seconds—omitting any unit that is zero,
 * except that hours and seconds are always shown.
 *
 * @param {Date} deadlineDate - The deadline date and time.
 * @param {string} elementId - The ID of the HTML element where the countdown will be displayed.
 */
function updateCountdownSecond(deadlineDate, elementId) {
    function update() {
        const el = document.getElementById(elementId);
        if (!el) return; // Exit if element is not in the DOM
        
        // Added check for "rolling" or "n/a" values (case-insensitive)
        if (typeof deadlineDate === 'string' && 
            (deadlineDate.toLowerCase() === "rolling" || deadlineDate.toLowerCase() === "n/a")) {
            el.innerHTML =
                "<span class='text-info'><i class='bi bi-alarm'></i> Deadline Not Available</span>";
            return;
        }
        const now = new Date();
        const timeDiff = deadlineDate - now;
        if (timeDiff <= 0) {
            el.innerHTML =
                "<span class='text-danger'><i class='bi bi-alarm'></i> Deadline Passed</span>";
            return;
        }
        
        // Calculate total seconds remaining
        const totalSeconds = Math.floor(timeDiff / 1000);
        // Assume 30 days per month for this calculation
        const months = Math.floor(totalSeconds / (30 * 24 * 60 * 60));
        const remainderAfterMonths = totalSeconds % (30 * 24 * 60 * 60);
        const days = Math.floor(remainderAfterMonths / (24 * 60 * 60));
        const remainderAfterDays = remainderAfterMonths % (24 * 60 * 60);
        const hours = Math.floor(remainderAfterDays / (60 * 60));
        const remainderAfterHours = remainderAfterDays % (60 * 60);
        const minutes = Math.floor(remainderAfterHours / 60);
        const seconds = remainderAfterHours % 60;
        
        // Define singular/plural labels
        const monthLabel = months === 1 ? 'month' : 'months';
        const dayLabel = days === 1 ? 'day' : 'days';
        const hourLabel = hours === 1 ? 'hour' : 'hours';
        const minuteLabel = minutes === 1 ? 'minute' : 'minutes';
        const secondLabel = seconds === 1 ? 'second' : 'seconds';
        
        // Determine color based on the largest nonzero unit (months > days > otherwise)
        let colorClass = 'text-danger';
        if (months > 0) {
            colorClass = 'text-success';
        } else if (days > 0) {
            colorClass = 'text-warning';
        }
        
        // Build the output string conditionally.
        // Always include hours and seconds.
        const parts = [];
        if (months > 0) {
            parts.push(`${months} ${monthLabel}`);
        }
        if (days > 0) {
            parts.push(`${days} ${dayLabel}`);
        }
        parts.push(`${hours} ${hourLabel}`);
        if (minutes > 0) {
            parts.push(`${minutes} ${minuteLabel}`);
        }
        parts.push(`${seconds} ${secondLabel}`);
        
        const output = `<span class='${colorClass}'><i class="bi bi-alarm"></i> in ${parts.join(' ')}</span>`;
        el.innerHTML = output;

        // Always update every second.
        setTimeout(update, 1000);
    }
    update();
}


/**
 * Updates the countdown timer for a given deadline date and updates the specified HTML element with the remaining time.
 * The countdown updates every second and displays the time in different formats based on the remaining time:
 * - "in Xmo" for months
 * - "in Xd" for days
 * - "in Xh" for hours
 * - "in Xm Xs" for minutes and seconds
 * - "Deadline Passed" when the deadline has passed
 *
 * @param {Date} deadlineDate - The deadline date to count down to.
 * @param {string} elementId - The ID of the HTML element to update with the countdown.
 */
function updateCountdown(deadlineDate, elementId) {
    function update() {
        const el = document.getElementById(elementId);
        if (!el) return; // Exit if element not found
        
        // Added check for "rolling" or "n/a" values (case-insensitive)
        if (typeof deadlineDate === 'string' && 
            (deadlineDate.toLowerCase() === "rolling" || deadlineDate.toLowerCase() === "n/a")) {
            el.innerHTML =
                "<span class='text-info'><i class='bi bi-alarm' data-bs-toggle='tooltip' data-bs-placement='left' title='Deadline Not Available'></i> Deadline Not Available</span>";
            const icon = el.querySelector('[data-bs-toggle="tooltip"]');
            if (icon) new bootstrap.Tooltip(icon);
            return;
        }
        const now = new Date();
        const timeDiff = deadlineDate - now;

        if (timeDiff <= 0) {
            el.innerHTML =
                `<span class='text-danger'><i class="bi bi-alarm" data-bs-toggle="tooltip" data-bs-placement="left" title="Deadline Passed"></i> Deadline Passed</span>`;
            const icon = el.querySelector('[data-bs-toggle="tooltip"]');
            if (icon) new bootstrap.Tooltip(icon);
            return; // Stop further execution
        }

        if (timeDiff >= 1000 * 60 * 60 * 24 * 30) {
            // More than 1 month → Show months
            const months = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30));
            const monthLabel = months === 1 ? 'month' : 'months';
            el.innerHTML =
                `<span class='text-success'><i class="bi bi-alarm" data-bs-toggle="tooltip" data-bs-placement="left" title="Time Remaining"></i> in ${months} ${monthLabel}</span>`;
            const icon = el.querySelector('[data-bs-toggle="tooltip"]');
            if (icon) new bootstrap.Tooltip(icon);
            setTimeout(update, 1000 * 60 * 60 * 24); // Update once per day
            return;
        }

        if (timeDiff >= 1000 * 60 * 60 * 24) {
            // More than 1 day → Show days
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const dayLabel = days === 1 ? 'day' : 'days';
            el.innerHTML =
                `<span class='text-warning'><i class="bi bi-alarm" data-bs-toggle="tooltip" data-bs-placement="left" title="Time Remaining"></i> in ${days} ${dayLabel}</span>`;
            const icon = el.querySelector('[data-bs-toggle="tooltip"]');
            if (icon) new bootstrap.Tooltip(icon);
            setTimeout(update, 1000 * 60 * 60); // Update once per hour
            return;
        }

        if (timeDiff >= 1000 * 60 * 60) {
            // More than 1 hour → Show hours
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const hourLabel = hours === 1 ? 'hour' : 'hours';
            el.innerHTML =
                `<span class='text-danger'><i class="bi bi-alarm" data-bs-toggle="tooltip" data-bs-placement="left" title="Time Remaining"></i> in ${hours} ${hourLabel}</span>`;
            const icon = el.querySelector('[data-bs-toggle="tooltip"]');
            if (icon) new bootstrap.Tooltip(icon);
            setTimeout(update, 1000 * 60); // Update once per minute
            return;
        }

        // Less than 1 hour → Show minutes and seconds
        const minutes = Math.floor(timeDiff / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        const minuteLabel = minutes === 1 ? 'minute' : 'minutes';
        const secondLabel = seconds === 1 ? 'second' : 'seconds';
        el.innerHTML =
            `<span class='text-danger'><i class="bi bi-alarm" data-bs-toggle="tooltip" data-bs-placement="left" title="Time Remaining"></i> in ${minutes} ${minuteLabel} ${seconds} ${secondLabel}</span>`;
        const icon = el.querySelector('[data-bs-toggle="tooltip"]');
        if (icon) new bootstrap.Tooltip(icon);
        setTimeout(update, 1000); // Update every second
    }

    update(); // Run immediately
}

/**
 * Creates an HTML card element for a given datum.
 *
 * @param {Object} datum - The data object containing information for the card.
 * @param {string} datum.deadline - The deadline date or "Rolling".
 * @param {string} datum.name_display - The display name of the event.
 * @param {string} datum.link - The URL link to the event.
 * @param {string} datum.venue_type - The type of venue for the event.
 * @param {string} datum.submission_type - The type of submission for the event.
 * @param {string} datum.archival - Indicates if the event is archival.
 * @param {string} datum.city - The city where the event is held.
 * @param {string} datum.country - The country where the event is held.
 * @param {string} datum.event_dates - The dates of the event.
 * @param {Array<string>} datum.topics - The topics covered by the event.
 * @returns {string} The HTML string representing the card element.
 */
export function createCard(datum) {
    const deadlineStr = datum.deadline.toLowerCase();
    const deadlineDate = (deadlineStr === "rolling" || deadlineStr === "n/a") ? datum.deadline : new Date(datum.deadline);
    const deadlineFormatted = (typeof deadlineDate === 'string')
        ? deadlineDate
        : deadlineDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    
    // Use the new "id" field to create unique identifiers.
    const uniqueId = `deadline-${datum.id}`;
    const countdownId = `card-countdown-${uniqueId}`;

    setTimeout(() => {
        if (typeof deadlineDate !== "string") {
            updateCountdown(deadlineDate, countdownId);
        }
    }, 0);

    return `
        <div class="col">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title"><a href="${datum.link}" target="_blank">${datum.name_display}</a></h5>
                    <p class="card-text">
                        <i class="bi bi-signpost-split" data-bs-toggle="tooltip" data-bs-placement="left" title="Venue type"></i> ${datum.venue_type}
                        <br>
                        <i class="bi bi-layers" data-bs-toggle="tooltip" data-bs-placement="left" title="Submission type"></i> ${datum.submission_type}
                        <br>
                        <i class="bi bi-archive" data-bs-toggle="tooltip" data-bs-placement="left" title="Archival?"></i> ${datum.archival}
                        <br>
                        <i class="bi bi-geo" data-bs-toggle="tooltip" data-bs-placement="left" title="Location"></i> ${datum.city}, ${datum.country}
                        <br>
                        <i class="bi bi-calendar-week" data-bs-toggle="tooltip" data-bs-placement="left" title="Dates"></i> ${datum.event_dates}
                        <br>
                        <i class="bi bi-calendar-x" data-bs-toggle="tooltip" data-bs-placement="left" title="Deadline"></i> ${deadlineFormatted}
                        <br>
                        ${typeof deadlineDate === 'string' 
                            ? "<span class='text-danger'><i class='bi bi-alarm' data-bs-toggle='tooltip' data-bs-placement='left' title='Time Remaining'></i> Deadline Not Available</span>" 
                            : `<span id="${countdownId}"></span>`}
                        <br>
                        <span data-bs-toggle="tooltip" data-bs-placement="left" title="${datum.notes}">
                            <i class="bi bi-stickies me-1"></i>${datum.notes.substring(0, 60)}...
                        </span>
                        <br>
                    </p>
                    <div class="d-flex flex-wrap gap-2">
                        ${datum.topics.map(topic => `<span class="badge bg-dark">${topic}</span>`).join(" ")}
                    </div>
                    <!-- Button container -->
                    <div class="mt-3">
                        <button type="button" class="btn btn-outline-dark btn-sm" data-bs-toggle="modal" data-bs-target="#modal-${uniqueId}">
                            More Info
                        </button>
                        <button type="button" class="btn btn-outline-dark btn-sm" onclick='downloadICS(${JSON.stringify(datum)})'>
                            Add to iCal
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
}

/**
 * Creates a modal HTML string for a given datum.
 *
 * @param {Object} datum - The data object containing information about the event.
 * @param {string} datum.deadline - The deadline date or "Rolling".
 * @param {string} datum.name_display - The display name of the event.
 * @param {string} datum.link - The URL link to the event.
 * @param {string} datum.name_full - The full name of the event.
 * @param {string} datum.submission_type - The type of submission for the event.
 * @param {string} datum.archival - Indicates if the event is archival.
 * @param {string} datum.city - The city where the event is located.
 * @param {string} datum.country - The country where the event is located.
 * @param {string} datum.event_dates - The dates of the event.
 * @param {Array<string>} datum.topics - The topics covered by the event.
 * @returns {string} The HTML string for the modal.
 */
export function createModal(datum) {
    const deadlineStr = datum.deadline.toLowerCase();
    const deadlineDate = (deadlineStr === "rolling" || deadlineStr === "n/a") ? datum.deadline : new Date(datum.deadline);
    const deadlineFormatted = (typeof deadlineDate === 'string')
        ? deadlineDate
        : deadlineDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
    
    // Use the new "id" field to create unique identifiers.
    const uniqueId = `deadline-${datum.id}`;
    const countdownId = `modal-countdown-${uniqueId}`;
    const modalId = `modal-${uniqueId}`;

    setTimeout(() => {
        if (typeof deadlineDate !== "string") {
            updateCountdownSecond(deadlineDate, countdownId);
        }
    }, 0);

    return `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title" id="${modalId}Label">
                            <a href="${datum.link}" target="_blank">${datum.name_display}</a>
                        </h4>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div>
                            <p>
                                <i class="bi bi-building me-1"></i><strong>Venue</strong><br>
                                ${datum.name_full}
                            </p>
                            <p>
                                <i class="bi bi-layers me-1"></i><strong>Submission Type</strong><br>
                                ${datum.submission_type}
                            </p>
                            <p>
                                <i class="bi bi-archive me-1"></i><strong>Archival?</strong><br>
                                ${datum.archival}
                            </p>
                            <p>
                                <i class="bi bi-geo me-1"></i><strong>Location</strong><br>
                                ${datum.city}, ${datum.country}
                            </p>
                            <p>
                                <i class="bi bi-calendar me-1"></i><strong>Dates</strong><br>
                                Submission Deadline: ${deadlineFormatted}<br>
                                Conference Dates: ${datum.event_dates}
                            </p>
                            <p>
                                <i class="bi bi-stickies me-1"></i><strong>Notes</strong><br>
                                ${datum.notes}
                            </p>
                            <p>
                                <i class="bi bi-alarm me-1"></i><strong>Time remaining</strong><br>
                                ${typeof deadlineDate === 'string'
                                    ? "<span class='text-danger'><i class='bi bi-alarm'></i> Deadline Not Available</span>"
                                    : `<span id="${countdownId}"></span>`}
                            </p>
                        </div>
                        <div class="d-flex flex-wrap gap-2">
                            ${datum.topics.map(topic => `<span class="badge bg-dark">${topic}</span>`).join(" ")}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <a href="${datum.link}" target="_blank" class="btn btn-secondary btn-sm">Visit Website</a>
                        <button type="button" class="btn btn-secondary btn-sm" onclick='downloadICS(${JSON.stringify(datum)})'>Add to iCal</button>
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>`;
}



/**
 * Creates a table row for the list view for a given datum.
 *
 * @param {Object} datum - The data object containing information for the list item.
 * @param {string} datum.deadline - The deadline date or "Rolling".
 * @param {string} datum.name_display - The display name of the event.
 * @param {string} datum.link - The URL link to the event.
 * @returns {string} The HTML string representing the table row.
 */
export function createListItem(datum) {
    const deadlineStr = datum.deadline.toLowerCase();
    const deadlineDate = (deadlineStr === "rolling" || deadlineStr === "n/a") ? datum.deadline : new Date(datum.deadline);
    const deadlineFormatted = (typeof deadlineDate === 'string')
        ? deadlineDate
        : deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    
    const uniqueId = `deadline-${datum.id}`;
    const countdownId = `list-countdown-${uniqueId}`;

    setTimeout(() => {
        if (typeof deadlineDate !== "string") {
            updateCountdown(deadlineDate, countdownId);
        }
    }, 0);

    return `
        <tr>
            <td>
                <a href="${datum.link}" target="_blank" class="text-decoration-none fw-bold">${datum.name_display}</a>
            </td>
            <td>${datum.event_dates}</td>
            <td>${datum.city}, ${datum.country}</td>
            <td>${deadlineFormatted}</td>
            <td>
                ${typeof deadlineDate === 'string' 
                    ? "<span class='text-info'><i class='bi bi-alarm'></i> N/A</span>" 
                    : `<span id="${countdownId}"></span>`}
            </td>
            <td>
                <button type="button" class="btn btn-outline-dark btn-sm" data-bs-toggle="modal" data-bs-target="#modal-${uniqueId}">
                    <i class="bi bi-info-circle"></i> More Info
                </button>
            </td>
        </tr>`;
}