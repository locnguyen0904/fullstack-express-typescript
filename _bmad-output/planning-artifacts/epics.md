---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - '_bmad-output/planning-artifacts/research/technical-docker-compose-volumes-best-practices-research-2026-02-09.md'
---

# backend-template - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for backend-template, decomposing the requirements from the Docker Compose Technical Research into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Add `redis_data` named volume mapped to `/data` for Redis persistence in both local and production compose files
FR2: Add healthcheck to the backend service to verify it is serving HTTP requests
FR3: Update frontend `depends_on` to use `condition: service_healthy` for backend
FR4: Refactor compose files to base + override pattern (`docker-compose.yml` base, `docker-compose.override.yml` dev, `docker-compose.prod.yml` prod overrides)
FR5: Add network isolation with separate `frontend-network` and `backend-network` in production
FR6: Migrate production secrets (Mongo password, Redis password) from environment variables to Docker Compose secrets
FR7: Add nginx reverse proxy service with SSL termination for production
FR8: Upgrade Redis from 6.2.13 to 7.x
FR9: Add volume labels with metadata (description, backup priority) to all named volumes
FR10: Add security hardening options (`security_opt`, `cap_drop`, `read_only`) to production services
FR11: Remove `container_name` from production services to support future horizontal scaling with replicas
FR12: Add MongoDB keyfile to `.gitignore` to prevent committing secrets to version control
FR13: Add a `generate:mongo-key` script to package.json that generates a MongoDB replica set keyfile for self-hosted production deployments
FR14: Production compose should mount the generated MongoDB keyfile as a `:ro` volume instead of baking it into the Dockerfile

### NonFunctional Requirements

NFR1: Zero data loss on container restart - all stateful services must have persistent volumes
NFR2: All services must use healthcheck-based dependency ordering (`condition: service_healthy`)
NFR3: No secrets exposed via environment variables in production (use file-based secrets)
NFR4: SSL/TLS enabled for all public-facing endpoints in production
NFR5: Production containers must follow defense-in-depth security (non-root users, dropped capabilities, read-only fs)
NFR6: Compose configuration must minimize duplication between environments (DRY principle)
NFR7: Volume storage must be monitored with alerts at 80% capacity

### Additional Requirements

- Redis production should enable both AOF and RDB persistence for maximum durability
- MongoDB keyfile must never be committed to Git (`.gitignore` enforced)
- Self-hosted production flow: generate keyfile locally via script, mount into container at runtime
- Script should generate a secure random keyfile with proper permissions (`chmod 400`)
- Production services should include `cpus` limits alongside existing memory limits
- `docker compose config` should be used to verify merged configuration before deploying
- Consider Compose profiles for optional services (monitoring, debug tools) as future enhancement

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 1 | Redis data volume |
| FR2 | Epic 1 | Backend healthcheck |
| FR3 | Epic 1 | Frontend depends_on service_healthy |
| FR4 | Epic 2 | Refactor to base + override pattern |
| FR5 | Epic 3 | Network isolation |
| FR6 | Epic 3 | Docker Compose secrets |
| FR7 | Epic 4 | Nginx reverse proxy + SSL |
| FR8 | Epic 1 | Upgrade Redis to 7.x |
| FR9 | Epic 2 | Volume labels with metadata |
| FR10 | Epic 3 | Security hardening (security_opt, cap_drop, read_only) |
| FR11 | Epic 2 | Remove container_name for scaling support |
| FR12 | Epic 3 | MongoDB keyfile in .gitignore |
| FR13 | Epic 3 | Generate mongo-key script in package.json |
| FR14 | Epic 3 | Mount MongoDB keyfile as :ro volume |

## Epic List

### Epic 1: Data Persistence and Reliability
Developers and operators can trust that all stateful services persist data across container restarts, with proper health-based startup ordering ensuring services are truly ready before dependents start.
**FRs covered:** FR1, FR2, FR3, FR8

### Epic 2: Compose Configuration Refactoring
Developers can maintain a single source of truth for shared service configuration, with environment-specific overrides cleanly separated, reducing duplication and maintenance errors.
**FRs covered:** FR4, FR9, FR11

### Epic 3: Production Security Hardening
Operators can deploy with confidence that secrets are protected, containers follow defense-in-depth principles, and network isolation prevents unauthorized access between services.
**FRs covered:** FR5, FR6, FR10, FR12, FR13, FR14

### Epic 4: Production Reverse Proxy and SSL
Operators can expose the application securely to the internet with SSL/TLS termination, proper request routing, and a foundation for future horizontal scaling.
**FRs covered:** FR7

## Epic 1: Data Persistence and Reliability

Developers and operators can trust that all stateful services persist data across container restarts, with proper health-based startup ordering ensuring services are truly ready before dependents start.

### Story 1.1: Add Redis Data Volume for Persistence

As a **developer/operator**,
I want Redis to persist data to a named volume,
So that cached data, sessions, and rate-limit state survive container restarts.

**Acceptance Criteria:**

**Given** the Docker Compose local config has a Redis service
**When** `redis_data` named volume is added and mapped to `/data`
**Then** Redis data persists across `docker compose down && docker compose up`
**And** the `redis_data` volume is declared in the top-level `volumes:` section in both local and prod compose files

**Given** the production Redis service uses `--appendonly yes`
**When** the container restarts
**Then** AOF data is recovered from the persistent volume at `/data`

### Story 1.2: Upgrade Redis to 7.x

As a **developer/operator**,
I want Redis upgraded from 6.2.13 to the latest stable 7.x,
So that we receive security patches, performance improvements, and modern features.

**Acceptance Criteria:**

**Given** Redis image is currently `redis:6.2.13-alpine`
**When** the image is updated to `redis:7-alpine` in both local and prod compose files
**Then** all services start successfully with the new Redis version
**And** existing `--appendonly yes` command flag remains compatible
**And** production `--requirepass` and `--maxmemory` flags work correctly

### Story 1.3: Add Backend Service Healthcheck

As a **developer/operator**,
I want the backend service to have a healthcheck,
So that dependent services only start when the backend is actually serving requests.

**Acceptance Criteria:**

**Given** the backend Express.js service is running
**When** a healthcheck is configured using `curl -f http://localhost:3000/health` (or equivalent)
**Then** Docker reports the backend as `healthy` only when the HTTP endpoint responds successfully
**And** the healthcheck is configured in both local and prod compose files with appropriate intervals

**Given** the backend service is still initializing
**When** the healthcheck runs during `start_period`
**Then** failures during `start_period` do not count toward the `retries` limit

### Story 1.4: Update Frontend Dependency to Health-Based Ordering

As a **developer/operator**,
I want the frontend to wait for a healthy backend before starting,
So that the frontend doesn't start and fail to connect to an unready backend.

**Acceptance Criteria:**

**Given** the backend service has a healthcheck (from Story 1.3)
**When** the frontend `depends_on` is updated to `condition: service_healthy`
**Then** the frontend container only starts after backend reports `healthy`
**And** this is configured in both local and prod compose files

**Given** the backend takes longer than usual to start
**When** the frontend is waiting on `service_healthy`
**Then** the frontend does not start prematurely and Docker Compose shows the dependency wait status

## Epic 2: Compose Configuration Refactoring

Developers can maintain a single source of truth for shared service configuration, with environment-specific overrides cleanly separated, reducing duplication and maintenance errors.

### Story 2.1: Refactor to Base + Override Compose Pattern

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

### Story 2.2: Add Volume Labels and Metadata

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

### Story 2.3: Remove Container Names from Production Services

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

## Epic 3: Production Security Hardening

Operators can deploy with confidence that secrets are protected, containers follow defense-in-depth principles, and network isolation prevents unauthorized access between services.

### Story 3.1: Add MongoDB Keyfile to .gitignore and Create Generation Script

As a **developer/operator**,
I want the MongoDB replica set keyfile excluded from Git and generated via a package.json script,
So that secrets are never committed to version control and self-hosted production can easily generate keys.

**Acceptance Criteria:**

**Given** the MongoDB keyfile path pattern (e.g., `compose/mongo/mongo-keyfile`)
**When** the keyfile pattern is added to `.gitignore`
**Then** `git status` does not show the keyfile as a trackable file
**And** any existing tracked keyfile is removed from Git history (if applicable)

**Given** a developer or operator needs to generate a MongoDB keyfile
**When** they run the `generate:mongo-key` script from package.json (root level)
**Then** a secure random keyfile is generated using `openssl rand -base64 756`
**And** file permissions are set to `400` (owner read-only)
**And** the keyfile is placed in the expected location for Docker Compose to mount

### Story 3.2: Mount MongoDB Keyfile as Read-Only Volume

As an **operator**,
I want the MongoDB keyfile mounted as a read-only volume instead of baked into the Dockerfile,
So that the keyfile can be rotated without rebuilding the image and follows security best practices.

**Acceptance Criteria:**

**Given** the MongoDB keyfile is generated on the host (from Story 3.1)
**When** the production compose mounts it as a `:ro` volume to `/etc/mongo-keyfile`
**Then** MongoDB starts successfully using the mounted keyfile for replica set authentication
**And** the keyfile is not writable from within the container

**Given** the local dev compose
**When** the keyfile mount is configured (or the Dockerfile fallback is used for dev convenience)
**Then** the MongoDB replica set initializes correctly in both environments

### Story 3.3: Add Network Isolation for Production

As an **operator**,
I want production services separated into frontend and backend networks,
So that the frontend container cannot directly access MongoDB or Redis, reducing the attack surface.

**Acceptance Criteria:**

**Given** the production compose file
**When** `frontend-network` and `backend-network` are defined
**Then** `frontend` is on `frontend-network` only
**And** `backend` is on both `frontend-network` and `backend-network`
**And** `mongo` and `redis` are on `backend-network` only

**Given** the frontend container is running in production
**When** it attempts to connect to `mongo:27017` or `redis:6379`
**Then** the connection fails because frontend has no route to backend-network services

**Given** the backend container is running in production
**When** it connects to `mongo:27017` and `redis:6379`
**Then** connections succeed because backend shares `backend-network` with both services

### Story 3.4: Migrate Production Secrets to Docker Compose Secrets

As an **operator**,
I want production passwords (MongoDB root password, Redis password) managed via Docker Compose secrets,
So that sensitive credentials are not exposed in environment variables, process listings, or `docker inspect`.

**Acceptance Criteria:**

**Given** the production compose file
**When** `secrets:` top-level key is defined with `mongo_root_password` and `redis_password` entries pointing to secret files
**Then** secrets are mounted at `/run/secrets/<name>` inside the respective containers on a tmpfs filesystem

**Given** the MongoDB service in production
**When** it reads the root password from `/run/secrets/mongo_root_password`
**Then** authentication works correctly using the file-based secret
**And** the password is not visible via `docker inspect` or environment variable listing

**Given** the Redis service in production
**When** it reads the password from the secret file (via `--requirepass` reading from file or equivalent)
**Then** authentication works correctly
**And** the password is not exposed in the process command line or environment

### Story 3.5: Add Container Security Hardening Options

As an **operator**,
I want production containers hardened with security options,
So that containers follow defense-in-depth principles minimizing privilege escalation and attack surface.

**Acceptance Criteria:**

**Given** all production services
**When** security hardening is applied
**Then** each service has `security_opt: [no-new-privileges:true]`
**And** each service has `cap_drop: [ALL]` with only necessary capabilities added back via `cap_add`
**And** applicable services have `read_only: true` with tmpfs mounts for `/tmp` and other writable paths

**Given** the backend service in production with `read_only: true`
**When** the application needs to write temporary files
**Then** it can write to tmpfs-mounted paths (e.g., `/tmp`)
**And** the root filesystem remains read-only

**Given** production services also need `cpus` resource limits
**When** `cpus` limits are added alongside existing `memory` limits in `deploy.resources`
**Then** no single container can starve others of CPU resources

## Epic 4: Production Reverse Proxy and SSL

Operators can expose the application securely to the internet with SSL/TLS termination, proper request routing, and a foundation for future horizontal scaling.

### Story 4.1: Add Nginx Reverse Proxy Service

As an **operator**,
I want an nginx reverse proxy in the production compose configuration,
So that all traffic is routed through a single entry point with proper request forwarding to backend and frontend services.

**Acceptance Criteria:**

**Given** the production compose file
**When** an `nginx` service is added with a custom configuration
**Then** nginx listens on port 80 and 443
**And** requests to `/api/*` are proxied to the `backend` service on port 3000
**And** all other requests are proxied to the `frontend` service on port 80
**And** proper proxy headers are set (`X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`)

**Given** the nginx service is running
**When** backend or frontend services are accessed directly (not through nginx)
**Then** only nginx exposes host ports; backend and frontend ports are internal-only in production

**Given** the nginx configuration file
**When** it is stored in `compose/nginx/nginx.conf`
**Then** it is mounted as a read-only volume into the nginx container

### Story 4.2: Configure SSL/TLS Termination

As an **operator**,
I want nginx to handle SSL/TLS termination with certificate support,
So that all public traffic is encrypted and the application meets security standards.

**Acceptance Criteria:**

**Given** the nginx reverse proxy service (from Story 4.1)
**When** SSL configuration is added to the nginx config
**Then** port 443 serves HTTPS with TLS 1.2+ enforced
**And** port 80 redirects all HTTP traffic to HTTPS
**And** SSL certificates are mounted as read-only volumes from a configurable host path

**Given** an operator needs to use self-signed certificates for staging
**When** a `generate:ssl-cert` script is added to the root package.json
**Then** a self-signed certificate and key are generated for local/staging testing
**And** the certificate files are added to `.gitignore`

**Given** an operator uses Let's Encrypt or externally managed certificates
**When** certificate files are placed at the expected mount path
**Then** nginx serves traffic using those certificates without container rebuilds
