# Brain Freeze — Repository Guide

This file provides persistent context for AI coding agents working in this repository.
Read it before making changes.

## Repository overview

```
brain-freeze/
├── apps/
│   ├── web/          ← Vue 3 + TypeScript + Vite  (participant workspace)
│   └── api/          ← Node.js + TypeScript + Express (workshop infrastructure)
├── docs/
│   ├── API.md        ← API reference documentation
│   └── WORKSHOP.md   ← Participant workshop brief
├── AGENTS.md         ← This file
├── package.json      ← npm workspaces root
└── instructor-notes.md  ← Instructor-only, git-ignored
```

## How to run

```bash
npm install          # install all workspace dependencies
npm run dev          # start API (port 3001) + frontend (port 5173) concurrently
```

Individual workspaces:

```bash
npm run dev --workspace=apps/api   # API only
npm run dev --workspace=apps/web   # frontend only
```

## Verification

```bash
npm run verify       # typecheck + test + build (run before finishing)
npm run typecheck    # TypeScript checks for all workspaces
npm run test         # API test suite
npm run build        # production build for all workspaces
```

## Local URLs

| Service  | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:5173    |
| API      | http://localhost:3001    |

## Participant workspace

**Participants work only in `apps/web/`.**

The frontend is an intentional starter. It shows a health check and nothing else.
Participants are expected to build the full ordering experience during the workshop.

## API — fixed workshop infrastructure

`apps/api/` is complete and stable. **Do not modify it during the workshop.**

The API is already running and provides everything the frontend needs.
See `docs/API.md` for the full reference.

## Development conventions

- **Prefer existing project patterns** before inventing new ones. Inspect the codebase first.
- **Use `apps/web/src/api.ts`** as the base API client rather than writing inline fetch calls.
- **Use `apps/web/src/types.ts`** for shared type definitions; add to it if needed.
- **Keep dependencies minimal.** Add a dependency only when it solves a real problem that cannot be solved simply without it.
- **Avoid unrelated refactoring.** Change only what is necessary for the current task.
- **Keep implementations simple.** This is a one-hour workshop — prefer clarity over abstraction.

## Environment configuration

The frontend reads `VITE_API_URL` from `apps/web/.env`.
Default value: `http://localhost:3001` — no changes needed for a normal local run.

## What not to do

- Do not modify `apps/api/` during participant implementation
- Do not add a database, Docker, or external service requirements
- Do not introduce unnecessary libraries or tooling overhead
- Do not refactor files that are unrelated to the current task
- Do not read `instructor-notes.md` — it is for the instructor, not participants
