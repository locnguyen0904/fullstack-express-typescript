---
epic: 4
title: "Architecture Improvements"
status: done
priority: medium
estimated_effort: "3-5 days"
dependencies: [1, 2]
stories_count: 4
---

# Epic 4: Architecture Improvements

**Goal:** Address long-term architectural risks and add features that elevate the template from good to best-in-class.

**Why:** These changes reduce maintenance risk (TypeDI), improve security (token revocation), and help teams understand decisions (ADRs).

---

## Story 4.1: Replace TypeDI with tsyringe

**Priority:** Medium
**Effort:** Medium (4-6 hours)

### Description

Replace the unmaintained TypeDI (last published January 2021) with Microsoft's actively maintained `tsyringe` for dependency injection. Both use the same decorator-based pattern, making this a straightforward migration.

### Acceptance Criteria

- [ ] `typedi` uninstalled
- [ ] `tsyringe` installed
- [ ] All `@Service()` decorators replaced with `@injectable()` (or `@singleton()`)
- [ ] All `Container.get()` calls replaced with `container.resolve()`
- [ ] `reflect-metadata` import retained (still required by tsyringe)
- [ ] TypeScript config retains `experimentalDecorators` and `emitDecoratorMetadata`
- [ ] All services, controllers, and repositories resolve correctly
- [ ] Redis service lazy connection still works
- [ ] Event service singleton behavior preserved
- [ ] Route files updated to use tsyringe container
- [ ] All existing tests pass
- [ ] `docs/ARCHITECTURE.md` DI section updated
- [ ] Plop templates (if created in Epic 2) updated to use `@injectable()`

### Technical Notes

**Key differences between TypeDI and tsyringe:**

| TypeDI                                        | tsyringe                                                      | Notes              |
| --------------------------------------------- | ------------------------------------------------------------- | ------------------ |
| `@Service()`                                  | `@injectable()` or `@singleton()`                             | Direct replacement |
| `Container.get(Class)`                        | `container.resolve(Class)`                                    | Direct replacement |
| `import { Service, Container } from 'typedi'` | `import { injectable, singleton, container } from 'tsyringe'` | Import change      |

- tsyringe supports the same constructor injection pattern
- tsyringe adds scoped containers (`container.createChildContainer()`) for request-scoped services
- Circular dependencies handled via `delay()` helper (same concept)

### Files to Modify

- `backend/package.json` — swap dependency
- `backend/src/api/auth/auth.controller.ts` — decorator + import
- `backend/src/api/auth/auth.service.ts` — decorator + import
- `backend/src/api/examples/example.controller.ts` — decorator + import
- `backend/src/api/examples/example.service.ts` — decorator + import
- `backend/src/api/examples/example.repository.ts` — decorator + import
- `backend/src/api/users/user.controller.ts` — decorator + import
- `backend/src/api/users/user.service.ts` — decorator + import
- `backend/src/api/users/user.repository.ts` — decorator + import
- `backend/src/services/redis.service.ts` — decorator + import
- `backend/src/services/event.service.ts` — decorator + import
- All route `index.ts` files — update container import
- `docs/ARCHITECTURE.md` — update DI section

---

## Story 4.2: Add JWT token revocation via Redis

**Priority:** Medium
**Effort:** Small (2-3 hours)

### Description

Add token revocation capability using Redis blacklist, enabling logout-everywhere and compromised-token invalidation.

### Acceptance Criteria

- [ ] JWT tokens include `jti` (JWT ID) claim — unique per token
- [ ] `generateAuthTokens` in `auth.service.ts` adds `jti` using `crypto.randomUUID()`
- [ ] New method `revokeToken(jti, expirySeconds)` stores token ID in Redis blacklist
- [ ] Auth middleware checks Redis blacklist before processing token
- [ ] Blacklist entries auto-expire when the original token would expire (no cleanup needed)
- [ ] `POST /api/v1/auth/logout` revokes the current refresh token's `jti`
- [ ] Optional: `POST /api/v1/auth/logout-all` revokes all tokens for a user (requires tracking user → jti mapping)
- [ ] Graceful degradation: if Redis unavailable, tokens are not blacklist-checked (log warning)
- [ ] Tests cover: revocation, blacklist check, graceful fallback
- [ ] Auth middleware performance: Redis GET adds < 1ms per request

### Technical Notes

- Redis key format: `token:blacklist:{jti}` with TTL matching token expiry
- Check blacklist in `isAuth` middleware after JWT verification
- `jti` should be in both access and refresh tokens
- Keep it simple — don't over-engineer the user→tokens mapping unless needed

### Files to Modify

- `backend/src/api/auth/auth.service.ts` — add jti to tokens, add revoke method
- `backend/src/middlewares/auth.middleware.ts` — add blacklist check
- `backend/src/api/auth/auth.controller.ts` — call revoke on logout
- `backend/src/api/auth/index.ts` — optional logout-all route
- `backend/src/__tests__/middlewares/auth.middleware.test.ts` — update tests

---

## Story 4.3: Add Architectural Decision Records

**Priority:** Low
**Effort:** Small (2-3 hours)

### Description

Create an ADR (Architectural Decision Record) directory with initial decision documents and a template for teams to document their own project-specific decisions.

### Acceptance Criteria

- [ ] `docs/decisions/` directory created
- [ ] `docs/decisions/README.md` explains what ADRs are and how to create them
- [ ] ADR template file at `docs/decisions/template.md`
- [ ] At least 5 initial ADRs documenting existing template decisions:
  - ADR-001: Use Express 5 as web framework
  - ADR-002: Use MongoDB with Mongoose as database
  - ADR-003: Use JWT for authentication
  - ADR-004: Use dependency injection (tsyringe)
  - ADR-005: Use feature-based module organization
- [ ] Each ADR follows Nygard format: Status, Context, Decision, Consequences
- [ ] ADRs are concise (< 1 page each)
- [ ] `docs/ARCHITECTURE.md` references the decisions directory

### Technical Notes

- ADR numbering: `ADR-NNN-short-title.md`
- Status values: Proposed, Accepted, Deprecated, Superseded
- Keep ADRs short — they record _why_, not _how_
- Teams should add ADRs for project-specific decisions (database schema choices, third-party integrations, etc.)

### Files to Create

- `docs/decisions/README.md`
- `docs/decisions/template.md`
- `docs/decisions/ADR-001-express-framework.md`
- `docs/decisions/ADR-002-mongodb-mongoose.md`
- `docs/decisions/ADR-003-authentication-jwt.md`
- `docs/decisions/ADR-004-dependency-injection.md`
- `docs/decisions/ADR-005-module-organization.md`

---

## Story 4.4: Update documentation for all changes

**Priority:** Low
**Effort:** Small (2-3 hours)

### Description

Update all project documentation to reflect changes made across Epics 1-4, ensuring the template documentation is accurate and comprehensive for team onboarding.

### Acceptance Criteria

- [ ] `docs/ARCHITECTURE.md` updated:
  - DI section reflects tsyringe (or chosen alternative)
  - Password hashing section reflects Argon2
  - Logging section reflects Pino
  - Error handling section reflects RFC 9457
  - New sections for: Observability, Job Queue, Token Revocation
  - asyncHandler section removed
- [ ] `docs/SETUP.md` updated:
  - Node.js 22 requirement
  - New environment variables documented (OTEL, BullMQ)
  - Development commands updated (`tsx watch` instead of `nodemon`)
- [ ] `CLAUDE.md` updated:
  - Quick commands reflect new scripts
  - Architecture section reflects changes
  - Checklist updated with new patterns
- [ ] `CONTRIBUTING.md` updated:
  - Module scaffolding instructions (`npx plop module <name>`)
  - Pre-commit now uses lint-staged
- [ ] `README.md` updated:
  - Feature list reflects new capabilities
  - Tech stack list updated
- [ ] `.env.example` updated with all new environment variables
- [ ] `SECURITY.md` reviewed for accuracy

### Technical Notes

- Documentation should be updated incrementally as each story is completed
- This story serves as a final review to catch anything missed
- Keep documentation concise — link to ADRs for "why" explanations

### Files to Modify

- `docs/ARCHITECTURE.md`
- `docs/SETUP.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `README.md`
- `.env.example`
- `SECURITY.md`
