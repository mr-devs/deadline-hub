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
        `UID:${Date.now()}@deadline-hub`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
        `DTSTART;VALUE=DATE:${dtStart}`,
        `SUMMARY:${datum.name_display}`,
        `DESCRIPTION:${description}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");
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
// Expose the function globally.
window.downloadICS = downloadICS;
