# Tasks: Template Quality Gaps Fix

**Input**: Design documents from `specs/001-fix-template-quality-gaps/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Auth refresh-token tests are included per spec requirement (FR-007/FR-008).
All other changes are documentation/config — no additional test tasks required.

**Organization**: Tasks grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Paths are absolute from project root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm branch and working state before any changes.

- [x] T001 Confirm active branch is `001-fix-template-quality-gaps` via `git branch --show-current`
- [x] T002 Confirm all existing tests pass before making changes: run `cd backend && npm test`

**Checkpoint**: Green baseline established — all 5 user stories can now proceed independently.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No shared foundational infrastructure is needed — all 5 user stories are
fully independent of each other and of any shared setup beyond Phase 1.

_(No tasks — proceed directly to user story phases.)_

**Checkpoint**: Foundation ready — all user stories can begin in parallel.

---

## Phase 3: User Story 1 — SECURITY.md Real Content (Priority: P1) 🎯 MVP

**Goal**: Replace GitHub boilerplate in `SECURITY.md` with a meaningful, template-aware
security policy that downstream project owners can adapt.

**Independent Test**: Open `SECURITY.md` and verify: no "Use this section to tell people"
text, real reporting contact method, and version table reflects template status.

### Implementation for User Story 1

- [x] T003 [US1] Replace `SECURITY.md` at project root with real template-aware security policy containing: `## Supported Versions` table (template status note), `## Reporting a Vulnerability` (private advisory channel + 72h acknowledgement / 30d fix timeline), `## Disclosure Policy`, and `## Scope` sections

**Checkpoint**: User Story 1 complete — `SECURITY.md` has real content with no placeholder boilerplate.

---

## Phase 4: User Story 2 — Create CLAUDE.md (Priority: P1) 🎯 MVP

**Goal**: Create `CLAUDE.md` at project root so AI coding assistants receive accurate
project context and broken links in README + SETUP are resolved.

**Independent Test**: Verify `CLAUDE.md` exists, contains Architecture section with
4-layer pipeline, "Patterns to Follow" and "Patterns to Avoid" sections; verify README
link `[CLAUDE.md](CLAUDE.md)` resolves.

### Implementation for User Story 2

- [x] T004 [US2] Create `CLAUDE.md` at project root with the following sections: `## Project Overview` (template purpose + audience), `## Tech Stack` (table mirroring README), `## Architecture` (4-layer pipeline diagram + layer responsibilities table), `## Key Conventions` (path aliases @/, barrel exports, DI via tsyringe @singleton/@inject, Plop scaffolding, Zod validation), `## Patterns to Follow` (Repository extends base Repository<T>, Service injects via @inject, routes use validate() middleware), `## Patterns to Avoid` (direct mongoose in controller, console.log, cross-layer imports, skipping Zod validation), `## Common Tasks` (generate module: `npm run generate`, run tests: `npm test`, seed DB: `npm run seed:dev`, dev server: `npm run dev`)

**Checkpoint**: User Story 2 complete — `CLAUDE.md` exists, README link resolves, AI
assistants receive accurate project context.

---

## Phase 5: User Story 3 — Coverage Threshold ≥ 60% (Priority: P2)

**Goal**: Raise `jest.config.js` coverage threshold to constitution minimum (60% lines)
so the CI test step fails automatically when coverage drops below this level.

**Independent Test**: Run `cd backend && grep -A 6 "coverageThreshold" jest.config.js`
and verify `lines: 60`; run `npm run test:coverage` and confirm it exits with code 0.

### Implementation for User Story 3

- [x] T005 [US3] Update `backend/jest.config.js` `coverageThreshold.global` values: set `branches` from `30` → `40`, `functions` from `35` → `50`, `lines` from `50` → `60`, `statements` from `50` → `60`
- [x] T006 [US3] Run `cd backend && npm run test:coverage` to verify the raised threshold still passes with the current test suite and no tests are broken (depends on T005)

**Checkpoint**: User Story 3 complete — coverage gate enforces constitution minimum
both locally and in CI.

---

## Phase 6: User Story 4 — Auth Refresh-Token Integration Tests (Priority: P2)

**Goal**: Extend `auth.e2e.test.ts` with a `refresh-token` describe block covering
the happy path and two error cases, using the existing in-memory MongoDB test helpers.

**Independent Test**: Run `cd backend && npm test -- --testPathPattern=auth.e2e` and
verify a `POST /api/v1/auth/refresh-token` describe block with ≥ 3 passing tests.

### Implementation for User Story 4

- [x] T007 [US4] Extend `backend/src/__tests__/api/auth/auth.e2e.test.ts` by adding a new `describe('POST /api/v1/auth/refresh-token', ...)` block after the existing logout block, containing these 3 test cases:
  - **Test 1** (happy path): `loginAsAdmin()` → extract `set-cookie` header → POST `/api/v1/auth/refresh-token` with that cookie → expect `200` + `res.body.data.token` defined + new `set-cookie` header present
  - **Test 2** (missing cookie): POST `/api/v1/auth/refresh-token` with no cookie → expect `401`
  - **Test 3** (invalid token): POST `/api/v1/auth/refresh-token` with cookie `refreshToken=invalid-garbage` → expect `401`

  Note: Cookie path in the controller is `path: '/api/v1/auth/refresh-token'`. Use `supertest`'s `.set('Cookie', ...)` to forward cookies from login response. Use `request(app)` (not `authRequest`) since refresh uses cookies, not Authorization header.

- [x] T008 [US4] Run `cd backend && npm test -- --testPathPattern=auth.e2e` to confirm all 3 new tests pass alongside existing login/logout tests (depends on T007)

**Checkpoint**: User Story 4 complete — refresh-token flow is integration-tested,
closing the last major security-critical test gap.

---

## Phase 7: User Story 5 — ADR-006 MongoDB Replica Set (Priority: P3)

**Goal**: Create `docs/adr/006-mongodb-replica-set.md` following the existing ADR
format and update the ADR index table in `docs/ARCHITECTURE.md`.

**Independent Test**: Run `cat docs/adr/006-mongodb-replica-set.md` and verify
Date / Status / Context / Decision / Consequences sections exist; run
`grep "006\|replica" docs/ARCHITECTURE.md` and verify table row is present.

### Implementation for User Story 5

- [x] T009 [P] [US5] Create `docs/adr/006-mongodb-replica-set.md` following the exact same format as `docs/adr/001-argon2-password-hashing.md` (Date / Status / Context / Decision / Consequences), with content:
  - **Date**: 2026-03-10
  - **Status**: Accepted
  - **Context**: MongoDB multi-document ACID transactions require a replica set; even single-node dev environments must run with `--replSet rs0`; the Docker Compose `compose/mongo/Dockerfile` configures this automatically; developers running local MongoDB must add `--replSet rs0` to their startup flags
  - **Decision**: Mandate `replicaSet=rs0` in `DATABASE_URL` for all environments; the Docker Compose setup enables this automatically; local dev guide in `docs/SETUP.md` documents the requirement
  - **Consequences** Positive: ACID transactions available by default; Change streams supported; Negative: Local MongoDB needs manual `--replSet rs0` flag without Docker; adds slight complexity to local-only setups

- [x] T010 [US5] Update `docs/ARCHITECTURE.md` ADR index table (lines 335–341) to add a new row: `| [006](adr/006-mongodb-replica-set.md) | MongoDB Replica Set requirement |` after the ADR-005 row (depends on T009)

**Checkpoint**: User Story 5 complete — MongoDB Replica Set decision is documented
and discoverable from the architecture index.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all user stories.

- [x] T011 [P] Run full quickstart validation from `specs/001-fix-template-quality-gaps/quickstart.md`: verify all 5 checkpoints pass
- [x] T012 [P] Run `cd backend && npm run lint` to confirm no lint issues introduced
- [x] T013 [P] Run `cd backend && npm run test:coverage` for final coverage confirmation (lines ≥ 60%, all tests pass)
- [x] T014 Commit all changes: `git add . && git commit -m "fix: resolve 5 template quality gaps (SECURITY.md, CLAUDE.md, coverage, auth tests, ADR-006)"`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 3 (US1)**: Only depends on Phase 1 – can start after T002 passes
- **Phase 4 (US2)**: Only depends on Phase 1 – can start after T002 passes
- **Phase 5 (US3)**: Only depends on Phase 1 – can start after T002 passes
- **Phase 6 (US4)**: Only depends on Phase 1 – can start after T002 passes
- **Phase 7 (US5)**: Only depends on Phase 1 – can start after T002 passes
- **Phase 8 (Polish)**: Depends on all Phase 3–7 completing

### User Story Dependencies

- **US1 (P1)**: Independent — no dependency on other stories
- **US2 (P1)**: Independent — no dependency on other stories
- **US3 (P2)**: Independent — no dependency on other stories
- **US4 (P2)**: Independent — no dependency on other stories
- **US5 (P3)**: T010 depends on T009 (within-story only)

### Parallel Opportunities

```bash
# After Phase 1 (T001, T002) passes, all US phases can run in parallel:
Task: T003  # US1 - SECURITY.md
Task: T004  # US2 - CLAUDE.md
Task: T005  # US3 - jest.config.js threshold
Task: T007  # US4 - auth.e2e.test.ts refresh-token block
Task: T009  # US5 - ADR-006 file

# Within US5:
T009 → T010  # (sequential — T010 depends on T009)

# Within US3:
T005 → T006  # (sequential — T006 validates T005)

# Within US4:
T007 → T008  # (sequential — T008 validates T007)

# Polish (after all stories complete):
T011, T012, T013  # All run in parallel
T014              # Final commit after T011-T013
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only — highest priority P1)

1. Complete Phase 1 (T001–T002)
2. Complete Phase 3 (T003 — SECURITY.md) ← **5 minutes**
3. Complete Phase 4 (T004 — CLAUDE.md) ← **15 minutes**
4. **STOP and VALIDATE**: Two most visible quality gaps resolved; README links all work

### Full Incremental Delivery

1. T001–T002: Baseline verification
2. T003: SECURITY.md → immediately visible to security scanners
3. T004: CLAUDE.md → AI assistant context available
4. T005–T006: Coverage gate tightened → CI guards regression
5. T007–T008: Auth refresh tests → security gap closed
6. T009–T010: ADR-006 → architectural knowledge preserved
7. T011–T014: Final validation + commit

### Single-Developer Sequence (recommended)

With a single developer, work in priority order:

```
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014
```

Total estimated time: **~90 minutes** (mostly writing time for CLAUDE.md and refresh tests).

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [USN] label maps each task to its user story for traceability
- T002 and T006/T008/T013 are verification tasks — they MUST pass before moving on
- Auth cookie path (`/api/v1/auth/refresh-token`) is critical for T007 — set cookie at correct path in supertest
- T004 (CLAUDE.md) is the highest-effort task — estimated 15–20 min of writing
- All changes are additive or threshold raises — rollback is trivial via `git checkout`
