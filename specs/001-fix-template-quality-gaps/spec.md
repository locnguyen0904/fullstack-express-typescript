# Feature Specification: Template Quality Gaps Fix

**Feature Branch**: `001-fix-template-quality-gaps`
**Created**: 2026-03-10
**Status**: Draft
**Input**: User description: "Fix các vấn đề chất lượng trong template: SECURITY.md boilerplate, CLAUDE.md thiếu, thiếu integration tests cho auth flow, coverage threshold chưa enforce trong CI, ADR-006 cho MongoDB Replica Set"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Contributor Finds Security Policy (Priority: P1)

A new contributor (or security researcher) clones the repository and navigates to
`SECURITY.md` to understand how to report a vulnerability. They currently find a
GitHub-generated boilerplate table with fake version numbers (5.1.x, 4.0.x) and
placeholder text that provides no real guidance.

**Why this priority**: Security policy is the first thing external contributors and
automated vulnerability scanners look for. A misleading boilerplate actively undermines
trust in the template as a "production-ready" starting point.

**Independent Test**: Can be fully tested by opening `SECURITY.md` in a browser and
verifying it contains real reporting instructions, an accurate supported-versions table,
and an expected response timeline.

**Acceptance Scenarios**:

1. **Given** a contributor opens `SECURITY.md`, **When** they look for how to report a
   vulnerability, **Then** they find a clear email/contact method and an expected
   response time.
2. **Given** a consumer clones the template for their own project, **When** they read
   `SECURITY.md`, **Then** the version table and reporting instructions serve as a
   meaningful starting template (not generic GitHub boilerplate with fake versions).
3. **Given** the project has no released versions yet, **When** SECURITY.md is read,
   **Then** the document honestly reflects the "template" status with guidance on how
   projects should adapt it.

---

### User Story 2 - AI Coding Assistant Reads CLAUDE.md (Priority: P1)

A developer using an AI coding assistant (Cursor, GitHub Copilot, Antigravity, etc.)
opens the project. The README and SETUP docs reference `CLAUDE.md` for AI-assisted
development guidelines, but the file does not exist — causing a broken link and
confused AI context.

**Why this priority**: `CLAUDE.md` is referenced in 2 documentation files. A missing
file creates broken references and a poor first impression. The constitution mandates
Developer Experience as Principle V.

**Independent Test**: Can be fully tested by verifying `CLAUDE.md` exists at project
root and contains actionable guidance for AI coding assistants (architecture summary,
patterns to follow, patterns to avoid).

**Acceptance Scenarios**:

1. **Given** a developer opens the project with an AI coding assistant, **When** the
   assistant reads `CLAUDE.md`, **Then** it receives a concise summary of the project
   architecture, tech stack, and key conventions to follow.
2. **Given** `README.md` links to `CLAUDE.md`, **When** a contributor clicks the link,
   **Then** they reach a file with actionable content (not a 404).
3. **Given** a contributor is writing a new module, **When** they check `CLAUDE.md`,
   **Then** they find the "patterns to follow" and "patterns to avoid" clearly stated.

---

### User Story 3 - CI Enforces Coverage Threshold (Priority: P2)

A developer submits a PR that inadvertently drops test coverage below the minimum
threshold defined in the constitution (≥60%). Currently CI reports coverage to codecov
but does not fail the build, so the drop goes unnoticed until code review.

**Why this priority**: Without an automated gate, coverage regressions accumulate
silently. The constitution's Principle III (Test Coverage) mandates a ≥60% line
coverage gate.

**Independent Test**: Can be fully tested by adding a single line of untested code that
drops a file's coverage below threshold, pushing a PR, and verifying CI fails with a
coverage error.

**Acceptance Scenarios**:

1. **Given** a PR reduces line coverage below 60%, **When** CI runs the test suite,
   **Then** the coverage step fails and the PR cannot be merged until coverage is
   restored.
2. **Given** a PR maintains or improves coverage, **When** CI runs, **Then** the
   coverage step passes without any changes to the developer's workflow.
3. **Given** a developer runs tests locally with coverage, **When** coverage is below
   threshold, **Then** the command exits with a non-zero code (same behavior as CI).

---

### User Story 4 - Developer Verifies Auth Endpoints Are Tested (Priority: P2)

A developer consuming the template wants to understand how auth flows are tested before
extending them. They look in `backend/src/__tests__/` and find unit tests for services
but no integration-level tests for the auth HTTP endpoints (login, refresh, logout).

**Why this priority**: Auth is the most security-critical flow in any backend. The
constitution's Principle II (Security-First) + Principle III (Test Coverage) both
require integration tests for critical auth flows.

**Independent Test**: Can be fully tested by running `npm test` and verifying tests
for `/api/v1/auth/login`, `/api/v1/auth/refresh-tokens`, and `/api/v1/auth/logout`
endpoints execute against an in-memory MongoDB.

**Acceptance Scenarios**:

1. **Given** the test suite runs, **When** auth integration tests execute, **Then**
   login with valid credentials returns access token + sets refresh cookie.
2. **Given** the test suite runs, **When** auth integration tests execute, **Then**
   login with invalid credentials returns a 401 RFC 9457 error response.
3. **Given** the test suite runs, **When** auth integration tests execute, **Then**
   refresh with a valid cookie returns a new access token.
4. **Given** the test suite runs, **When** auth integration tests execute, **Then**
   logout clears the refresh cookie and blacklists the token server-side.

---

### User Story 5 - ADR Documents MongoDB Replica Set Requirement (Priority: P3)

A developer encounters the MongoDB Replica Set requirement (`replicaSet=rs0` in the
connection string) and wonders why it's mandatory. There's no ADR explaining this
decision, unlike the 5 other architectural decisions that are documented.

**Why this priority**: Architectural decisions without documented rationale lead to
contributors removing "unnecessary" constraints. The project already has ADR-001 through
ADR-005; this gap creates inconsistency.

**Independent Test**: Can be fully tested by verifying `docs/adr/006-mongodb-replica-set.md`
exists and contains context, decision, and consequences sections.

**Acceptance Scenarios**:

1. **Given** a contributor asks "why do we need a replica set?", **When** they check
   `docs/adr/`, **Then** they find ADR-006 explaining the decision.
2. **Given** ADR-006 exists, **When** it is read, **Then** it includes context
   (why replica set), the decision, and consequences (what breaks without it).

---

### Edge Cases

- `CLAUDE.md` should be generic enough to work with multiple AI assistants (not only
  Claude/Anthropic-specific). The file name is a convention; the content MUST apply
  broadly to AI coding assistants.
- Coverage threshold at exactly 60% (boundary) MUST pass, not fail.
- Integration tests for auth MUST use in-memory MongoDB (no external DB dependency),
  consistent with Principle III.
- If a contributor deliberately removes the coverage threshold config, CI MUST still
  fail because the threshold setting lives in `package.json`/Jest config (version-
  controlled), not an environment variable.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The repository MUST contain a `SECURITY.md` with a real vulnerability
  reporting contact method and an expected response timeline (not GitHub boilerplate).
- **FR-002**: The `SECURITY.md` supported-versions table MUST reflect the actual project
  version range or explicitly state this is a template to be adapted.
- **FR-003**: A `CLAUDE.md` file MUST exist at the repository root with content covering:
  architecture summary, tech stack overview, key conventions to follow, and patterns to
  avoid.
- **FR-004**: All links from `README.md` and `SETUP.md` to `CLAUDE.md` MUST resolve
  to a file with actionable content.
- **FR-005**: The Jest configuration MUST enforce a minimum 60% line coverage threshold
  that causes the test command to exit non-zero when violated.
- **FR-006**: CI MUST fail the test step when coverage drops below threshold (no
  separate "coverage check" step needed; the existing test step enforces it).
- **FR-007**: Integration tests MUST exist for the three primary auth endpoints:
  login, refresh-tokens, and logout — covering both happy-path and key error cases.
- **FR-008**: Auth integration tests MUST use in-memory MongoDB only (no external
  database dependency).
- **FR-009**: A `docs/adr/006-mongodb-replica-set.md` ADR MUST be created following
  the same format as existing ADRs (001–005), covering context, decision, and
  consequences.
- **FR-010**: The `docs/adr/` index in `docs/ARCHITECTURE.md` MUST be updated to
  reference ADR-006.

### Assumptions

- Auth endpoints are under `/api/v1/auth/` prefix based on current route structure.
- Coverage threshold set to 60% line coverage (matching constitution's stated minimum).
- `CLAUDE.md` content should mirror the style of existing project docs (concise,
  table-driven, markdown).
- ADR-006 format follows ADR-001 pattern: Status / Context / Decision / Consequences.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A new contributor can find and read a meaningful `SECURITY.md` in under
  30 seconds — no boilerplate placeholder text remains.
- **SC-002**: An AI coding assistant reading `CLAUDE.md` can answer "what pattern should
  I follow to add a new module?" without referring to any other file.
- **SC-003**: Running `npm test` locally with coverage below 60% results in a non-zero
  exit code (enforced, not just reported).
- **SC-004**: CI fails automatically when a PR reduces line coverage below 60%, without
  requiring manual reviewer intervention.
- **SC-005**: The auth test suite covers login, refresh, and logout flows with at least
  one happy-path and one error-path test each (minimum 6 new test cases).
- **SC-006**: All 5 quality gaps identified in the constitution review are fully
  resolved — verified by re-running the review checklist and finding 0 open P1/P2 items.
- **SC-007**: `docs/ARCHITECTURE.md` ADR index lists ADR-006 alongside ADR-001 through
  ADR-005.
