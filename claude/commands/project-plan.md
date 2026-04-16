---
name: project-plan
description: >
  Generate a structured project plan with ticket-style tasks from a context document.
  Parses Figma URLs from the document and pulls design context. Outputs a prioritized
  plan with individual task tickets to /docs/plan.md or a custom path.
  Trigger phrases include: "project plan", "plan from doc", "generate tickets from spec".
argument-hint: <document-path> [--output <file>]
---

# Project Plan Generator

Transform a context document into a structured, prioritized project plan with ticket-style task breakdowns. Automatically detect and pull Figma design context referenced in the document.

## Input Parsing

Parse `$ARGUMENTS` for:

1. **Document path** — the first argument (required). This is a file path to a spec, PRD, design doc, or any project context document.
2. **Output path** — if `--output <file>` is present, use that path. Otherwise default to `docs/plan.md`.

If `$ARGUMENTS` is empty, ask the user to provide a document path.

## Step 1: Read the Context Document

Read the document at the provided path. If the file does not exist, report the error and stop.

## Step 2: Extract Figma References

Scan the document content for Figma URLs matching these patterns:

- `figma.com/design/...`
- `figma.com/board/...`
- `figma.com/make/...`
- `figma.com/file/...`
- `figma.com/proto/...`

For each Figma URL found:

1. Parse the `fileKey` and `nodeId` from the URL:
   - `figma.com/design/:fileKey/:fileName?node-id=:nodeId` — convert `-` to `:` in nodeId
   - `figma.com/design/:fileKey/branch/:branchKey/:fileName` — use branchKey as fileKey
   - `figma.com/board/:fileKey/:fileName` — FigJam file
2. Call the appropriate Figma MCP tool:
   - For `board` URLs: use `get_figjam`
   - For all others: use `get_design_context` with the extracted fileKey and nodeId
3. Collect the returned design information (component names, layout structure, annotations, screenshots) as supplementary context for task generation.

If no Figma URLs are found, skip this step and proceed.

## Step 3: Analyze and Decompose

Analyze the full context (document + any Figma design context) and decompose the project into:

1. **Functional areas** — group related work (e.g., "Auth", "Dashboard UI", "API Layer", "Data Model")
2. **Individual tasks** — concrete, actionable units of work scoped to 1–3 days per person

When Figma designs are available, create specific UI implementation tasks referencing the design context (component names, layout details, design tokens).

## Step 4: Prioritize

Assign each task a priority using MoSCoW:

| Priority | Label            | Meaning                                    |
| -------- | ---------------- | ------------------------------------------ |
| P1       | Must Have        | Required for a working, releasable product |
| P2       | Should Have      | High value, not strictly blocking          |
| P3       | Could Have       | Nice to have if time allows                |
| P4       | Won't Have (now) | Deferred to a future phase or cut          |

Order tasks within each priority by dependency (tasks that unblock others come first).

## Step 5: Write the Plan

Write the output file using the format below. Create parent directories if needed.

```markdown
# Project Plan: [Project Name]

**Generated:** [YYYY-MM-DD]
**Source:** [document path]

---

## Overview

[2–4 sentence summary: what is being built, who it is for, definition of done.]

---

## Figma References

[List each Figma URL found with a one-line description of what it covers. Omit this section if no Figma URLs were found.]

---

## Task Tickets

### TICKET-001: [Task Title]

- **Priority:** P1 — Must Have
- **Area:** [Functional area]
- **Depends on:** [TICKET-XXX or "None"]
- **Description:** [2–4 sentences describing what needs to be done and why.]
- **Acceptance criteria:**
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]
- **Figma:** [URL or "N/A"]
- **Notes:** [Any relevant context, edge cases, or design details. Omit if none.]

---

[Repeat for each task...]

---

## Priority Summary

### P1 — Must Have
- [ ] TICKET-XXX: [Title]

### P2 — Should Have
- [ ] TICKET-XXX: [Title]

### P3 — Could Have
- [ ] TICKET-XXX: [Title]

### P4 — Won't Have (now)
- [ ] TICKET-XXX: [Title]

---

## Recommended Order

Start with these tasks:

1. TICKET-XXX: [Title] — [why first]
2. TICKET-XXX: [Title] — [why next]
3. TICKET-XXX: [Title] — [why next]

---

## Open Questions

> [Any ambiguities, missing requirements, or decisions needed.]
```

## Guidelines

- Each ticket should be self-contained — someone reading just that ticket should understand what to do.
- Prefer concrete deliverables over vague process tasks (e.g., "Build login form with email/password fields" over "Work on authentication").
- Surface hidden work: database migrations, environment setup, deployment config, testing.
- When Figma context is available, reference specific component names and design details in the ticket description and acceptance criteria.
- Keep ticket count reasonable — aim for 8–25 tickets depending on project scope. Split large tasks, merge trivially small ones.
- Flag ambiguities or missing requirements in the Open Questions section rather than guessing.
- Use sequential TICKET-001, TICKET-002, etc. numbering.

## Step 6: Report

After writing the file, output a short summary:

- The output file path
- Total number of tickets generated
- Breakdown by priority (e.g., "5 P1, 4 P2, 3 P3, 1 P4")
- Number of Figma references processed (if any)
- Any open questions flagged
