---
name: plan-project
description: >
  This skill should be used when the user wants to create a structured project plan
  from a reference document (spec, PRD, design doc, etc.) and/or additional context.
  Produces a goal statement, project outline, general tasklist, and prioritized work breakdown.
  Trigger phrases include: "plan this project", "create a project plan", "help me plan out",
  "build a project plan from this doc", "prioritize this work".
---

# Plan Project

Transform a reference document and additional context into a structured, actionable project plan.

## Inputs

Collect the following before planning:

1. **Reference document** — A spec, PRD, design doc, README, or any document describing the project. May be a file path, pasted content, or URL.
2. **Additional context** (ask if not provided):
   - Team size and composition (solo, small team, cross-functional, etc.)
   - Key constraints (deadline, budget, tech stack, dependencies)
   - Desired scope (MVP only, full build, phased rollout, etc.)
   - Any known risks or blockers

If the reference document is a file, read it before proceeding. If context is missing and would materially affect the plan, ask for it before generating.

## Output Format

Produce a project plan with the following four sections in order:

### 1. Goal

A 2–4 sentence statement that captures:

- What is being built or achieved
- Who it is for and why it matters
- The definition of success

### 2. Outline

A high-level breakdown of the project into phases or functional areas. Each phase should have:

- A short name
- A one-sentence description
- Key deliverables or milestones

Keep to 3–6 phases. Phases should be sequential where possible.

### 3. Tasklist

A flat list of concrete, actionable tasks derived from the outline. Each task should:

- Start with an action verb (e.g., "Implement", "Design", "Configure", "Write", "Review")
- Be scoped to something completable in 1–3 days by one person
- Reference the phase it belongs to

Group tasks under their phase heading.

### 4. Prioritized Work

Reorder and label tasks using the **MoSCoW method**:

| Priority | Label            | Meaning                                    |
| -------- | ---------------- | ------------------------------------------ |
| P1       | Must Have        | Required for a working, releasable product |
| P2       | Should Have      | High value, not strictly blocking          |
| P3       | Could Have       | Nice to have if time allows                |
| P4       | Won't Have (now) | Deferred to a future phase or cut          |

Present as a prioritized flat list with labels. Call out the recommended starting point (the first 3–5 tasks to begin with).

## Planning Guidelines

- Prefer concrete deliverables over process tasks (e.g., "Build auth login page" over "Work on authentication")
- Surface hidden work: infra setup, testing, documentation, deployment, access provisioning
- Flag ambiguities or missing requirements inline using `> Note:` blockquotes
- If the reference document is large (>500 lines), use `references/plan-template.md` as a structural guide
- Keep the plan realistic for the team size and constraints provided
- Do not pad the plan — if scope is small, a short focused plan is correct

## Reference Files

- `references/plan-template.md` — Structural template for the output document; use as a scaffold when producing the final plan
