export async function fetchData(jsonFilePath) {
    const response = await fetch(jsonFilePath);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
}

/**
 * Parses a datum's deadline string into a Date (or the original string for
 * special values like "Rolling" / "N/A") and a pre-formatted display string.
 *
 * @param {Object} datum - A deadline data object.
 * @param {"long"|"short"} [monthFormat="long"] - Month format for toLocaleDateString.
 * @returns {{ deadlineDate: Date|string, deadlineFormatted: string }}
 */
export function parseDeadline(datum, monthFormat = "long") {
    const deadlineStr = datum.deadline.toLowerCase();
    const isSpecial = deadlineStr === "rolling" || deadlineStr === "n/a";
    const deadlineDate = isSpecial ? datum.deadline : new Date(datum.deadline);
    const deadlineFormatted = isSpecial
        ? datum.deadline
        : deadlineDate.toLocaleDateString("en-US", {
            month: monthFormat, day: "numeric", year: "numeric", timeZone: "UTC"
          });
    return { deadlineDate, deadlineFormatted };
}