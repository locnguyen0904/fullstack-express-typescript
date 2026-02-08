---
epic: 3
title: "Production Readiness"
status: done
priority: high
estimated_effort: "3-5 days"
dependencies: [1]
stories_count: 6
---

# Epic 3: Production Readiness

**Goal:** Add foundational production features that every real project needs: observability, background jobs, performant logging, standardized errors, and security scanning.

**Why:** Without these, teams using the template will have to build them from scratch for every project — or worse, ship without them.

---

## Story 3.1: Add OpenTelemetry observability (opt-in)

**Priority:** High
**Effort:** Medium (4-6 hours)

### Description

Add pre-configured OpenTelemetry instrumentation for distributed tracing and metrics, opt-in via environment variables. Auto-instruments Express, MongoDB, Redis, and HTTP.

### Acceptance Criteria

- [ ] `@opentelemetry/sdk-node`, `@opentelemetry/api`, `@opentelemetry/auto-instrumentations-node`, `@opentelemetry/sdk-metrics`, `@opentelemetry/sdk-trace-node` installed
- [ ] `src/instrumentation.ts` created with OpenTelemetry SDK setup
- [ ] Instrumentation loaded via `--import` flag or conditional import in `server.ts`
- [ ] Feature is opt-in via `OTEL_ENABLED=true` environment variable
- [ ] When disabled, zero performance overhead (no SDK initialization)
- [ ] When enabled, auto-instruments: Express routes, MongoDB queries, Redis commands, HTTP calls
- [ ] `OTEL_EXPORTER_ENDPOINT` configurable for any backend (Jaeger, Grafana, Datadog)
- [ ] Console exporter available for local development
- [ ] `.env.example` updated with OpenTelemetry env vars (commented out)
- [ ] `env.schema.ts` updated with optional OTEL validation
- [ ] Docker compose can optionally include Jaeger for local trace viewing
- [ ] `docs/ARCHITECTURE.md` updated with observability section

### Technical Notes

- OpenTelemetry auto-instrumentation detects Express, Mongoose, ioredis automatically
- Must load before any other imports (use `--import` flag or top of `server.ts`)
- Default: disabled. Teams enable when they have an observability backend.

### Files to Create/Modify

- `backend/src/instrumentation.ts` — new file
- `backend/src/config/env.schema.ts` — add OTEL env vars
- `backend/src/config/env.config.ts` — add OTEL config
- `backend/package.json` — add dependencies, update start script
- `.env.example` — add OTEL vars
- `docs/ARCHITECTURE.md` — document observability

---

## Story 3.2: Add BullMQ job queue with example

**Priority:** High
**Effort:** Medium (4-6 hours)

### Description

Add BullMQ job queue infrastructure with Redis backend and an example email queue, providing teams a ready-to-use pattern for background job processing.

### Acceptance Criteria

- [ ] `bullmq` installed as production dependency
- [ ] `src/jobs/` directory structure created
- [ ] Queue registry (`src/jobs/index.ts`) manages queue creation and worker startup
- [ ] Example email queue (`src/jobs/queues/email.queue.ts`) demonstrates queue setup
- [ ] Example email worker (`src/jobs/workers/email.worker.ts`) demonstrates job processing
- [ ] Worker includes retry configuration (3 retries with exponential backoff)
- [ ] Queue uses existing Redis connection from `RedisService`
- [ ] Queues initialized during server startup (after Redis connection)
- [ ] Graceful shutdown closes workers and queues
- [ ] Bull Board UI mounted at `/admin/queues` (protected by auth + admin role)
- [ ] Example service demonstrates adding a job to the queue
- [ ] Jobs work without Redis (graceful fallback — log warning, skip queue)

### Technical Notes

- BullMQ uses the same Redis instance already configured
- Workers can run in-process (simple) or in separate processes (scalable)
- For template, run in-process by default with documentation on separating workers
- Bull Board provides a monitoring UI — mount behind auth middleware

### Files to Create/Modify

- `backend/src/jobs/index.ts` — queue registry
- `backend/src/jobs/queues/email.queue.ts` — example queue
- `backend/src/jobs/workers/email.worker.ts` — example worker
- `backend/src/app.ts` — mount Bull Board UI
- `backend/src/server.ts` — initialize queues on startup, shutdown on exit
- `backend/package.json` — add bullmq dependency

---

## Story 3.3: Replace Winston + Morgan with Pino

**Priority:** Medium
**Effort:** Medium (3-4 hours)

### Description

Replace Winston and Morgan with Pino and pino-http for 5x faster logging, 12-Factor compliant stdout output, and built-in request ID tracking.

### Acceptance Criteria

- [ ] `winston`, `winston-daily-rotate-file`, `morgan`, `@types/morgan` uninstalled
- [ ] `pino`, `pino-http`, `pino-pretty` installed
- [ ] New `logger.service.ts` creates Pino logger with environment-based config
- [ ] Development: `pino-pretty` for human-readable colored output
- [ ] Production: JSON to stdout (no file writes — 12-Factor compliant)
- [ ] Test: silent mode
- [ ] `pino-http` middleware replaces Morgan — includes request ID, method, URL, status, response time
- [ ] Request ID from `requestIdMiddleware` integrated into Pino context
- [ ] All existing `logger.info/warn/error/debug` calls work with new logger
- [ ] Error handler `logErrors` updated to use Pino
- [ ] Log level configurable via `LOG_LEVEL` env var
- [ ] Child loggers available for per-module context
- [ ] All tests pass with new logging

### Technical Notes

- Pino philosophy: log fast (JSON to stdout), process elsewhere (Docker log drivers)
- `pino-http` replaces both Morgan and the custom morgan middleware
- `pino-pretty` is dev-only dependency
- Remove `LOG_DIR` env var (no longer writing to files)

### Files to Modify

- `backend/package.json` — swap dependencies
- `backend/src/services/logger.service.ts` — rewrite with Pino
- `backend/src/middlewares/morgan.middleware.ts` — replace with pino-http setup (or delete and integrate into app.ts)
- `backend/src/middlewares/index.ts` — update exports
- `backend/src/helpers/handle-errors.helper.ts` — update logErrors
- `backend/src/config/env.schema.ts` — remove LOG_DIR, keep LOG_LEVEL
- `backend/src/config/env.config.ts` — update config

---

## Story 3.4: Upgrade error responses to RFC 9457

**Priority:** Medium
**Effort:** Small (2-3 hours)

### Description

Upgrade error response format from custom JSON to RFC 9457 Problem Details standard (`application/problem+json`), the industry standard for HTTP API error responses.

### Acceptance Criteria

- [ ] Error responses follow RFC 9457 format with `type`, `title`, `status`, `detail`, `instance` fields
- [ ] Response `Content-Type` header set to `application/problem+json` for errors
- [ ] `AppError` class updated with `type` and `title` properties
- [ ] `NotFoundError`, `BadRequestError`, `UnAuthorizedError`, `ForbiddenError` have appropriate default types and titles
- [ ] `errorHandle` middleware outputs RFC 9457 format
- [ ] `instance` field populated with request URL (`req.originalUrl`)
- [ ] Zod validation errors include `detail` with field-level error descriptions
- [ ] MongoDB duplicate key errors include meaningful `detail`
- [ ] Stack trace included as extension field in non-production only
- [ ] OpenAPI error response schema updated to RFC 9457 format
- [ ] All error handling tests updated and passing
- [ ] Common response schemas in `common/schemas/response.schema.ts` updated

### Technical Notes

- RFC 9457 replaces RFC 7807 — same concept, updated standard
- Default `type` for generic errors: `about:blank`
- Custom error types can use project-specific URIs
- Extension members (extra fields) are allowed by the standard

### Files to Modify

- `backend/src/core/response-error.core.ts` — update AppError and subclasses
- `backend/src/helpers/handle-errors.helper.ts` — update errorHandle output format
- `backend/src/common/schemas/response.schema.ts` — update error schema
- `backend/src/api/*/docs/*.doc.ts` — update error response schemas
- `backend/src/__tests__/helpers/handle-errors.helper.test.ts` — update assertions

---

## Story 3.5: Add container image scanning to CI

**Priority:** Medium
**Effort:** Small (1-2 hours)

### Description

Add Trivy container vulnerability scanning to the GitHub Actions CI pipeline, failing builds on CRITICAL and HIGH severity vulnerabilities.

### Acceptance Criteria

- [ ] Trivy GitHub Action added to CI workflow
- [ ] Backend Docker image built during CI
- [ ] Trivy scans the built image for OS and application vulnerabilities
- [ ] Build fails on CRITICAL or HIGH severity findings
- [ ] Scan results uploaded as SARIF to GitHub Code Scanning (if Advanced Security available)
- [ ] Scan results visible in CI job output (table format)
- [ ] `.trivyignore` file exists for known acceptable vulnerabilities

### Technical Notes

- Use `aquasecurity/trivy-action@0.33.1` or latest
- Build image first, then scan (don't push to registry)
- SARIF upload integrates with GitHub Security tab alongside CodeQL

### Files to Create/Modify

- `.github/workflows/ci.yml` — add security job with Trivy
- `.trivyignore` — create empty (for future use)

---

## Story 3.6: Add mongodb-memory-server for integration tests

**Priority:** Medium
**Effort:** Medium (3-4 hours)

### Description

Add `mongodb-memory-server` to enable real MongoDB integration tests without external database dependency. Update test setup and add example integration tests.

### Acceptance Criteria

- [ ] `mongodb-memory-server` installed as devDependency
- [ ] `__tests__/setup.ts` updated to start MongoMemoryReplSet before all tests
- [ ] In-memory MongoDB URI set as `DATABASE_URL` for test environment
- [ ] In-memory MongoDB stopped after all tests complete
- [ ] At least one integration test per module (examples, users, auth) exercising full stack
- [ ] Integration tests use Supertest against the Express app with real DB operations
- [ ] Tests are isolated — each test cleans up its data
- [ ] Jest config `globalSetup`/`globalTeardown` or `beforeAll`/`afterAll` handles lifecycle
- [ ] Coverage thresholds raised: branches 60%, functions 60%, lines 70%, statements 70%
- [ ] All tests pass in CI without external MongoDB

### Technical Notes

- `MongoMemoryReplSet` needed (not `MongoMemoryServer`) because your app uses replica set features
- First run downloads MongoDB binary — cached for subsequent runs
- Tests should be parallel-safe (each test uses unique data)

### Files to Modify

- `backend/package.json` — add devDependency
- `backend/src/__tests__/setup.ts` — add memory server lifecycle
- `backend/jest.config.js` — update coverage thresholds
- `backend/src/__tests__/api/` — add integration test files
