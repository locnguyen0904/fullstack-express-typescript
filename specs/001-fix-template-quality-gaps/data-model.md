# Data Model: Template Quality Gaps Fix

**Branch**: `001-fix-template-quality-gaps`
**Date**: 2026-03-10

---

## Overview

This feature deals purely with **documentation files, configuration, and test additions**.
There are no new database entities, no new API endpoints, and no schema changes.

The "data" in this feature is structured text (Markdown files, YAML config, JS config).

---

## File Artifacts (Entities)

### 1. `SECURITY.md` (root)

| Field             | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Type**          | Markdown document                                                         |
| **Location**      | `/SECURITY.md`                                                            |
| **Current state** | GitHub boilerplate — fake version table, placeholder text                 |
| **Target state**  | Template-aware security policy with real vulnerability reporting guidance |

**Required sections**:

- `## Supported Versions` — table stating this is a template; downstream projects fill this
- `## Reporting a Vulnerability` — private advisory channel + expected response timeline
- `## Disclosure Policy` — coordinated disclosure expectations
- `## Scope` — what is in/out of scope for this template

---

### 2. `CLAUDE.md` (root)

| Field             | Value                                                     |
| ----------------- | --------------------------------------------------------- |
| **Type**          | Markdown document                                         |
| **Location**      | `/CLAUDE.md`                                              |
| **Current state** | Does not exist (broken references in README and SETUP.md) |
| **Target state**  | AI coding assistant context file                          |

**Required sections**:

- `## Project Overview`
- `## Tech Stack` (table)
- `## Architecture` (4-layer diagram + layer responsibilities)
- `## Key Conventions` (path aliases, barrel exports, DI, Plop, Zod)
- `## Patterns to Follow` (with brief code examples)
- `## Patterns to Avoid` (anti-patterns)
- `## Common Tasks` (add module, run tests, seed DB)

---

### 3. `docs/adr/006-mongodb-replica-set.md`

| Field               | Value                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------- |
| **Type**            | ADR (Architectural Decision Record)                                                      |
| **Location**        | `/docs/adr/006-mongodb-replica-set.md`                                                   |
| **Current state**   | Does not exist                                                                           |
| **Target state**    | ADR following existing ADR-001 format: Date / Status / Context / Decision / Consequences |
| **Cross-reference** | Must be added to ADR index table in `docs/ARCHITECTURE.md`                               |

---

### 4. `backend/jest.config.js` (modification)

| Field                  | Before | After |
| ---------------------- | ------ | ----- |
| `branches` threshold   | 30%    | 40%   |
| `functions` threshold  | 35%    | 50%   |
| `lines` threshold      | 50%    | 60%   |
| `statements` threshold | 50%    | 60%   |

**Note**: CI already runs `npm run test:coverage` (confirmed via `.github/workflows/ci.yml`
line 37). Threshold update directly enforces the constitution gate.

---

### 5. `backend/src/__tests__/api/auth/auth.e2e.test.ts` (extension)

| Field             | Value                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| **Type**          | Jest integration test file (extension of existing)                                              |
| **Current state** | Tests for login (4 cases) + logout (2 cases) = 6 tests                                          |
| **Target state**  | Add `refresh-token` describe block (3+ cases)                                                   |
| **Pattern**       | Mirrors existing test file structure; uses `connectTestDB`, `seedAdmin`, `loginAsAdmin` helpers |

**New test cases to add**:

| Test Case      | Input                                      | Expected                            |
| -------------- | ------------------------------------------ | ----------------------------------- |
| Valid refresh  | Encrypted `refreshToken` cookie from login | 200 + new access token + new cookie |
| Missing cookie | No `refreshToken` cookie                   | 401 RFC 9457 response               |
| Invalid token  | Tampered/random string as cookie           | 401 RFC 9457 response               |

**Implementation note**: The refresh endpoint at `/api/v1/auth/refresh-token` requires
the cookie path to match exactly (`path: '/api/v1/auth/refresh-token'`). Tests must
set the cookie at the correct path or use the cookie from the login response directly.

---

## No Entities Changed

The following are explicitly **not** changing in this feature:

- No Mongoose models
- No new API routes or controllers
- No new services
- No Docker Compose changes
- No environment variable additions
