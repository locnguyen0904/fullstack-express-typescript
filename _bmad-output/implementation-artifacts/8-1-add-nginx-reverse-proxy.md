---
story_id: 8.1
story_key: 8-1-add-nginx-reverse-proxy
epic: 8
title: Add Nginx Reverse Proxy Service
status: done
priority: MEDIUM
---

# Story 8.1: Add Nginx Reverse Proxy Service

## Tasks/Subtasks
- [x] Task 1: Add nginx service to production compose with port 80 and 443
- [x] Task 2: Update nginx config to proxy `/api/*`, `/health`, `/api-docs`, `/admin/*` to backend
- [x] Task 3: Update nginx config to proxy all other routes to frontend
- [x] Task 4: Set proper proxy headers (X-Real-IP, X-Forwarded-For, X-Forwarded-Proto)
- [x] Task 5: Remove direct port exposure from backend and frontend in production (nginx is the entry point)
- [x] Task 6: Move backend port 3000 from base to dev override
- [x] Task 7: Mount nginx config as read-only volume

## Dev Notes
- Nginx uses `nginx:1.27-alpine` image (no custom Dockerfile needed for prod)
- Backend and frontend ports are internal-only in production
- The existing compose/nginx/Dockerfile is retained for backward compatibility but not used by prod compose
- Dev override exposes ports directly for local development convenience

## Dev Agent Record
### Implementation Plan
Added nginx reverse proxy service to production compose. Updated nginx config for proper backend/frontend routing. Moved port mappings to dev override to keep them internal in production.

### Completion Notes
Nginx handles all external traffic in production. Backend and frontend are internal services only.

## File List
- `docker-compose.yml` (modified - removed backend ports)
- `docker-compose.override.yml` (modified - added backend ports)
- `docker-compose.prod.yml` (modified - added nginx service)
- `compose/nginx/conf.d/backend-template.conf` (rewritten)

## Change Log
- 2026-02-09: Added nginx reverse proxy service with proper routing
