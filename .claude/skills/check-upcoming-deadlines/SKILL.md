---
name: check-upcoming-deadlines
description: Use when verifying that upcoming deadlines in the Deadline Hub project are accurate. Fetches source webpages and generates a markdown report with evidence and justification for each deadline date.
argument-hint: [--days N | --date YYYY-MM-DD]
disable-model-invocation: true
allowed-tools: Bash(python3 *), Read, WebFetch, Write
---

# Check Upcoming Deadlines

Verify that upcoming deadline dates in `data/deadlines.json` are accurate by fetching their source pages and producing an evidence-backed report.

## Step 1: Identify Deadlines to Verify

Run the helper script to print which deadlines are upcoming. Pass `$ARGUMENTS` through if provided:

```bash
python3 .claude/skills/check-upcoming-deadlines/scripts/print_upcoming_deadlines.py $ARGUMENTS
```

## Step 2: Read Full Deadline Data

Read `data/deadlines.json` and collect the full entries for every deadline printed in Step 1. You need the `deadline`, `link`, `name_display`, `submission_type`, and `submission_stage` (if present) fields for each.

## Step 3: Fetch Source Pages

For each entry, fetch its `link` URL using WebFetch with this prompt:

> "Find any mention of submission deadlines, paper deadlines, abstract deadlines, or due dates on this page. Return the exact text containing dates."

**De-duplicate fetches:** if multiple entries share the same `link`, fetch once and reuse the result.

**Date comparison note:** deadlines are stored as ISO 8601 timestamps (e.g., `2026-03-15T23:59:59Z`). Compare only the date portion (`2026-03-15`) against text found on the page — the time suffix is an internal convention and will not appear on source pages.

Assign one of these statuses per entry:

| Status | Meaning |
|--------|---------|
| ✅ Verified | Source page contains text matching the stored deadline date |
| ⚠️ Unverified | Page was reachable but no matching date text was found |
| ❌ Contradicted | Source page shows a different date for this deadline |
| 🔗 Unreachable | URL could not be fetched |
| 🚫 Wrong Type | Entry is not a researcher submission opportunity (e.g. commitment deadline, camera-ready deadline, registration deadline) — it should not be in the data |

## Step 4: Write Report

Write the report to `reports/deadline-verification-{TODAY}.md` (create the `reports/` directory if needed), then print the path.

### Report format

```markdown
# Deadline Verification Report
Generated: {TODAY}

## Summary

| Status | Count |
|--------|-------|
| ✅ Verified | N |
| ⚠️ Unverified | N |
| ❌ Contradicted | N |
| 🔗 Unreachable | N |
| 🚫 Wrong Type | N |

---

## Deadlines

### {name_display} — {submission_stage if present, otherwise submission_type}

- **Deadline:** {human-readable date, e.g. "March 15, 2026"}
- **Source:** [{link}]({link})
- **Status:** {status badge}

> {exact excerpt from source page, or "No matching date text found." / "Page could not be fetched."}

**Justification:** {One sentence explaining why this status was assigned.}

---
```

Repeat the per-deadline block for every entry, ordered by deadline date ascending.

If any entry is ❌ Contradicted or 🚫 Wrong Type, add this warning immediately after the summary table:

```markdown
> [!WARNING]
> The following deadlines may be incorrect — the source page shows a different date:
> - {name_display} ({submission_type}): stored `{stored date}`, source says `{found date}`

> [!WARNING]
> The following entries should be removed — they are not researcher submission opportunities:
> - {name_display} ({submission_type}): {brief reason, e.g. "commitment deadline"}
```

Omit whichever warning block has no entries.
