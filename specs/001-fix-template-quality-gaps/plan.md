# Implementation Plan: Template Quality Gaps Fix

**Branch**: `001-fix-template-quality-gaps` | **Date**: 2026-03-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-fix-template-quality-gaps/spec.md`

## Summary

Fix 5 quality gaps identified during the initial constitution review:

1. `SECURITY.md` — replace GitHub boilerplate with real template-aware security policy
2. `CLAUDE.md` — create missing AI coding assistant context file (referenced in README + SETUP)
3. Coverage threshold — raise `jest.config.js` from 50% → 60% lines (constitution minimum)
4. Auth refresh-token tests — extend `auth.e2e.test.ts` with 3+ cases for the untested endpoint
5. ADR-006 — document MongoDB Replica Set requirement; update `docs/ARCHITECTURE.md` index

Research confirmed: CI already runs `npm run test:coverage` (threshold IS enforced);
auth e2e test file exists but lacks `POST /api/v1/auth/refresh-token` coverage.
No new dependencies, no new API endpoints, no schema changes.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 24
**Primary Dependencies**: Jest 30, Supertest, mongodb-memory-server (testing only)
**Storage**: N/A (no schema changes)
**Testing**: Jest 30 + Supertest + `mongodb-memory-server` (in-memory — no external DB)
**Target Platform**: GitHub repository (documentation) + Node.js backend (tests/config)
**Project Type**: Backend web service template
**Performance Goals**: N/A — this is documentation + test additions
**Constraints**: All tests MUST pass with `mongodb-memory-server` (no external DB)
**Scale/Scope**: 5 discrete, independent tasks; total ~250 lines of new content

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| #   | Check                                                                                  | Result                            |
| --- | -------------------------------------------------------------------------------------- | --------------------------------- |
| 1   | Does the feature violate the Routes → Controller → Service → Repository pipeline?      | ✅ NO — no new layers             |
| 2   | Does the feature introduce direct `process.env` access outside `config/env.config.ts`? | ✅ NO                             |
| 3   | Are all new endpoints secured?                                                         | ✅ N/A — no new endpoints         |
| 4   | Will new business logic have unit + integration tests?                                 | ✅ Auth refresh-token tests added |
| 5   | Are new endpoints registered in `*.doc.ts`?                                            | ✅ N/A — no new endpoints         |
| 6   | Does the feature use `console.log`/`console.error`?                                    | ✅ NO — test code only            |
| 7   | Does the feature change a locked tech-stack dependency without ADR?                    | ✅ NO — threshold config only     |
| 8   | New API modules via Plop?                                                              | ✅ N/A — no new API modules       |

**Gate result: PASS** — no violations, proceed to implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-template-quality-gaps/
├── spec.md              ✅ Feature specification
├── plan.md              ✅ This file
├── research.md          ✅ Phase 0 research
├── data-model.md        ✅ File artifacts description
├── quickstart.md        ✅ Validation guide
├── checklists/
│   └── requirements.md  ✅ Spec quality checklist
└── tasks.md             (Phase 2 — /speckit.tasks command)
```

### Source Code (files being modified/created)

```text
# Root-level docs (new/modified)
SECURITY.md                                         ← UPDATE (replace boilerplate)
CLAUDE.md                                           ← CREATE (new file)
docs/
├── adr/
│   └── 006-mongodb-replica-set.md                 ← CREATE (new ADR)
└── ARCHITECTURE.md                                 ← UPDATE (add ADR-006 to table)

# Backend config (modification only)
backend/
└── jest.config.js                                  ← UPDATE (raise coverage threshold)

# Backend tests (extension of existing file)
backend/src/__tests__/api/auth/
└── auth.e2e.test.ts                                ← UPDATE (add refresh-token tests)
```

**Structure Decision**: No new directories needed. All changes are targeted modifications
to existing well-placed files or creation of new files in established locations.

## Complexity Tracking

> No Constitution Check violations — this section is intentionally empty.

All changes are straightforward:

- Documentation updates (Markdown) — no code complexity
- Config number adjustment (jest.config.js) — trivial
- Test extension (mirrors existing patterns exactly) — low complexity
- ADR creation (Markdown template) — low complexity

No complexity justification required.
