---
epic: 1
title: "Critical Security Fixes"
status: done
priority: critical
estimated_effort: "1-2 days"
dependencies: []
stories_count: 4
---

# Epic 1: Critical Security Fixes

**Goal:** Eliminate known security vulnerabilities and align with OWASP recommendations.

**Why First:** These address a deprecated/archived dependency (csurf) and a below-standard password hashing algorithm. Must be resolved before any team uses this template.

---

## Story 1.1: Replace csurf with csrf-csrf

**Priority:** Critical
**Effort:** Small (2-4 hours)

### Description

Replace the deprecated and archived `csurf` package with `csrf-csrf`, implementing the Double Submit Cookie Pattern for stateless CSRF protection.

### Acceptance Criteria

- [ ] `csurf` and `@types/csurf` are uninstalled
- [ ] `csrf-csrf` is installed and configured in `app.ts`
- [ ] CSRF protection uses the Double Submit Cookie Pattern
- [ ] `GET /api/v1/csrf-token` endpoint returns a valid token
- [ ] Requests with `Authorization: Bearer` header skip CSRF validation (API clients)
- [ ] Safe methods (GET, HEAD, OPTIONS) skip CSRF validation
- [ ] Admin frontend can obtain and submit CSRF tokens via cookies + header
- [ ] Cookie settings: `sameSite: 'strict'`, `secure: true` (prod), `httpOnly: true`
- [ ] Tests pass for CSRF-protected and non-CSRF routes
- [ ] No reference to `csurf` remains in codebase

### Technical Notes

- `csrf-csrf` requires `getSecret` and `getSessionIdentifier` configuration
- Use `config.jwt.secret` as the CSRF secret source
- Session identifier can use `req.user?.sub` or a session cookie
- Current `x-csrf-token` / `x-xsrf-token` header logic already aligns with `csrf-csrf`

### Files to Modify

- `backend/package.json` — swap dependencies
- `backend/src/app.ts` — replace CSRF middleware setup
- `backend/src/types/index.d.ts` — remove csurf types if referenced

---

## Story 1.2: Replace bcrypt with Argon2

**Priority:** High
**Effort:** Small (2-4 hours)

### Description

Replace `bcrypt` with `argon2` (Argon2id variant) for password hashing per OWASP Password Storage Cheat Sheet recommendations.

### Acceptance Criteria

- [ ] `bcrypt` and `@types/bcrypt` are uninstalled
- [ ] `argon2` is installed
- [ ] User model pre-save hook uses `argon2.hash()` with Argon2id config
- [ ] `isPasswordMatch()` method uses `argon2.verify()`
- [ ] `auth.service.ts` `verifyPassword()` uses `argon2.verify()`
- [ ] Argon2id config: `memoryCost: 19456, timeCost: 2, parallelism: 1`
- [ ] Seed script works with new hashing
- [ ] All auth tests pass
- [ ] Salt rounds constant removed (Argon2 handles salting internally)

### Technical Notes

- OWASP recommends: _"Use Argon2id with a minimum of 19 MiB memory, 2 iterations, 1 parallelism"_
- `argon2` npm package is a native module — verify Docker build works
- No backward compatibility needed (template, not production app)

### Files to Modify

- `backend/package.json` — swap dependencies
- `backend/src/api/users/user.model.ts` — pre-save hook, isPasswordMatch
- `backend/src/api/auth/auth.service.ts` — verifyPassword method
- `backend/src/db/seeds/index.ts` — seed password hashing
- `backend/src/__tests__/api/auth/auth.service.test.ts` — update mocks

---

## Story 1.3: Add request body size limits

**Priority:** High
**Effort:** Minimal (30 minutes)

### Description

Configure explicit request body size limits on `express.json()` and `express.urlencoded()` to prevent denial-of-service attacks via oversized payloads.

### Acceptance Criteria

- [ ] `express.json({ limit: '10mb' })` configured in `app.ts`
- [ ] `express.urlencoded({ extended: true, limit: '10mb' })` configured in `app.ts`
- [ ] Requests exceeding limit receive 413 Payload Too Large response
- [ ] Error handler properly handles payload size errors

### Files to Modify

- `backend/src/app.ts` — add `limit` option to JSON and URL-encoded parsers

---

## Story 1.4: Update CI to Node.js 22

**Priority:** Low
**Effort:** Minimal (15 minutes)

### Description

Update GitHub Actions CI workflow to use Node.js 22 to match the Docker runtime and development environment.

### Acceptance Criteria

- [ ] `.github/workflows/ci.yml` uses `node-version: '22'` for both backend and frontend jobs
- [ ] CI pipeline passes on Node.js 22
- [ ] `docs/SETUP.md` prerequisites updated to reflect Node.js >= 22

### Files to Modify

- `.github/workflows/ci.yml` — update `node-version`
- `docs/SETUP.md` — update prerequisites table
