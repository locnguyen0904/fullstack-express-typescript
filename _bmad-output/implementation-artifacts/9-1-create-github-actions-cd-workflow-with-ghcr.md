---
story_id: 9.1
story_key: 9-1-create-github-actions-cd-workflow-with-ghcr
epic: 9
title: Create GitHub Actions CD Workflow with GHCR
status: done
priority: HIGH
---

# Story 9.1: Create GitHub Actions CD Workflow with GHCR

## Story

As an **operator**,
I want a GitHub Actions workflow that builds Docker images for backend and frontend services and pushes them to GitHub Container Registry,
so that every merge to main produces versioned, immutable container images ready for deployment.

## Acceptance Criteria

1. **Given** a push to the `main` branch or a version tag (`v*`), **When** the CD workflow triggers, **Then** Docker images for both backend and frontend are built using their respective Dockerfiles and pushed to GHCR.
2. **Given** the CD workflow builds images, **When** images are pushed to GHCR, **Then** they are available at `ghcr.io/<owner>/backend-template-backend` and `ghcr.io/<owner>/backend-template-frontend`.
3. **Given** images are built, **When** tagging is applied, **Then** images get `latest` tag (on main branch), `sha-<short-commit>` tag (always), and semver tags `{{version}}` + `{{major}}.{{minor}}` (on `v*` tags).
4. **Given** the workflow uses Docker Buildx, **When** images are built, **Then** GitHub Actions cache (`type=gha, mode=max`) is used with per-service scoping.
5. **Given** the workflow file, **When** it is configured, **Then** it uses matrix strategy to build backend and frontend in parallel, and workflow permissions are `contents: read` + `packages: write`.
6. **Given** `docker-compose.prod.yml`, **When** it is updated, **Then** backend and frontend `image:` keys reference GHCR URLs instead of local build names.
7. **Given** the CD workflow, **When** it is created, **Then** it does NOT duplicate CI validation (lint/test/build) — the existing CI workflow handles that on PRs before merge.

## Tasks / Subtasks

- [x] Task 1: Create `.github/workflows/cd.yml` with build matrix (AC: 1, 2, 4, 5, 7)
  - [x] Subtask 1.1: Create workflow file with trigger on `push` to `main` branch and `v*` tags
  - [x] Subtask 1.2: Add `build` job with matrix strategy for backend and frontend services
  - [x] Subtask 1.3: Add steps: checkout, setup-buildx, login to GHCR, metadata extraction, build-and-push
  - [x] Subtask 1.4: Configure GitHub Actions cache (`type=gha, mode=max`) with per-service scope
- [x] Task 2: Configure image tagging with `docker/metadata-action` (AC: 3)
  - [x] Subtask 2.1: Add `latest` tag on default branch pushes
  - [x] Subtask 2.2: Add `sha-<short>` tag on all pushes
  - [x] Subtask 2.3: Add semver `{{version}}` and `{{major}}.{{minor}}` tags on `v*` tag pushes
- [x] Task 3: Update `docker-compose.prod.yml` image references to GHCR (AC: 6)
  - [x] Subtask 3.1: Change backend `image:` from `backend-template:latest` to `ghcr.io/<owner>/backend-template-backend:latest`
  - [x] Subtask 3.2: Change frontend `image:` from `frontend-template:latest` to `ghcr.io/<owner>/backend-template-frontend:latest`
  - [x] Subtask 3.3: Use `${GITHUB_REPOSITORY_OWNER:-locnguyen}` variable for owner to keep it portable
- [x] Task 4: Update `DOCKER.md` with CD pipeline documentation (AC: all)
  - [x] Subtask 4.1: Add "CD Pipeline" section explaining the workflow, triggers, and image tagging
  - [x] Subtask 4.2: Document GitHub repository setup steps (Packages, Secrets, Permissions)
  - [x] Subtask 4.3: Add GHCR image pull instructions and rollback procedure

## Dev Notes

### Architecture Requirements

- **Single workflow file**: `.github/workflows/cd.yml` — no reusable workflows needed for 2 services
- **No CI duplication**: The existing CI workflow (`.github/workflows/ci.yml`) already handles lint, build, test, and security scanning on PRs. The CD workflow only builds images and pushes — no need for a test job
- **Matrix strategy over reusable workflows**: For 2 services, matrix is simpler and sufficient
- **Build context**: Both Dockerfiles use `.` (repo root) as context — this is required because `COPY backend/` and `COPY frontend/` reference from root

### Existing CI Workflow Reference

The CI workflow (`.github/workflows/ci.yml`) already:
- Runs on push/PR to `main`, `master`, `develop`
- Backend: lint + build + test with coverage (Node 24)
- Security: Trivy scan on production Docker image (CRITICAL/HIGH)
- Frontend: lint + build
- Uses `npm ci` with caching

**Do NOT duplicate any of this in the CD workflow.**

### Docker Action Suite — Exact Versions

| Action | Version | Purpose |
|--------|---------|---------|
| `actions/checkout` | `v4` | Clone repo |
| `docker/setup-buildx-action` | `v3` | Configure Buildx builder |
| `docker/login-action` | `v3` | Authenticate to GHCR |
| `docker/metadata-action` | `v5` | Extract tags and labels from git refs |
| `docker/build-push-action` | `v6` | Build and push with Buildx |

### Matrix Configuration

```yaml
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
```

### Tagging Strategy

```yaml
tags: |
  type=raw,value=latest,enable={{is_default_branch}}
  type=sha,prefix=sha-
  type=semver,pattern={{version}}
  type=semver,pattern={{major}}.{{minor}}
```

### Caching Strategy

Use GitHub Actions cache backend with per-service scoping:
```yaml
cache-from: type=gha,scope=${{ matrix.service }}
cache-to: type=gha,mode=max,scope=${{ matrix.service }}
```

`mode=max` caches all layers (not just final), improving cache hit rate for multi-stage builds.

### Docker Compose Prod Image References

Current state in `docker-compose.prod.yml`:
```yaml
backend:
  build:
    target: production
  image: backend-template:latest

frontend:
  build:
    target: production
  image: frontend-template:latest
```

Target state — use GHCR URLs. Keep `build:` directive so local builds still work, but `image:` now points to GHCR:
```yaml
backend:
  build:
    target: production
  image: ghcr.io/${GITHUB_REPOSITORY_OWNER:-locnguyen}/backend-template-backend:latest

frontend:
  build:
    target: production
  image: ghcr.io/${GITHUB_REPOSITORY_OWNER:-locnguyen}/backend-template-frontend:latest
```

**Important**: When `build:` and `image:` coexist, `docker compose build` builds locally and tags with the `image:` name. `docker compose pull` pulls from the registry. This is the correct dual-use pattern.

### Workflow Permissions

```yaml
permissions:
  contents: read
  packages: write
```

`packages: write` is required to push to GHCR. By default `GITHUB_TOKEN` only has read access to packages.

### File Structure

```
.github/
  workflows/
    ci.yml           # Existing — lint, test, security scan
    cd.yml           # NEW — build, push to GHCR
    codeql.yml       # Existing — CodeQL analysis
```

### Dockerfile Targets

- **Backend** (`compose/backend/Dockerfile`): Target `production` — Node 24 Alpine, compiled TypeScript in `dist/`, production deps only, non-root user, dumb-init
- **Frontend** (`compose/frontend/Dockerfile`): Target `production` — Nginx 1.27 Alpine serving static build, non-root

### Testing This Story

1. Push to a feature branch and create a PR — CD should NOT trigger (only CI runs)
2. Merge to main — CD should trigger, build both images, push to GHCR
3. Check GHCR: `github.com/<owner>?tab=packages` — both images should appear with `latest` and `sha-*` tags
4. Create a tag `v1.0.0` — images should get `1.0.0` and `1.0` tags
5. Verify `docker compose -f docker-compose.yml -f docker-compose.prod.yml pull` works with GHCR images

### Anti-Patterns to Avoid

- **Do NOT add test/lint jobs** — CI already handles this
- **Do NOT use `docker/setup-qemu-action`** — multi-platform builds not needed (VPS is amd64)
- **Do NOT use reusable workflows** — overkill for 2 services
- **Do NOT hardcode the owner** in workflow YAML — use `${{ github.repository_owner }}`
- **Do NOT use PATs for GHCR auth** — `GITHUB_TOKEN` is sufficient and more secure

### Project Structure Notes

- Workflow files go in `.github/workflows/` (standard GitHub Actions location)
- Docker compose files remain in repo root
- No new directories needed beyond `.github/workflows/` (already exists from CI)

### References

- [Source: _bmad-output/planning-artifacts/research/technical-github-actions-cd-docker-ghcr-research-2026-02-10.md — Full technical research]
- [Source: .github/workflows/ci.yml — Existing CI workflow to not duplicate]
- [Source: docker-compose.prod.yml — Current prod compose with image references]
- [Source: compose/backend/Dockerfile — Backend multi-stage Dockerfile]
- [Source: compose/frontend/Dockerfile — Frontend multi-stage Dockerfile]
- [Source: DOCKER.md — Existing deployment documentation to update]

## Change Log

- 2026-02-10: Story created from Epic 9 with comprehensive technical research context
- 2026-02-10: All tasks implemented — CD workflow, GHCR image refs, documentation
- 2026-02-10: Code review fixes — concurrency control, checkout@v6, rollback docs, env.prod.example

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Created `.github/workflows/cd.yml` with matrix strategy building backend and frontend Docker images in parallel
- Workflow triggers on push to `main` (latest + sha tags) and `v*` tags (semver + sha tags)
- Uses Docker Action Suite: setup-buildx@v3, login-action@v3, metadata-action@v5, build-push-action@v6
- GitHub Actions cache (`type=gha, mode=max`) with per-service scoping for optimal multi-stage build caching
- Updated `docker-compose.prod.yml` image references to GHCR URLs with portable `${GITHUB_REPOSITORY_OWNER:-locnguyen}` variable
- Dual-use pattern preserved: `build:` for local builds, `image:` for registry pulls
- Added comprehensive CD Pipeline section to DOCKER.md with setup guide, pull instructions, and rollback procedure
- Validated: both dev and prod compose configs pass, backend lint clean, all 68 tests pass
- Code review: Fixed 3M + 2L issues — added concurrency control, updated checkout@v6, fixed rollback docs (retag approach), added --env-file to pull command, added GITHUB_REPOSITORY_OWNER to .env.prod.example

### Implementation Plan

Single workflow file approach with matrix strategy for 2 services. No CI duplication — existing CI handles lint/test/security on PRs. CD only builds and pushes to GHCR. Image references in prod compose use environment variable for owner portability.

### File List

- `.github/workflows/cd.yml` (new — CD workflow with build matrix, GHCR push, concurrency control)
- `docker-compose.prod.yml` (modified — backend and frontend image refs changed to GHCR URLs)
- `DOCKER.md` (modified — added CD Pipeline section with setup, pull, and rollback docs)
- `.env.prod.example` (modified — added GITHUB_REPOSITORY_OWNER variable)
