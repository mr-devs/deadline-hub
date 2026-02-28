/**
 * @file js/card.js
 * @description Card element generation for the Deadline Hub application.
 */

import { updateCountdown } from './countdown.js';
import { parseDeadline } from './utils.js';

export function createCard(item) {
    if (item.isGroup) return createGroupedCard(item);
    return createSingleCard(item);
}

function createGroupedCard(group) {
    const groupModalId = `modal-group-${group.entries[0].id}`;

    const stagesHtml = group.entries.map(datum => {
        const { deadlineDate, deadlineFormatted } = parseDeadline(datum, "long");
        const countdownId = `card-countdown-deadline-${datum.id}`;
        const isSpecial = typeof deadlineDate === 'string';

        setTimeout(() => {
            if (!isSpecial) updateCountdown(deadlineDate, countdownId);
        }, 0);

        return `
            <div class="mt-2 ps-2 border-start border-2">
                <div class="fw-semibold text-muted small">${datum.submission_stage} deadline</div>
                <div>
                    <i class="bi bi-calendar-x me-1"></i>${deadlineFormatted}
                </div>
                <div>
                    ${isSpecial
                        ? "<span class='text-danger'><i class='bi bi-alarm'></i> Deadline Not Available</span>"
                        : `<span id="${countdownId}"></span>`}
                </div>
                ${!isSpecial ? `
                <div class="mt-1">
                    <div class="dropdown">
                        <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-calendar-plus"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><button class="dropdown-item ical-download-btn" data-deadline-id="${datum.id}">
                                <i class="bi bi-download me-2"></i>iCal (.ics)
                            </button></li>
                            <li><button class="dropdown-item gcal-btn" data-deadline-id="${datum.id}">
                                <i class="bi bi-google me-2"></i>Google Calendar
                            </button></li>
                        </ul>
                    </div>
                </div>` : ''}
            </div>`;
    }).join('');

    return `
        <div class="col">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title"><i class="bi bi-building me-1" data-bs-toggle="tooltip" data-bs-placement="left" title="${group.entries[0].name_full}"></i><a href="${group.link}" target="_blank">${group.name_display}</a></h5>
                    <p class="card-text">
                        <i class="bi bi-signpost-split" data-bs-toggle="tooltip" data-bs-placement="left" title="Venue type"></i> ${group.venue_type}
                        <br>
                        <i class="bi bi-layers" data-bs-toggle="tooltip" data-bs-placement="left" title="Submission type"></i> ${group.submission_type}
                        <br>
                        <i class="bi bi-archive" data-bs-toggle="tooltip" data-bs-placement="left" title="Archival?"></i> ${group.archival}
                        <br>
                        <i class="bi bi-geo" data-bs-toggle="tooltip" data-bs-placement="left" title="Location"></i> ${group.city}, ${group.country}
                        <br>
                        <i class="bi bi-calendar-week" data-bs-toggle="tooltip" data-bs-placement="left" title="Dates"></i> ${group.event_dates}
                    </p>
                    ${stagesHtml}
                    <div class="d-flex flex-wrap gap-2 mt-3">
                        ${group.topics.map(topic => `<span class="badge bg-dark">${topic}</span>`).join(" ")}
                    </div>
                    <div class="mt-3">
                        <button type="button" class="btn btn-outline-dark btn-sm" data-bs-toggle="modal" data-bs-target="#${groupModalId}">
                            More Info
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
}

function createSingleCard(datum) {
    const { deadlineDate, deadlineFormatted } = parseDeadline(datum, "long");
    const uniqueId = `deadline-${datum.id}`;
    const countdownId = `card-countdown-${uniqueId}`;
    const isSpecial = typeof deadlineDate === 'string';
    const notesText = datum.notes.length > 60 ? datum.notes.substring(0, 60) + '...' : datum.notes;

    setTimeout(() => {
        if (!isSpecial) updateCountdown(deadlineDate, countdownId);
    }, 0);

    return `
        <div class="col">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title"><i class="bi bi-building me-1" data-bs-toggle="tooltip" data-bs-placement="left" title="${datum.name_full}"></i><a href="${datum.link}" target="_blank">${datum.name_display}</a></h5>
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
                        ${isSpecial
                            ? "<span class='text-danger'><i class='bi bi-alarm' data-bs-toggle='tooltip' data-bs-placement='left' title='Time Remaining'></i> Deadline Not Available</span>"
                            : `<span id="${countdownId}"></span>`}
                        <br>
                        <span data-bs-toggle="tooltip" data-bs-placement="left" title="${datum.notes}">
                            <i class="bi bi-stickies me-1"></i>${notesText}
                        </span>
                        <br>
                    </p>
                    <div class="d-flex flex-wrap gap-2">
                        ${datum.topics.map(topic => `<span class="badge bg-dark">${topic}</span>`).join(" ")}
                    </div>
                    <div class="mt-3 d-flex gap-2">
                        <button type="button" class="btn btn-outline-dark btn-sm" data-bs-toggle="modal" data-bs-target="#modal-${uniqueId}">
                            More Info
                        </button>
                        ${!isSpecial ? `
                        <div class="dropdown">
                            <button class="btn btn-outline-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-calendar-plus"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><button class="dropdown-item ical-download-btn" data-deadline-id="${datum.id}">
                                    <i class="bi bi-download me-2"></i>iCal (.ics)
                                </button></li>
                                <li><button class="dropdown-item gcal-btn" data-deadline-id="${datum.id}">
                                    <i class="bi bi-google me-2"></i>Google Calendar
                                </button></li>
                            </ul>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
}
