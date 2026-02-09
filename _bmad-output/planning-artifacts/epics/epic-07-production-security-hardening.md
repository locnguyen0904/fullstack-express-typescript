---
epic: 7
title: Production Security Hardening
status: done
priority: HIGH
stories: 5
dependencies: None
source: technical-docker-compose-volumes-best-practices-research-2026-02-09.md
frs_covered: [FR5, FR6, FR10, FR12, FR13, FR14]
---

# Epic 7: Production Security Hardening

Operators can deploy with confidence that secrets are protected, containers follow defense-in-depth principles, and network isolation prevents unauthorized access between services.

## Story 7.1: Add MongoDB Keyfile to .gitignore and Create Generation Script

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

## Story 7.2: Mount MongoDB Keyfile as Read-Only Volume

As an **operator**,
I want the MongoDB keyfile mounted as a read-only volume instead of baked into the Dockerfile,
So that the keyfile can be rotated without rebuilding the image and follows security best practices.

**Acceptance Criteria:**

**Given** the MongoDB keyfile is generated on the host (from Story 7.1)
**When** the production compose mounts it as a `:ro` volume to `/etc/mongo-keyfile`
**Then** MongoDB starts successfully using the mounted keyfile for replica set authentication
**And** the keyfile is not writable from within the container

**Given** the local dev compose
**When** the keyfile mount is configured (or the Dockerfile fallback is used for dev convenience)
**Then** the MongoDB replica set initializes correctly in both environments

## Story 7.3: Add Network Isolation for Production

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

## Story 7.4: Migrate Production Secrets to Docker Compose Secrets

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

## Story 7.5: Add Container Security Hardening Options

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
