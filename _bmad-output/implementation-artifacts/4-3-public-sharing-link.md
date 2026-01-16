# Story 4.3: Public Sharing Link

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to generate a public link,
so that I can share my CV with recruiters.

## Acceptance Criteria

1. **Given** a resume, **When** I toggle "Public Share", **Then** the system should generate a unique, obscure URL.
2. **When** a public viewer accesses the link, **Then** they should see the Read-Only version without logging in.
3. **And** the share link should NOT allow editing the resume.
4. **And** I should be able to disable (revoke) the share link.
5. **And** when the resume is deleted, all share links should be invalidated.

## Tasks / Subtasks

- [ ] **Task 1: Create ShareLink Model** (AC: 1, 4, 5)
  - [ ] Create `backend/src/api/share-links/share-link.model.ts`
  - [ ] Define `IShareLink` interface:

    ```typescript
    interface IShareLink {
      resumeId: ObjectId;
      userId: ObjectId; // Owner
      token: string; // Unique, obscure token
      isActive: boolean;
      createdAt: Date;
      expiresAt?: Date; // Optional expiry
      accessCount: number;
    }
    ```

  - [ ] Add indexes: `{ token: 1 }` (unique), `{ resumeId: 1 }`

- [ ] **Task 2: Create ShareLink Service** (AC: 1, 4, 5)
  - [ ] Create `backend/src/api/share-links/share-link.service.ts`
  - [ ] Implement `createShareLink(resumeId, userId)`:
    - Generate unique token (nanoid or UUID)
    - Create ShareLink record
    - Return share URL
  - [ ] Implement `revokeShareLink(linkId, userId)`:
    - Set isActive = false
  - [ ] Implement `invalidateByResumeId(resumeId)`:
    - Deactivate all links for resume
  - [ ] Implement `getShareLinkByToken(token)`:
    - Find active link by token
    - Increment accessCount

- [ ] **Task 3: Create Share Link API Endpoints** (AC: 1, 4)
  - [ ] Create `backend/src/api/share-links/share-link.controller.ts`
  - [ ] `POST /api/resumes/:id/share` - Create share link
  - [ ] `DELETE /api/share-links/:id` - Revoke share link
  - [ ] `GET /api/resumes/:id/share-links` - List share links for resume

- [ ] **Task 4: Create Public View Endpoint** (AC: 2, 3)
  - [ ] Create `GET /api/public/resumes/:token`:
    - NO authentication required
    - Find share link by token
    - If active, return resume data (read-only)
    - Increment access count
    - If inactive/not found, return 404

- [ ] **Task 5: Update Resume Delete for Cascade** (AC: 5)
  - [ ] Update `ResumeService.softDeleteResume`:

    ```typescript
    async softDeleteResume(resumeId, userId) {
      // ... existing logic
      await shareLinkService.invalidateByResumeId(resumeId);
      // ...
    }
    ```

- [ ] **Task 6: Create Share Link Validation** (AC: all)
  - [ ] Create `backend/src/api/share-links/share-link.validation.ts`

- [ ] **Task 7: Create OpenAPI Documentation** (AC: all)
  - [ ] Create `backend/src/api/share-links/share-link.doc.ts`
  - [ ] Document all endpoints

- [ ] **Task 8: Frontend Share UI** (AC: 1, 4)
  - [ ] Create `frontend/src/components/share/ShareModal.jsx`
  - [ ] Show share link with copy button
  - [ ] Toggle to enable/disable sharing
  - [ ] Add to resume actions menu

## Dev Notes

### Architecture Compliance

- **Public Endpoint Security:**
  - Public view endpoint must NOT expose sensitive data
  - Return only resume content, not user details
  - Rate limit public endpoints (prevent scraping)

### Share Link Token

Use `nanoid` for URL-friendly, secure tokens:

```typescript
import { nanoid } from 'nanoid';

const token = nanoid(21); // e.g., "V1StGXR8_Z5jdHi6B-myT"
const shareUrl = `${BASE_URL}/r/${token}`;
```

### Public View Flow

```text
Public User accesses https://cvcraft.ai/r/{token}
    │
    ├── Frontend: Route to PublicResumePage
    │
    ├── GET /api/public/resumes/{token}
    │   │
    │   ├── Find ShareLink by token
    │   ├── If not found → 404
    │   ├── If inactive → 404
    │   ├── Increment accessCount
    │   └── Return resume content (sanitized)
    │
    └── Render read-only resume view
```

### File Structure

```text
backend/src/api/share-links/
├── index.ts                  # NEW: Router
├── share-link.model.ts       # NEW: ShareLink model
├── share-link.service.ts     # NEW: Share operations
├── share-link.controller.ts  # NEW: HTTP handlers
├── share-link.validation.ts  # NEW: Zod schemas
└── share-link.doc.ts         # NEW: OpenAPI docs

frontend/src/
├── components/share/
│   └── ShareModal.jsx        # NEW: Share UI
├── pages/public/
│   └── PublicResumePage.jsx  # NEW: Public view page
```

### API Endpoints

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/api/resumes/:id/share` | ✅ | Create share link |
| GET | `/api/resumes/:id/share-links` | ✅ | List share links |
| DELETE | `/api/share-links/:id` | ✅ | Revoke link |
| GET | `/api/public/resumes/:token` | ❌ | Public view |

### Testing Requirements

- [ ] Verify share link is created with unique token
- [ ] Verify public view works without auth
- [ ] Verify inactive links return 404
- [ ] Verify access count increments
- [ ] Verify cascade invalidation on delete

### Previous Story Context

**Dependencies:**

- Story 2.6 (Resume Lifecycle) - Cascade delete hook prepared
- Story 2.4 (Templates) - For rendering public view

### References

- [PRD - FR-27, FR-28, FR-29](../planning-artifacts/prd.md) - Share links, public view
- [Story 2.6](./2-6-resume-lifecycle-management.md) - Cascade delete preparation

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
