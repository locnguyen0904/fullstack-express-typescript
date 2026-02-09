---
story_id: 6.3
story_key: 6-3-remove-prod-container-names
epic: 6
title: Remove Container Names from Production Services
status: review
priority: HIGH
---

# Story 6.3: Remove Container Names from Production Services

## Story

As an **operator**,
I want production services to not have hardcoded `container_name` values,
So that future horizontal scaling with `deploy.replicas` is possible without naming conflicts.

## Acceptance Criteria

**AC1:**
**Given** the production compose file previously had `container_name` set on all services
**When** `container_name` is removed from all services in `docker-compose.prod.yml`
**Then** Docker Compose generates container names automatically using the project name prefix

**AC2:**
**Given** the local dev compose still benefits from predictable container names
**When** `container_name` is retained in `docker-compose.override.yml` for dev convenience
**Then** local development containers have predictable names for `docker exec` and log viewing

## Tasks/Subtasks

- [x] Task 1: Ensure `container_name` is NOT present in `docker-compose.prod.yml`
- [x] Task 2: Ensure `container_name` IS present in `docker-compose.override.yml` for all 4 services

## Dev Notes

- Production containers now get auto-generated names like `backend-template-mongo-1`
- Dev containers retain predictable names: `backend-template_mongo`, `backend-template_backend`, etc.
- This enables future `deploy.replicas` scaling in production

## Dev Agent Record

### Implementation Plan
Container names moved from prod to dev override only, as part of the compose refactoring in Story 6.1.

### Debug Log
No issues encountered.

### Completion Notes
Production compose has zero `container_name` entries. Dev override has all 4 container names.

## File List

- `docker-compose.prod.yml` (modified - container_name removed)
- `docker-compose.override.yml` (created - container_name for all services)

## Change Log

- 2026-02-09: Removed container_name from production, retained in dev override
