---
description: Final review of a completed change before deciding it is ready
---

# review-before-finish

Review a completed implementation and help the developer decide whether it is ready.
This workflow is review-only.

## Rules

- Do NOT automatically fix, refactor, or reformat anything.
- Do NOT make large additional changes because they might improve the code.
- Do NOT touch unrelated code.
- Report findings; let the developer decide what to act on.

## Inputs to inspect

1. **Original requirements** — The task description, brief, or plan the change was meant to satisfy.
2. **Current changes** — `git status` and `git diff` (including untracked files).
3. **Repository instructions** — `AGENTS.md` or equivalent rules, conventions, and constraints.
4. **Verification results** — Output of the project's verification command(s) if available. If they were not run, say so rather than assuming they pass.

## Checks

- Missing or partially implemented requirements
- Unintended changes and files changed unnecessarily
- Changes outside the intended area, or to areas declared off-limits
- Scope creep (features or refactors nobody asked for)
- Obvious edge cases (empty, loading, error, boundary states)
- Unnecessary complexity or over-abstraction
- Violations of repository conventions and existing patterns
- Assumptions that still need verification

## Output

Return a concise review with these sections:

### Verdict
One or two sentences: ready, or not ready and why.

### Must-fix
Issues that break requirements, violate constraints, or are likely bugs. For each: what, where (file/line), why it matters.

### Optional improvements
Nice-to-haves that are not required for the change to be acceptable.

### Unverified assumptions
Things that look plausible but were not confirmed.

If a section has nothing to report, write "None". Do not pad the review.
