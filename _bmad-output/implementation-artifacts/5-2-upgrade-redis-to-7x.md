---
story_id: 5.2
story_key: 5-2-upgrade-redis-to-7x
epic: 5
title: Upgrade Redis to 7.x
status: review
priority: CRITICAL
---

# Story 5.2: Upgrade Redis to 7.x

## Story

As a **developer/operator**,
I want Redis upgraded from 6.2.13 to the latest stable 7.x,
So that we receive security patches, performance improvements, and modern features.

## Acceptance Criteria

**AC1:**
**Given** Redis image is currently `redis:6.2.13-alpine`
**When** the image is updated to `redis:7-alpine` in both local and prod compose files
**Then** all services start successfully with the new Redis version
**And** existing `--appendonly yes` command flag remains compatible
**And** production `--requirepass` and `--maxmemory` flags work correctly

## Tasks/Subtasks

- [x] Task 1: Update Redis image from `redis:6.2.13-alpine` to `redis:7-alpine` in `docker-compose.yml`
- [x] Task 2: Update Redis image from `redis:6.2.13-alpine` to `redis:7-alpine` in `docker-compose.prod.yml`

## Dev Notes

- Redis 7.x is backward-compatible with 6.x for the flags we use
- The `redis-cli ping` healthcheck remains compatible
- No application code changes needed

## Dev Agent Record

### Implementation Plan
Simple image tag update from `redis:6.2.13-alpine` to `redis:7-alpine` in both compose files.

### Debug Log
No issues encountered.

### Completion Notes
✅ Redis image updated in both compose files. All flags (`--appendonly yes`, `--requirepass`, `--maxmemory`, `--maxmemory-policy`) remain compatible with Redis 7.x.

## File List

- `docker-compose.yml` (modified)
- `docker-compose.prod.yml` (modified)

## Change Log

- 2026-02-09: Upgraded Redis from 6.2.13-alpine to 7-alpine in both local and prod compose files
