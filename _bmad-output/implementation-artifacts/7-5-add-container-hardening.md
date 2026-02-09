---
story_id: 7.5
story_key: 7-5-add-container-hardening
epic: 7
title: Add Container Security Hardening Options
status: done
priority: HIGH
---

# Story 7.5: Add Container Security Hardening Options

## Tasks/Subtasks
- [x] Task 1: Add `security_opt: [no-new-privileges:true]` to all production services
- [x] Task 2: Add `cap_drop: [ALL]` to all production services
- [x] Task 3: Add `cap_add: [NET_BIND_SERVICE]` to nginx (needs to bind ports 80/443)
- [x] Task 4: Add `read_only: true` with tmpfs for `/tmp` to backend service
- [x] Task 5: Add `read_only: true` with tmpfs for `/tmp`, `/var/cache/nginx`, `/var/run` to frontend and nginx
- [x] Task 6: Add `cpus` limits alongside existing `memory` limits in `deploy.resources`

## Dev Notes
- `no-new-privileges` prevents privilege escalation inside containers
- `cap_drop: ALL` removes all Linux capabilities; only `NET_BIND_SERVICE` added back for nginx
- `read_only: true` makes root filesystem immutable; tmpfs mounts provide writable paths
- CPU limits: mongo 1.0, backend 1.0, redis 0.5, frontend 0.5, nginx 0.25

## Dev Agent Record
### Implementation Plan
Applied defense-in-depth security options to all production services.

### Completion Notes
All services have no-new-privileges, dropped capabilities, read-only filesystems (where applicable), and CPU limits.

## File List
- `docker-compose.prod.yml` (modified)

## Change Log
- 2026-02-09: Added container security hardening (no-new-privileges, cap_drop, read_only, cpu limits)
