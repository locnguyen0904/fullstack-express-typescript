# Research: Template Quality Gaps Fix

**Branch**: `001-fix-template-quality-gaps`
**Date**: 2026-03-10
**Phase**: 0 — Research & NEEDS CLARIFICATION resolution

---

## 1. Auth Integration Tests: Gap Analysis

### Finding

`backend/src/__tests__/api/auth/auth.e2e.test.ts` already exists with tests for:

- `POST /api/v1/auth/login` — 4 test cases (valid, wrong password, wrong email, missing field)
- `POST /api/v1/auth/logout` — 2 test cases (with auth, without auth)

**Gap identified**: `POST /api/v1/auth/refresh-token` has **zero test coverage**.

### Decision

Extend `auth.e2e.test.ts` with a `refresh-token` describe block covering:

- Happy path: valid encrypted refresh cookie → new access token + new cookie
- Error: missing cookie → 401
- Error: invalid/tampered token → 401

**Rationale**: The refresh flow uses `decrypt(req.cookies.refreshToken)` +
`AuthService.refreshAuth()` → token blacklist revocation → new tokens.
This is the highest-value untested path because it connects JWT, encryption,
Redis blacklist, and cookie mechanics end-to-end.

**Pattern used**: Mirror `user.e2e.test.ts` pattern — `loginAsAdmin()` helper
returns a `token`; can extract `cookies` from login response to use in refresh call.

---

## 2. Coverage Threshold: Current State vs Required

### Finding

`backend/jest.config.js` already has `coverageThreshold` configured:

```js
coverageThreshold: {
  global: {
    branches: 30,
    functions: 35,
    lines: 50,      // ← current
    statements: 50,
  },
},
```

Constitution mandates ≥ 60% **line** coverage.

Current coverage (from CI badge and README): tracked via codecov, ~68 tests.
Existing threshold at 50% lines does enforce a gate (non-zero exit when violated),
so the constraint is partially fulfilled.

### Decision

Raise threshold to align with constitution:

```js
coverageThreshold: {
  global: {
    branches: 40,
    functions: 50,
    lines: 60,      // ← constitution minimum
    statements: 60,
  },
},
```

**Rationale**: Branches/functions boosted proportionally. The `test:coverage` script
already runs coverage; this change makes the `test` (CI) script also enforce threshold
because Jest applies `coverageThreshold` only when `--coverage` flag is present.
**CI currently runs `npm test` (no `--coverage`), so threshold does not enforce on CI.**

**Additional change needed**: Update CI YAML to use `npm run test:coverage` instead of
`npm test` (or add `--coverage` flag to the CI test step).

---

## 3. SECURITY.md: Current State

### Finding

`SECURITY.md` contains GitHub's default boilerplate:

- Version table with fake versions (`5.1.x`, `5.0.x`, `4.0.x`, `< 4.0`)
- Three placeholder paragraphs with no real information

### Decision

Replace with a meaningful but template-generic security policy that:

1. Acknowledges this is a **template repository** (no released versions to support)
2. Provides a **vulnerability reporting process** that downstream projects should adapt
3. Includes a real reporting contact placeholder that the project owner fills in
4. Documents expected response timeline (industry-standard: 72h acknowledgement, 30d fix)

**Alternatives considered**:

- Delete SECURITY.md entirely → rejected, GitHub shows security tab based on this file
- Reference GitHub private advisory → accepted as recommended mechanism

---

## 4. CLAUDE.md: Content Strategy

### Finding

`CLAUDE.md` is referenced in:

- `README.md` line 137: `[CLAUDE.md](CLAUDE.md) | AI coding assistant instructions`
- `docs/SETUP.md` line 303: `Check [CLAUDE.md](../CLAUDE.md) for AI-assisted development`

The file does not exist. Similar AI guidance files in popular projects (like Anthropic's
template) contain: project overview, tech stack, key conventions, patterns to follow,
patterns to avoid, and common pitfalls.

### Decision

Create `CLAUDE.md` with sections:

1. **Project Overview** — what this is and its purpose
2. **Tech Stack** — mirrored from README table (concise)
3. **Architecture** — the 4-layer pipeline + DI pattern summary
4. **Key Conventions** — path aliases, barrel exports, Plop generation, Zod validation
5. **Patterns to Follow** — with code examples
6. **Patterns to Avoid** — anti-patterns explicitly forbidden
7. **Common Tasks** — how to add a new module, run tests, etc.

**Rationale**: File name `CLAUDE.md` is convention from Anthropic; content must be
AI-assistant-agnostic since multiple assistants read it.

---

## 5. ADR-006: MongoDB Replica Set — Research

### Finding

Connection string requires `?replicaSet=rs0`. No ADR explains this.
Existing ADRs (001-005) all use: Status / Context / Decision / Consequences format.

### Why Replica Set is Required

MongoDB replica sets enable:

1. **Multi-document ACID transactions** — Mongoose sessions (`session.startTransaction()`)
   only work on replica sets
2. **Change streams** — Used by MongoDB Atlas Triggers and local watchers
3. **Read preference** — Offload reads to secondaries in production (not used here,
   but enabled by default once replica set exists)
4. **Write concern** — Majority write concern for durability guarantees

For a **development template**, the replica set is configured as a single-node replica
set (`rs0`) primarily to enable transactions. Even local dev docker-compose sets
`--replSet rs0` for this reason.

### Decision

Write ADR-006 following the established format, documenting:

- Context: transactions require replica set; template ships with Docker Compose that
  enables it
- Decision: mandate `replicaSet=rs0` in DATABASE_URL
- Consequences: dev environment needs Docker Compose (documented); local MongoDB needs
  `--replSet rs0` flag

---

## 6. CI Pipeline: Coverage Enforcement

### Finding

`.github/workflows/ci.yml` runs tests. Need to check if it uses `npm test` or
`npm run test:coverage`.

**Strategy**: Change CI test step to use `test:coverage` script so the threshold
defined in `jest.config.js` is enforced on every PR.

### Decision

Update CI workflow to run `npm run test:coverage` so:

1. Coverage is collected and threshold checked (non-zero exit = PR fails)
2. Coverage report is available for codecov upload (same command)

This eliminates the "coverage reported but not enforced" gap identified in the review.
