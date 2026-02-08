---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ["docs/ARCHITECTURE.md", "docs/SETUP.md", "CLAUDE.md"]
workflowType: "research"
lastStep: 1
research_type: "technical"
research_topic: "Backend Template Best Practices Evaluation"
research_goals: "Evaluate tech stack, identify missing features, DX improvements, security hardening, performance/scalability patterns - deep dive for team starter template"
user_name: "Loc Nguyen"
date: "2026-02-07"
web_research_enabled: true
source_verification: true
---

# Research Report: Technical

**Date:** 2026-02-07
**Author:** Loc Nguyen
**Research Type:** Technical

---

## Research Overview

Comprehensive evaluation of the backend-template project's technology stack, architecture patterns, and development practices against current (2026) industry best practices. The goal is to identify improvements that will make this template the strongest possible starting point for new team projects.

---

## Technical Research Scope Confirmation

**Research Topic:** Backend Template Best Practices Evaluation
**Research Goals:** Evaluate tech stack, identify missing features, DX improvements, security hardening, performance/scalability patterns

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns
- Security Hardening - auth, OWASP, container security
- DX & Team Productivity - tooling, testing, onboarding

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-02-07

## Technology Stack Analysis

### Web Framework: Express 5 — KEEP (with caveats)

**Current:** Express 5.2.1
**Verdict:** Keep, but monitor alternatives

Express 5 is now stable with native async/await error handling (rejected promises auto-forwarded to error handler), which eliminates the need for your `asyncHandler` wrapper in many cases. Your template is already on Express 5 — good.

**Alternatives evaluated:**

| Framework     | Req/sec (relative) | Ecosystem        | TypeScript             | Verdict                                                        |
| ------------- | ------------------ | ---------------- | ---------------------- | -------------------------------------------------------------- |
| **Express 5** | 1x (baseline)      | Massive, mature  | Via @types             | Keep for template — team familiarity, ecosystem                |
| **Fastify**   | ~2-3x Express      | Growing, strong  | First-class            | Best alternative if performance matters                        |
| **Hono**      | ~3-5x Express      | Smaller, growing | First-class, ultrafast | Best for edge/serverless, less mature for traditional backends |

**Recommendation:** Keep Express 5 for team template. The ecosystem maturity, middleware availability, and developer familiarity outweigh Fastify/Hono's raw performance. However, **remove `asyncHandler`** — Express 5 handles async errors natively.

_Sources: [Express 5 Migration Guide](https://expressjs.com/en/guide/migrating-5.html), [Fastify Benchmarks](https://fastify.dev/benchmarks/), [Hono Documentation](https://hono.dev/docs/)_

---

### CSRF Protection: csurf — CRITICAL: MUST REPLACE

**Current:** csurf 1.11.0
**Verdict:** REPLACE IMMEDIATELY

**csurf is officially deprecated and archived.** Last update was January 2020. The expressjs organization has abandoned it with the message: _"This package is archived and no longer maintained."_

**Recommended replacement:** `csrf-csrf` — implements the **Double Submit Cookie Pattern** (stateless CSRF):

- HMAC-based tokens tied to session identifiers
- Secure defaults (`sameSite: strict`, `secure: true`, `httpOnly: true`)
- Actively maintained
- Works with your existing cookie-based auth flow

Your current CSRF implementation already partially implements this pattern (checking `x-csrf-token` header), so migration should be straightforward.

_Source: [npm registry - csurf](https://registry.npmjs.org/csurf), [csrf-csrf GitHub](https://github.com/Psifi-Solutions/csrf-csrf)_

---

### Dependency Injection: TypeDI — CONSIDER REPLACING

**Current:** TypeDI 0.10.0
**Verdict:** Replace or accept the risk

TypeDI's last publish was **January 2021** (over 5 years ago). Last repository activity was December 2022. It is effectively **unmaintained** despite having no formal deprecation notice.

**Key risk:** TypeDI depends on `experimentalDecorators` and `emitDecoratorMetadata`, which are legacy TypeScript features. TC39 Stage 3 decorators (the standard) work differently and don't support metadata emission the same way.

**Alternatives:**

| Library                  | Status              | Approach                           | Recommendation               |
| ------------------------ | ------------------- | ---------------------------------- | ---------------------------- |
| **tsyringe** (Microsoft) | Active, 11.8k stars | Decorator-based, similar to TypeDI | Best drop-in replacement     |
| **inversify**            | Active, mature      | More features, heavier             | Good for complex DI needs    |
| **Manual DI**            | N/A                 | Factory functions, no decorators   | Simplest, no dependency risk |

**Recommendation:** For a team template, consider **tsyringe** as a drop-in replacement (same decorator pattern, active Microsoft maintenance) or evaluate if you even need DI — many teams find manual factory-based injection sufficient for Express apps.

_Source: [npm registry - typedi](https://registry.npmjs.org/typedi), [tsyringe GitHub](https://github.com/microsoft/tsyringe)_

---

### Database ODM: Mongoose 8 — KEEP

**Current:** Mongoose 8.0
**Verdict:** Keep — still the best choice for MongoDB

**Alternatives evaluated:**

- **Prisma + MongoDB:** Currently requires v6.19 (v7 support coming). No migration support. Requires replica set. Manual relation setup. Still maturing for MongoDB — **not ready to replace Mongoose.**
- **Drizzle ORM:** SQL-only — **does not support MongoDB at all.**

Mongoose remains the most mature, feature-complete MongoDB ODM with excellent TypeScript support, active maintenance, and the largest ecosystem of plugins.

**Improvement:** Your mongoose-delete plugin (v1.0.7) is actively maintained and added Mongoose 9.x support in December 2025 — good.

_Source: [Prisma MongoDB Docs](https://www.prisma.io/docs/orm/overview/databases/mongodb), [Drizzle Docs](https://orm.drizzle.team/docs/get-started), [npm registry - mongoose-delete](https://registry.npmjs.org/mongoose-delete)_

---

### Logging: Winston — CONSIDER REPLACING with Pino

**Current:** Winston 3.17 + winston-daily-rotate-file + Morgan
**Verdict:** Consider replacing with Pino for performance

Pino is **5x faster than Winston** and follows a "log fast, process elsewhere" philosophy:

- Outputs newline-delimited JSON natively (no formatter overhead)
- Worker thread transports (doesn't block event loop)
- `pino-pretty` for development readability
- `pino-http` replaces Morgan with request logging

**Why this matters for a template:** Logging is called on every request. In high-throughput services, Winston's synchronous formatting can become a bottleneck.

| Logger      | Speed      | Approach                            | DX                         |
| ----------- | ---------- | ----------------------------------- | -------------------------- |
| **Winston** | Baseline   | Batteries-included, sync formatting | Good, many transports      |
| **Pino**    | ~5x faster | JSON-native, worker transports      | Excellent with pino-pretty |

**Recommendation:** Replace Winston + Morgan with Pino + pino-http for production performance. Use `pino-pretty` in development for readability.

_Source: [Pino GitHub](https://github.com/pinojs/pino)_

---

### Password Hashing: bcrypt — SHOULD UPGRADE to Argon2

**Current:** bcrypt 6.0
**Verdict:** Upgrade to Argon2id

Per OWASP Password Storage Cheat Sheet, **Argon2id is the top recommendation** for password hashing. bcrypt is explicitly listed as a fallback: _"should only be used for password storage in legacy systems where Argon2 and scrypt are not available."_

**Why Argon2id is better:**

- Won the 2015 Password Hashing Competition
- 3 tunable parameters (memory, iterations, parallelism) vs bcrypt's single work factor
- Resists both side-channel and GPU-based attacks
- No 72-byte input length limit (bcrypt truncates longer passwords)
- No null byte issues

**Recommended config (OWASP):** 19 MiB memory, 2 iterations, 1 parallelism.

**Migration:** Use `argon2` npm package. Support bcrypt verification for existing passwords during transition.

_Source: [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)_

---

### Testing: Jest 30 — KEEP or MIGRATE to Vitest

**Current:** Jest 30 + ts-jest + Supertest
**Verdict:** Both are valid — Vitest has better DX

| Feature           | Jest 30          | Vitest 4                |
| ----------------- | ---------------- | ----------------------- |
| Speed             | Good             | Faster (esbuild/Vite)   |
| TypeScript        | Via ts-jest      | Native                  |
| ESM Support       | Improving        | Native                  |
| API Compatibility | Standard         | Jest-compatible API     |
| Watch Mode        | Yes              | Better (Vite HMR)       |
| Config            | `jest.config.js` | Shares `vite.config.ts` |
| Community         | Largest          | Growing fast            |

**Recommendation:** If starting fresh, Vitest offers better DX and speed. But Jest 30 is solid — this is a lower-priority change. If you migrate, Vitest has a [Jest migration guide](https://vitest.dev/guide/migration#jest) and uses the same API.

_Source: [Vitest Documentation](https://vitest.dev/guide/)_

---

### TypeScript Execution: ts-node — REPLACE with tsx

**Current:** ts-node + tsconfig-paths/register
**Verdict:** Replace with tsx

`tsx` (11.8k GitHub stars, 430k+ dependents) is the modern replacement for ts-node:

- **esbuild-powered** — significantly faster startup
- **Native ESM support** — no configuration headaches
- **Watch mode built-in** — can replace nodemon for development
- **Zero config** — no need for `tsconfig-paths/register`
- **Path alias support** — works with `@/` imports

**Impact:** Simplifies your dev toolchain. Could replace both `ts-node` AND `nodemon`.

```bash
# Before: ts-node + nodemon + tsconfig-paths
nodemon --exec "ts-node --files -r tsconfig-paths/register src/server.ts"

# After: tsx
tsx watch src/server.ts
```

_Source: [tsx GitHub](https://github.com/privatenumber/tsx)_

---

### Observability: MISSING — ADD OpenTelemetry

**Current:** Winston logs + Morgan HTTP logs + request ID tracing
**Verdict:** Add OpenTelemetry for production-grade observability

Your template has logging but lacks **distributed tracing** and **metrics** — critical for production microservices.

**OpenTelemetry Node.js SDK provides:**

- Auto-instrumentation for Express, MongoDB, Redis, HTTP
- Distributed traces (spans) across services
- Metrics (request duration, error rates, custom counters)
- Works with any backend (Jaeger, Grafana, Datadog, etc.)

**Setup is minimal:**

```typescript
// instrumentation.ts — loaded before app
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const sdk = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

**Recommendation:** Add as an optional, pre-configured feature in the template. Teams can enable it by pointing to their observability backend.

_Source: [OpenTelemetry Node.js Getting Started](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/)_

---

### Git Hooks: Husky — ADD lint-staged

**Current:** Husky with full `npm run lint && npm run test` on pre-commit
**Verdict:** Add lint-staged for faster commits

Your current pre-commit hook runs lint and tests on the **entire codebase**. This is slow and frustrating for developers making small changes.

**lint-staged** (14.4k GitHub stars) runs linters/formatters only on **staged files**:

```json
{
  "lint-staged": {
    "*.{ts,js}": ["eslint --fix", "prettier --write"],
    "*.md": "prettier --write"
  }
}
```

**Impact:** Pre-commit goes from running full lint + test suite to only checking changed files. Full CI still validates everything on push.

_Source: [lint-staged GitHub](https://github.com/lint-staged/lint-staged)_

---

### Development Tools and Platforms

| Tool                   | Current      | Status                | Recommendation        |
| ---------------------- | ------------ | --------------------- | --------------------- |
| ESLint 9 (flat config) | v9.39        | Current best practice | Keep                  |
| Prettier 3             | v3.3         | Current               | Keep                  |
| Husky 9                | v9.1         | Current               | Keep, add lint-staged |
| Commitlint             | v19          | Current               | Keep                  |
| Docker Compose         | Latest       | Good setup            | Keep                  |
| GitHub Actions CI      | Node 20      | **Update to Node 22** | Update                |
| Dependabot             | Configured   | Good                  | Keep                  |
| CodeQL                 | Configured   | Good                  | Keep                  |
| PM2                    | Cluster mode | Good for production   | Keep                  |

---

### Technology Adoption Trends

**What your template does well (keep):**

- Express 5 with async/await (modern)
- Zod 4 for validation + OpenAPI generation (best practice)
- ESLint 9 flat config (latest standard)
- Jest 30 (current)
- Docker multi-stage builds with non-root user
- Graceful shutdown handling
- Environment validation at startup
- Redis-backed rate limiting with fallback

**What needs updating (action required):**

| Priority | Change                                      | Effort | Impact                 |
| -------- | ------------------------------------------- | ------ | ---------------------- |
| CRITICAL | Replace `csurf` with `csrf-csrf`            | Low    | Security vulnerability |
| HIGH     | Replace `bcrypt` with `argon2`              | Medium | OWASP compliance       |
| HIGH     | Replace `ts-node` + `nodemon` with `tsx`    | Low    | DX improvement         |
| HIGH     | Add OpenTelemetry (optional)                | Medium | Production readiness   |
| MEDIUM   | Replace TypeDI with `tsyringe` or manual DI | Medium | Maintenance risk       |
| MEDIUM   | Add `lint-staged` to pre-commit             | Low    | DX improvement         |
| MEDIUM   | Replace Winston with Pino                   | Medium | Performance            |
| LOW      | Remove `asyncHandler` (Express 5 native)    | Low    | Code cleanup           |
| LOW      | Update CI to Node 22                        | Low    | Consistency            |
| LOW      | Consider Vitest over Jest                   | High   | DX (optional)          |

---

## Integration Patterns Analysis

### API Design Patterns — Current vs Best Practice

**Your current pattern:**

```
Request → Routes → Zod Validation → Controller → Service → Repository → MongoDB
Response: { status: "success", message: "OK", data: {...} }
```

**Evaluation against REST best practices (Microsoft Azure API Guidelines, RFC standards):**

| Best Practice                | Your Template                 | Status        | Recommendation                                     |
| ---------------------------- | ----------------------------- | ------------- | -------------------------------------------------- |
| Plural nouns for collections | `/examples`, `/users`         | GOOD          | Keep                                               |
| HTTP methods semantics       | POST/GET/PUT/DELETE           | GOOD          | Add PATCH support for partial updates              |
| URI versioning `/api/v1`     | Yes                           | GOOD          | Keep                                               |
| Pagination (limit/offset)    | `page` + `limit` (default 25) | GOOD          | Keep, add `cursor-based` option for large datasets |
| Filtering                    | Via QueryBuilder              | GOOD          | Keep                                               |
| Sorting                      | Via `-createdAt` default      | GOOD          | Keep                                               |
| OpenAPI/Swagger              | Zod-to-OpenAPI auto-gen       | EXCELLENT     | Keep                                               |
| Error response format        | Custom `{ status, error }`    | NEEDS UPGRADE | Adopt RFC 9457                                     |
| Location header on 201       | Not implemented               | MISSING       | Add to CREATED response                            |
| PATCH for partial updates    | Not implemented               | MISSING       | Add alongside PUT                                  |
| Field selection (`?fields=`) | Not implemented               | OPTIONAL      | Consider adding                                    |
| HATEOAS links                | Not implemented               | OPTIONAL      | Low priority for API templates                     |

---

### Error Response Format — UPGRADE to RFC 9457

**Current format:**

```json
{
  "status": "error",
  "error": {
    "message": "User not found",
    "code": 404
  }
}
```

**RFC 9457 Problem Details standard (`application/problem+json`):**

```json
{
  "type": "https://api.example.com/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "User with ID '123' does not exist.",
  "instance": "/api/v1/users/123"
}
```

**Why adopt RFC 9457:**

- Industry standard adopted by Microsoft, Google, and most major APIs
- Machine-readable error types via URI
- Extensible — add custom fields alongside standard ones
- Better client-side error handling
- Content-Type header signals error format: `application/problem+json`

**Recommendation:** Refactor `response-error.core.ts` to output RFC 9457 format. This is a high-impact, low-effort improvement that makes your template immediately more professional.

_Source: [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)_

---

### Communication Protocols — What to Add

**Currently supported:**

- HTTP/HTTPS (Express 5)
- Redis pub/sub (via ioredis)

**Missing patterns your template should consider:**

#### 1. WebSocket Support (RECOMMENDED)

Your Nginx config already has WebSocket upgrade headers configured, but your Express app has no WebSocket handling. Add a pre-configured WebSocket setup using `ws` or `Socket.IO`:

- Real-time notifications
- Live data updates
- Chat/messaging features

Many team projects will need real-time features — having it pre-configured saves setup time.

#### 2. Server-Sent Events (SSE) — Lightweight Alternative

Simpler than WebSocket for server-to-client streaming:

- Notification feeds
- Progress updates for long-running operations
- Works with standard HTTP (no upgrade needed)
- Built into Express with `res.write()` + `text/event-stream`

---

### Background Job Processing — MISSING (HIGH PRIORITY)

**Current state:** No job queue. Your EventEmitter handles events synchronously in-process.

**Recommendation:** Add **BullMQ** — the standard Redis-based job queue for Node.js:

| Feature       | BullMQ                              |
| ------------- | ----------------------------------- |
| Queue backend | Redis (you already have Redis)      |
| Job types     | FIFO, LIFO, priority, delayed, cron |
| Reliability   | At-least-once delivery, auto-retry  |
| Scalability   | Horizontal — add more workers       |
| Monitoring    | Bull Board UI                       |
| Concurrency   | Per-worker configurable             |

**Why this is critical for a team template:**

- Email sending (every project needs this)
- PDF/report generation
- Data import/export
- Webhook delivery
- Scheduled tasks (cron jobs)
- Image processing

Without a job queue, teams will hack async processing with `setTimeout` or fire-and-forget patterns, creating reliability issues.

**Suggested template structure:**

```
backend/src/
├── jobs/
│   ├── index.ts              # Queue setup + Bull Board
│   ├── queues/
│   │   └── email.queue.ts    # Example queue
│   └── workers/
│       └── email.worker.ts   # Example worker
```

_Source: [BullMQ Documentation](https://docs.bullmq.io/)_

---

### File Upload Pattern — MISSING

**Current state:** No file upload handling.

**Recommendation:** Add pre-configured **Multer** middleware with best practices:

- Storage configuration (disk or memory)
- File type validation (whitelist approach)
- Size limits to prevent DoS
- **Never as global middleware** — per-route only
- Upload directory outside `src/`

This is another pattern every team project will need eventually.

_Source: [Multer GitHub](https://github.com/expressjs/multer)_

---

### Event-Driven Architecture — NEEDS IMPROVEMENT

**Current state:** `EventEmitter` service with `user.created` / `user.deleted` events. Events are handled synchronously in the same process.

**Problems:**

1. Events are lost if the process crashes
2. No retry mechanism
3. No event history/replay
4. Coupled to single process

**Recommendation (tiered):**

| Tier         | Approach      | Use Case                                                   |
| ------------ | ------------- | ---------------------------------------------------------- |
| **Keep**     | EventEmitter  | Simple in-process decoupling (logging, cache invalidation) |
| **Add**      | BullMQ events | Reliable async processing (emails, notifications)          |
| **Optional** | Redis Pub/Sub | Cross-service event broadcasting                           |

Your EventEmitter pattern is fine for what it does — don't over-engineer. But route anything that needs reliability through BullMQ.

---

### Authentication & Authorization — EVALUATION

**Current state:** Custom JWT implementation with:

- Access tokens (30 min) in response body
- Refresh tokens (30 days) encrypted with AES-256-CTR in httpOnly cookies
- Role-based authorization (`admin`, `user`)

**Evaluation:**

| Aspect                | Status        | Notes                                        |
| --------------------- | ------------- | -------------------------------------------- |
| Token storage         | GOOD          | httpOnly cookie for refresh, body for access |
| Token encryption      | GOOD          | AES-256-CTR for refresh tokens               |
| RBAC                  | BASIC         | Only role-based — no permission-based        |
| Token revocation      | MISSING       | No blacklist/whitelist mechanism             |
| Rate limiting on auth | GOOD          | 5 req/15 min via authLimiter                 |
| Password hashing      | NEEDS UPGRADE | bcrypt → Argon2 (covered in Step 2)          |

**Recommended improvements:**

1. **Token revocation** — Use Redis to store a blacklist of revoked tokens (critical for logout-everywhere, compromised accounts)
2. **Permission-based auth** — Add granular permissions beyond roles: `user.read`, `user.write`, `example.delete`. Many team projects will need finer-grained access control
3. **API key authentication** — Add support for service-to-service auth via API keys (separate from user JWT auth)
4. **OAuth2 provider integration** — Consider adding `passport.js` or `express-oauth2-jwt-bearer` for external identity provider support (Google, GitHub login)

_Source: [express-oauth2-jwt-bearer](https://github.com/auth0/node-oauth2-jwt-bearer), [Microsoft REST API Guidelines](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)_

---

### Integration Security Patterns

| Pattern             | Status    | Recommendation                                              |
| ------------------- | --------- | ----------------------------------------------------------- |
| CORS                | GOOD      | Configured with allowed origins                             |
| Helmet headers      | GOOD      | Security headers applied                                    |
| Rate limiting       | GOOD      | Global + auth-specific limiters                             |
| Input validation    | EXCELLENT | Zod at route level                                          |
| CSRF                | CRITICAL  | Replace csurf (see Step 2)                                  |
| Request size limits | PARTIAL   | JSON body unlimited — add `express.json({ limit: '10mb' })` |
| SQL/NoSQL injection | GOOD      | Mongoose parameterized queries                              |
| API key rotation    | MISSING   | No API key management                                       |
| Request signing     | MISSING   | No HMAC request verification for webhooks                   |

---

### Missing Integration Features Summary

| Feature                  | Priority | Effort  | Why                                  |
| ------------------------ | -------- | ------- | ------------------------------------ |
| RFC 9457 error format    | HIGH     | Low     | Industry standard, professional API  |
| BullMQ job queue         | HIGH     | Medium  | Every project needs async processing |
| Token revocation (Redis) | HIGH     | Low     | Security requirement                 |
| PATCH endpoint support   | MEDIUM   | Low     | REST completeness                    |
| File upload (Multer)     | MEDIUM   | Low     | Common requirement                   |
| WebSocket/SSE support    | MEDIUM   | Medium  | Real-time features                   |
| Permission-based auth    | MEDIUM   | Medium  | Finer-grained access control         |
| Request body size limit  | LOW      | Minimal | Security hardening                   |
| API key auth             | LOW      | Medium  | Service-to-service communication     |

---

## Architectural Patterns and Design

### Current Architecture Evaluation: CSRM Pattern

Your template uses a **Controller-Service-Repository-Model** layered architecture:

```
Routes (Zod validation) → Controller (HTTP) → Service (Business Logic) → Repository (Data Access) → Model (Schema)
```

**Evaluation against Clean Architecture principles:**

| Principle                          | Your Template                                  | Assessment                       |
| ---------------------------------- | ---------------------------------------------- | -------------------------------- |
| Dependency Rule (deps flow inward) | Controllers → Services → Repositories → Models | GOOD — correct direction         |
| Framework independence             | Controllers coupled to Express `req`/`res`     | ACCEPTABLE — practical trade-off |
| Database independence              | Repository abstracts Mongoose                  | GOOD — swap-friendly             |
| Testability                        | Services testable via mocked repos             | GOOD                             |
| UI independence                    | API-only, no UI coupling                       | GOOD                             |
| Separation of concerns             | Clear layer responsibilities                   | GOOD                             |

**Verdict:** Your CSRM pattern is a solid, practical implementation of layered architecture. It's not full Clean Architecture (no use case layer, no dependency inversion via interfaces), but for a team template it's the right level of complexity — **keep it.**

Full Clean Architecture or Hexagonal Architecture would add unnecessary abstraction for most Express projects. Your pragmatic approach is correct.

_Source: [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)_

---

### Module Organization: Modular Monolith — ALREADY ALIGNED

Your feature-based module structure is excellent:

```
api/
├── auth/          # Auth bounded context
├── users/         # User bounded context
├── examples/      # Example bounded context
└── health/        # Health monitoring
```

Each module is self-contained with its own controller, service, repository, model, validation, and docs. This is exactly the **modular monolith** pattern recommended by industry leaders.

Martin Fowler: _"You shouldn't start a new project with microservices, even if you're sure your application will be big enough."_

**What you're doing right:**

- Feature-based grouping (not technical grouping like `controllers/`, `models/`)
- Each module has clear boundaries
- Modules communicate through services, not direct database access
- Easy to extract into microservices later if needed

**Improvements to consider:**

1. **Module-level barrel exports** — Your `index.ts` files export routes. Also export the service and types for cross-module use:

```typescript
// api/users/index.ts
export { UserService } from "./user.service";
export { IUser, UserRole } from "./user.model";
export { default as userRoutes } from "./routes";
```

2. **Cross-module communication rules** — Document that modules should communicate through **services only**, never import another module's repository or model directly. This rule prevents tight coupling.

3. **Module generator** — Add a scaffolding script that generates the full module structure (model, repo, service, controller, validation, doc, index, test) from a name. This dramatically improves DX for teams starting new features.

_Source: [Modular Monolith Architecture](https://www.milanjovanovic.tech/blog/what-is-a-modular-monolith)_

---

### 12-Factor App Compliance

Evaluating your template against the 12-Factor App methodology:

| Factor                   | Status     | Notes                                                 |
| ------------------------ | ---------- | ----------------------------------------------------- |
| 1. **Codebase**          | GOOD       | Single repo, multiple deploys via Docker configs      |
| 2. **Dependencies**      | GOOD       | `package.json` declares all deps, `npm ci` in Docker  |
| 3. **Config**            | GOOD       | Environment variables via `.env`, Zod validation      |
| 4. **Backing Services**  | GOOD       | MongoDB and Redis treated as attached resources       |
| 5. **Build/Release/Run** | GOOD       | Multi-stage Docker build separates stages             |
| 6. **Processes**         | GOOD       | Stateless Express server, state in MongoDB/Redis      |
| 7. **Port Binding**      | GOOD       | Self-contained HTTP server via `server.ts`            |
| 8. **Concurrency**       | GOOD       | PM2 cluster mode, Docker replica support              |
| 9. **Disposability**     | GOOD       | Graceful shutdown with SIGTERM/SIGINT, 30s timeout    |
| 10. **Dev/Prod Parity**  | GOOD       | Same Docker stack, `docker-compose.prod.yml` for prod |
| 11. **Logs**             | NEEDS WORK | Winston writes to files — should stream to stdout     |
| 12. **Admin Processes**  | PARTIAL    | Seed script exists, but no general admin task pattern |

**Factor 11 — Logs as Event Streams:**

Your Winston config writes log files directly (`app-%DATE%.log`). Per 12-Factor: _"Treat logs as event streams"_ — the app should write to stdout/stderr and let the execution environment handle routing.

**Recommendation:** In production, logs should go to stdout only. File rotation should be handled by Docker logging drivers or a log aggregator (Fluentd, Logstash). Keep file transport for local development only.

**Factor 12 — Admin Processes:**

You have `seed:dev` but no general pattern for one-off tasks. Add a `scripts/` directory pattern:

```
backend/src/scripts/
├── seed.ts           # Database seeding
├── migrate.ts        # Data migrations
└── cleanup.ts        # Scheduled maintenance
```

_Source: [12factor.net](https://12factor.net/)_

---

### Node.js Best Practices Compliance

Evaluating against the goldbergyoni/nodebestpractices guide (102 practices):

#### Project Architecture

| Practice                         | Your Template                     | Status    |
| -------------------------------- | --------------------------------- | --------- |
| Structure by business components | Feature-based modules             | EXCELLENT |
| 3-tier layering                  | Controller → Service → Repository | EXCELLENT |
| Wrap utilities as packages       | Helpers in `helpers/` dir         | GOOD      |
| Environment-aware config         | Zod-validated env, typed config   | EXCELLENT |

#### Error Handling

| Practice                                | Your Template                          | Status            |
| --------------------------------------- | -------------------------------------- | ----------------- |
| Async-await for errors                  | Yes, throughout                        | GOOD              |
| Extend built-in Error                   | `AppError extends Error`               | GOOD              |
| Distinguish operational vs catastrophic | Partial — all errors treated similarly | NEEDS IMPROVEMENT |
| Centralized error handling              | Global `errorHandle` middleware        | GOOD              |
| Document API errors (OpenAPI)           | Error schemas in doc files             | GOOD              |
| Exit gracefully on catastrophic errors  | `uncaughtException` → exit             | GOOD              |
| Mature logger                           | Winston                                | GOOD              |
| Test error flows                        | Error handler tests exist              | GOOD              |
| Catch unhandled rejections              | `unhandledRejection` handler           | GOOD              |

**Improvement:** Add error categorization — distinguish between:

- **Operational errors** (expected): validation failures, not found, duplicate key → handle gracefully
- **Programmer errors** (unexpected): null reference, assertion failures → log and restart

Your current `AppError` hierarchy handles operational errors well, but unknown errors in `errorHandle` should trigger a graceful restart rather than continuing in a potentially corrupted state.

#### Docker Best Practices

| Practice                    | Your Template                | Status    |
| --------------------------- | ---------------------------- | --------- |
| Multi-stage builds          | Yes                          | EXCELLENT |
| Non-root user               | `app` user created           | EXCELLENT |
| `dumb-init` for signals     | Yes                          | EXCELLENT |
| `.dockerignore`             | Yes                          | GOOD      |
| Clean dependencies for prod | `npm ci --omit=dev`          | GOOD      |
| Healthcheck                 | `GET /health`                | GOOD      |
| Resource limits             | In `docker-compose.prod.yml` | GOOD      |
| Use `node` not `npm start`  | `node dist/server.js`        | GOOD      |

Your Docker setup is very strong. One improvement: **add image vulnerability scanning** to CI (e.g., Trivy, Snyk Container).

_Source: [Node.js Best Practices Guide](https://github.com/goldbergyoni/nodebestpractices)_

---

### Architectural Decision Records — MISSING (RECOMMENDED)

Your template has docs (`ARCHITECTURE.md`, `SETUP.md`) but no **Architectural Decision Records (ADRs)** documenting _why_ specific choices were made.

ADRs are valuable for team templates because new team members need to understand:

- Why Express over Fastify?
- Why Mongoose over Prisma?
- Why TypeDI for DI?
- Why soft delete by default?

**Recommended format** (Nygard template):

```markdown
# ADR-001: Use Express 5 as Web Framework

## Status: Accepted

## Context

We need a web framework for our backend template that balances
ecosystem maturity, team familiarity, and modern features.

## Decision

Use Express 5 with TypeScript.

## Consequences

- Largest middleware ecosystem available
- Most team members already know Express
- Express 5 adds native async/await error handling
- Lower raw performance than Fastify/Hono
```

**Recommendation:** Add a `docs/decisions/` directory with ADRs for each major architectural choice. Include a template ADR file for teams to document their own project-specific decisions.

_Source: [adr.github.io](https://adr.github.io/)_

---

### Scalability Architecture

**What your template handles well:**

- Horizontal scaling via PM2 cluster mode and Docker replicas
- Redis-backed rate limiting (shared state across instances)
- Stateless server design (session in JWT, state in DB/Redis)
- Connection pooling (`maxPoolSize: 10` for MongoDB)
- Graceful shutdown for zero-downtime deployments

**What's missing:**

1. **Database indexing strategy** — Your models only have `{ createdAt: -1 }` index. Add a documented pattern for teams to define proper indexes based on query patterns.

2. **Query performance guardrails** — No query timeout configuration. Add `socketTimeoutMS` and `maxTimeMS` patterns to prevent slow queries from blocking the connection pool.

3. **Memory limits** — No V8 heap configuration. For containerized deployments, set `--max-old-space-size` to match Docker memory limits.

4. **Circuit breaker** — No resilience pattern for external service calls. Consider adding a lightweight circuit breaker utility for HTTP calls to external APIs.

---

### Security Architecture

| Area                | Current Status                 | Assessment              |
| ------------------- | ------------------------------ | ----------------------- |
| Authentication      | JWT (access + refresh)         | GOOD                    |
| Authorization       | Role-based (admin/user)        | BASIC — add permissions |
| Password hashing    | bcrypt                         | UPGRADE to Argon2       |
| CSRF                | csurf (deprecated)             | CRITICAL — replace      |
| Input validation    | Zod at route level             | EXCELLENT               |
| Security headers    | Helmet                         | GOOD                    |
| Rate limiting       | Express-rate-limit + Redis     | GOOD                    |
| CORS                | Configured                     | GOOD                    |
| Encryption          | AES-256-CTR for refresh tokens | GOOD                    |
| Secrets in env      | Zod-validated env vars         | GOOD                    |
| Non-root Docker     | Yes                            | GOOD                    |
| Dependency scanning | CodeQL + Dependabot            | GOOD                    |
| Request ID tracing  | crypto.randomUUID()            | GOOD                    |

**Missing security patterns:**

1. **Request payload size limits** — `express.json()` has no `limit` set (defaults to 100kb, but should be explicit)
2. **Helmet CSP** — Content Security Policy not configured (relevant for admin frontend)
3. **IP allowlisting** — No pattern for restricting admin routes by IP
4. **Audit logging** — No pattern for recording who-did-what for compliance

---

### Deployment Architecture

**Current:** Docker Compose (dev + prod) with Nginx reverse proxy.

**Assessment:**

| Component             | Status                              |
| --------------------- | ----------------------------------- |
| Multi-stage Docker    | EXCELLENT                           |
| Reverse proxy (Nginx) | GOOD                                |
| Health checks         | GOOD                                |
| Resource limits       | GOOD (prod compose)                 |
| Log rotation          | GOOD (Docker + Winston)             |
| SSL termination       | Not configured                      |
| Zero-downtime deploy  | Possible via Docker rolling updates |
| CI/CD pipeline        | GitHub Actions (lint, build, test)  |

**Missing for production readiness:**

1. **SSL/TLS configuration** — No HTTPS setup in Nginx config
2. **Container image scanning** — No Trivy/Snyk in CI
3. **Deployment documentation** — No guide for actual production deployment (cloud provider specifics)
4. **Backup strategy** — No MongoDB backup pattern documented

---

## Implementation Approaches and Technology Adoption

### Migration Strategy: How to Apply Changes

Your template is a **greenfield template** (not a production app), so migrations are simpler — you can make breaking changes without backward compatibility concerns. The strategy is: make each change, verify tests pass, update documentation.

**Approach:** Phased implementation with each phase independently shippable.

---

### Phase 1: Critical Security Fixes (Effort: 1-2 days)

These should be done immediately — they address active vulnerabilities.

#### 1.1 Replace `csurf` with `csrf-csrf`

```bash
npm uninstall csurf @types/csurf
npm install csrf-csrf
```

**Migration steps:**

- Remove `csurf` import and middleware from `app.ts`
- Install and configure `csrf-csrf` with double submit cookie pattern
- Update CSRF token endpoint (`GET /api/v1/csrf-token`)
- Your existing `x-csrf-token` header check pattern already aligns with `csrf-csrf`
- Test with admin frontend

#### 1.2 Replace `bcrypt` with `argon2`

```bash
npm uninstall bcrypt @types/bcrypt
npm install argon2
```

**Migration steps:**

- Replace `bcrypt.hash()` with `argon2.hash()` in user model pre-save hook
- Replace `bcrypt.compare()` with `argon2.verify()` in `isPasswordMatch()` and `auth.service.ts`
- Update seed script
- Config: `{ type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 }`
- No database migration needed — new users get Argon2, existing password hashes are invalid in a template context

#### 1.3 Add request body size limit

```typescript
// app.ts — one-line change
express.json({ limit: "10mb" });
express.urlencoded({ extended: true, limit: "10mb" });
```

---

### Phase 2: DX Improvements (Effort: 1-2 days)

#### 2.1 Replace `ts-node` + `nodemon` with `tsx`

```bash
npm uninstall ts-node nodemon tsconfig-paths
npm install -D tsx
```

**Update `package.json` scripts:**

```json
{
  "dev": "tsx watch src/server.ts",
  "seed:dev": "tsx src/db/seeds/index.ts"
}
```

**Delete:** `nodemon.json` (no longer needed)

`tsx` handles path aliases (`@/`), TypeScript execution, and file watching — replacing 3 tools with 1.

#### 2.2 Add `lint-staged`

```bash
npm install -D lint-staged
```

**Root `package.json`:**

```json
{
  "lint-staged": {
    "backend/src/**/*.{ts,js}": ["eslint --fix", "prettier --write"],
    "frontend/src/**/*.{ts,tsx,js}": ["eslint --fix", "prettier --write"]
  }
}
```

**Update `.husky/pre-commit`:**

```bash
npx lint-staged
```

Tests should still run in CI (not pre-commit) — pre-commit should be fast.

#### 2.3 Remove `asyncHandler` wrapper

Express 5 handles async errors natively. Remove `asyncHandler` from:

- `helpers/async-handler.helper.ts` — delete file
- All route registrations — unwrap handlers
- `helpers/index.ts` — remove export

**Before:**

```typescript
router.get("/:id", asyncHandler(controller.findOne.bind(controller)));
```

**After:**

```typescript
router.get("/:id", controller.findOne.bind(controller));
```

#### 2.4 Add module scaffolding with Plop.js

```bash
npm install -D plop
```

Create `plopfile.js` with a generator that creates the full module structure from a resource name:

- `{name}.model.ts` — with BaseDocument interface, schema, plugins
- `{name}.repository.ts` — extending Repository base
- `{name}.service.ts` — with CRUD operations
- `{name}.controller.ts` — with standard handlers
- `{name}.validation.ts` — with create/update Zod schemas
- `{name}.doc.ts` — with OpenAPI registrations
- `index.ts` — with routes
- `__tests__/{name}.service.test.ts` — with test skeleton

**Usage:** `npx plop module user-profile` generates all 8 files in seconds.

This is a huge DX win — teams can scaffold a complete feature module in 10 seconds instead of copy-pasting and renaming from the examples module.

_Source: [Plop.js Documentation](https://plopjs.com/documentation/)_

---

### Phase 3: Production Readiness (Effort: 3-5 days)

#### 3.1 Add OpenTelemetry (optional, pre-configured)

```bash
npm install @opentelemetry/sdk-node @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics @opentelemetry/sdk-trace-node
```

Create `src/instrumentation.ts` — loaded via `--import` flag before app starts. Auto-instruments Express, MongoDB, Redis, and HTTP.

Make it **opt-in** via environment variable:

```
OTEL_ENABLED=true
OTEL_EXPORTER_ENDPOINT=http://jaeger:4318
```

Teams that don't need observability ignore it. Teams that do get it for free.

#### 3.2 Add BullMQ job queue

```bash
npm install bullmq
```

**Template structure:**

```
src/jobs/
├── index.ts              # Queue registry + Bull Board setup
├── queues/
│   └── email.queue.ts    # Example: email sending queue
└── workers/
    └── email.worker.ts   # Example: email worker
```

Include a working example (email queue) that teams can copy for their own job types. Wire up Bull Board at `/admin/queues` for monitoring.

_Source: [BullMQ Documentation](https://docs.bullmq.io/)_

#### 3.3 Replace Winston with Pino

```bash
npm uninstall winston winston-daily-rotate-file morgan
npm install pino pino-http pino-pretty
```

**Key changes:**

- Replace `logger.service.ts` with Pino configuration
- Replace `morgan.middleware.ts` with `pino-http` middleware (includes request ID tracking)
- Production: JSON to stdout (12-Factor compliant)
- Development: `pino-pretty` for human-readable output
- Request ID automatically included in all log entries

#### 3.4 Upgrade error responses to RFC 9457

Update `response-error.core.ts` to output:

```json
{
  "type": "https://api.example.com/errors/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "User with ID '123' does not exist.",
  "instance": "/api/v1/users/123"
}
```

Set response `Content-Type: application/problem+json`.

#### 3.5 Add container image scanning to CI

```yaml
# .github/workflows/ci.yml
- name: Build Docker image
  run: docker build -t backend:${{ github.sha }} -f compose/backend/Dockerfile .

- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@0.33.1
  with:
    image-ref: "backend:${{ github.sha }}"
    format: "sarif"
    output: "trivy-results.sarif"
    severity: "CRITICAL,HIGH"

- name: Upload Trivy scan results
  uses: github/codeql-action/upload-sarif@v4
  with:
    sarif_file: "trivy-results.sarif"
```

_Source: [Trivy GitHub Action](https://github.com/aquasecurity/trivy-action)_

---

### Phase 4: Architecture Improvements (Effort: 3-5 days)

#### 4.1 Replace TypeDI with tsyringe (or manual DI)

**Option A — tsyringe (drop-in):**

```bash
npm uninstall typedi
npm install tsyringe
```

Same decorator pattern (`@injectable()` vs `@Service()`), active Microsoft maintenance. Requires same TypeScript config.

**Option B — Manual DI (zero dependencies):**
Replace decorators with factory functions:

```typescript
// Instead of @Service() decorator
export function createUserService(repo: UserRepository, events: EventService) {
  return new UserService(repo, events);
}
```

Register in a composition root (`src/container.ts`). No decorator metadata needed.

**Recommendation:** tsyringe if your team likes decorators; manual DI if you want zero risk of another unmaintained library.

#### 4.2 Add token revocation

Use Redis to maintain a token blacklist:

```typescript
// On logout or "logout everywhere"
await redis.set(`blacklist:${jti}`, "1", tokenExpirySeconds);

// In auth middleware
const isBlacklisted = await redis.get(`blacklist:${jti}`);
if (isBlacklisted) throw new UnAuthorizedError("Token revoked");
```

Add a `jti` (JWT ID) claim to token generation for targeted revocation.

#### 4.3 Add ADR documentation

Create `docs/decisions/` with:

- `ADR-001-express-framework.md`
- `ADR-002-mongodb-mongoose.md`
- `ADR-003-authentication-jwt.md`
- `ADR-004-dependency-injection.md`
- `docs/decisions/template.md` — blank ADR template for teams

---

### Testing Strategy Improvements

**Current coverage thresholds:** branches 30%, functions 25%, lines 50%, statements 50%

**Assessment:** These thresholds are very low for a template. Your tests are unit-only (mocked dependencies) with one integration test.

**Recommended testing strategy (Testing Trophy approach):**

| Test Type               | Current      | Target   | Tools                                 |
| ----------------------- | ------------ | -------- | ------------------------------------- |
| **Unit tests**          | Yes (mocked) | Keep     | Jest/Vitest                           |
| **Integration tests**   | 1 test       | Add more | Supertest + mongodb-memory-server     |
| **API/Component tests** | None         | **Add**  | Supertest against real DB (in-memory) |
| **E2E tests**           | None         | Optional | Optional for template                 |

**Key improvement: Add `mongodb-memory-server`**

```bash
npm install -D mongodb-memory-server
```

This spins up a real MongoDB in-memory for tests — no external DB needed, tests are isolated and fast. Perfect for integration tests that exercise the full Controller -> Service -> Repository -> DB stack.

**Update `__tests__/setup.ts`:**

```typescript
import { MongoMemoryReplSet } from "mongodb-memory-server";

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.DATABASE_URL = replSet.getUri();
});

afterAll(async () => {
  await replSet.stop();
});
```

**Raise coverage thresholds:**

```json
{
  "branches": 60,
  "functions": 60,
  "lines": 70,
  "statements": 70
}
```

_Sources: [JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices), [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server)_

---

### Development Workflow Improvements

| Current                  | Improved                           | Impact                          |
| ------------------------ | ---------------------------------- | ------------------------------- |
| `ts-node` + `nodemon`    | `tsx watch`                        | Faster startup, fewer deps      |
| Full lint on pre-commit  | `lint-staged` (changed files only) | Faster commits                  |
| Manual module creation   | `plop` scaffolding                 | 10-second module creation       |
| CI on Node 20            | CI on Node 22                      | Match runtime                   |
| No code generation       | Plop templates                     | Consistent code patterns        |
| Copy-paste from examples | Scaffold + customize               | Fewer errors, faster onboarding |

---

### CI/CD Pipeline — Updated

```yaml
# Recommended CI pipeline
jobs:
  lint:
    - npm ci
    - npm run lint
    - npm run prettier

  test:
    - npm ci
    - npm test -- --coverage

  build:
    - npm ci
    - npm run build

  security:
    - docker build
    - trivy scan (CRITICAL, HIGH)
    - CodeQL analysis (already configured)
```

Update CI Node version from 20 to 22 to match your Docker runtime.

---

### Team Onboarding Checklist

For new team members using this template, provide:

1. `docs/SETUP.md` — already exists, good
2. `docs/ARCHITECTURE.md` — already exists, update with new patterns
3. `docs/decisions/` — ADRs explaining "why" (new)
4. `CONTRIBUTING.md` — already exists
5. `plop` scaffolding — `npx plop module <name>` for instant setup
6. Example module (`examples/`) — already exists as reference implementation

---

### Risk Assessment and Mitigation

| Risk                               | Probability | Impact | Mitigation                                       |
| ---------------------------------- | ----------- | ------ | ------------------------------------------------ |
| `csurf` vulnerability exploited    | Medium      | HIGH   | Phase 1 — replace immediately                    |
| TypeDI breaks on TypeScript update | Low         | HIGH   | Phase 4 — replace with tsyringe                  |
| Team unfamiliar with new tools     | Medium      | LOW    | Documentation + examples                         |
| Pino migration breaks logging      | Low         | MEDIUM | Test thoroughly, keep Winston config as fallback |
| OpenTelemetry overhead             | Low         | LOW    | Opt-in via env var, disabled by default          |

---

## Technical Research Recommendations

### Final Implementation Roadmap

```
Phase 1 (Week 1)     -> Security fixes: csurf, argon2, body limits
Phase 2 (Week 1-2)   -> DX: tsx, lint-staged, remove asyncHandler, plop
Phase 3 (Week 2-3)   -> Production: OpenTelemetry, BullMQ, Pino, RFC 9457, Trivy
Phase 4 (Week 3-4)   -> Architecture: DI replacement, token revocation, ADRs
```

### Technology Stack Recommendations Summary

| Component      | Current                 | Recommendation                        | Priority |
| -------------- | ----------------------- | ------------------------------------- | -------- |
| CSRF           | `csurf` (deprecated)    | `csrf-csrf`                           | CRITICAL |
| Password hash  | `bcrypt`                | `argon2`                              | HIGH     |
| TS execution   | `ts-node` + `nodemon`   | `tsx`                                 | HIGH     |
| Job queue      | None                    | `bullmq`                              | HIGH     |
| Observability  | None                    | `@opentelemetry/*`                    | HIGH     |
| Logger         | `winston` + `morgan`    | `pino` + `pino-http`                  | MEDIUM   |
| Error format   | Custom                  | RFC 9457                              | MEDIUM   |
| DI             | `typedi`                | `tsyringe` or manual                  | MEDIUM   |
| Pre-commit     | Full lint               | `lint-staged`                         | MEDIUM   |
| Scaffolding    | None                    | `plop`                                | MEDIUM   |
| Tests          | Unit only, low coverage | + Integration + mongodb-memory-server | MEDIUM   |
| Image scanning | None                    | `trivy` in CI                         | MEDIUM   |
| CI Node        | 20                      | 22                                    | LOW      |
| `asyncHandler` | Used everywhere         | Remove (Express 5 native)             | LOW      |
| Vitest         | Jest 30                 | Optional migration                    | LOW      |

### What to Keep (No Changes Needed)

- Express 5 — stable, mature, right choice for team template
- Mongoose 8 — best MongoDB ODM, no viable replacement
- Zod 4 + zod-to-openapi — excellent validation + API docs pattern
- ESLint 9 flat config — current best practice
- Docker multi-stage builds — well-structured
- CSRM architecture — practical, not over-engineered
- Feature-based module organization — modular monolith pattern
- Graceful shutdown — properly implemented
- Redis rate limiting — production-ready
- Husky + commitlint — good git hygiene

### Success Metrics

After implementing all phases, your template should achieve:

- Zero known deprecated dependencies
- OWASP-compliant password hashing
- RFC 9457-compliant error responses
- Optional observability (traces + metrics) out of the box
- Background job processing ready to use
- Sub-3-second pre-commit hooks
- 10-second module scaffolding
- 70%+ test coverage with integration tests
- Container security scanning in CI
- Documented architectural decisions
