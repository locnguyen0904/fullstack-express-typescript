---
project: backend-template
created: 2026-02-07
status: done
total_epics: 4
total_stories: 18
estimated_effort: "8-14 days"
source: "technical-backend-template-best-practices-research-2026-02-07.md"
---

# Backend Template Improvement — Sprint Overview

## Epic Summary

| Epic  | Title                             | Priority | Stories | Effort   | Dependencies |
| ----- | --------------------------------- | -------- | ------- | -------- | ------------ |
| **1** | Critical Security Fixes           | CRITICAL | 4       | 1-2 days | None         |
| **2** | Developer Experience Improvements | HIGH     | 4       | 1-2 days | None         |
| **3** | Production Readiness              | HIGH     | 6       | 3-5 days | Epic 1       |
| **4** | Architecture Improvements         | MEDIUM   | 4       | 3-5 days | Epic 1, 2    |

## Execution Order

Epics 1 and 2 can run **in parallel** (no dependencies between them).
Epic 3 depends on Epic 1 (security fixes should be in place).
Epic 4 depends on Epics 1 and 2.

```
Week 1:  Epic 1 (Security) + Epic 2 (DX) — in parallel
Week 2:  Epic 3 (Production Readiness) — starts after Epic 1 complete
Week 3:  Epic 3 continues + Epic 4 (Architecture) begins
Week 4:  Epic 4 completes + Story 4.4 (Documentation review)
```

## All Stories by Priority

### CRITICAL

| Story | Title                        | Epic | Effort  |
| ----- | ---------------------------- | ---- | ------- |
| 1.1   | Replace csurf with csrf-csrf | 1    | 2-4 hrs |
| 1.2   | Replace bcrypt with Argon2   | 1    | 2-4 hrs |

### HIGH

| Story | Title                              | Epic | Effort  |
| ----- | ---------------------------------- | ---- | ------- |
| 1.3   | Add request body size limits       | 1    | 30 min  |
| 2.1   | Replace ts-node + nodemon with tsx | 2    | 1-2 hrs |
| 3.1   | Add OpenTelemetry (opt-in)         | 3    | 4-6 hrs |
| 3.2   | Add BullMQ job queue               | 3    | 4-6 hrs |

### MEDIUM

| Story | Title                        | Epic | Effort  |
| ----- | ---------------------------- | ---- | ------- |
| 2.2   | Add lint-staged              | 2    | 1 hr    |
| 2.3   | Remove asyncHandler          | 2    | 1-2 hrs |
| 2.4   | Add Plop.js scaffolding      | 2    | 3-4 hrs |
| 3.3   | Replace Winston with Pino    | 3    | 3-4 hrs |
| 3.4   | Upgrade errors to RFC 9457   | 3    | 2-3 hrs |
| 3.5   | Add Trivy to CI              | 3    | 1-2 hrs |
| 3.6   | Add mongodb-memory-server    | 3    | 3-4 hrs |
| 4.1   | Replace TypeDI with tsyringe | 4    | 4-6 hrs |
| 4.2   | Add token revocation         | 4    | 2-3 hrs |

### LOW

| Story | Title                    | Epic | Effort  |
| ----- | ------------------------ | ---- | ------- |
| 1.4   | Update CI to Node.js 22  | 1    | 15 min  |
| 4.3   | Add ADR documentation    | 4    | 2-3 hrs |
| 4.4   | Update all documentation | 4    | 2-3 hrs |

## File Locations

- Epic 1: `_bmad-output/planning-artifacts/epics/epic-01-security-fixes.md`
- Epic 2: `_bmad-output/planning-artifacts/epics/epic-02-dx-improvements.md`
- Epic 3: `_bmad-output/planning-artifacts/epics/epic-03-production-readiness.md`
- Epic 4: `_bmad-output/planning-artifacts/epics/epic-04-architecture-improvements.md`
- Research: `_bmad-output/planning-artifacts/research/technical-backend-template-best-practices-research-2026-02-07.md`
