---
story_id: 6.1
story_key: 6-1-refactor-base-override-compose
epic: 6
title: Refactor to Base + Override Compose Pattern
status: done
priority: HIGH
---

# Story 6.1: Refactor to Base + Override Compose Pattern

## Story

As a **developer**,
I want shared service configuration in a base `docker-compose.yml` with dev-specific settings in `docker-compose.override.yml`,
So that I maintain one source of truth and reduce duplication between environments.

## Acceptance Criteria

**AC1:**
**Given** the current separate `docker-compose.yml` and `docker-compose.prod.yml` files
**When** configuration is refactored to base + override pattern
**Then** `docker-compose.yml` contains shared service definitions (images, healthchecks, networks, volumes, base environment)
**And** `docker-compose.override.yml` contains dev-only settings (bind mounts, debug ports 9229, `target: development`, `stdin_open`, `tty`)
**And** `docker-compose.prod.yml` contains only production overrides (`target: production`, resource limits, logging config)

**AC2:**
**Given** a developer runs `docker compose up` locally
**When** no `-f` flag is provided
**Then** Docker Compose auto-loads `docker-compose.yml` + `docker-compose.override.yml` and all services start correctly for development

**AC3:**
**Given** an operator deploys to production
**When** running `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
**Then** production overrides are applied correctly and verified via `docker compose config`

## Tasks/Subtasks

- [x] Task 1: Extract shared config into base `docker-compose.yml` (images, healthchecks, networks, volumes, environment)
- [x] Task 2: Create `docker-compose.override.yml` with dev-only settings (bind mounts, debug ports, build targets, container names, stdin_open/tty)
- [x] Task 3: Slim down `docker-compose.prod.yml` to only production overrides (build targets, resource limits, logging, env_file)
- [x] Task 4: Update DOCKER.md with new compose architecture and production commands
- [x] Task 5: Validate both configs with `docker compose config`

## Dev Notes

- Environment variables use mapping format (not list) for proper Docker Compose merge behavior
- Base healthcheck uses dev defaults for `MONGO_INITDB_ROOT_PASSWORD:-password123` which is harmless in prod (real value overrides the default)
- Docker Compose auto-loads `docker-compose.yml` + `docker-compose.override.yml` on `docker compose up`
- Prod requires explicit `-f docker-compose.yml -f docker-compose.prod.yml`
- Healthcheck intervals/timeouts in prod override merge with base (keeps `test` and `retries` from base)

## Dev Agent Record

### Implementation Plan
Split existing docker-compose.yml and docker-compose.prod.yml into three files: base (shared), override (dev), prod (overrides only). Convert environment from list to mapping format for merge compatibility.

### Debug Log
No issues encountered. Both `docker compose config` (dev) and `docker compose -f ... -f ... config` (prod) validate successfully.

### Completion Notes
Base file reduced from 102 to 81 lines. Prod file reduced from 136 to 81 lines. New override file is 44 lines. Total config is smaller due to eliminated duplication.

## File List

- `docker-compose.yml` (rewritten - base/shared config)
- `docker-compose.override.yml` (new - dev overrides)
- `docker-compose.prod.yml` (rewritten - prod overrides only)
- `DOCKER.md` (updated - architecture description and prod commands)
- `.gitignore` (modified - added `.env.prod`)

## Change Log

- 2026-02-09: Refactored to base + override + prod compose pattern
