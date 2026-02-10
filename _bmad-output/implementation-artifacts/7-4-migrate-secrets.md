---
story_id: 7.4
story_key: 7-4-migrate-secrets
epic: 7
title: Migrate Production Secrets to Docker Compose Secrets
status: done
priority: HIGH
---

# Story 7.4: Migrate Production Secrets to Docker Compose Secrets

## Tasks/Subtasks
- [x] Task 1: Define `secrets:` top-level key with `mongo_root_password` and `redis_password` entries
- [x] Task 2: Update mongo service to use `MONGO_INITDB_ROOT_PASSWORD_FILE` with secret mount
- [x] Task 3: Update redis command to read password from secret file
- [x] Task 4: Update healthchecks to read passwords from secret files
- [x] Task 5: Add `secrets/` directory to `.gitignore`

## Dev Notes
- MongoDB official image supports `MONGO_INITDB_ROOT_PASSWORD_FILE` natively
- Redis reads password via shell command substitution: `$(cat /run/secrets/redis_password)`
- Secret files: `secrets/mongo_root_password.txt`, `secrets/redis_password.txt`
- `$$` in YAML produces literal `$` for container shell evaluation
- Passwords no longer visible in `docker inspect` or process environment

## Dev Agent Record
### Implementation Plan
Added Docker Compose file-based secrets for mongo and redis passwords. MongoDB uses native `_FILE` env var support. Redis uses shell command substitution to read from secret file.

### Completion Notes
Production passwords are now file-based secrets mounted at /run/secrets/. Not exposed in environment variables or docker inspect.

## File List
- `docker-compose.prod.yml` (modified)
- `.gitignore` (modified - added secrets/)

## Change Log
- 2026-02-09: Migrated production passwords to Docker Compose file-based secrets
