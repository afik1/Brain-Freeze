---
description: Add a small number of focused tests for behavior introduced or changed by the current task
---

# add-tests-for-changed-behavior

Add focused tests that protect the behavior introduced or changed by the current task.
The goal is **not** coverage. The goal is a few high-value tests that prove requirements and observable behavior.

## Rules

- Do NOT try to maximize coverage or test everything.
- Do NOT write tests that merely reproduce the implementation (mirroring internal calls, private state, or exact markup structure).
- Prefer tests that prove requirements: what a user sees or does, and what the business rules guarantee.
- Do NOT add testing libraries if the repository already has suitable test infrastructure.
- Do NOT rewrite working production code just to make it easier to test, unless there is a clear reason — and say what the reason is.
- Do NOT weaken or delete a test just to make it pass.

## Steps

1. **Requirements** — Read the current task requirements (brief, plan, issue, or conversation). Include any requirement changes made since the start.
2. **Changes** — Inspect the current implementation and the git diff.
3. **Changed behavior** — List the user-visible or business behavior that was introduced or changed. Describe it as behavior, not as code.
4. **Existing patterns** — Inspect existing tests: location, naming, helpers, mocking style, and the command that runs them. Follow them. If no test setup exists for the relevant area, report that and use the smallest reasonable setup instead of inventing a large one.
5. **Select cases** — Choose a small number of high-value test cases (a handful, not dozens). Favor:
   - the most important behavior
   - edge cases and error paths that would hurt users if they broke
   - regressions of behavior that must keep working
6. **Propose before writing** — Present the selected cases as a short list, each with the requirement it protects, and wait for the developer's review before implementing when asked to do so.
7. **Implement** — Add the tests. Assert on observable outcomes. Mock only external boundaries (network, time, randomness).
8. **Run** — Run the relevant tests and report the real result.
9. **Handle failures** — Investigate each failure:
   - If it reveals a real bug in the implementation, report it and fix it only if clearly in scope.
   - If the test itself is wrong, fix the test and explain why.
   - Never change expectations only to turn the run green.

## Output

Return a concise summary:

- **Behavior now covered**
- **Edge cases covered**
- **Important behavior still not covered**
- **Test results** — whether all relevant tests pass, and the command used
- **Bugs found** — real implementation issues the tests exposed, if any

A passing suite is evidence only for what it actually checks. State clearly what it does not.
