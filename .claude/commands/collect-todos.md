---
name: collect-todos
description: Scan the codebase for TODO comments and aggregate new ones into docs/TODO.md. Skips TODOs already tracked in the file.
argument-hint: [path] (optional: scope scan to a specific directory or file)
---

Scan the codebase for TODO comments and add any untracked ones to `docs/TODO.md`.

## Scan Target

Scan path: `$ARGUMENTS` (if empty, scan the entire repo from `/workspaces/coreframe`)

## Step 1: Find all TODO comments

Use Grep to find all TODO comments in source files. Search for the pattern `TODO` across `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.sh`, `.css`, `.scss`, and `.graphql` files. Exclude `node_modules`, `dist`, `.git`, `.next`, `build`, and `coverage` directories.

For each match, capture: file path, line number, and the full line content.

## Step 2: Read the existing TODO file

Read `docs/TODO.md` if it exists. If it doesn't exist, treat it as empty.

## Step 3: Identify untracked TODOs

A TODO is considered **already tracked** if the normalized TODO message (stripped of `TODO:`, `TODO`, whitespace, comment markers like `//`, `#`, `*`) already appears verbatim somewhere in `docs/TODO.md`.

Filter out already-tracked TODOs. If all TODOs are already tracked, report that and stop — do not modify the file.

## Step 4: Update docs/TODO.md

For each untracked TODO, extract a clean description by:

- Stripping comment markers (`//`, `#`, `/*`, `*`)
- Stripping the `TODO` keyword and any trailing `:` or `-`
- Trimming whitespace

Append new TODOs to `docs/TODO.md` under a `## Uncategorized` section (create the section if missing). Use this format for each entry:

```
- [ ] {clean description} (`{relative/file/path}:{line}`)
```

Use relative paths from the repo root (strip the `/workspaces/coreframe/` prefix).

If `docs/TODO.md` does not exist, create it with this header first:

```markdown
# TODO

> Auto-generated from code comments. Run `/collect-todos` to update.
> Check off items as they are resolved and remove the line when done.

## Uncategorized
```

## Step 5: Report results

After writing the file, output a short summary:

- How many new TODOs were added
- How many were already tracked (skipped)
- The file path updated
