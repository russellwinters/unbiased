---
name: branch-diff
description: >
  This skill should be used when the user wants to see a git diff between the current branch
  and another branch. Trigger phrases include: "diff against main", "show me the diff",
  "what changed compared to", "diff this branch", "compare branches", "/branch-diff".
---

# Branch Diff

Show the git diff between the current branch and a specified target branch.

## Inputs

- **Target branch** — The branch to diff against (e.g., `main`, `develop`, `origin/main`).
  - If provided as an argument, use it directly.
  - If not provided, ask the user which branch to compare against.

## Workflow

1. Get the current branch name:

   ```bash
   git branch --show-current
   ```

2. Run the three-dot diff to show changes introduced on the current branch since it diverged from the target:

   ```bash
   git diff <target-branch>...HEAD
   ```

   Use three-dot syntax (`...`) so only commits unique to the current branch are shown, not unrelated changes on the target branch.

3. If the diff is empty, check whether the branches are identical or if the target branch doesn't exist:

   ```bash
   git branch -a | grep <target-branch>
   ```

4. Summarize findings after showing the diff:
   - Files changed (count and names)
   - Nature of changes (new files, deletions, modifications)
   - Any notable patterns worth calling out

## Output

Present results as:

1. A one-line header: `Diff: <current-branch> vs <target-branch>`
2. The raw diff output (in a code block if short; summarized by file if large)
3. A brief summary of what changed

If the diff is large (>200 lines), group changes by file and summarize each file's changes rather than dumping the full diff.
