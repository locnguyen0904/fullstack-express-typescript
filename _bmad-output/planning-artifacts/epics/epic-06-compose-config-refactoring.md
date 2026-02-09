---
epic: 6
title: Compose Configuration Refactoring
status: pending
priority: HIGH
stories: 3
dependencies: Epic 5
source: technical-docker-compose-volumes-best-practices-research-2026-02-09.md
frs_covered: [FR4, FR9, FR11]
---

# Epic 6: Compose Configuration Refactoring

Developers can maintain a single source of truth for shared service configuration, with environment-specific overrides cleanly separated, reducing duplication and maintenance errors.

## Story 6.1: Refactor to Base + Override Compose Pattern

As a **developer**,
I want shared service configuration in a base `docker-compose.yml` with dev-specific settings in `docker-compose.override.yml`,
So that I maintain one source of truth and reduce duplication between environments.

**Acceptance Criteria:**

**Given** the current separate `docker-compose.yml` and `docker-compose.prod.yml` files
**When** configuration is refactored to base + override pattern
**Then** `docker-compose.yml` contains shared service definitions (images, healthchecks, networks, volumes, base environment)
**And** `docker-compose.override.yml` contains dev-only settings (bind mounts, debug ports 9229, `target: development`, `stdin_open`, `tty`)
**And** `docker-compose.prod.yml` contains only production overrides (`target: production`, resource limits, logging config)

**Given** a developer runs `docker compose up` locally
**When** no `-f` flag is provided
**Then** Docker Compose auto-loads `docker-compose.yml` + `docker-compose.override.yml` and all services start correctly for development

**Given** an operator deploys to production
**When** running `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
**Then** production overrides are applied correctly and verified via `docker compose config`

## Story 6.2: Add Volume Labels and Metadata

As a **developer/operator**,
I want all named volumes to have descriptive labels,
So that volume purpose and backup priority are documented for management tooling and team clarity.

**Acceptance Criteria:**

**Given** named volumes exist in the base `docker-compose.yml`
**When** labels are added to each volume definition
**Then** `mongo_data` has labels for description ("MongoDB data directory") and backup priority ("critical")
**And** `redis_data` has labels for description ("Redis persistence data") and backup priority ("medium")
**And** `backend_node_modules` and `frontend_node_modules` have labels indicating they are development-only and non-critical

**Given** a developer runs `docker volume inspect`
**When** inspecting any project volume
**Then** the labels are visible in the output with correct metadata

## Story 6.3: Remove Container Names from Production Services

As an **operator**,
I want production services to not have hardcoded `container_name` values,
So that future horizontal scaling with `deploy.replicas` is possible without naming conflicts.

**Acceptance Criteria:**

**Given** the production compose file has `container_name` set on all services
**When** `container_name` is removed from all services in `docker-compose.prod.yml`
**Then** Docker Compose generates container names automatically using the project name prefix
**And** all services start and communicate correctly without hardcoded names

**Given** the local dev compose still benefits from predictable container names
**When** `container_name` is retained in `docker-compose.override.yml` for dev convenience
**Then** local development containers have predictable names for `docker exec` and log viewing
