# Story 1.1: Project Initialization & Docker Setup

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want to initialize the project infrastructure with Docker Compose,
so that I have a consistent environment for development.

## Acceptance Criteria

1. **Given** the existing boilerplate, **When** I run `docker-compose up`, **Then** MongoDB (Replica Set), Redis, Backend API, and Worker containers should start healthy.
2. **And** the backend service should connect successfully to Mongo and Redis.
3. **And** the frontend service should be reachable via localhost.

## Tasks / Subtasks

- [x] Configure MongoDB Replica Set in Docker (AC: 1, 2)
  - [x] Update `docker-compose.yml` for `mongo` service to use `--replSet rs0`
  - [x] Add mechanism to initialize replica set (`rs.initiate()`) automatically
- [x] Configure Redis with Persistence (AC: 1)
  - [x] Update `docker-compose.yml` for `redis` service to enable AOF (`redis-server --appendonly yes`)
- [x] Configure Backend Worker Service (AC: 1)
  - [x] Create `backend/src/worker.ts` entry point (minimal placeholder)
  - [x] Add `worker` service to `docker-compose.yml` (same image as api, different command)
- [x] Verify Frontend & Backend Connectivity (AC: 3)
  - [x] Ensure `frontend` service exposes port 3001 (or similar)
  - [x] Ensure `api` service connects to `mongo` and `redis` via docker network aliases

## Dev Notes

- **Architecture Compliance:**
  - **Mongo Replica Set:** Required for Transactions (Credits System). Use version 7.0+.
  - **Redis Persistence:** Required for BullMQ reliability.
  - **Worker Process:** Separate container sharing the same codebase but different entry point (`worker.ts`).
- **Project Structure:**
  - `docker-compose.yml` is in root.
  - Backend source: `backend/src/`.
  - Frontend source: `frontend/src/`.
- **References:**
  - [Architecture Document](../planning-artifacts/architecture.md) - Infrastructure Section
  - [Project Context](../../project-context.md) - Tech Stack

## Dev Agent Record

### Agent Model Used

O1-Mini / GPT-4o

### Debug Log References

### Completion Notes List

- Configured `docker-compose.yml` with `mongo` (Replica Set), `mongo-init`, `redis` (AOF), `api`, `worker`, and `frontend`.
- Created `backend/src/worker.ts` as entry point for worker process.
- Updated `backend/package.json` with `worker` and `dev:worker` scripts.
- Verified TypeScript compilation for backend.

### File List

- backend/src/worker.ts
- backend/package.json
- docker-compose.yml
