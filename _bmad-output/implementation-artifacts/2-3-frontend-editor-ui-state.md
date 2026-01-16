# Story 2.3: Frontend Editor UI & State

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want a visual editor to input my resume details,
so that I can easily enter information.

## Acceptance Criteria

1. **Given** the Editor Page, **When** I type in a form field, **Then** the local state should update immediately.
2. **And** when I stop typing (debounce ~500ms), the data should auto-save to the backend.
3. **And** on page reload, the latest saved data should be loaded.
4. **And** a visual indicator should show when data is saving/saved.
5. **And** if save fails, an error notification should be displayed.
6. **And** the editor should show all resume sections in an organized form layout.

## Tasks / Subtasks

- [ ] **Task 1: Create Resume Editor Page Structure** (AC: 1, 6)
  - [ ] Create `frontend/src/pages/editor/` directory structure
  - [ ] Create `EditorPage.jsx` as main page component
  - [ ] Implement route `/app/resumes/:id/edit`
  - [ ] Fetch resume data on page load using resume ID

- [ ] **Task 2: Create Section Form Components** (AC: 1, 6)
  - [ ] Create `frontend/src/pages/editor/sections/` directory
  - [ ] Create `PersonalSection.jsx`:
    - [ ] Form fields: fullName, email, phone, location, linkedin, website
    - [ ] Controlled inputs tied to local state
  - [ ] Create `SummarySection.jsx`:
    - [ ] Textarea with character count (max 500)
  - [ ] Create `ExperienceSection.jsx`:
    - [ ] Dynamic list of experience items
    - [ ] Add/remove experience functionality
    - [ ] Bullet point editor for each experience
  - [ ] Create `EducationSection.jsx`:
    - [ ] Dynamic list of education items
    - [ ] Add/remove education functionality
  - [ ] Create `SkillsSection.jsx`:
    - [ ] Skill categories with tag-like skill items
    - [ ] Add/remove categories and skills

- [ ] **Task 3: Implement Auto-Save with Debounce** (AC: 2, 4, 5)
  - [ ] Create `frontend/src/hooks/useAutoSave.js` custom hook:

    ```javascript
    function useAutoSave(data, saveFunction, delay = 500) {
      // Debounce logic
      // Track saving state
      // Return { isSaving, lastSaved, error }
    }
    ```

  - [ ] Integrate hook with editor state
  - [ ] Trigger API call on debounced changes

- [ ] **Task 4: Create Save Status Indicator** (AC: 4, 5)
  - [ ] Create `SaveStatusIndicator.jsx` component
  - [ ] Show states: "Saved", "Saving...", "Error - Click to retry"
  - [ ] Display last saved timestamp
  - [ ] Position in editor header

- [ ] **Task 5: Implement Resume State Management** (AC: 1, 2, 3)
  - [ ] Create `frontend/src/hooks/useResumeEditor.js`:

    ```javascript
    function useResumeEditor(resumeId) {
      // Fetch resume on mount
      // Local state for editing
      // Update handlers for each section
      // Auto-save integration
      // Return { resume, updateSection, isSaving, error }
    }
    ```

  - [ ] Handle optimistic updates
  - [ ] Handle error recovery

- [ ] **Task 6: Add API Integration** (AC: 2, 3, 5)
  - [ ] Create `frontend/src/api/resumes.js`:

    ```javascript
    export const resumeApi = {
      getById: (id) => fetch(`/api/resumes/${id}`),
      update: (id, data) => fetch(`/api/resumes/${id}`, { method: 'PUT', ... }),
      updateSection: (id, type, content) => fetch(...),
    };
    ```

  - [ ] Handle authentication (Firebase token)
  - [ ] Error handling and retry logic

- [ ] **Task 7: Create Editor Layout** (AC: 6)
  - [ ] Create `EditorLayout.jsx` with:
    - [ ] Header with resume title and save status
    - [ ] Sidebar with section navigation
    - [ ] Main content area for active section
  - [ ] Implement collapsible sections
  - [ ] Add section reordering (drag-and-drop optional for MVP)

## Dev Notes

### Architecture Compliance

- **Frontend Architecture (from project-context.md):**
  - Single Vite App (`frontend/`)
  - Route Splitting: `/app/*` → Custom Editor App
  - Shared `auth-provider.ts` handles Firebase Login/Token Refresh

- **State Management:**
  - Use React's built-in `useState` + `useReducer` for editor state
  - No external state library needed for MVP
  - Consider Zustand if complexity grows

### Auto-Save Implementation

```text
User Types → Local State Update (immediate)
              │
              ▼
         Debounce Timer (500ms)
              │
              ▼
         API Call (PUT /api/resumes/:id)
              │
              ├── Success → Update "lastSaved" timestamp
              └── Failure → Show error, allow retry
```

**Key Considerations:**

1. **Debounce:** Prevent excessive API calls
2. **Optimistic UI:** Show changes immediately, revert on failure
3. **Conflict Handling:** Last-write-wins (matches backend strategy)

### File Structure

```text
frontend/src/
├── api/
│   └── resumes.js                # NEW: Resume API client
├── hooks/
│   ├── useAutoSave.js           # NEW: Auto-save hook
│   └── useResumeEditor.js       # NEW: Editor state hook
├── pages/
│   └── editor/
│       ├── EditorPage.jsx       # NEW: Main editor page
│       ├── EditorLayout.jsx     # NEW: Layout wrapper
│       ├── SaveStatusIndicator.jsx  # NEW: Save status
│       └── sections/
│           ├── PersonalSection.jsx
│           ├── SummarySection.jsx
│           ├── ExperienceSection.jsx
│           ├── EducationSection.jsx
│           └── SkillsSection.jsx
└── App.jsx                      # MODIFY: Add editor route
```

### Component State Design

```javascript
// EditorPage state structure
const [resume, setResume] = useState({
  _id: '',
  title: '',
  templateId: 'modern',
  sections: [
    { type: 'personal', order: 0, content: { fullName: '', email: '', ... } },
    { type: 'experience', order: 1, content: { items: [] } },
    // ...
  ]
});
```

### Testing Requirements

- [ ] Verify immediate local state updates on typing
- [ ] Verify debounced save triggers after 500ms of inactivity
- [ ] Verify save status indicator shows correct states
- [ ] Verify data persists after page reload
- [ ] Verify error handling displays notification
- [ ] Verify all section forms render correctly

### Security Considerations

- **Authentication:** All API calls must include Firebase ID token
- **Authorization:** Backend enforces ownership (frontend trusts backend)
- **XSS Prevention:** Use React's default escaping for user content

### Previous Story Context

**Dependencies:**

- Story 2.1 (Resume CRUD) - Resume model and basic API
- Story 2.2 (Structured Content Editor Backend) - Update API with validation
- Story 1.4 (Client-Side Login) - Firebase auth integration

**From Story 1.4:**

- `auth-provider.js` provides Firebase authentication
- `token-provider.js` provides `getToken()` for API calls
- `http-client.js` attaches token to requests

### References

- [PRD - FR-06, FR-13](../planning-artifacts/prd.md) - Structured editor, Auto-save
- [Story 2.2](./2-2-structured-content-editor-backend.md) - Backend API for updates
- [Project Context](../../project-context.md) - Frontend Architecture

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
