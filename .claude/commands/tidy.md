---
name: tidy
description: Tidy up code by removing unnecessary comments, abstracting logic into well-named functions, and addressing todo comments.
argument-hint: <file references> (one or many files to tidy)
---

Improve code quality by removing clutter, improving structure, and addressing todos. Process each referenced file through the tidying workflow.

## Step 1: Parse Arguments

- Extract file references from `@ARGUMENTS`.
- If no arguments provided, ask the user to specify one or more files to tidy.
- For each file reference, resolve to an absolute workspace path.

## Step 2: Process Each File

For each file:

### A. Read & Analyze

- Read the file content.
- Identify:
  - Overly simple comments (comments that merely restate the code, e.g., `// increment counter` above `counter++`)
  - Logic that could be abstracted into smaller, well-named functions
  - TODO comments and their context

### B. Remove Overly Simple Comments

- Remove comments that add no value—those that simply describe what the code does without explaining _why_ or _how_ it works.
- Keep comments that:
  - Explain non-obvious decisions or algorithms
  - Document edge cases or gotchas
  - Clarify the purpose of complex expressions
  - Link to external resources or issues

### C. Abstract Logic

- Identify blocks of code (loops, conditionals, calculations) that could be extracted into separate functions.
- Extract them with clear, descriptive names that explain intent.
- Aim for functions ~5-15 lines that do one thing well.
- Update any related comments or docstrings to reflect the abstraction.

### D. Address TODOs

- For each TODO comment:
  - Understand what needs to be done.
  - Either resolve it (if straightforward) or clarify and document it properly.
  - Check if this TODO is referenced in `docs/todo.md`.
  - If referenced, update or remove the entry as appropriate.

### E. Apply Changes

- Write the improved file back to disk.
- Preserve file structure, formatting, and existing logic—only improve clarity and structure.

## Step 4: Summary

Provide a concise summary of changes made to each file:

- Specific comments removed
- Functions abstracted (if any) with their names and purposes
- TODOs resolved or clarified (if any)
- Any files in `docs/todo.md` that were updated

## Notes

- Preserve existing docstrings and type annotations.
- If an abstraction would harm readability (e.g., creating a function for a 2-line helper), skip it.
- For TODO comments tied to larger epics or external issues, treat them as _documentation only_—don't remove them, but clarify their intent.
- If a file has many potential improvements, prioritize by impact: remove simple comments first, then abstract larger logical blocks.
