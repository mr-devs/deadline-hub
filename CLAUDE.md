# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Deadline Hub is a client-side web application that tracks academic deadlines for conferences, journals, and workshops. It uses vanilla JavaScript with ES6 modules and Bootstrap for styling, with all data stored in `data/deadlines.json`.

## Architecture

The application follows a modular JavaScript architecture:

- **`js/script.js`**: Main application logic, data filtering, and UI state management
- **`js/elements.js`**: UI component generation (deadline cards, modals, countdown timers)
- **`js/utils.js`**: Data fetching utilities with error handling
- **`js/calendar.js`**: ICS calendar export functionality
- **`data/deadlines.json`**: Core data store with structured deadline information

## Key Data Structure

Each deadline entry in `deadlines.json` contains:
- `name_display`, `name_full`: Display and full conference names
- `venue_type`: Conference, Workshop, Journal, Training, etc.
- `submission_type`: Full papers, Abstracts, Applications, etc.
- `deadline`: ISO 8601 timestamp or "Rolling"/"N/A"
- `topics`: Array of research topics for filtering
- `archival`: Boolean for archival status
- Location, dates, links, and notes fields

## Development

**No build process required** - this is a static site with direct file serving.

For local development, use a local web server due to CORS restrictions:
```bash
python -m http.server 8000
# or
npx serve .
```

## Data Contributions

Data updates should only modify `data/deadlines.json`. Use the OpenAI GPT tool for consistent formatting: https://chatgpt.com/g/g-67c62a6497d081918a7d0de2d1267137-deadline-hub-data-extractor

## Utility Scripts

- **`scripts/export_list_of_conferences.py`**: Extract unique conference names from JSON data
- **`notebooks/2025-03-24-consolidate.ipynb`**: Data analysis and exploration

## Filtering System

The application supports multi-dimensional filtering:
- Topics (social computing, machine learning, etc.)
- Submission types (Full papers, Abstracts, etc.)
- Venue types (Conference, Workshop, Journal)
- Archival status
- Text search across all fields
- Past/future deadline toggle

## Deployment

The application is hosted as a static site at https://www.matthewdeverna.com/deadline-hub/ and fetches data from GitHub's raw content API.