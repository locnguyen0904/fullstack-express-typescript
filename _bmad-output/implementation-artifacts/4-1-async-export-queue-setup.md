# Story 4.1: Async Export Queue Setup

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a System,
I want to process PDF exports in a background queue,
so that the API remains responsive.

## Acceptance Criteria

1. **Given** an export request, **When** `POST /api/exports` is called, **Then** it should add a job to BullMQ and return a `jobId`.
2. **When** client polls `GET /api/exports/:jobId`, **Then** it should return the status (pending, processing, completed, failed).
3. **And** when completed, it should return the download URL.
4. **And** the export request should validate user owns the resume.
5. **And** export jobs should be tracked in an Export model.
6. **And** p95 export completion time should be ≤ 10s (NFR-03).

## Tasks / Subtasks

- [ ] **Task 1: Create Export Model** (AC: 5)
  - [ ] Create `backend/src/api/exports/export.model.ts`
  - [ ] Define `IExport` interface:

    ```typescript
    interface IExport {
      userId: ObjectId;
      resumeId: ObjectId;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      format: 'pdf';
      fileUrl?: string;
      fileSize?: number;
      error?: string;
      watermarked: boolean;
      createdAt: Date;
      completedAt?: Date;
    }
    ```

  - [ ] Add indexes: `{ userId: 1, createdAt: -1 }`, `{ status: 1 }`

- [ ] **Task 2: Setup BullMQ Queue** (AC: 1, 6)
  - [ ] Create/Update `backend/src/services/queue.service.ts`
  - [ ] Define `EXPORT_QUEUE` queue name
  - [ ] Configure job options:

    ```typescript
    const defaultJobOptions = {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      timeout: 30000, // 30s max
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
    };
    ```

- [ ] **Task 3: Create Export Service** (AC: 1, 2, 3, 4, 5)
  - [ ] Create `backend/src/api/exports/export.service.ts`
  - [ ] Implement `createExportJob(userId, resumeId, options)`:
    - Verify user owns resume
    - Determine if watermarked (free user check)
    - Create Export record with status='pending'
    - Add job to BullMQ queue
    - Return export ID
  - [ ] Implement `getExportStatus(exportId, userId)`:
    - Return current status, download URL if completed
  - [ ] Implement `cancelPendingByResumeId(resumeId)` (for cascade delete)

- [ ] **Task 4: Create Export API Endpoints** (AC: 1, 2, 3)
  - [ ] Create `backend/src/api/exports/export.controller.ts`
  - [ ] `POST /api/exports` - Request new export
  - [ ] `GET /api/exports/:id` - Get export status
  - [ ] `GET /api/exports` - List user's exports

- [ ] **Task 5: Create Export Validation** (AC: all)
  - [ ] Create `backend/src/api/exports/export.validation.ts`
  - [ ] Schema for create export:

    ```typescript
    z.object({
      resumeId: z.string().regex(/^[0-9a-fA-F]{24}$/),
      format: z.enum(['pdf']).default('pdf'),
    })
    ```

- [ ] **Task 6: Create OpenAPI Documentation** (AC: all)
  - [ ] Create `backend/src/api/exports/export.doc.ts`
  - [ ] Document all endpoints

- [ ] **Task 7: Register Export Routes** (AC: all)
  - [ ] Create `backend/src/api/exports/index.ts`
  - [ ] Apply AuthMiddleware
  - [ ] Register in main API router

## Dev Notes

### Architecture Compliance

- **Job Queue (from project-context.md):**
  - Use `QueueService` (BullMQ wrapper) for all async tasks
  - Workers MUST be idempotent
  - Workers MUST NOT crash the process on error

### Export Job Flow

```text
POST /api/exports { resumeId }
    │
    ├── Validate request (Zod)
    ├── Check resume ownership
    ├── Determine watermark status
    │
    ├── Create Export record (status=pending)
    │
    ├── Add job to BullMQ
    │   └── Job data: { exportId, resumeId, userId, watermarked }
    │
    └── Return { exportId }

Client polls GET /api/exports/:id
    │
    └── Return { status, fileUrl?, error? }
```

### Watermark Logic

```typescript
// Determine if export should be watermarked
async function shouldWatermark(userId: string): Promise<boolean> {
  // For MVP: Free users get watermark
  // Future: Check if user has "paid export" entitlement
  const user = await userService.findById(userId);
  return user.creditBalance < PAID_EXPORT_CREDIT_THRESHOLD;
  // OR check for specific entitlement
}
```

### File Structure

```text
backend/src/
├── api/exports/
│   ├── index.ts              # NEW: Router
│   ├── export.model.ts       # NEW: Export model
│   ├── export.service.ts     # NEW: Export operations
│   ├── export.controller.ts  # NEW: HTTP handlers
│   ├── export.validation.ts  # NEW: Zod schemas
│   └── export.doc.ts         # NEW: OpenAPI docs
├── services/
│   └── queue.service.ts      # MODIFY: Add export queue
```

### API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/exports` | Request new export |
| GET | `/api/exports/:id` | Get export status |
| GET | `/api/exports` | List user's exports |

### Polling Strategy (Frontend)

```javascript
// Client-side polling
async function pollExportStatus(exportId, onComplete, onError) {
  const poll = async () => {
    const status = await exportApi.getStatus(exportId);
    if (status.status === 'completed') {
      onComplete(status.fileUrl);
    } else if (status.status === 'failed') {
      onError(status.error);
    } else {
      setTimeout(poll, 2000); // Poll every 2s
    }
  };
  poll();
}
```

### Testing Requirements

- [ ] Verify job is added to queue
- [ ] Verify export record is created
- [ ] Verify status polling works
- [ ] Verify ownership check prevents unauthorized exports
- [ ] Verify cascade cancel works

### Previous Story Context

**Dependencies:**

- Story 1.5 (User Deletion) - Queue setup may already exist
- Story 2.1 (Resume CRUD) - Resume model

### References

- [PRD - FR-24, NFR-03](../planning-artifacts/prd.md) - PDF export, 10s latency
- [Project Context](../../project-context.md#4-job-queue-backend) - Job queue rules

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
