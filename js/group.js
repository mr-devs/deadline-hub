/**
 * @file js/group.js
 * @description Groups multi-stage deadline entries (those sharing name_display and
 * having a submission_stage field) into a single group object for unified rendering.
 */

/**
 * Takes a filtered+sorted flat array of deadline entries and returns a render list
 * where entries with `submission_stage` that share both `name_display` and
 * `submission_type` are collapsed into group objects.
 *
 * Group object shape:
 * {
 *   isGroup: true,
 *   name_display, link, venue_type, submission_type,
 *   archival, city, country, event_dates, topics,   // shared from first entry
 *   entries: [datum1, datum2, ...]                   // sorted by deadline (inherits sort order)
 * }
 *
 * If a group ends up with only 1 entry (e.g. one stage filtered out), the single
 * entry is returned as a plain datum instead.
 *
 * @param {Array} deadlines - Filtered and sorted flat array of deadline objects.
 * @returns {Array} Render list mixing plain datums and group objects.
 */
export function groupDeadlines(deadlines) {
    const renderList = [];
    const groupMap = new Map(); // `${name_display}||${submission_type}` -> group object

    for (const datum of deadlines) {
        if (!datum.submission_stage) {
            renderList.push(datum);
            continue;
        }

        const groupKey = `${datum.name_display}||${datum.submission_type}`;

        if (groupMap.has(groupKey)) {
            // Append to existing group
            groupMap.get(groupKey).entries.push(datum);
        } else {
            // Create a new group at this position
            const group = {
                isGroup: true,
                name_display: datum.name_display,
                name_full: datum.name_full.replace(/\s*\([^)]+\)\s*$/, '').trim(),
                link: datum.link,
                venue_type: datum.venue_type,
                submission_type: datum.submission_type,
                archival: datum.archival,
                city: datum.city,
                country: datum.country,
                event_dates: datum.event_dates,
                topics: datum.topics,
                entries: [datum],
            };
            groupMap.set(groupKey, group);
            renderList.push(group);
        }
    }

    // Unwrap any group that ended up with only 1 entry
    return renderList.map(item => {
        if (item.isGroup && item.entries.length === 1) {
            return item.entries[0];
        }
        return item;
    });
}
