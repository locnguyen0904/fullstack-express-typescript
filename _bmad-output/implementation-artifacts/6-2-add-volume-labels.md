---
story_id: 6.2
story_key: 6-2-add-volume-labels
epic: 6
title: Add Volume Labels and Metadata
status: review
priority: HIGH
---

# Story 6.2: Add Volume Labels and Metadata

## Story

As a **developer/operator**,
I want all named volumes to have descriptive labels,
So that volume purpose and backup priority are documented for management tooling and team clarity.

## Acceptance Criteria

**AC1:**
**Given** named volumes exist in the base `docker-compose.yml`
**When** labels are added to each volume definition
**Then** `mongo_data` has labels for description ("MongoDB data directory") and backup priority ("critical")
**And** `redis_data` has labels for description ("Redis persistence data") and backup priority ("medium")
**And** `backend_node_modules` and `frontend_node_modules` have labels indicating they are development-only and non-critical

## Tasks/Subtasks

- [x] Task 1: Add labels to `mongo_data` and `redis_data` volumes in base `docker-compose.yml`
- [x] Task 2: Add labels to `backend_node_modules` and `frontend_node_modules` in `docker-compose.override.yml`

## Dev Notes

- Labels use `com.backend-template.*` namespace
- Label keys: `description`, `backup-priority`, `environment` (for dev-only volumes)
- Dev-only volumes (`*_node_modules`) have `backup-priority: none` and `environment: development`

## Dev Agent Record

### Implementation Plan
Added Docker volume labels to all named volumes across base and override compose files.

### Debug Log
No issues encountered.

### Completion Notes
All 4 named volumes now have descriptive labels. Visible via `docker volume inspect`.

## File List

- `docker-compose.yml` (modified - labels on mongo_data, redis_data)
- `docker-compose.override.yml` (modified - labels on node_modules volumes)

## Change Log

- 2026-02-09: Added descriptive labels to all named volumes
