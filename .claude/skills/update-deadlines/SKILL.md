---
name: update-deadlines
description: Search for and update conference deadline data in deadlines.json for tracked conferences
argument-hint: [conferences...] [year]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, WebSearch, WebFetch
---

# Update Deadlines Skill

Search the web for current conference CFP/deadline information and update `data/deadlines.json`.

## Arguments

User input: `$ARGUMENTS`

Arguments are optional and flexible. Examples:
- `/update-deadlines` — no arguments, will prompt for everything
- `/update-deadlines CHI 2026` — single conference + year
- `/update-deadlines CHI, ICWSM 2026` — multiple conferences + year
- `/update-deadlines 2027` — all conferences for a specific year
- `/update-deadlines CHI` — single conference, will prompt for year

## Step 1: Read the Conference List

Read `.claude/references/conferences.txt`. Each line has the format `abbreviation | full_name`. Parse both fields for each conference.

## Step 2: Determine Scope

**First, parse `$ARGUMENTS`** to extract any conferences and/or year the user already specified:
- A 4-digit number (e.g., `2026`) is the target year
- Anything else is matched against conference abbreviations from conferences.txt (comma-separated if multiple)
- If an argument doesn't match any known abbreviation, treat it as a new conference — ask the user for its full name, add the entry to `conferences.txt`, then proceed

**Then, prompt only for what's missing.** Use `AskUserQuestion` to ask about:
1. **Which conferences** — only if none were provided in arguments. Present the full list of tracked abbreviations; default is all.
2. **Target year** — only if no year was provided in arguments. Use the current year as the default suggestion.

## Step 3: Check Existing Data

Read `data/deadlines.json` and identify which entries already exist for the selected conference+year combinations. Note their current deadlines, dates, and other fields so you can detect changes later.

## Step 4: Search for Each Conference

For each conference+year combination, use `WebSearch` to find the latest information:

- **Search query**: Use both the abbreviation and full name with the year, e.g.:
  `"ICWSM 2026 International AAAI Conference on Web and Social Media call for papers deadline"`
- **What to look for**: official CFP page, submission deadlines, submission types, event dates, location, topics, archival status
- **Use `WebFetch`** to visit promising results (official conference sites, WikiCFP, etc.) and extract specific details
- **Pay attention to**:
  - Round-based deadlines (e.g., ICWSM Round 1, Round 2, Round 3) — each round should be a separate entry
  - Multiple tracks (research track, industry track, workshops, tutorials) — each may be a separate entry
  - Abstract vs. full paper deadlines — these are often separate entries
  - Timezone information — convert to UTC for the `deadline` field

## Step 5: Compare Findings with Existing Data

For each conference, categorize findings:

- **Already present and up-to-date** → skip (no action needed)
- **Present but needs updating** (e.g., deadline date changed, location updated) → flag as **update**
- **Not present in existing data** → flag as **new entry**

## Step 6: Present Summary to the User

Show a clear summary organized by conference:

For each conference, show:
- What was found (or note if nothing was found)
- Whether entries are **new** or **updates** to existing ones
- The proposed JSON entries, formatted per the schema below

Wait for explicit user approval before making any changes. The user may request modifications to proposed entries.

## Step 7: Update deadlines.json

After user approval:
- Add new entries to the JSON array
- Update changed entries in place
- Preserve all existing entries that don't need changes
- Ensure the file remains valid JSON with consistent formatting

## Schema Reference

Every entry in `data/deadlines.json` must follow this structure:

```json
{
    "name_display": "CHI 2026",
    "name_full": "The ACM Conference on Human Factors in Computing Systems (Research Track: Papers Due)",
    "venue_type": "Conference",
    "submission_type": "Full papers",
    "event_dates": "April 13-17, 2026",
    "deadline": "2025-09-30T23:59:59Z",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "archival": "Archival",
    "link": "https://example.com/cfp",
    "topics": ["human-computer interaction", "social computing"],
    "notes": "Relevant details about the submission process, page limits, review process, etc."
}
```

### Field guidelines:

- **`name_display`**: Abbreviation + year (e.g., `"CHI 2026"`). For conferences with multiple tracks/rounds, keep the display name the same across entries.
- **`name_full`**: Full conference name + year, with track/round/type info in parentheses (e.g., `"The Web Conference 2026 (Research Track: Papers Due)"`)
- **`venue_type`**: One of `"Conference"`, `"Workshop"`, `"Journal"`, `"Training"`
- **`submission_type`**: e.g., `"Full papers"`, `"Research Papers"`, `"Abstracts"`, `"Applications"`, `"Workshops"`, `"Tutorials"`
- **`event_dates`**: Human-readable date range (e.g., `"April 13-17, 2026"`)
- **`deadline`**: ISO 8601 UTC timestamp (e.g., `"2025-09-30T23:59:59Z"`). Use `"Rolling"` or `"N/A"` if no fixed deadline.
- **`city`** and **`country`**: Event location. Use `"Virtual"` / `"N/A"` for online events.
- **`archival`**: `"Archival"` or `"Non-archival"`
- **`link`**: URL to the official CFP or conference page
- **`topics`**: Array of lowercase topic strings relevant to the conference
- **`notes`**: Brief description of submission requirements, review process, page limits, notification dates, or other relevant details

### Consistency rules:

- Match the formatting style of existing entries in `deadlines.json`
- Use existing topic strings when possible (check what's already in the file) rather than inventing new ones
- When a conference has multiple deadlines (abstract + paper, multiple rounds), create separate entries for each
- Ensure `deadline` timestamps use `T23:59:59Z` unless a specific time is known
