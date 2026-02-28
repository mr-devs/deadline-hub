/**
 * @file js/modal.js
 * @description Modal element generation for the Deadline Hub application.
 */

import { updateCountdownSecond } from './countdown.js';
import { parseDeadline } from './utils.js';

export function createModal(item) {
    if (item.isGroup) return createGroupedModal(item);
    return createSingleModal(item);
}

function createGroupedModal(group) {
    const modalId = `modal-group-${group.entries[0].id}`;

    const stagesHtml = group.entries.map(datum => {
        const { deadlineDate, deadlineFormatted } = parseDeadline(datum, "long");
        const countdownId = `modal-countdown-deadline-${datum.id}`;
        const isSpecial = typeof deadlineDate === 'string';

        setTimeout(() => {
            if (!isSpecial) updateCountdownSecond(deadlineDate, countdownId);
        }, 0);

        return `
            <div class="mt-3 ps-3 border-start border-2">
                <div class="fw-semibold">${datum.submission_stage} deadline</div>
                <div><i class="bi bi-calendar-x me-1"></i>${deadlineFormatted}</div>
                <div class="mt-1">
                    ${isSpecial
                        ? "<span class='text-danger'><i class='bi bi-alarm'></i> Deadline Not Available</span>"
                        : `<span id="${countdownId}"></span>`}
                </div>
                ${datum.notes ? `<div class="mt-1 text-muted small">${datum.notes}</div>` : ''}
                ${!isSpecial ? `
                <div class="mt-2">
                    <div class="dropup">
                        <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Add to Calendar
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
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title" id="${modalId}Label">
                            <a href="${group.link}" target="_blank">${group.name_display}</a>
                        </h4>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div>
                            <p>
                                <i class="bi bi-building me-1"></i><strong>Venue</strong><br>
                                ${group.entries[0].name_full}
                            </p>
                            <p>
                                <i class="bi bi-layers me-1"></i><strong>Submission Type</strong><br>
                                ${group.submission_type}
                            </p>
                            <p>
                                <i class="bi bi-archive me-1"></i><strong>Archival?</strong><br>
                                ${group.archival}
                            </p>
                            <p>
                                <i class="bi bi-geo me-1"></i><strong>Location</strong><br>
                                ${group.city}, ${group.country}
                            </p>
                            <p>
                                <i class="bi bi-calendar me-1"></i><strong>Conference Dates</strong><br>
                                ${group.event_dates}
                            </p>
                        </div>
                        <div>
                            <p><i class="bi bi-calendar-check me-1"></i><strong>Submission Stages</strong></p>
                            ${stagesHtml}
                        </div>
                        <div class="d-flex flex-wrap gap-2 mt-3">
                            ${group.topics.map(topic => `<span class="badge bg-dark">${topic}</span>`).join(" ")}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <a href="${group.link}" target="_blank" class="btn btn-secondary btn-sm">Visit Website</a>
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>`;
}

function createSingleModal(datum) {
    const { deadlineDate, deadlineFormatted } = parseDeadline(datum, "long");
    const uniqueId = `deadline-${datum.id}`;
    const countdownId = `modal-countdown-${uniqueId}`;
    const modalId = `modal-${uniqueId}`;
    const isSpecial = typeof deadlineDate === 'string';

    setTimeout(() => {
        if (!isSpecial) updateCountdownSecond(deadlineDate, countdownId);
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
                                ${isSpecial
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
                        ${!isSpecial ? `
                        <div class="dropup">
                            <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Add to Calendar
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
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>`;
}
