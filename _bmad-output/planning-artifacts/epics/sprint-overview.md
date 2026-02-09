---
project: backend-template
created: 2026-02-07
updated: 2026-02-09
status: in-progress
total_epics: 8
total_stories: 32
source_1: "technical-backend-template-best-practices-research-2026-02-07.md"
source_2: "technical-docker-compose-volumes-best-practices-research-2026-02-09.md"
---

# Backend Template Improvement — Sprint Overview

## Epic Summary

| Epic  | Title                             | Priority | Stories | Status  | Dependencies |
| ----- | --------------------------------- | -------- | ------- | ------- | ------------ |
| **1** | Critical Security Fixes           | CRITICAL | 4       | done    | None         |
| **2** | Developer Experience Improvements | HIGH     | 4       | done    | None         |
| **3** | Production Readiness              | HIGH     | 6       | done    | Epic 1       |
| **4** | Architecture Improvements         | MEDIUM   | 4       | done    | Epic 1, 2    |
| **5** | Data Persistence and Reliability  | CRITICAL | 4       | pending | None         |
| **6** | Compose Configuration Refactoring | HIGH     | 3       | pending | Epic 5       |
| **7** | Production Security Hardening     | HIGH     | 5       | pending | None         |
| **8** | Production Reverse Proxy and SSL  | MEDIUM   | 2       | pending | None         |

## Execution Order (Epics 5-8)

Epics 5 and 7 can run **in parallel** (no dependencies between them).
Epic 6 depends on Epic 5 (persistence fixes should be in place before refactoring).
Epic 8 is independent and can run anytime.

```
Phase 1:  Epic 5 (Persistence) + Epic 7 (Security) — in parallel
Phase 2:  Epic 6 (Config Refactoring) — starts after Epic 5 complete
Phase 3:  Epic 8 (Reverse Proxy + SSL)
```

## All Stories (Epics 5-8) by Priority

### CRITICAL

| Story | Title                              | Epic |
| ----- | ---------------------------------- | ---- |
| 5.1   | Add Redis Data Volume              | 5    |
| 5.2   | Upgrade Redis to 7.x              | 5    |

### HIGH

| Story | Title                                     | Epic |
| ----- | ----------------------------------------- | ---- |
| 5.3   | Add Backend Service Healthcheck           | 5    |
| 5.4   | Update Frontend Dependency Ordering       | 5    |
| 6.1   | Refactor to Base + Override Pattern       | 6    |
| 7.1   | MongoDB Keyfile .gitignore + Gen Script   | 7    |
| 7.2   | Mount MongoDB Keyfile as Read-Only Volume | 7    |
| 7.3   | Add Network Isolation for Production      | 7    |
| 7.4   | Migrate Secrets to Docker Compose Secrets | 7    |
| 7.5   | Add Container Security Hardening Options  | 7    |

### MEDIUM

| Story | Title                                      | Epic |
| ----- | ------------------------------------------ | ---- |
| 6.2   | Add Volume Labels and Metadata             | 6    |
| 6.3   | Remove Container Names from Production     | 6    |
| 8.1   | Add Nginx Reverse Proxy Service            | 8    |
| 8.2   | Configure SSL/TLS Termination              | 8    |

## File Locations

- Epic 1: `_bmad-output/planning-artifacts/epics/epic-01-security-fixes.md`
- Epic 2: `_bmad-output/planning-artifacts/epics/epic-02-dx-improvements.md`
- Epic 3: `_bmad-output/planning-artifacts/epics/epic-03-production-readiness.md`
- Epic 4: `_bmad-output/planning-artifacts/epics/epic-04-architecture-improvements.md`
- Epic 5: `_bmad-output/planning-artifacts/epics/epic-05-data-persistence-reliability.md`
- Epic 6: `_bmad-output/planning-artifacts/epics/epic-06-compose-config-refactoring.md`
- Epic 7: `_bmad-output/planning-artifacts/epics/epic-07-production-security-hardening.md`
- Epic 8: `_bmad-output/planning-artifacts/epics/epic-08-reverse-proxy-ssl.md`
- Research (Epics 1-4): `_bmad-output/planning-artifacts/research/technical-backend-template-best-practices-research-2026-02-07.md`
- Research (Epics 5-8): `_bmad-output/planning-artifacts/research/technical-docker-compose-volumes-best-practices-research-2026-02-09.md`
