---
story_id: 5.4
story_key: 5-4-update-frontend-depends-on
epic: 5
title: Update Frontend Dependency to Health-Based Ordering
status: done
priority: HIGH
---

# Story 5.4: Update Frontend Dependency to Health-Based Ordering

## Story

As a **developer/operator**,
I want the frontend to wait for a healthy backend before starting,
So that the frontend doesn't start and fail to connect to an unready backend.

## Acceptance Criteria

**AC1:**
**Given** the backend service has a healthcheck (from Story 5.3)
**When** the frontend `depends_on` is updated to `condition: service_healthy`
**Then** the frontend container only starts after backend reports `healthy`
**And** this is configured in both local and prod compose files

**AC2:**
**Given** the backend takes longer than usual to start
**When** the frontend is waiting on `service_healthy`
**Then** the frontend does not start prematurely and Docker Compose shows the dependency wait status

## Tasks/Subtasks

- [x] Task 1: Update frontend `depends_on` in `docker-compose.yml` from `- backend` to `backend: condition: service_healthy`
- [x] Task 2: Update frontend `depends_on` in `docker-compose.prod.yml` from `- backend` to `backend: condition: service_healthy`

## Dev Notes

- Changed from simple list dependency to condition-based dependency
- Requires backend to have a healthcheck (satisfied by Story 5.3)
- No application code changes needed

## Dev Agent Record

### Implementation Plan
Updated frontend `depends_on` from simple array format to object format with `condition: service_healthy` in both compose files.

### Debug Log
No issues encountered.

### Completion Notes
✅ Frontend now waits for backend to be healthy (HTTP 200 on `/health`) before starting. Applied to both local and prod compose files.

## File List

- `docker-compose.yml` (modified)
- `docker-compose.prod.yml` (modified)

## Change Log

- 2026-02-09: Updated frontend depends_on to use condition: service_healthy for backend in both compose files
