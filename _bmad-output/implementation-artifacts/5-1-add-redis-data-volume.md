---
story_id: 5.1
story_key: 5-1-add-redis-data-volume
epic: 5
title: Add Redis Data Volume for Persistence
status: done
priority: CRITICAL
---

# Story 5.1: Add Redis Data Volume for Persistence

## Story

As a **developer/operator**,
I want Redis to persist data to a named volume,
So that cached data, sessions, and rate-limit state survive container restarts.

## Acceptance Criteria

**AC1:**
**Given** the Docker Compose local config has a Redis service
**When** `redis_data` named volume is added and mapped to `/data`
**Then** Redis data persists across `docker compose down && docker compose up`
**And** the `redis_data` volume is declared in the top-level `volumes:` section in both local and prod compose files

**AC2:**
**Given** the production Redis service uses `--appendonly yes`
**When** the container restarts
**Then** AOF data is recovered from the persistent volume at `/data`

## Tasks/Subtasks

- [x] Task 1: Add `redis_data` named volume to `docker-compose.yml` top-level `volumes:` section
- [x] Task 2: Add `volumes: - redis_data:/data` to the Redis service in `docker-compose.yml`
- [x] Task 3: Add `redis_data` named volume to `docker-compose.prod.yml` top-level `volumes:` section
- [x] Task 4: Add `volumes: - redis_data:/data` to the Redis service in `docker-compose.prod.yml`

## Dev Notes

- Redis stores persistence data (AOF and RDB files) at `/data` by default
- The `--appendonly yes` flag is already set in both compose files
- Production also uses `--requirepass` and `--maxmemory` flags - these are unaffected by volume changes
- This is a pure Docker Compose configuration change - no application code changes needed

## Dev Agent Record

### Implementation Plan
Added `redis_data` named volume to both local and prod compose files, mounted at `/data` in the Redis service container.

### Debug Log
No issues encountered. Straightforward YAML additions.

### Completion Notes
✅ All 4 tasks completed. `redis_data` volume declared in top-level volumes and mounted to Redis service in both `docker-compose.yml` and `docker-compose.prod.yml`. Redis data will now persist across container restarts.

## File List

- `docker-compose.yml` (modified)
- `docker-compose.prod.yml` (modified)

## Change Log

- 2026-02-09: Added `redis_data` named volume for Redis persistence in both local and prod compose files
