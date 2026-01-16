# Story 2.1: Resume CRUD Operations

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to create, rename, and delete resume drafts,
so that I can manage different versions of my CV.

## Acceptance Criteria

1. **Given** a logged-in user, **When** I POST to `/api/resumes`, **Then** a new resume document should be created with default sections.
2. **And** the resume should be associated with the current user (`ownerUserId`).
3. **And** the response should return the created resume with ID and default structure.
4. **When** I PUT to `/api/resumes/:id/title` with a new title, **Then** the title should be updated.
5. **And** only the owner of the resume can update the title.
6. **When** I DELETE `/api/resumes/:id`, **Then** the resume should be soft-deleted (set `status=deleted`).
7. **And** only the owner of the resume can delete it.
8. **When** I GET `/api/resumes`, **Then** I should see a paginated list of my own resumes (excluding deleted ones).
9. **When** I GET `/api/resumes/:id`, **Then** I should see the full resume details if I am the owner.

## Tasks / Subtasks

- [ ] **Task 1: Create Resume Model** (AC: 1, 2, 3)
  - [ ] Create `backend/src/api/resumes/resume.model.ts`
  - [ ] Define `IResume` interface with required fields:
    - `title: string` (default: "Untitled Resume")
    - `ownerUserId: ObjectId` (ref: User)
    - `templateId: string` (default: "modern")
    - `status: 'active' | 'deleted'` (default: "active")
    - `sections: IResumeSection[]` (embedded array)
  - [ ] Define `IResumeSection` interface:
    - `type: string` (e.g., "personal", "education", "experience", "skills")
    - `order: number`
    - `content: object` (flexible JSON for section-specific data)
  - [ ] Add indexes: `{ ownerUserId: 1, status: 1 }`, `{ ownerUserId: 1, createdAt: -1 }`
  - [ ] Add mongoose-paginate-v2 plugin

- [ ] **Task 2: Create Resume Service** (AC: 1-9)
  - [ ] Create `backend/src/api/resumes/resume.service.ts`
  - [ ] Extend `ServiceCore<IResume>`
  - [ ] Implement `createResume(userId: string, data?: Partial<IResume>)`:
    - [ ] Set `ownerUserId` from userId
    - [ ] Initialize default sections structure
  - [ ] Implement `findResumesByOwner(userId: string, query: object)`:
    - [ ] Filter by `ownerUserId` and `status: 'active'`
    - [ ] Support pagination
  - [ ] Implement `findResumeById(resumeId: string, userId: string)`:
    - [ ] Enforce ownership check
    - [ ] Return null if not owner
  - [ ] Implement `updateResumeTitle(resumeId: string, userId: string, title: string)`:
    - [ ] Enforce ownership check
  - [ ] Implement `softDeleteResume(resumeId: string, userId: string)`:
    - [ ] Set `status = 'deleted'`, `deletedAt = new Date()`
    - [ ] Enforce ownership check

- [ ] **Task 3: Create Resume Validation Schemas** (AC: 1, 4)
  - [ ] Create `backend/src/api/resumes/resume.validation.ts`
  - [ ] Define Zod schemas:
    - `createResumeSchema` (optional title, optional templateId)
    - `updateTitleSchema` (required title, min 1 char, max 100 chars)
    - `resumeIdParamSchema` (valid MongoDB ObjectId)

- [ ] **Task 4: Create Resume Controller** (AC: 1-9)
  - [ ] Create `backend/src/api/resumes/resume.controller.ts`
  - [ ] Implement endpoints:
    - `POST /` - Create resume
    - `GET /` - List user's resumes
    - `GET /:id` - Get single resume
    - `PUT /:id/title` - Update title
    - `DELETE /:id` - Soft delete resume
  - [ ] Use `req.user.id` for ownership (from AuthMiddleware)
  - [ ] Apply validation middleware to all routes

- [ ] **Task 5: Create Resume OpenAPI Documentation** (AC: all)
  - [ ] Create `backend/src/api/resumes/resume.doc.ts`
  - [ ] Register all endpoints with OpenAPI registry
  - [ ] Define request/response schemas
  - [ ] Document error responses (400, 401, 403, 404)

- [ ] **Task 6: Register Resume Routes** (AC: all)
  - [ ] Create `backend/src/api/resumes/index.ts` router
  - [ ] Apply `AuthMiddleware` to all routes
  - [ ] Register in `backend/src/api/index.ts`

- [ ] **Task 7: Default Sections Structure** (AC: 1, 3)
  - [ ] Define `DEFAULT_RESUME_SECTIONS` constant:

    ```typescript
    const DEFAULT_RESUME_SECTIONS = [
      { type: 'personal', order: 0, content: {} },
      { type: 'summary', order: 1, content: {} },
      { type: 'experience', order: 2, content: { items: [] } },
      { type: 'education', order: 3, content: { items: [] } },
      { type: 'skills', order: 4, content: { items: [] } },
    ];
    ```

## Dev Notes

### Architecture Compliance

- **Tenant Isolation (CRITICAL from project-context.md):**
  - ALL Service methods MUST accept `userId` as argument
  - ALWAYS filter queries by `{ ownerUserId: userId }`
  - Anti-Pattern: `Model.findOne({ _id: id })` (Missing owner check!)

- **API Module Structure (from project-context.md):**
  - `src/api/{resource}/` MUST contain: Controller, Service, Model, Validation, Doc
  - Docs: Define OpenAPI spec in `*.doc.ts` alongside controller

- **Error Handling:**
  - Controllers: DO NOT use try-catch. Let global middleware handle errors
  - Services: Throw typed errors (`NotFoundError`, `ForbiddenError`)

### Resume Data Model Design

```typescript
interface IResume extends Document {
  title: string;
  ownerUserId: mongoose.Types.ObjectId;
  templateId: string;
  status: 'active' | 'deleted';
  deletedAt?: Date;
  sections: IResumeSection[];
}

interface IResumeSection {
  type: string;
  order: number;
  content: Record<string, unknown>;
}
```

**Design Decisions:**

1. **Embedded Sections:** Sections are embedded in Resume document (not separate collection) for:
   - Atomic reads/writes
   - No join operations needed
   - Resume is a natural aggregate boundary

2. **Flexible Content:** `content` is a flexible object to accommodate different section types without schema changes.

3. **Soft Delete:** Use `status` field for soft delete to support recovery and cascade operations.

### File Structure Requirements

```text
backend/src/api/resumes/
├── index.ts              # NEW: Router with routes
├── resume.model.ts       # NEW: Mongoose model
├── resume.service.ts     # NEW: Business logic
├── resume.controller.ts  # NEW: HTTP handlers
├── resume.validation.ts  # NEW: Zod schemas
└── resume.doc.ts         # NEW: OpenAPI documentation
```

### API Endpoints Summary

| Method | Endpoint | Description | Auth |
| ------ | -------- | ----------- | ---- |
| POST | `/api/resumes` | Create new resume | ✅ |
| GET | `/api/resumes` | List user's resumes | ✅ |
| GET | `/api/resumes/:id` | Get single resume | ✅ |
| PUT | `/api/resumes/:id/title` | Update resume title | ✅ |
| DELETE | `/api/resumes/:id` | Soft delete resume | ✅ |

### Testing Requirements

- [ ] Create resume with default sections
- [ ] Verify ownership is set correctly
- [ ] Verify list only returns user's own resumes
- [ ] Verify cannot access/modify other user's resumes
- [ ] Verify soft delete sets correct status
- [ ] Verify deleted resumes don't appear in list

### Security Considerations

- **Authorization:** Every operation MUST verify ownership before proceeding
- **Input Validation:** All inputs validated with Zod before processing
- **Pagination:** Limit max page size to prevent DoS

### Previous Stories Context

From **Story 1.2 (Firebase Auth):**

- AuthMiddleware provides `req.user` with user ID
- User ID is the MongoDB `_id` (mapped from Firebase UID)

From **Story 1.3 (User Profile):**

- User model pattern is established
- Service pattern with TypeDI is in place

### References

- [PRD - FR-05](../planning-artifacts/prd.md) - Create, rename, delete resume drafts
- [Project Context](../../project-context.md) - Tenant Isolation rules
- [Example Model](../../backend/src/api/examples/example.model.ts) - Model pattern reference
- [Service Core](../../backend/src/core/service.core.ts) - Base service class

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
