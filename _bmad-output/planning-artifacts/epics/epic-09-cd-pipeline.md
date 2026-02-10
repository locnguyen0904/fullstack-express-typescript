---
epic: 9
title: CI/CD Pipeline with GitHub Actions
status: backlog
priority: HIGH
stories: 2
dependencies: Epic 8 (nginx/SSL must exist for prod deployment)
source: technical-github-actions-cd-docker-ghcr-research-2026-02-10.md
frs_covered: []
---

# Epic 9: CI/CD Pipeline with GitHub Actions

Operators can automatically build Docker images and deploy the application to a VPS when code is pushed to the main branch, using GitHub Actions for CI/CD and GitHub Container Registry (GHCR) for image storage.

## Story 9.1: Create GitHub Actions CD Workflow with GHCR

As an **operator**,
I want a GitHub Actions workflow that builds Docker images for backend and frontend services and pushes them to GitHub Container Registry,
So that every merge to main produces versioned, immutable container images ready for deployment.

**Acceptance Criteria:**

**Given** a push to the `main` branch or a version tag (`v*`)
**When** the CD workflow triggers
**Then** Docker images for both backend and frontend services are built using their respective Dockerfiles
**And** images are pushed to GHCR at `ghcr.io/<owner>/backend-template-backend` and `ghcr.io/<owner>/backend-template-frontend`
**And** images are tagged with `latest` (on main), `sha-<commit>` (always), and semver (on tags)

**Given** the CD workflow uses Docker Buildx
**When** images are built
**Then** GitHub Actions cache (`type=gha, mode=max`) is used to speed up subsequent builds
**And** the `production` build target is used from multi-stage Dockerfiles

**Given** the workflow file `.github/workflows/cd.yml`
**When** it is created
**Then** it uses matrix strategy to build backend and frontend in parallel
**And** workflow permissions are set to `contents: read` and `packages: write`
**And** `docker-compose.prod.yml` image references are updated to use GHCR URLs

## Story 9.2: Add VPS Deployment via SSH

As an **operator**,
I want the CD workflow to automatically deploy the application to a VPS after images are built,
So that the production server is updated with the latest version without manual intervention.

**Acceptance Criteria:**

**Given** the build job completes successfully
**When** the push was to the `main` branch (not a tag-only push)
**Then** a deploy job runs that copies compose files to the VPS via SCP
**And** connects via SSH to pull new images and restart services
**And** old unused images are pruned after deployment

**Given** the deployment uses SSH
**When** secrets are configured in GitHub repository settings
**Then** `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, and `VPS_PORT` secrets are used
**And** the SSH key uses ed25519 format
**And** the deploy user has Docker group permissions but no sudo

**Given** the deployment completes
**When** verifying the deployment
**Then** all services are running and healthy via `docker compose ps`
**And** the deployment documentation (DOCKER.md) includes VPS setup instructions
