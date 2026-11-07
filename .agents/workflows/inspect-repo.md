---
description: Understand an unfamiliar repository before planning or implementing anything
---

# inspect-repo

Build an accurate understanding of this repository **before** any planning or implementation.
This workflow is read-only.

## Rules

- Do NOT modify, create, or delete any files.
- Do NOT implement anything.
- Do NOT design an architecture or propose a solution for the requested feature.
- Only report what you actually found. Mark anything uncertain as an assumption.

## Steps

1. **Repository instructions** — Read repository-level instruction files (e.g. `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, any rules or agent config folders).
2. **Structure** — Inspect the top-level layout and key subdirectories. Note package managers, workspaces, and languages/frameworks.
3. **Relevant area** — Identify which application, package, or folder is relevant to the task. Note which areas are off-limits or should not be touched.
4. **Documentation** — Read documentation relevant to the task (API references, design docs, task briefs).
5. **Existing patterns** — Locate existing code related to the task: shared clients, types, utilities, components, naming and style conventions. Prefer reusing these over inventing new ones.
6. **Commands** — Identify how to run, test, typecheck, lint, and build the project, and which command is the final verification step.
7. **Constraints** — List explicit constraints (things not to modify, dependency rules, scope limits, conventions).
8. **Likely files** — List files or folders that will probably need changes, and files that should stay untouched.
9. **Gaps** — List assumptions, ambiguities, or missing information that should be clarified or verified.

## Output

Return a concise summary with these headings:

- **Repository overview**
- **Relevant area**
- **Key documentation**
- **Existing patterns to reuse**
- **Commands** (run / verify)
- **Constraints**
- **Likely files to modify**
- **Assumptions and open questions**

Keep it short and factual. Stop after the summary — planning is a separate step.
