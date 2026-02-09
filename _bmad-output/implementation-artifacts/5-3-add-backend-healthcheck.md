---
story_id: 5.3
story_key: 5-3-add-backend-healthcheck
epic: 5
title: Add Backend Service Healthcheck
status: review
priority: HIGH
---

# Story 5.3: Add Backend Service Healthcheck

## Story

As a **developer/operator**,
I want the backend service to have a healthcheck,
So that dependent services only start when the backend is actually serving requests.

## Acceptance Criteria

**AC1:**
**Given** the backend Express.js service is running
**When** a healthcheck is configured using `node -e` HTTP check against `/health`
**Then** Docker reports the backend as `healthy` only when the HTTP endpoint responds successfully
**And** the healthcheck is configured in both local and prod compose files with appropriate intervals

**AC2:**
**Given** the backend service is still initializing
**When** the healthcheck runs during `start_period`
**Then** failures during `start_period` do not count toward the `retries` limit

## Tasks/Subtasks

- [x] Task 1: Verify a `/health` endpoint exists in the backend Express.js app (exists at `backend/src/api/health/index.ts`)
- [x] Task 2: Add healthcheck configuration to backend service in `docker-compose.yml` (interval: 10s, timeout: 5s, retries: 5, start_period: 15s)
- [x] Task 3: Add healthcheck configuration to backend service in `docker-compose.prod.yml` (interval: 30s, timeout: 10s, retries: 5, start_period: 30s)

## Dev Notes

- Health endpoint already exists at `/health` returning 200 (ok) or 503 (error) with DB and Redis status checks
- Used `node -e` with `http.get` instead of `curl` since `curl` is not available in `node:24-alpine` images
- Same approach as the existing Dockerfile HEALTHCHECK directive
- Local intervals are faster (10s) for quicker dev feedback; prod intervals are slower (30s) to reduce overhead

## Dev Agent Record

### Implementation Plan
Added Docker Compose healthcheck to backend service using `node -e "require('http').get(...)"` pattern, matching the existing Dockerfile HEALTHCHECK approach.

### Debug Log
Initially considered `curl -f` but verified the `node:24-alpine` base image doesn't include curl. Used `node -e` with built-in `http` module instead.

### Completion Notes
✅ Backend healthcheck added to both compose files. Uses the existing `/health` endpoint which checks MongoDB and Redis connectivity. Local uses 10s interval with 15s start_period, prod uses 30s interval with 30s start_period.

## File List

- `docker-compose.yml` (modified)
- `docker-compose.prod.yml` (modified)

## Change Log

- 2026-02-09: Added backend healthcheck to both local and prod compose files using node HTTP check
