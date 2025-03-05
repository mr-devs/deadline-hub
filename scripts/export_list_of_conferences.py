"""
Purpose: Read all deadlines from a JSON file, extract unique full conference names, and export them
    as a newline delimited text file.

Inputs: JSON file at ../data/deadlines.json

Outputs: Text file at ../data/conference_names.txt with one conference name per line.

Author: Matthew DeVerna
"""

import json
import os

# Define file paths
DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data"
)
INPUT_FILE = os.path.join(DATA_DIR, "deadlines.json")
OUTPUT_FILE = os.path.join(DATA_DIR, "conference_names.txt")


def load_deadlines(filepath):
    # Load deadlines JSON data
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def extract_unique_conferences(deadlines):
    # Extract unique name_full entries from deadlines
    conferences = {
        entry.get("name_full") for entry in deadlines if "name_full" in entry
    }
    return list(conferences)


def write_conferences_to_file(conference_list, filepath):
    # Write the list of conference names to a file, one per line
    with open(filepath, "w", encoding="utf-8") as f:
        for name in conference_list:
            f.write(f"{name}\n")


def main():
    # Load deadlines and process conference names then export to a file
    deadlines = load_deadlines(INPUT_FILE)
    unique_conferences = extract_unique_conferences(deadlines)
    write_conferences_to_file(unique_conferences, OUTPUT_FILE)
    print(
        f"Export completed. {len(unique_conferences)} "
        f"unique conference names written to {OUTPUT_FILE}."
    )


if __name__ == "__main__":
    main()
