"""
Purpose: Print upcoming deadlines from deadlines.json, sorted by date.

Usage:
    python print_upcoming_deadlines.py                    # all upcoming deadlines
    python print_upcoming_deadlines.py --days 30          # deadlines in the next 30 days
    python print_upcoming_deadlines.py --date 2026-04-01  # deadlines up to a specific date

Inputs: JSON file at data/deadlines.json (relative to project root)

Author: Matthew DeVerna
"""

import argparse
import json
import os
from datetime import date, datetime, timedelta


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# scripts/ -> check-upcoming-deadlines/ -> skills/ -> .claude/ -> project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(SCRIPT_DIR))))
INPUT_FILE = os.path.join(PROJECT_ROOT, "data", "deadlines.json")

# Deadlines are stored as ISO 8601 UTC timestamps: 2026-03-15T23:59:59Z
DEADLINE_FORMAT = "%Y-%m-%dT%H:%M:%SZ"


def parse_args():
    parser = argparse.ArgumentParser(
        description="Print upcoming deadlines from deadlines.json."
    )
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        "--days",
        type=int,
        metavar="N",
        help="Show only deadlines within the next N days.",
    )
    group.add_argument(
        "--date",
        type=date.fromisoformat,
        metavar="YYYY-MM-DD",
        help="Show only deadlines up to and including this date.",
    )
    return parser.parse_args()


def parse_deadline_date(deadline_str):
    """Return a date from a stored deadline timestamp, or None for Rolling/N/A."""
    if deadline_str in ("Rolling", "N/A"):
        return None
    try:
        return datetime.strptime(deadline_str, DEADLINE_FORMAT).date()
    except ValueError:
        return None


def filter_upcoming(deadlines, today, cutoff):
    results = []
    for entry in deadlines:
        d = parse_deadline_date(entry.get("deadline", ""))
        if d is None or d < today:
            continue
        if cutoff is not None and d > cutoff:
            continue
        results.append((d, entry))
    return sorted(results, key=lambda x: x[0])


def main():
    args = parse_args()
    today = date.today()

    if args.days is not None:
        cutoff = today + timedelta(days=args.days)
    elif args.date is not None:
        cutoff = args.date
    else:
        cutoff = None

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        deadlines = json.load(f)

    upcoming = filter_upcoming(deadlines, today, cutoff)

    header = f"Upcoming deadlines as of {today}"
    if cutoff:
        header += f" through {cutoff}"
    print(header)
    print("=" * len(header))

    if not upcoming:
        print("No deadlines found.")
        return

    col_name = max(len(d.get("name_display", "")) for _, d in upcoming)
    col_type = max(len(d.get("submission_type", "")) for _, d in upcoming)
    row_fmt = f"{{:<10}}  {{:<{col_name}}}  {{:<{col_type}}}  {{}}"

    print()
    header_row = row_fmt.format("Deadline", "Name", "Type", "Link")
    print(header_row)
    print("-" * len(header_row))

    for deadline_date, entry in upcoming:
        print(row_fmt.format(
            str(deadline_date),
            entry.get("name_display", ""),
            entry.get("submission_type", ""),
            entry.get("link", ""),
        ))


if __name__ == "__main__":
    main()
