# Story 1.5: User Deletion & Data Cleanup

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want my data to be removed when I delete my account,
so that I comply with privacy laws (NFR-09).

## Acceptance Criteria

1. **Given** a delete request from a logged-in user, **When** confirmed, **Then** the system should soft-delete the User record immediately by setting `status=deleted`.
2. **And** the user should receive a 200 OK response confirming the deletion request.
3. **And** the user's Firebase account should be disabled or deleted.
4. **When** the daily cleanup job runs, **Then** the system should hard-delete all Resumes, Credits, CreditLedger entries, and Exports associated with that user.
5. **And** payment records should be retained for legal compliance (audit trail).
6. **And** the cleanup job should log all deletion actions for audit purposes.
7. **And** the cleanup should complete within 30 days of the deletion request (NFR-09 compliance).

## Tasks / Subtasks

- [ ] **Task 1: Add Status Field to User Model** (AC: 1)
  - [ ] Add `status` field to User model with enum: `active`, `disabled`, `deleted`
  - [ ] Add `deletedAt` timestamp field to track deletion request date
  - [ ] Set default status to `active` for new users
  - [ ] Update TypeScript interface `IUser` to include new fields

- [ ] **Task 2: Implement User Deletion API Endpoint** (AC: 1, 2, 3)
  - [ ] Create `DELETE /api/users/me` endpoint in user routes
  - [ ] Implement `softDeleteUser` method in `UserService`
    - [ ] Set `status = 'deleted'` and `deletedAt = new Date()`
    - [ ] Call Firebase Admin to disable the user account
  - [ ] Add Zod validation for deletion confirmation (optional password/confirmation field)
  - [ ] Register endpoint in OpenAPI documentation (`user.doc.ts`)

- [ ] **Task 3: Setup BullMQ Queue Infrastructure** (AC: 4, 6)
  - [ ] Create `backend/src/services/queue.service.ts` with BullMQ wrapper
  - [ ] Configure Redis connection for job queue
  - [ ] Add queue configuration to `env.config.ts`
  - [ ] Create `backend/src/workers/` directory for worker processes

- [ ] **Task 4: Implement Daily Cleanup Job** (AC: 4, 5, 6, 7)
  - [ ] Create `backend/src/workers/cleanup.worker.ts`
  - [ ] Implement `UserCleanupProcessor` to:
    - [ ] Find all users with `status=deleted` and `deletedAt` older than 24 hours (or configurable grace period)
    - [ ] For each user, delete associated records in order:
      1. Exports (files + DB records)
      2. CreditLedger entries
      3. Resumes
      4. User record (hard delete)
    - [ ] Log each deletion step for audit trail
  - [ ] Ensure idempotency (handle re-runs safely)
  - [ ] Implement error handling that doesn't crash the process

- [ ] **Task 5: Schedule Daily Cleanup Job** (AC: 7)
  - [ ] Create `backend/src/jobs/scheduled-jobs.ts` for cron job definitions
  - [ ] Schedule cleanup job to run daily (e.g., 3:00 AM UTC)
  - [ ] Add job scheduling configuration to environment variables

- [ ] **Task 6: Add Audit Logging** (AC: 6)
  - [ ] Create structured log entries for deletion operations
  - [ ] Include: userId, timestamp, items deleted (count by type)
  - [ ] Use existing logger service with appropriate log level

## Dev Notes

### Architecture Compliance

- **Tenant Isolation:** Deletion must only affect the requesting user's data
- **Job Queue (from project-context.md):**
  - Use `QueueService` (BullMQ wrapper) for async tasks
  - Workers MUST be idempotent (handle duplicate jobs safely)
  - Workers MUST NOT crash the process on error (catch all exceptions)
- **Transaction Management:** Multi-collection deletions should use transactions where possible

### NFR-09 Compliance Requirements

From PRD:

> **NFR-09 (Deletion):** Users can request account deletion and have personal data removed within 30 days
> - **Method:** Admin/audit workflow with completion logs
> - **Context:** Includes resumes and exported documents; excludes payment records that must be retained for legal reasons

**Implementation Strategy:**

1. **Immediate soft-delete** - user loses access instantly
2. **Grace period** (24h) - allows for accidental deletion recovery
3. **Hard-delete via scheduled job** - actual data removal
4. **Audit trail** - logs preserved for compliance

### Previous Story Intelligence

From **1-2-firebase-auth-integration-backend.md**:

- User model already has Firebase UID mapping
- `AuthMiddleware` checks for `status=disabled` → returns 403
- Firebase Admin SDK is configured and available

**Key Pattern:** Use `admin.auth().updateUser(uid, { disabled: true })` to disable Firebase account

### Current User Model Analysis

Current `user.model.ts` does NOT have:

- ❌ `status` field (need to add)
- ❌ `deletedAt` field (need to add)
- ❌ `firebaseUid` field (should have been added in Story 1.2 - verify)

**Action Required:** Verify Story 1.2 implementation and add missing fields.

### Library & Framework Requirements

| Library | Version | Purpose |
| ------- | ------- | ------- |
| bullmq | ^5.x | Job queue for Redis |
| ioredis | ^5.x | Redis client (BullMQ peer dep) |
| cron | ^3.x | (optional) Cron expression parsing |

### File Structure Requirements

```text
backend/src/
├── services/
│   └── queue.service.ts          # NEW: BullMQ wrapper
├── workers/
│   ├── index.ts                  # NEW: Worker entry point
│   └── cleanup.worker.ts         # NEW: User cleanup processor
├── jobs/
│   └── scheduled-jobs.ts         # NEW: Cron job definitions
└── api/users/
    ├── user.model.ts             # MODIFY: Add status, deletedAt fields
    ├── user.service.ts           # MODIFY: Add softDeleteUser method
    ├── user.controller.ts        # MODIFY: Add delete endpoint
    └── user.doc.ts               # MODIFY: Document delete endpoint
```

### Testing Requirements

- [ ] Verify soft-delete sets correct status and timestamp
- [ ] Verify Firebase account is disabled on deletion
- [ ] Verify cleanup job finds and deletes correct users
- [ ] Verify cleanup is idempotent (re-running doesn't fail)
- [ ] Verify payment records are NOT deleted
- [ ] Verify audit logs are created

### Security Considerations

- **Authentication Required:** Delete endpoint must require valid auth token
- **Self-Only Deletion:** Users can only delete their own account (enforce via `req.user.id`)
- **No Immediate Hard Delete:** Always use soft-delete first for recovery window
- **Audit Trail:** All deletions must be logged for compliance

### Cleanup Order (Prevent Orphans)

```text
1. Exports (files from storage + DB records)
2. CreditLedger entries
3. Resumes
4. Finally: User record
```

**Important:** Delete in reverse dependency order to prevent orphan references.

### Environment Variables to Add

```bash
# Redis (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cleanup Job Configuration
CLEANUP_GRACE_PERIOD_HOURS=24
CLEANUP_CRON_SCHEDULE="0 3 * * *"  # 3:00 AM daily
```

### References

- [PRD - NFR-09](../planning-artifacts/prd.md#74-compliance--data-rights) - Deletion compliance requirements
- [Project Context](../../project-context.md#4-job-queue-backend) - Job Queue rules
- [Story 1.2](./1-2-firebase-auth-integration-backend.md) - Firebase Admin integration
- [Firebase Admin - Disable User](https://firebase.google.com/docs/auth/admin/manage-users#update_a_user) - Official docs

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
