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

## Step 1: Read Reference Files

Read `.claude/references/conferences.txt`. Each line has the format `abbreviation | full_name | base_url`. Parse all three fields for each conference. The base URL is the conference's official website root — use it in Step 4 for direct fetching.

Also read `.claude/references/topics.txt` for the canonical list of topic strings. You will need this when assigning topics to entries.

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

For each conference+year combination:

1. **Try the official site first.** If the conference has a `base_url` in `conferences.txt`, construct the year-specific URL (e.g., append `/{year}/` or replace the year in the domain) and try `WebFetch` on it before falling back to `WebSearch`. Many conference sites follow predictable URL patterns like `https://icwsm.org/2026/` or `https://ic2s2-2026.org/`.

2. **Fall back to web search.** If the direct URL doesn't work, use `WebSearch` with both the abbreviation and full name plus the year, e.g.:
   `"ICWSM 2026 International AAAI Conference on Web and Social Media call for papers deadline"`

- **What to look for**: official CFP page, submission deadlines, submission types, event dates, location, topics, archival status. Focus on deadlines where researchers actively submit work — paper submissions, abstract submissions, workshop/tutorial proposals, and similar opportunities. **Do not include** commitment deadlines, camera-ready deadlines, registration deadlines, or other administrative deadlines that are not submission opportunities.
- **Use `WebFetch`** to visit promising results (official conference sites, WikiCFP, etc.) and extract specific details
- **Pay attention to**:
  - Round-based deadlines (e.g., ICWSM Round 1, Round 2, Round 3) — each round should be a separate entry
  - Multiple tracks (research track, industry track, workshops, tutorials) — each may be a separate entry
  - Abstract vs. full paper deadlines — use the `submission_stage` field (see below) or separate entries depending on the pattern:
    - **Single-track abstract→paper pipeline** (e.g., COLM, AIES): the abstract and full paper are sequential stages of the *same* submission. Use `submission_stage: "Abstract"` and `submission_stage: "Full paper"` on two otherwise-identical entries. The site will group these into a single card automatically.
    - **Multi-track or complex conferences** (e.g., CHI, The Web Conference): each track has its own submission pipeline. Use separate entries with descriptive `name_full` parenthetical suffixes (e.g., `"Research Track: Abstracts Due"`). Do **not** use `submission_stage` for these.
  - **Timezone handling**: Always use the **announced deadline date** as the calendar date in the timestamp, with `T23:59:59Z` as the time. For example, "January 15, 2026 AoE" becomes `"2026-01-15T23:59:59Z"`. Do NOT convert AoE to UTC by adding 12 hours — this shifts the date forward by one day and causes the wrong date to display on the website. The goal is for the displayed date to match what the CFP announces. If a specific non-AoE time is given (e.g., "12:00 noon ET"), convert that to UTC normally.

## Step 4b: Review Entry Patterns

Read `.claude/references/entry-examples.json` for formatting guidance on round-based, multi-track, and abstract+paper patterns. Use these examples to ensure new entries follow established conventions.

## Step 5: Compare Findings with Existing Data

Before proposing new entries, check for near-duplicates: entries with the same conference abbreviation, year, and submission type. If a match exists, propose an **update** rather than a new entry.

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

## Step 8: Validate Changes

After updating `deadlines.json`, verify correctness:
- Read the file back and confirm it is valid JSON (no trailing commas, proper brackets, etc.)
- Check that all new/updated entries contain every required field (`name_display`, `name_full`, `venue_type`, `submission_type`, `event_dates`, `deadline`, `city`, `country`, `archival`, `link`, `topics`, `notes`). If the entry uses the `submission_stage` pattern, also verify that field is present on both the abstract and full paper entries.
- Verify that topic strings in new/updated entries match the canonical list in `.claude/references/topics.txt`. Flag any new topics that were introduced.

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

For conferences with a single-track abstract→paper pipeline, add `submission_stage` to both entries:

```json
{
    "name_display": "COLM 2026",
    "name_full": "Conference on Language Modeling",
    "venue_type": "Conference",
    "submission_type": "Research Papers",
    "submission_stage": "Abstract",
    "event_dates": "October 6-9, 2026",
    "deadline": "2026-03-26T23:59:00Z",
    "city": "San Francisco, CA",
    "country": "USA",
    "archival": "Archival",
    "link": "https://colmweb.org/cfp",
    "topics": ["machine learning", "natural language processing", "ai", "generative ai"],
    "notes": "Abstract submission deadline. ..."
},
{
    "name_display": "COLM 2026",
    "name_full": "Conference on Language Modeling",
    "venue_type": "Conference",
    "submission_type": "Research Papers",
    "submission_stage": "Full paper",
    "event_dates": "October 6-9, 2026",
    "deadline": "2026-03-31T23:59:00Z",
    "city": "San Francisco, CA",
    "country": "USA",
    "archival": "Archival",
    "link": "https://colmweb.org/cfp",
    "topics": ["machine learning", "natural language processing", "ai", "generative ai"],
    "notes": "Full paper deadline. ..."
}
```

### Field guidelines:

- **`name_display`**: Abbreviation + year (e.g., `"CHI 2026"`). For conferences with multiple tracks/rounds, keep the display name the same across entries.
- **`name_full`**: Full conference name + year, with track/round/type info in parentheses (e.g., `"The Web Conference 2026 (Research Track: Papers Due)"`)
- **`venue_type`**: One of `"Conference"`, `"Workshop"`, `"Journal"`, `"Training"`
- **`submission_type`**: e.g., `"Full papers"`, `"Research Papers"`, `"Abstracts"`, `"Applications"`, `"Workshops"`, `"Tutorials"`
- **`submission_stage`** *(optional)*: Only used for single-track abstract→paper pipelines. Set to `"Abstract"` on the abstract deadline entry and `"Full paper"` on the full paper entry. Both entries must have the same `name_display`. Do **not** use this field for multi-track conferences — use `name_full` parentheticals instead. See entry-examples.json for the full pattern.
- **`event_dates`**: Human-readable date range (e.g., `"April 13-17, 2026"`)
- **`deadline`**: ISO 8601 UTC timestamp using the **announced deadline date** with `T23:59:59Z` (e.g., a September 30 deadline becomes `"2025-09-30T23:59:59Z"`). Do not shift AoE dates forward. Use `"Rolling"` or `"N/A"` if no fixed deadline.
- **`city`** and **`country`**: Event location. Use `"Virtual"` / `"N/A"` for online events.
- **`archival`**: `"Archival"` or `"Non-archival"`
- **`link`**: URL to the official CFP or conference page
- **`topics`**: Array of lowercase topic strings relevant to the conference. Read `.claude/references/topics.txt` for the canonical list. Always prefer existing topics from this list. Only introduce a new topic if none of the existing ones fit, and note the addition in the summary.
- **`notes`**: Brief description of submission requirements, review process, page limits, notification dates, or other relevant details

### Consistency rules:

- Match the formatting style of existing entries in `deadlines.json`
- Use canonical topic strings from `.claude/references/topics.txt` rather than inventing new ones
- When a conference has multiple rounds or tracks, create separate entries for each
- For a single-track abstract→paper pipeline, create two entries with the same `name_display` and `name_full`, differing only in `submission_stage`, `deadline`, and `notes`. Do **not** use `name_full` parentheticals for these — the `submission_stage` field is the signal the site uses to group them into one card
- Ensure `deadline` timestamps use `T23:59:59Z` unless a specific time is known
