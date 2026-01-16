---
project_name: 'backend-template'
user_name: 'Locnguyen'
date: '2026-01-16'
sections_completed: ['technology_stack', 'critical_rules', 'patterns', 'security', 'workers']
status: 'complete'
rule_count: 25
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Runtime:** Node.js 20+
- **Language:** TypeScript 5.6+ (Strict Mode)
- **Framework:** Express 4.21+ (Backend), React 19 + Vite 7 (Frontend)
- **Database:** MongoDB 7.0+ (Mongoose 7.8+)
- **Queue:** BullMQ + Redis 7.2+
- **PDF Engine:** Playwright
- **AI:** OpenAI SDK + Opossum (Circuit Breaker)
- **Validation:** Zod + zod-to-openapi
- **Auth:** Firebase Admin SDK

## Critical Implementation Rules

### 1. Async Workers & Jobs
- **Rule:** Define Jobs in `src/jobs/*.job.ts` (Producers) and Workers in `src/workers/*.worker.ts` (Consumers).
- **Rule:** Worker logic MUST be idempotent. Handle duplicate job processing gracefully.
- **Rule:** PDF generation MUST happen inside a Playwright sandbox. NEVER expose browser instance globally.
- **Rule:** Use a "Reaper" pattern to kill zombie browser processes.

### 2. Credit System (Financial Safety)
- **Rule:** ALL credit deductions MUST use the **Reservation Pattern** (Reserve -> Execute -> Commit/Rollback).
- **Rule:** NEVER modify `creditBalance` directly without a Ledger Transaction.
- **Rule:** Use ACID Transactions (Mongoose `withTransaction`) for all ledger updates.

### 3. AI Integration
- **Rule:** Wrap ALL OpenAI calls with a Circuit Breaker (Opossum) to prevent cascading failures.
- **Rule:** Use `userContext.id` for rate limiting keys in Redis.
- **Rule:** Handle AI timeouts gracefully (NFR: < 5s).

### 4. Frontend Architecture (Local-first)
- **Rule:** Editor state MUST persist to IndexedDB (via `idb` or `zustand-persist`) immediately on change.
- **Rule:** Sync to backend MUST be Debounced (1000ms) and use **Optimistic Locking** (`_v` version check).
- **Rule:** Use Zustand for state management.

### 5. Tenant Isolation (Security)
- **Rule:** Every Mongoose query MUST include `{ ownerUserId: userContext.id }`.
- **Anti-Pattern:** `Model.find({})` without owner filter.

## Coding Conventions

### Naming
- **Files:** `kebab-case` (e.g., `resume-export.worker.ts`)
- **Classes:** `PascalCase`
- **Job Names:** `domain:action` (e.g., `resume:export-pdf`)
- **DB Fields:** `camelCase`

### Structure
- **API Module:** `src/api/{resource}/` MUST contain Controller, Service, Model, Validation, Doc.
- **Workers:** Logic resides in `src/workers/`, job creation in `src/jobs/`.

### Error Handling
- **Backend:** Throw `AppError` with specific error codes (e.g., `ERR_CREDIT_INSUFFICIENT`).
- **Frontend:** Show toast notifications for `AppError`, handle sync errors with silent retry where appropriate.

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code.
- Follow ALL rules exactly as documented.
- If a rule in this file conflicts with a general pattern, this file takes precedence.
- Update this file if new architectural patterns emerge.

Last Updated: 2026-01-16