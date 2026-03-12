# Quickstart: Template Quality Gaps Fix

**Branch**: `001-fix-template-quality-gaps`
**Date**: 2026-03-10

This guide validates that all 5 quality gaps are resolved after implementation.

---

## Prerequisites

```bash
# From repo root
cd backend
npm install
```

---

## Validation 1: SECURITY.md is Real

```bash
# Open the file and verify:
cat SECURITY.md
```

✅ **Pass criteria**:

- No text "Use this section to tell people"
- Version table reflects template status (not fake 5.1.x/4.0.x)
- Email/contact method present for vulnerability reporting
- Expected response timeline stated

---

## Validation 2: CLAUDE.md Exists and Has Content

```bash
cat CLAUDE.md
```

✅ **Pass criteria**:

- File exists at repo root
- Contains "Architecture" section with the 4-layer pipeline
- Contains "Patterns to Follow" and "Patterns to Avoid" sections
- README link resolves: `open README.md` → click CLAUDE.md link in browser preview

---

## Validation 3: Coverage Threshold Enforced

```bash
cd backend

# Confirm threshold in config
grep -A 6 "coverageThreshold" jest.config.js
# Expected: lines: 60

# Run tests with coverage — should pass at current coverage level
npm run test:coverage
```

✅ **Pass criteria**:

- `jest.config.js` shows `lines: 60`
- `npm run test:coverage` exits with code 0
- Coverage summary shows lines ≥ 60%

**To verify threshold enforces failure** (destructive — do not commit):

```bash
# Temporarily reduce a file's coverage — just verify concept
# In practice: CI will fail if coverage drops below 60%
```

---

## Validation 4: Auth Refresh-Token Tests Pass

```bash
cd backend
npm test -- --testPathPattern=auth.e2e
```

✅ **Pass criteria**:

- Output shows `describe('POST /api/v1/auth/refresh-token')` block
- At least 3 tests in that block
- All tests pass
- No skipped tests

---

## Validation 5: ADR-006 Exists and Is Indexed

```bash
# Check file exists
cat docs/adr/006-mongodb-replica-set.md

# Check it's referenced in ARCHITECTURE.md
grep "ADR-006\|006-mongodb" docs/ARCHITECTURE.md
```

✅ **Pass criteria**:

- `docs/adr/006-mongodb-replica-set.md` exists with Date / Status / Context / Decision / Consequences
- `docs/ARCHITECTURE.md` ADR table lists row for ADR-006

---

## Full Suite Validation

```bash
cd backend

# 1. Lint (0 errors)
npm run lint

# 2. Tests + coverage (all pass, ≥60% lines)
npm run test:coverage

# Expected final output:
# Tests: XX passed, XX total
# Lines: XX% > 60% threshold ✓
```

---

## Rollback

These are all **additive changes** (new files) or **threshold increases** in config.
To revert:

- Delete `CLAUDE.md`, `docs/adr/006-mongodb-replica-set.md`
- Restore `SECURITY.md` from git: `git checkout main -- SECURITY.md`
- Restore `jest.config.js` thresholds: `git checkout main -- backend/jest.config.js`
- Restore test file: `git checkout main -- backend/src/__tests__/api/auth/auth.e2e.test.ts`
