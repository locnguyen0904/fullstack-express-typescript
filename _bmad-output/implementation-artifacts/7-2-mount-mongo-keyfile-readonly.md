---
story_id: 7.2
story_key: 7-2-mount-mongo-keyfile-readonly
epic: 7
title: Mount MongoDB Keyfile as Read-Only Volume
status: done
priority: HIGH
---

# Story 7.2: Mount MongoDB Keyfile as Read-Only Volume

## Tasks/Subtasks
- [x] Task 1: Add keyfile volume mount `./compose/mongo/keys/keyfile.local:/etc/mongo-keyfile:ro` to prod compose
- [x] Task 2: Keep Dockerfile fallback for dev convenience (no changes needed)

## Dev Notes
- Production mounts keyfile from host as read-only volume, overriding the Dockerfile-baked keyfile
- Dev uses the Dockerfile COPY fallback (existing behavior)
- Host file needs chmod 400 (handled by generate:mongo-key script)

## Dev Agent Record
### Implementation Plan
Added volume mount in production compose for mongo keyfile. Dev environment continues using Dockerfile-baked keyfile.

### Completion Notes
Production keyfile is mounted as :ro volume. Dev uses Dockerfile fallback.

## File List
- `docker-compose.prod.yml` (modified)

## Change Log
- 2026-02-09: Added read-only keyfile volume mount for production
