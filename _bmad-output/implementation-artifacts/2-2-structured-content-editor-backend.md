# Story 2.2: Structured Content Editor (Backend)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to save detailed resume sections (Education, Experience),
so that my data is stored structurally.

## Acceptance Criteria

1. **Given** a resume ID owned by me, **When** I PUT to `/api/resumes/:id` with nested section data, **Then** the system should validate the structure using Zod.
2. **And** the system should update the `updatedAt` timestamp.
3. **And** the system should preserve data integrity with last-write-wins strategy.
4. **And** if validation fails, return 400 Bad Request with detailed error messages.
5. **And** only the owner can update the resume content.
6. **When** I send partial section updates, **Then** only the specified sections should be updated (merge strategy).
7. **And** section order should be respected and persisted.

## Tasks / Subtasks

- [ ] **Task 1: Define Section Content Schemas** (AC: 1, 4)
  - [ ] Create `backend/src/api/resumes/schemas/personal.schema.ts`:
    ```typescript
    {
      fullName: string,
      email: string,
      phone?: string,
      location?: string,
      linkedin?: string,
      website?: string,
      photoUrl?: string
    }
    ```
  - [ ] Create `backend/src/api/resumes/schemas/summary.schema.ts`:
    ```typescript
    {
      text: string (max 500 chars)
    }
    ```
  - [ ] Create `backend/src/api/resumes/schemas/experience.schema.ts`:
    ```typescript
    {
      items: Array<{
        id: string,
        company: string,
        position: string,
        location?: string,
        startDate: string (YYYY-MM),
        endDate?: string (YYYY-MM or "Present"),
        current: boolean,
        bullets: string[]
      }>
    }
    ```
  - [ ] Create `backend/src/api/resumes/schemas/education.schema.ts`:
    ```typescript
    {
      items: Array<{
        id: string,
        institution: string,
        degree: string,
        field?: string,
        location?: string,
        startDate: string,
        endDate?: string,
        gpa?: string,
        achievements?: string[]
      }>
    }
    ```
  - [ ] Create `backend/src/api/resumes/schemas/skills.schema.ts`:
    ```typescript
    {
      items: Array<{
        id: string,
        category: string,
        skills: string[]
      }>
    }
    ```

- [ ] **Task 2: Create Resume Update Validation** (AC: 1, 4, 6)
  - [ ] Update `backend/src/api/resumes/resume.validation.ts`
  - [ ] Create `updateResumeSchema`:
    ```typescript
    z.object({
      title: z.string().optional(),
      templateId: z.string().optional(),
      sections: z.array(sectionSchema).optional()
    })
    ```
  - [ ] Create `sectionSchema` with discriminated union by `type`
  - [ ] Add validation for section `order` (unique, sequential)

- [ ] **Task 3: Implement Resume Update Service** (AC: 1, 2, 3, 5, 6, 7)
  - [ ] Add `updateResume(resumeId: string, userId: string, data: UpdateResumeDto)` to `ResumeService`:
    - [ ] Verify ownership
    - [ ] If `sections` provided, replace entire sections array (last-write-wins)
    - [ ] If `title` or `templateId` provided, update those fields
    - [ ] Always update `updatedAt`
  - [ ] Add `updateSection(resumeId: string, userId: string, sectionType: string, content: object)`:
    - [ ] Find specific section by type
    - [ ] Update only that section's content
    - [ ] Merge strategy for single-section updates

- [ ] **Task 4: Add Update Endpoint to Controller** (AC: 1-7)
  - [ ] Add `PUT /api/resumes/:id` endpoint in `resume.controller.ts`
  - [ ] Apply validation middleware with `updateResumeSchema`
  - [ ] Return updated resume with new `updatedAt`

- [ ] **Task 5: Add Partial Section Update Endpoint** (AC: 6)
  - [ ] Add `PATCH /api/resumes/:id/sections/:sectionType` endpoint
  - [ ] Validate section content based on `sectionType`
  - [ ] Support granular updates without affecting other sections

- [ ] **Task 6: Update OpenAPI Documentation** (AC: all)
  - [ ] Add PUT `/api/resumes/:id` documentation
  - [ ] Add PATCH `/api/resumes/:id/sections/:sectionType` documentation
  - [ ] Document all section content schemas
  - [ ] Document validation error responses

## Dev Notes

### Architecture Compliance

- **Tenant Isolation:** All update operations MUST verify `ownerUserId === userId`
- **Validation:** Use Zod for runtime validation of all section content
- **Error Handling:** Throw `ForbiddenError` if not owner, `BadRequestError` for validation failures

### Data Strategy: Last-Write-Wins

For MVP, we use **last-write-wins** concurrency strategy:

- No optimistic locking (no `version` field)
- Latest update overwrites previous data
- Acceptable for single-user editing (no real-time collaboration in MVP)

**Future Enhancement:** Add `version` field for optimistic locking if concurrent editing becomes a requirement.

### Section Type Registry

```typescript
const SECTION_TYPES = {
  personal: personalSchema,
  summary: summarySchema,
  experience: experienceSchema,
  education: educationSchema,
  skills: skillsSchema,
} as const;
```

### Validation Architecture

```text
Request Body
    │
    ▼
updateResumeSchema (Zod)
    │
    ├── title? (string validation)
    ├── templateId? (string validation)
    └── sections? (array)
            │
            ▼
        sectionSchema (discriminated union by 'type')
            │
            ├── type: 'personal' → personalContentSchema
            ├── type: 'experience' → experienceContentSchema
            └── ...
```

### API Endpoints (This Story)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| PUT | `/api/resumes/:id` | Update entire resume (title, template, sections) |
| PATCH | `/api/resumes/:id/sections/:type` | Update single section content |

### File Structure Updates

```text
backend/src/api/resumes/
├── schemas/                      # NEW: Section content schemas
│   ├── index.ts
│   ├── personal.schema.ts
│   ├── summary.schema.ts
│   ├── experience.schema.ts
│   ├── education.schema.ts
│   └── skills.schema.ts
├── resume.model.ts               # EXISTING
├── resume.service.ts             # MODIFY: Add update methods
├── resume.controller.ts          # MODIFY: Add PUT/PATCH endpoints
├── resume.validation.ts          # MODIFY: Add update schemas
└── resume.doc.ts                 # MODIFY: Document new endpoints
```

### Example Request/Response

**PUT /api/resumes/:id**

Request:
```json
{
  "title": "My Updated Resume",
  "sections": [
    {
      "type": "personal",
      "order": 0,
      "content": {
        "fullName": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      }
    },
    {
      "type": "experience",
      "order": 1,
      "content": {
        "items": [
          {
            "id": "exp-1",
            "company": "Tech Corp",
            "position": "Software Engineer",
            "startDate": "2020-01",
            "current": true,
            "bullets": ["Led team of 5", "Increased performance by 40%"]
          }
        ]
      }
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "resume-id",
    "title": "My Updated Resume",
    "updatedAt": "2026-01-16T12:00:00Z",
    "sections": [...]
  }
}
```

### Testing Requirements

- [ ] Verify full resume update with all sections
- [ ] Verify partial update (only title)
- [ ] Verify single section update via PATCH
- [ ] Verify validation errors for invalid section content
- [ ] Verify ownership check (403 for other user's resume)
- [ ] Verify `updatedAt` is updated on every change

### Previous Story Context

From **Story 2.1 (Resume CRUD):**

- Resume model with `sections` array is created
- `IResumeSection` interface: `{ type, order, content }`
- Ownership pattern via `ownerUserId`
- `ResumeService` with base CRUD methods

**Dependency:** This story REQUIRES Story 2.1 to be completed first.

### References

- [PRD - FR-06](../planning-artifacts/prd.md) - Edit resume content with structured editor
- [Story 2.1](./2-1-resume-crud-operations.md) - Resume model and service foundation
- [Project Context](../../project-context.md) - Validation and API patterns

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
