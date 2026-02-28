/**
 * @file js/list-item.js
 * @description List item element generation for the Deadline Hub application.
 */

import { updateCountdown } from './countdown.js';
import { parseDeadline } from './utils.js';

export function createListItem(item) {
    if (item.isGroup) return createGroupedListRows(item);
    return createSingleListItem(item);
}

function createGroupedListRows(group) {
    const groupModalId = `modal-group-${group.entries[0].id}`;

    const headerRow = `
        <tr class="table-light">
            <td>
                <a href="${group.link}" target="_blank" class="text-decoration-none fw-bold">${group.name_display}</a>
            </td>
            <td>${group.submission_type}</td>
            <td></td>
            <td></td>
            <td>${group.city}, ${group.country}</td>
            <td>${group.event_dates}</td>
            <td>
                <button type="button" class="btn btn-outline-dark btn-sm" data-bs-toggle="modal" data-bs-target="#${groupModalId}">
                    <i class="bi bi-info-circle"></i> More Info
                </button>
            </td>
        </tr>`;

    const subRows = group.entries.map(datum => {
        const { deadlineDate, deadlineFormatted } = parseDeadline(datum, "short");
        const countdownId = `list-countdown-deadline-${datum.id}`;
        const isSpecial = typeof deadlineDate === 'string';

        setTimeout(() => {
            if (!isSpecial) updateCountdown(deadlineDate, countdownId);
        }, 0);

        return `
        <tr>
            <td class="ps-4 text-muted">
                <span class="me-1">&#x2514;</span>${datum.submission_stage}
            </td>
            <td></td>
            <td>${deadlineFormatted}</td>
            <td>
                ${isSpecial
                    ? "<span class='text-info'><i class='bi bi-alarm'></i> N/A</span>"
                    : `<span id="${countdownId}"></span>`}
            </td>
            <td></td>
            <td></td>
            <td></td>
        </tr>`;
    }).join('');

    return headerRow + subRows;
}

function createSingleListItem(datum) {
    const { deadlineDate, deadlineFormatted } = parseDeadline(datum, "short");
    const uniqueId = `deadline-${datum.id}`;
    const countdownId = `list-countdown-${uniqueId}`;
    const isSpecial = typeof deadlineDate === 'string';

    setTimeout(() => {
        if (!isSpecial) updateCountdown(deadlineDate, countdownId);
    }, 0);

    return `
        <tr>
            <td>
                <a href="${datum.link}" target="_blank" class="text-decoration-none fw-bold">${datum.name_display}</a>
            </td>
            <td>${datum.submission_type}</td>
            <td>${deadlineFormatted}</td>
            <td>
                ${isSpecial
                    ? "<span class='text-info'><i class='bi bi-alarm'></i> N/A</span>"
                    : `<span id="${countdownId}"></span>`}
            </td>
            <td>${datum.city}, ${datum.country}</td>
            <td>${datum.event_dates}</td>
            <td>
                <button type="button" class="btn btn-outline-dark btn-sm" data-bs-toggle="modal" data-bs-target="#modal-${uniqueId}">
                    <i class="bi bi-info-circle"></i> More Info
                </button>
            </td>
        </tr>`;
}
