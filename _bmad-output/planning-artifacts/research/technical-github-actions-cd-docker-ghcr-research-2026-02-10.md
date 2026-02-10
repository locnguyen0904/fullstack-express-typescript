---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'GitHub Actions CD pipeline — Docker build and push to GitHub Container Registry (GHCR)'
research_goals: 'Complete production-ready CD workflow for multi-service Docker project (backend + frontend) with image caching, tagging strategies, multi-platform builds, and GHCR integration'
user_name: 'Loc Nguyen'
date: '2026-02-10'
web_research_enabled: true
source_verification: true
---

# Research Report: technical

**Date:** 2026-02-10
**Author:** Loc Nguyen
**Research Type:** technical

---

## Research Overview

[Research overview and methodology will be appended here]

---

## Technical Research Scope Confirmation

**Research Topic:** GitHub Actions CD pipeline — Docker build and push to GitHub Container Registry (GHCR)
**Research Goals:** Complete production-ready CD workflow for multi-service Docker project (backend + frontend) with image caching, tagging strategies, multi-platform builds, and GHCR integration

**Technical Research Scope:**

- Architecture Analysis - CD pipeline design patterns, multi-service build orchestration, workflow triggers
- Implementation Approaches - GitHub Actions workflow YAML, Docker Buildx, multi-stage build optimization
- Technology Stack - GitHub Actions runners, Docker Buildx, GHCR, GitHub OIDC token authentication
- Integration Patterns - GHCR auth via GITHUB_TOKEN, image tagging (semver, SHA, latest), Docker Compose deployment
- Performance Considerations - layer caching, multi-platform builds, parallel jobs, image size optimization

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-02-10

## Technology Stack Analysis

### Core GitHub Actions — Docker Action Suite

The official Docker GitHub Actions ecosystem provides a well-integrated set of actions for building, tagging, and pushing Docker images. These are maintained by Docker Inc. and are the de facto standard.

| Action | Latest Major | Purpose |
|--------|-------------|---------|
| `docker/setup-buildx-action` | v3 | Configure Docker Buildx builder (required for advanced caching, multi-platform) |
| `docker/login-action` | v3 | Authenticate to GHCR, Docker Hub, ECR, or any OCI registry |
| `docker/metadata-action` | v5 | Extract tags and labels from Git refs, events, and semver |
| `docker/build-push-action` | v6 | Build and push images using Buildx with cache support |
| `docker/setup-qemu-action` | v3 | Emulation for multi-platform builds (arm64 on amd64 runners) |

_Source: [Docker Build GitHub Actions](https://docs.docker.com/build/ci/github-actions/), [docker/build-push-action](https://github.com/docker/build-push-action), [docker/metadata-action](https://github.com/docker/metadata-action)_

### GitHub Container Registry (GHCR)

GHCR (`ghcr.io`) is GitHub's native OCI-compliant container registry, tightly integrated with GitHub repositories, organizations, and permissions.

_Key characteristics:_
- **Image format**: `ghcr.io/<owner>/<image-name>:<tag>`
- **Authentication**: `GITHUB_TOKEN` (preferred) or Personal Access Tokens (PATs)
- **Visibility**: Public (free, unlimited) or private (counts against GitHub Packages storage)
- **Permissions**: Linked to repository — workflow `permissions: packages: write` required for push
- **Auto-linking**: Publishing from a workflow with `GITHUB_TOKEN` automatically links the package to the repository

_Important: By default, `GITHUB_TOKEN` only has **read** access to packages. The workflow must explicitly declare `permissions: packages: write` to push images._

_Source: [Working with the Container registry — GitHub Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry), [About permissions for GitHub Packages](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages)_

### Docker Buildx and BuildKit

Docker Buildx is the CLI plugin that extends `docker build` with BuildKit features. On GitHub Actions, `docker/setup-buildx-action` creates a `docker-container` driver builder, which is required for:

- **Multi-platform builds** (linux/amd64 + linux/arm64 via QEMU emulation)
- **Advanced caching backends** (GitHub Actions cache, registry cache, inline cache)
- **Build attestations** (provenance and SBOM — enabled by default in v6)
- **Concurrent multi-stage builds** (BuildKit parallelizes independent stages)

_Source: [Docker Buildx GitHub Actions](https://docs.docker.com/build/ci/github-actions/), [Multi-platform image](https://docs.docker.com/build/ci/github-actions/multi-platform/)_

### Caching Strategies

Three primary caching backends are available for GitHub Actions Docker builds:

1. **GitHub Actions Cache (`type=gha`)** — Uses GitHub's native Actions cache service. Simple to configure (`cache-from: type=gha`, `cache-to: type=gha,mode=max`). Limited to 10 GB per repository. Best for most projects.

2. **Registry Cache (`type=registry`)** — Stores cache layers in a separate image/tag on the registry itself. No storage limits beyond registry quota. Supports `mode=max` for caching all intermediate layers (critical for multi-stage builds). Slower on cache miss but unlimited size.

3. **Inline Cache (`type=inline`)** — Embeds cache metadata into the pushed image itself. Simplest but limited — only caches the final stage, not intermediate stages. Not recommended for multi-stage builds.

_For multi-stage builds like backend-template's Dockerfiles, `mode=max` is critical — it caches intermediate stages (base, builder, prod-dependencies), not just the final production stage._

_Source: [Cache management with GitHub Actions](https://docs.docker.com/build/ci/github-actions/cache/), [GitHub Actions cache backend](https://docs.docker.com/build/cache/backends/gha/), [Decreasing Docker Build Times by 50% — HyperDX](https://www.hyperdx.io/blog/docker-buildx-cache-with-github-actions)_

### Image Tagging with docker/metadata-action

The `docker/metadata-action` automatically generates tags and OCI labels from Git context:

| Trigger | Tag Type | Example Output |
|---------|----------|----------------|
| Push to `main` | `type=raw,value=latest` | `latest` |
| Git tag `v1.2.3` | `type=semver,pattern={{version}}` | `1.2.3` |
| Git tag `v1.2.3` | `type=semver,pattern={{major}}.{{minor}}` | `1.2` |
| Any push | `type=sha` | `sha-3bb505f` |
| Branch push | `type=ref,event=branch` | `main`, `develop` |

_Best practice: Use a combination of `sha` (immutable, traceable) + `semver` (human-readable release) + `latest` (convenience for dev/staging)._

_Source: [docker/metadata-action](https://github.com/docker/metadata-action), [Docker Metadata action — GitHub Marketplace](https://github.com/marketplace/actions/docker-metadata-action)_

### GitHub Actions Runner Environment

- **Default runner**: `ubuntu-latest` (Ubuntu 22.04 as of 2025, with Docker and Buildx pre-installed)
- **Docker pre-installed**: Yes — no setup step needed for basic Docker commands
- **Buildx pre-installed**: Yes — but `setup-buildx-action` is still recommended to configure the `docker-container` driver for advanced features
- **QEMU**: Not pre-installed — `setup-qemu-action` required for multi-platform builds
- **Cache storage**: 10 GB per repository for GitHub Actions cache (`type=gha`)

_Source: [GitHub Actions and Docker — Docker Docs](https://docs.docker.com/guides/gha/), [How to Build Docker Images with GitHub Actions](https://oneuptime.com/blog/post/2026-01-25-github-actions-docker-images/view)_

### Workflow Permissions Model

For GHCR push workflows, the following permissions must be explicitly declared:

```yaml
permissions:
  contents: read    # Checkout code
  packages: write   # Push to GHCR
```

_If the repository has "Require approval for all outside collaborators" or restricted default GITHUB_TOKEN permissions in Settings > Actions > General, the workflow-level permissions block is essential._

_Source: [Controlling permissions for GITHUB_TOKEN — GitHub Docs](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token), [Publishing and installing a package — GitHub Docs](https://docs.github.com/en/packages/managing-github-packages-using-github-actions-workflows/publishing-and-installing-a-package-with-github-actions)_

## Integration Patterns Analysis

### Workflow Trigger and Pipeline Design

For a CD pipeline triggered on merge to `main` (or on version tags), the workflow has three logical phases:

```
[Push to main / Tag] → [Build & Push Images] → [Deploy to VPS]
```

**Trigger patterns for production CD:**

```yaml
on:
  push:
    branches: [main]          # CD on merge to main
    tags: ['v*']              # CD on version tags
```

_For this project, the recommended trigger is push to `main` (continuous delivery) plus `v*` tags (release tagging). Pull request pushes should run CI only (lint, test, build) — not CD._

_Source: [Publishing Docker images — GitHub Docs](https://docs.github.com/actions/guides/publishing-docker-images), [How to Build a CI/CD Pipeline with GitHub Actions and Docker](https://runcloud.io/blog/setup-docker-github-actions-ci-cd)_

### Multi-Service Build: Matrix Strategy

The backend-template has two independent Dockerfiles (backend + frontend) that can be built in parallel using a matrix strategy:

```yaml
strategy:
  matrix:
    include:
      - service: backend
        dockerfile: compose/backend/Dockerfile
        image: ghcr.io/<owner>/backend-template
        target: production
        context: .
      - service: frontend
        dockerfile: compose/frontend/Dockerfile
        image: ghcr.io/<owner>/frontend-template
        target: production
        context: .
```

_Key advantages:_
- **Parallel execution** — backend and frontend build concurrently on separate runners
- **Shared workflow logic** — same steps (checkout, setup-buildx, login, metadata, build-push) with different matrix inputs
- **Independent caching** — each service gets its own cache scope via `cache-from: type=gha,scope=${{ matrix.service }}`
- **Independent failure** — if one service fails, the other still completes (unless `fail-fast: true`)

_Source: [Mastering GitHub Actions Strategy Matrix — DEV Community](https://dev.to/tejastn10/mastering-github-actions-strategy-matrix-deploy-smarter-not-harder-28po), [Advanced Usage of GitHub Actions Matrix Strategy](https://devopsdirective.com/posts/2025/08/advanced-github-actions-matrix/)_

### GHCR Authentication Flow

The authentication flow for pushing to GHCR within GitHub Actions:

```
Workflow starts → GITHUB_TOKEN auto-generated → docker/login-action logs in to ghcr.io → build-push-action pushes image
```

```yaml
- uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

_No PAT needed — `GITHUB_TOKEN` is automatically available in every workflow run. The workflow must declare `permissions: packages: write`. The token is scoped to the repository and expires when the workflow completes._

_Source: [Working with the Container registry — GitHub Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)_

### Build-Push-Action Integration with Multi-Stage Dockerfiles

For the backend-template's multi-stage Dockerfile (base → development → builder → prod-dependencies → production), the `build-push-action` must target the `production` stage:

```yaml
- uses: docker/build-push-action@v6
  with:
    context: .
    file: ${{ matrix.dockerfile }}
    target: ${{ matrix.target }}
    push: true
    tags: ${{ steps.meta.outputs.tags }}
    labels: ${{ steps.meta.outputs.labels }}
    cache-from: type=gha,scope=${{ matrix.service }}
    cache-to: type=gha,mode=max,scope=${{ matrix.service }}
```

_The `mode=max` cache setting is essential — it caches ALL stages (base, builder, prod-dependencies), not just the final production stage. Without `mode=max`, the expensive `npm ci` and `npm run build` stages would rebuild every time._

_Source: [Cache management with GitHub Actions](https://docs.docker.com/build/ci/github-actions/cache/), [Cache is King — Blacksmith](https://www.blacksmith.sh/blog/cache-is-king-a-guide-for-docker-layer-caching-in-github-actions)_

### VPS Deployment via SSH

After images are pushed to GHCR, a deployment job connects to the VPS via SSH, pulls the new images, and restarts services:

```
[Build Job completes] → [Deploy Job] → SSH to VPS → docker login ghcr.io → docker compose pull → docker compose up -d
```

**Required GitHub Secrets for deployment:**

| Secret | Purpose |
|--------|---------|
| `VPS_HOST` | Server IP or hostname |
| `VPS_USER` | SSH username |
| `VPS_SSH_KEY` | SSH private key (ed25519 recommended) |
| `VPS_PORT` | SSH port (default 22) |

**Deployment commands on VPS:**

```bash
cd /opt/backend-template
docker login ghcr.io -u ${{ github.actor }} -p ${{ secrets.GITHUB_TOKEN }}
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans
```

_Note: The VPS needs `docker login ghcr.io` to pull images from a private GHCR registry. For public images, no login is needed on the VPS side._

_Source: [Deploy docker containers in VPS with GitHub Actions — DEV Community](https://dev.to/ikurotime/deploy-docker-containers-in-vps-with-github-actions-2e28), [Automated Docker Compose Deployment with GitHub Actions — Ecostack](https://ecostack.dev/posts/automated-docker-compose-deployment-github-actions/), [GitHub Action Docker Compose deployments via SSH](https://docs.servicestack.net/ssh-docker-compose-deploment)_

### Docker Compose Integration — Prod Images from GHCR

The production compose must reference GHCR images instead of local builds. The current `docker-compose.prod.yml` already has:

```yaml
backend:
  image: backend-template:latest    # → change to ghcr.io/<owner>/backend-template:latest
frontend:
  image: frontend-template:latest   # → change to ghcr.io/<owner>/frontend-template:latest
```

_The `image:` key in prod compose serves dual purpose: it names the locally built image AND specifies what to pull when using `docker compose pull`. Changing it to the GHCR URL enables pull-based deployment._

### Reusable Workflow Pattern

For maintainability, the Docker build+push logic can be extracted into a reusable workflow that both services call:

```yaml
# .github/workflows/docker-build.yml (reusable)
on:
  workflow_call:
    inputs:
      service:
        required: true
        type: string
      dockerfile:
        required: true
        type: string
```

_However, for a two-service project, the matrix strategy is simpler and sufficient. Reusable workflows become valuable when you have 5+ services or share workflows across multiple repositories._

_Source: [GitHub Actions Composite vs Reusable Workflows — DEV Community](https://dev.to/hkhelil/github-actions-composite-vs-reusable-workflows-4bih), [BretFisher/docker-build-workflow](https://github.com/BretFisher/docker-build-workflow)_

### Security Integration Patterns

**Secrets management in the pipeline:**

| Secret Type | Storage | Access Pattern |
|-------------|---------|----------------|
| GHCR token | `GITHUB_TOKEN` (auto) | Available to all workflow jobs |
| SSH key | GitHub Secrets | `${{ secrets.VPS_SSH_KEY }}` |
| VPS credentials | GitHub Secrets | `${{ secrets.VPS_HOST }}`, etc. |
| Prod env vars | VPS filesystem | `.env.prod` on server, not in repo |
| Docker secrets | VPS filesystem | `secrets/*.txt` on server, not in repo |

_Critical: `.env.prod` and `secrets/` remain on the VPS only — never stored in GitHub Secrets or committed to the repository. The CD pipeline deploys images, not environment configuration._

### Deployment Considerations

**Brief downtime on deploy:** Using `docker compose up -d` replaces containers sequentially, causing a brief window where services restart. For the backend-template project (single-instance, not scaled), this is typically a few seconds and is acceptable.

**For zero-downtime (future):** Would require either `deploy.replicas > 1` with rolling updates (Docker Swarm mode) or external orchestration (Kubernetes).

## Architectural Patterns and Design

### Pipeline Architecture — Job Dependency Graph

The recommended CD pipeline for backend-template follows a **build-then-deploy** pattern with explicit job dependencies:

```
┌─────────────────────────────────────────────────┐
│  Trigger: push to main / tag v*                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐    ┌──────────────┐          │
│  │ build-backend │    │build-frontend│  (parallel│
│  │  (matrix)     │    │  (matrix)    │   via     │
│  └──────┬───────┘    └──────┬───────┘   matrix) │
│         │                   │                    │
│         └────────┬──────────┘                    │
│                  ▼                               │
│         ┌──────────────┐                        │
│         │   deploy      │  needs: [build]        │
│         │  (SSH to VPS) │                        │
│         └──────────────┘                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

The `needs:` keyword enforces that the deploy job only runs after ALL matrix build jobs succeed. If any image fails to build or push, deployment is blocked.

_Source: [Build CI/CD pipeline with GitHub Actions — GitHub Blog](https://github.blog/enterprise-software/ci-cd/build-ci-cd-pipeline-github-actions-four-steps/), [Advanced CI/CD Pipelines with GitHub Actions — Signiance](https://signiance.com/advanced-ci-cd-pipelines-with-github-actions/)_

### Workflow File Structure

For the backend-template project, a single workflow file is sufficient:

```
.github/
  workflows/
    cd.yml          # Build + push + deploy (triggered on push to main / tags)
```

_Design decision: Single file vs. split CI/CD. Since CI (lint, test) already happens on PRs before merge, the CD workflow only needs to build images and deploy. No need for a separate CI job in the CD workflow — the code is already validated._

### Image Naming and Registry Architecture

**Recommended GHCR image structure:**

```
ghcr.io/<owner>/backend-template-backend:latest
ghcr.io/<owner>/backend-template-backend:sha-abc1234
ghcr.io/<owner>/backend-template-backend:1.2.3

ghcr.io/<owner>/backend-template-frontend:latest
ghcr.io/<owner>/backend-template-frontend:sha-abc1234
ghcr.io/<owner>/backend-template-frontend:1.2.3
```

_Convention: `<project>-<service>` avoids naming collisions within the GitHub user/org namespace. Each image gets multiple tags simultaneously — `latest` for convenience, `sha-*` for immutable traceability, semver for releases._

### Rollback Architecture

The SHA-based tagging strategy enables simple rollbacks:

```bash
# On VPS — rollback to specific version
# Edit docker-compose.prod.yml or .env to pin image tags
# Then:
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

_Every pushed image is preserved in GHCR indefinitely (until manually deleted). Rolling back is changing the tag reference and re-pulling. No rebuild required._

**Rollback strategies by severity:**

| Scenario | Strategy | Recovery Time |
|----------|----------|---------------|
| Bad deploy, caught quickly | Pin previous SHA tag, re-pull | ~30 seconds |
| Feature rollback | Revert commit on main, CD re-triggers | ~5 minutes |
| Infrastructure failure | Re-deploy from last known good SHA | ~1 minute |

_Source: [Implementing a Release Process with GitHub Actions for Docker Image Management and Rollback — Medium](https://medium.com/@ignatovich.dm/implementing-a-release-process-with-github-actions-for-docker-image-management-and-rollback-9e385bb7c99a), [Automating Docker Image Versioning — DEV Community](https://dev.to/msrabon/automating-docker-image-versioning-build-push-and-scanning-using-github-actions-388n)_

### Security Architecture

**Principle of least privilege across the pipeline:**

| Component | Permission | Scope |
|-----------|-----------|-------|
| Workflow `GITHUB_TOKEN` | `contents: read`, `packages: write` | Only this workflow run |
| SSH key | Access to deploy user on VPS | Only the deploy job |
| VPS deploy user | Docker group + project directory only | No sudo required |
| GHCR images | Private by default | Only authenticated pulls |

**Action pinning best practice:**

```yaml
# Pin to SHA (most secure) or major version tag (practical)
- uses: docker/build-push-action@v6        # Major version pin (recommended)
- uses: docker/build-push-action@abc123...  # Full SHA pin (maximum security)
```

_Major version pinning (`@v6`) is the pragmatic choice — it gets security patches automatically while preventing breaking changes. Full SHA pinning is more secure but requires manual updates._

_Source: [7 GitHub Actions Security Best Practices — StepSecurity](https://www.stepsecurity.io/blog/github-actions-security-best-practices), [Securing GitHub Actions Workflows — GitHub Well-Architected](https://wellarchitected.github.com/library/application-security/recommendations/actions-security/), [GitHub Actions Security Best Practices — GitGuardian](https://blog.gitguardian.com/github-actions-security-cheat-sheet/)_

### Deployment Architecture — VPS File Layout

The VPS should have a dedicated project directory with compose files and environment configuration:

```
/opt/backend-template/
├── docker-compose.yml           # From repo (SCP'd or git pull)
├── docker-compose.prod.yml      # From repo (SCP'd or git pull)
├── .env.prod                    # Server-only, never in repo
├── secrets/
│   ├── mongo_root_password.txt  # Server-only
│   └── redis_password.txt       # Server-only
└── compose/
    └── nginx/
        ├── conf.d/
        │   └── backend-template.conf  # From repo
        └── ssl/
            ├── cert.pem         # Cloudflare Origin Cert
            └── key.pem          # Server-only
```

_Design decision: Compose files can be SCP'd from the CI runner or pulled via `git pull` on the VPS. SCP is simpler (no git on server needed). Secrets and SSL certs are provisioned once manually and never touched by the pipeline._

### Scalability Considerations

**Current architecture (single VPS):**
- Single instance of each service
- Brief downtime during container replacement (~2-5 seconds)
- Suitable for low-to-medium traffic

**Future scaling options (when needed):**

| Growth Stage | Architecture Change |
|-------------|-------------------|
| Medium traffic | Add health check polling before marking deploy as "done" |
| High traffic | Docker Swarm with `deploy.replicas` and rolling updates |
| Large scale | Kubernetes with Helm charts + ArgoCD for GitOps deployment |

_The current architecture is deliberately simple. Premature scaling infrastructure adds complexity without benefit. The SHA-based image strategy is forward-compatible with all scaling approaches._

## Implementation Approaches

### Complete Workflow YAML — Reference Implementation

Below is the full production-ready workflow for the backend-template project:

```yaml
# .github/workflows/cd.yml
name: CD — Build & Deploy

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io

permissions:
  contents: read
  packages: write

jobs:
  build:
    name: Build ${{ matrix.service }}
    runs-on: ubuntu-latest
    strategy:
      fail-fast: true
      matrix:
        include:
          - service: backend
            dockerfile: compose/backend/Dockerfile
            image: ghcr.io/${{ github.repository_owner }}/backend-template-backend
            target: production
          - service: frontend
            dockerfile: compose/frontend/Dockerfile
            image: ghcr.io/${{ github.repository_owner }}/backend-template-frontend
            target: production
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ matrix.image }}
          tags: |
            type=raw,value=latest,enable={{is_default_branch}}
            type=sha,prefix=sha-
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ${{ matrix.dockerfile }}
          target: ${{ matrix.target }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha,scope=${{ matrix.service }}
          cache-to: type=gha,mode=max,scope=${{ matrix.service }}

  deploy:
    name: Deploy to VPS
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout (for compose files)
        uses: actions/checkout@v4

      - name: Copy compose files to VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT || 22 }}
          source: "docker-compose.yml,docker-compose.prod.yml,compose/nginx/conf.d/"
          target: /opt/backend-template

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT || 22 }}
          script: |
            cd /opt/backend-template
            echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans
            docker image prune -f
```

_Source: [Publishing Docker images — GitHub Docs](https://docs.github.com/actions/guides/publishing-docker-images), [Shipyard — GitHub Actions: Building Docker Images](https://shipyard.build/blog/gha-recipes-build-and-push-container-registry/), [appleboy/ssh-action](https://github.com/appleboy/ssh-action), [appleboy/scp-action](https://github.com/appleboy/scp-action)_

### Step-by-Step Setup Guide

**Phase 1: GitHub Repository Setup**

1. Enable GitHub Packages for the repository (Settings > Packages)
2. Set default `GITHUB_TOKEN` permissions to read (Settings > Actions > General > Workflow permissions). The workflow explicitly requests `packages: write`.
3. Add deployment secrets in Settings > Secrets and variables > Actions:

| Secret | Value |
|--------|-------|
| `VPS_HOST` | Your server IP (e.g., `203.0.113.10`) |
| `VPS_USER` | Deploy user (e.g., `deploy`) |
| `VPS_SSH_KEY` | Private key content (ed25519 recommended) |
| `VPS_PORT` | SSH port (optional, defaults to 22) |

**Phase 2: VPS Server Preparation**

```bash
# 1. Create deploy user (on VPS)
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy

# 2. Set up SSH key authentication
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
# Add the PUBLIC key to authorized_keys
echo "ssh-ed25519 AAAA..." | sudo tee /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh

# 3. Create project directory
sudo mkdir -p /opt/backend-template
sudo chown deploy:deploy /opt/backend-template

# 4. Set up secrets and SSL (one-time manual setup)
cd /opt/backend-template
mkdir -p secrets compose/nginx/ssl
# Create .env.prod, secrets/*.txt, and SSL certs as per DOCKER.md
```

**Phase 3: Docker Compose Modification**

Update `docker-compose.prod.yml` to reference GHCR images:

```yaml
# Change:
#   image: backend-template:latest
# To:
#   image: ghcr.io/<owner>/backend-template-backend:latest

# Change:
#   image: frontend-template:latest
# To:
#   image: ghcr.io/<owner>/backend-template-frontend:latest
```

**Phase 4: Create Workflow File and Push**

```bash
mkdir -p .github/workflows
# Create .github/workflows/cd.yml with the reference implementation above
git add .github/workflows/cd.yml
git commit -m "feat: add cd pipeline with github actions and ghcr"
git push origin main
```

_Source: [Beginner's Guide: Build, Push, and Deploy Docker Image — DEV Community](https://dev.to/msrabon/beginners-guide-build-push-and-deploy-docker-image-with-github-actions-aa7), [Deploy docker containers in VPS — DEV Community](https://dev.to/ikurotime/deploy-docker-containers-in-vps-with-github-actions-2e28)_

### Cost and Resource Management

**GitHub Actions pricing (as of Jan 2026):**

| Plan | Free Minutes/month | Storage | Notes |
|------|-------------------|---------|-------|
| Free | 2,000 min | 500 MB | Public repos: unlimited free |
| Pro | 3,000 min | 1 GB | |
| Team | 3,000 min | 2 GB | |
| Enterprise | 50,000 min | 50 GB | |

**Estimated usage for backend-template CD:**

| Component | Time per Run | Monthly (20 deploys) |
|-----------|-------------|---------------------|
| Build backend | ~3-5 min | 60-100 min |
| Build frontend | ~2-4 min | 40-80 min |
| Deploy | ~30 sec | 10 min |
| **Total** | **~6-10 min** | **~110-190 min** |

_Well within the free tier for most usage patterns. Docker layer caching reduces build times significantly after the first run._

**Self-hosted runner note:** Starting March 2026, GitHub will charge $0.002/min for self-hosted runner control plane usage on private repos. For this project's ~200 min/month, the free GitHub-hosted runners are more cost-effective.

_Source: [Pricing changes for GitHub Actions](https://resources.github.com/actions/2026-pricing-changes-for-github-actions/), [Update to GitHub Actions pricing — GitHub Changelog](https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/), [GitHub Actions billing — GitHub Docs](https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions)_

### Risk Assessment and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| GHCR outage prevents deploy | Low | High | Keep last-known-good images cached on VPS (`docker compose pull` only updates if new image available) |
| SSH key compromise | Low | Critical | Rotate keys every 90 days, use ed25519, limit deploy user permissions |
| Bad image deployed | Medium | High | SHA tagging enables instant rollback; add smoke test after deploy |
| Build cache eviction (10 GB limit) | Medium | Low | Rebuild takes longer but is automatic; consider registry cache for large images |
| GitHub Actions minutes exhausted | Low | Medium | Public repos are free; optimize with layer caching to reduce build times |
| Downtime during deploy | Certain | Low | ~2-5 seconds; acceptable for single-instance; document maintenance windows |

### Testing the Pipeline

After setup, verify with these steps:

```bash
# 1. Trigger CD by pushing to main
git push origin main

# 2. Monitor in GitHub Actions tab
# → Build job: both matrix jobs should succeed
# → Deploy job: should connect and pull images

# 3. Verify on VPS
ssh deploy@your-server
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
# All services should be "Up" and "healthy"

# 4. Verify images in GHCR
# Go to: github.com/<owner>?tab=packages
# Should see backend-template-backend and backend-template-frontend
```

## Technical Research Recommendations

### Implementation Roadmap

| Phase | Task | Effort |
|-------|------|--------|
| 1 | Create `.github/workflows/cd.yml` with build+push jobs | 1 hour |
| 2 | Update `docker-compose.prod.yml` image references to GHCR URLs | 15 min |
| 3 | Set up VPS deploy user, SSH keys, project directory | 30 min |
| 4 | Add GitHub Secrets (VPS_HOST, VPS_USER, VPS_SSH_KEY) | 10 min |
| 5 | Add deploy job to workflow, test end-to-end | 1 hour |
| 6 | (Optional) Add smoke test after deploy | 30 min |

### Technology Stack Recommendations

- **Use GitHub-hosted runners** (`ubuntu-latest`) — free for public repos, cost-effective for private
- **Use `type=gha` caching with `mode=max`** — simplest setup, works well for two-service project
- **Use `appleboy/ssh-action`** for deployment — mature, well-maintained, supports ed25519
- **Use `docker/metadata-action`** for tagging — automated, follows conventions, semver-aware
- **Skip multi-platform builds initially** — add arm64 only if your VPS uses ARM (most don't)
- **Skip reusable workflows** — matrix strategy is sufficient for two services

### Success Metrics

| Metric | Target |
|--------|--------|
| Build time (cached) | < 3 minutes per service |
| Deploy time | < 1 minute |
| Pipeline reliability | > 99% success rate |
| Rollback time | < 1 minute |
| Monthly GitHub Actions usage | < 200 minutes |
