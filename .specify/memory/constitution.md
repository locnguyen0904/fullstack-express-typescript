<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0
Added sections:
  - Core Principles (x5): Layered Architecture, Security-First, Test Coverage,
    Observability & Structured Logging, Developer Experience
  - Tech Stack & Constraints
  - Development Workflow & Quality Gates
  - Governance
Modified principles: N/A (initial ratification — no prior version)
Removed: All template placeholder tokens replaced
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ Constitution Check gates added below
  - .specify/templates/spec-template.md ✅ Aligned with FR/SC structure
  - .specify/templates/tasks-template.md ✅ Task categories align with principles
Deferred TODOs:
  - RATIFICATION_DATE: Set to today 2026-03-10 (first fill — no prior date)
-->

# Backend Template Constitution

## Core Principles

### I. Layered Architecture (NON-NEGOTIABLE)

The codebase MUST follow a strict 4-layer request pipeline:

```text
Request → Routes → Controller → Service → Repository → Model → MongoDB
```

- **Routes**: HTTP routing, middleware attachment, and Zod request validation only.
  Routes MUST NOT contain business logic.
- **Controllers**: HTTP request parsing and response formatting only.
  Controllers MUST delegate all logic to Services and MUST NOT call Repositories directly.
- **Services**: All business logic lives here. Services MUST use Repositories for data
  access and MUST NOT import Mongoose models directly.
- **Repositories**: Data access and query construction only. Every domain repository MUST
  extend the base `Repository<T>` class from `core/repository.core.ts`.

Cross-layer imports that violate this direction (e.g., Service importing a Controller,
Repository importing a Service) are forbidden. Dependency Injection via `tsyringe`
`@singleton()` + `@inject()` decorators MUST be used for all class dependencies.

**Rationale**: Enforces testability (each layer mockable independently), predictability,
and the ability to swap implementations without cascading changes.

### II. Security-First

Every endpoint and feature MUST be designed with security as a first-class concern:

- **Authentication**: JWT with short-lived access tokens + refresh tokens. Refresh tokens
  MUST be stored as HTTP-only cookies. Token revocation via Redis-backed blacklist is
  REQUIRED for logout flows.
- **Input Validation**: ALL incoming request data (body, params, query) MUST be validated
  with Zod schemas before reaching controllers.
- **HTTP Security**: Helmet, CORS, CSRF (double-submit cookie pattern), and rate limiting
  MUST be applied globally via Express middleware stack.
- **Password Storage**: Passwords MUST be hashed with Argon2. Selection fields MUST use
  Mongoose `select: false`; auth-specific finders MUST use `+password` projection.
- **Error Responses**: All error responses MUST follow RFC 9457 Problem Details format
  (`application/problem+json`). Stack traces MUST NOT be exposed to clients in production.

**Rationale**: The template is a starting point for production APIs. Security defaults
prevent insecure patterns from being inherited by downstream projects.

### III. Test Coverage (REQUIRED)

All business logic and API endpoints MUST have automated tests:

- **Unit Tests**: Services and Helpers MUST have unit tests. Use `jest` + mocked
  repository dependencies. Tests MUST NOT require external services (MongoDB, Redis).
- **Integration Tests**: All API routes MUST have integration tests using `supertest` +
  `mongodb-memory-server`. Critical auth flows (login, refresh, logout) require
  integration-level coverage.
- **Coverage Gate**: Minimum 60% line coverage enforced via CI. New code reducing
  coverage below threshold MUST be rejected.
- **Test Location**: Tests MUST mirror the `src/` structure under `__tests__/`.
  Each source file SHOULD have a corresponding `*.test.ts` file.
- **Scaffolding**: New modules generated via `npm run generate` (Plop) MUST include
  a test file stub.

**Rationale**: Template consumers inherit these tests as a baseline. Untested code
reaching production leads to maintenance debt that undermines the template's value.

### IV. Observability & Structured Logging

Every operation that can fail or is operationally significant MUST be observable:

- **Logging**: Use the shared `logger` service (Pino) exclusively. `console.log` /
  `console.error` are FORBIDDEN in production code. Log messages MUST be structured JSON.
- **Request Tracing**: All HTTP requests MUST carry a `X-Request-Id` header (injected by
  `requestIdMiddleware`). Logs MUST include the request ID via Pino child logger context.
- **Health Check**: The `/health` endpoint MUST remain dependency-free and return within
  100 ms. It MUST NOT trigger DB queries or external service calls.
- **Job Monitoring**: BullMQ queues MUST be registered with Bull Board. Workers MUST log
  job start, completion, and failure events at appropriate Pino log levels.
- **OpenTelemetry**: Tracing is opt-in via `OTEL_ENABLED`. When enabled, all inbound
  requests and outbound DB calls MUST be instrumented automatically via the
  `instrumentation.ts` entry point.

**Rationale**: A backend template that ships without observability defaults leads to
black-box production deployments. Structured logging enables querying in log aggregators
(Loki, Datadog, etc.) from day one.

### V. Developer Experience & Simplicity

Complexity MUST be justified. The template should remain approachable and opinionated
without being over-engineered:

- **Module Scaffolding**: New API modules MUST be generated via `npm run generate` (Plop)
  to guarantee consistent file structure (model → repository → service → controller →
  validation → doc → routes → test).
- **Path Aliases**: Absolute imports MUST use the `@/` alias (e.g., `@/core`, `@/config`).
  Relative imports (`../../../`) beyond one level are forbidden.
- **Barrel Exports**: Every directory with multiple exports MUST provide an `index.ts`
  that re-exports public API. Internal implementation files SHOULD NOT be imported
  directly from outside their directory.
- **Conventional Commits**: ALL commits MUST follow the Conventional Commits format
  `<type>(<scope>): <description>`. `commitlint` enforces this via Husky hooks.
- **No Base Controller/Service Classes**: Business services and controllers MUST be
  standalone classes. Base class hierarchies for controllers/services are forbidden
  (they reduce flexibility and increase coupling).

**Rationale**: A template that is hard to extend becomes an obstacle rather than an
accelerator. Tooling enforces patterns so contributors don't have to rely on memory.

## Tech Stack & Constraints

The following technology choices are **locked** for this template. Deviating requires
an ADR (Architectural Decision Record) under `docs/adr/`.

| Layer         | Technology                           | Locked |
| ------------- | ------------------------------------ | ------ |
| Runtime       | Node.js ≥ 24 + TypeScript 5          | ✅     |
| Framework     | Express.js 5                         | ✅     |
| Database      | MongoDB 8 + Mongoose                 | ✅     |
| Cache         | Redis 7                              | ✅     |
| Validation    | Zod 4                                | ✅     |
| DI Container  | tsyringe (Microsoft)                 | ✅     |
| Logging       | Pino (JSON stdout)                   | ✅     |
| Jobs          | BullMQ + Bull Board UI               | ✅     |
| Testing       | Jest 30 + Supertest + mongodb-memory | ✅     |
| Containerized | Docker Compose (dev + prod)          | ✅     |
| API Docs      | OpenAPI 3 (auto-generated from Zod)  | ✅     |
| Auth          | JWT (access + refresh) + Argon2      | ✅     |

**Constraints**:

- ALL environment variables MUST be declared and validated in `config/env.config.ts`
  using Zod. Accessing `process.env` directly outside the config module is forbidden.
- Soft delete (`mongoose-delete` plugin) is the DEFAULT delete strategy.
  Hard delete is permitted only when the business requirement explicitly mandates it.
- Reads from MongoDB MUST use `.lean()` unless Mongoose document methods are required
  (e.g., pre/post hooks on update). This is a performance requirement.
- Create operations MUST use `new Model() + .save()` (not `Model.create()`) to ensure
  hooks and validators fire consistently.

## Development Workflow & Quality Gates

### Git Flow

| Branch type  | Naming pattern           | Target |
| ------------ | ------------------------ | ------ |
| `feature/*`  | `feature/add-user-auth`  | main   |
| `fix/*`      | `fix/login-validation`   | main   |
| `refactor/*` | `refactor/user-service`  | main   |
| `docs/*`     | `docs/update-readme`     | main   |
| `chore/*`    | `chore/upgrade-mongoose` | main   |

### Quality Gate Checklist (MUST pass before PR merge)

- [ ] `npm run lint` — 0 errors, 0 warnings
- [ ] `npm run prettier:fix` — no formatting diff
- [ ] `npm test` — all tests pass
- [ ] `npm run test:coverage` — coverage ≥ 60% lines
- [ ] New module generated via Plop (if adding a new resource)
- [ ] OpenAPI doc registered in `*.doc.ts` (if adding/changing endpoints)
- [ ] ADR created under `docs/adr/` (if making a locked tech-stack change)

### PR Rules

- PR title MUST follow Conventional Commits format.
- Squash merge to `main` is required (keeps history clean).
- Branch MUST be deleted after merge.

## Governance

This constitution supersedes all informal or ad-hoc practices documented elsewhere in
the repository. In case of conflict, this document takes precedence.

**Amendment procedure**:

1. Open a PR with proposed changes to this file.
2. Bump `CONSTITUTION_VERSION` according to semantic versioning rules below.
3. Update `LAST_AMENDED_DATE` to the amendment date.
4. Propagate changes to template files and the Sync Impact Report (HTML comment above).
5. PR description MUST justify the change and document any migration needed.

**Versioning policy**:

- MAJOR: Backward-incompatible governance changes (principle removal, fundamental
  architectural constraint removal).
- MINOR: New principle or section added, material expansion of existing guidance.
- PATCH: Clarifications, wording fixes, typo corrections.

**Compliance review**: Every PR author is responsible for self-certifying the quality
gate checklist. Reviewers MUST reject PRs that skip mandatory checklist items or violate
any NON-NEGOTIABLE principle.

**Version**: 1.0.0 | **Ratified**: 2026-03-10 | **Last Amended**: 2026-03-10
