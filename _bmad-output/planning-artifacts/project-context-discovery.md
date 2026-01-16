---
stepsCompleted:
  - step-01-discover
inputDocuments:
  - _bmad-output/planning-artifacts/architecture.md
  - project-context.md
workflowType: 'generate-project-context'
project_name: 'backend-template'
user_name: 'Locnguyen'
date: '2026-01-16'
lastStep: 1
---

# Project Context Discovery

## Technology Stack Discovered

**Core Technologies:**
- Backend: Node.js 20+, Express 4.21+
- Frontend: React 19, Vite 7
- Database: MongoDB 7.0+ (Mongoose)
- Cache/Queue: Redis, BullMQ (New)
- AI: OpenAI/Anthropic (New)
- PDF: Playwright (New)
- Auth: Firebase Admin

**Architecture Patterns:**
- Service Layer Pattern (TypeDI)
- Reservation Pattern (Credits)
- Local-first Persistence (Editor)
- Tenant Isolation (Middleware)

## Existing Patterns Found

**Naming Conventions:**
- Files: `kebab-case`
- Classes: `PascalCase`
- Service Methods: `camelCase`, `async`
- DB Fields: `camelCase`

**Implementation Rules:**
- ALL Service methods must accept `userContext`.
- ALWAYS filter queries by `ownerUserId`.
- Use Transactions for Ledger updates.
- Use QueueService for async tasks.
- API structure: `src/api/{resource}/{controller,service,model}`.

**Missing/New Context Needs:**
- Rules for creating Workers (`src/workers`).
- Rules for Job naming (`domain:action`).
- Rules for AI Circuit Breaker usage.
- Rules for Hybrid Persistence sync logic.

**Action:** Updating existing `project-context.md` with new architectural decisions.
