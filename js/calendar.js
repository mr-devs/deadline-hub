/**
 * Generates an ICS string based on the provided datum.
 * Uses the deadline date (excluding time) as the event date.
 */
export function generateICS(datum) {
    // Only generate ICS if deadline is a valid date
    const lower = typeof datum.deadline === 'string' ? datum.deadline.toLowerCase() : "";
    if (lower === "rolling" || lower === "n/a") {
        return null;
    }
    const deadlineDate = new Date(datum.deadline);
    // Format date as YYYYMMDD (ICS all-day event format)
    const pad = num => num.toString().padStart(2, '0');
    const year = deadlineDate.getUTCFullYear();
    const month = pad(deadlineDate.getUTCMonth() + 1);
    const day = pad(deadlineDate.getUTCDate());
    const dtStart = `${year}${month}${day}`;

    // Build description with modal details (excluding Time Remaining)
    const description = [
        `Full Name: ${datum.name_full}`,
        `Submission Type: ${datum.submission_type}`,
        `Venue: ${datum.venue_type}`,
        `Archival: ${datum.archival}`,
        `Location: ${datum.city}, ${datum.country}`,
        `Event Dates: ${datum.event_dates}`,
        `Notes: ${datum.notes}`
    ].join("\\n\\n");

    // Create the ICS content (all-day event)
    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `UID:${datum.id}-${Date.now()}@deadline-hub`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
        `DTSTART;VALUE=DATE:${dtStart}`,
        `SUMMARY:${datum.name_display}`,
        `DESCRIPTION:${description}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");
}

/**
 * Generates a Google Calendar "Add Event" URL for the given datum.
 * Returns null for rolling/n/a deadlines.
 */
export function generateGoogleCalendarUrl(datum) {
    const lower = typeof datum.deadline === 'string' ? datum.deadline.toLowerCase() : "";
    if (lower === "rolling" || lower === "n/a") return null;

    const deadlineDate = new Date(datum.deadline);
    const pad = num => num.toString().padStart(2, '0');
    const fmt = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;

    // Google Calendar all-day events need DTEND = day after DTSTART
    const endDate = new Date(deadlineDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const details = [
        `Full Name: ${datum.name_full}`,
        `Submission Type: ${datum.submission_type}`,
        `Venue: ${datum.venue_type}`,
        `Archival: ${datum.archival}`,
        `Event Dates: ${datum.event_dates}`,
        `Notes: ${datum.notes}`
    ].join('\n\n');

    const params = new URLSearchParams({
        action:   'TEMPLATE',
        text:     datum.name_display,
        dates:    `${fmt(deadlineDate)}/${fmt(endDate)}`,
        details:  details,
        location: `${datum.city}, ${datum.country}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Creates a Blob from the ICS content and triggers a download.
 */
export function downloadICS(datum) {
    const icsContent = generateICS(datum);
    if (!icsContent) {
        alert("No valid deadline date available for ICS export.");
        return;
    }
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    // Use a sanitized version of the deadline name for the filename
    a.download = `${datum.name_display.replace(/[\s,&/]+/g, '-')}-deadline.ics`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
