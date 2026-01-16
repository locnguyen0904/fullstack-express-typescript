# Story 2.6: Resume Lifecycle Management

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to manage my resume drafts completely,
so I can organize my work.

## Acceptance Criteria

1. **Given** a resume list, **When** I delete a resume, **Then** the system must also invalidate any active Share Links and cancel pending Export Jobs (Cascade Delete).
2. **When** I duplicate a resume, **Then** a deep copy of all sections should be created.
3. **And** the duplicated resume should have a new title like "Copy of [Original Title]".
4. **And** the duplicated resume should NOT copy share links or export history.
5. **And** I should be able to see a list of all my resumes with basic info (title, last updated, template).

## Tasks / Subtasks

- [ ] **Task 1: Implement Resume Duplication API** (AC: 2, 3, 4)
  - [ ] Add `POST /api/resumes/:id/duplicate` endpoint
  - [ ] Implement `duplicateResume(resumeId: string, userId: string)` in `ResumeService`:
    - [ ] Verify ownership
    - [ ] Create deep copy of resume document
    - [ ] Set new title: `Copy of ${originalTitle}`
    - [ ] Generate new `_id`
    - [ ] Reset `createdAt` and `updatedAt`
    - [ ] DO NOT copy `shareLinks` or related records
  - [ ] Add Zod validation for duplicate request
  - [ ] Document in OpenAPI

- [ ] **Task 2: Implement Cascade Delete for Share Links** (AC: 1)
  - [ ] Update `softDeleteResume` in `ResumeService`:

    ```typescript
    async softDeleteResume(resumeId: string, userId: string) {
      // 1. Verify ownership
      // 2. Invalidate all share links for this resume
      await ShareLinkService.invalidateByResumeId(resumeId);
      // 3. Soft delete resume
      return this.update(resumeId, { status: 'deleted', deletedAt: new Date() });
    }
    ```

  - [ ] (Note: ShareLink model will be created in Epic 4, but prepare the hook)

- [ ] **Task 3: Implement Cascade Delete for Export Jobs** (AC: 1)
  - [ ] Update `softDeleteResume` to cancel pending exports:

    ```typescript
    // Cancel pending export jobs for this resume
    await ExportService.cancelPendingByResumeId(resumeId);
    ```

  - [ ] (Note: Export model will be created in Epic 4, but prepare the hook)

- [ ] **Task 4: Create Resume List View (Frontend)** (AC: 5)
  - [ ] Create `frontend/src/pages/resumes/ResumeListPage.jsx`
  - [ ] Implement route `/app/resumes`
  - [ ] Fetch user's resumes from API
  - [ ] Display resume cards with:
    - Title
    - Template thumbnail (small)
    - Last updated date
    - Actions: Edit, Duplicate, Delete

- [ ] **Task 5: Create Resume Card Component** (AC: 5)
  - [ ] Create `frontend/src/pages/resumes/ResumeCard.jsx`
  - [ ] Show resume preview thumbnail (mini version)
  - [ ] Show metadata (title, date)
  - [ ] Add action dropdown menu
  - [ ] Implement delete confirmation modal

- [ ] **Task 6: Add Duplicate Functionality to Frontend** (AC: 2, 3)
  - [ ] Add "Duplicate" action to ResumeCard
  - [ ] Call `POST /api/resumes/:id/duplicate`
  - [ ] Refresh resume list after duplication
  - [ ] Show success notification

- [ ] **Task 7: Add Delete Confirmation Flow** (AC: 1)
  - [ ] Create `DeleteConfirmationModal.jsx`
  - [ ] Show warning: "This will also remove all share links and cancel pending exports"
  - [ ] Require explicit confirmation
  - [ ] Handle loading and error states

- [ ] **Task 8: Update API Router** (AC: all)
  - [ ] Add `POST /api/resumes/:id/duplicate` route
  - [ ] Ensure all routes require authentication
  - [ ] Update OpenAPI documentation

## Dev Notes

### Architecture Compliance

- **Cascade Delete Pattern:**
  - When parent entity is deleted, related entities must be cleaned up
  - Use service layer to coordinate cross-entity operations
  - Prepare hooks for future models (ShareLink, Export)

### Cascade Delete Flow

```text
DELETE /api/resumes/:id
    │
    ▼
ResumeService.softDeleteResume(id, userId)
    │
    ├── Verify ownership
    │
    ├── Invalidate Share Links (Epic 4 hook)
    │   └── ShareLinkService.invalidateByResumeId(resumeId)
    │
    ├── Cancel Export Jobs (Epic 4 hook)
    │   └── ExportService.cancelPendingByResumeId(resumeId)
    │
    └── Set resume status='deleted', deletedAt=now()
```

### Duplication Strategy

```typescript
async duplicateResume(resumeId: string, userId: string): Promise<IResume> {
  const original = await this.findResumeById(resumeId, userId);
  if (!original) throw new NotFoundError('Resume not found');

  const duplicate = {
    ...original.toObject(),
    _id: undefined, // Let MongoDB generate new ID
    title: `Copy of ${original.title}`,
    createdAt: undefined,
    updatedAt: undefined,
    // Explicitly exclude:
    // - shareLinks
    // - exportHistory
  };

  return this.model.create(duplicate);
}
```

### File Structure

```text
backend/src/api/resumes/
├── resume.service.ts         # MODIFY: Add duplicate, cascade hooks
├── resume.controller.ts      # MODIFY: Add duplicate endpoint
├── resume.validation.ts      # MODIFY: Add duplicate schema
└── resume.doc.ts             # MODIFY: Document duplicate endpoint

frontend/src/pages/
├── resumes/
│   ├── ResumeListPage.jsx    # NEW: Resume list view
│   └── ResumeCard.jsx        # NEW: Resume card component
├── components/
│   └── DeleteConfirmationModal.jsx  # NEW: Delete confirmation
```

### API Endpoints (This Story)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/resumes/:id/duplicate` | Duplicate resume |
| GET | `/api/resumes` | List user's resumes (from 2.1) |
| DELETE | `/api/resumes/:id` | Delete with cascade (enhanced) |

### Frontend Resume List Design

```text
┌─────────────────────────────────────────────────────┐
│ My Resumes                           [+ New Resume] │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ [Preview]  │  │ [Preview]  │  │ [Preview]  │    │
│  │            │  │            │  │            │    │
│  │ My Resume  │  │ Tech Role  │  │ Creative   │    │
│  │ Updated... │  │ Updated... │  │ Updated... │    │
│  │ [⋮ Menu]   │  │ [⋮ Menu]   │  │ [⋮ Menu]   │    │
│  └────────────┘  └────────────┘  └────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Testing Requirements

- [ ] Verify duplicate creates independent copy
- [ ] Verify duplicate has new ID and timestamps
- [ ] Verify duplicate doesn't copy share links
- [ ] Verify delete triggers cascade hooks (even if services don't exist yet)
- [ ] Verify resume list displays correctly
- [ ] Verify delete confirmation shows warning

### Stub Services for Future Epics

Since ShareLink and Export models don't exist yet, create stub services:

```typescript
// backend/src/api/share-links/share-link.service.ts (stub)
export const ShareLinkService = {
  async invalidateByResumeId(resumeId: string): Promise<void> {
    // TODO: Implement in Epic 4
    console.log(`[STUB] Invalidate share links for resume ${resumeId}`);
  },
};

// backend/src/api/exports/export.service.ts (stub)
export const ExportService = {
  async cancelPendingByResumeId(resumeId: string): Promise<void> {
    // TODO: Implement in Epic 4
    console.log(`[STUB] Cancel exports for resume ${resumeId}`);
  },
};
```

### Previous Story Context

**Dependencies:**

- Story 2.1 (Resume CRUD) - Base resume operations
- Story 2.3 (Frontend Editor) - Resume state management

### References

- [PRD - FR-05](../planning-artifacts/prd.md) - Create, rename, delete resumes
- [Story 2.1](./2-1-resume-crud-operations.md) - Basic CRUD operations
- [Epic 4 (Future)](../planning-artifacts/epics.md) - Export & Sharing

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
