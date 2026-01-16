# Story 2.5: Template System Foundation

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to switch between two basic templates,
so that I can choose a style.

## Acceptance Criteria

1. **Given** two templates (Modern, Classic), **When** I select "Classic", **Then** the Preview should immediately switch CSS/Layout structure.
2. **And** the `templateId` should be persisted in the Resume document.
3. **And** the template selection should be available from the editor interface.
4. **And** switching templates should NOT affect the resume content (only visual presentation).
5. **And** the selected template should be reflected in PDF export (Story 4.2 dependency).

## Tasks / Subtasks

- [ ] **Task 1: Create Template Selector Component** (AC: 1, 3)
  - [ ] Create `frontend/src/pages/editor/TemplateSelector.jsx`
  - [ ] Display thumbnail previews of available templates
  - [ ] Highlight currently selected template
  - [ ] Emit `onTemplateChange(templateId)` callback
  - [ ] Add to editor header or sidebar

- [ ] **Task 2: Create Template Metadata Registry** (AC: 1, 3)
  - [ ] Create `frontend/src/components/templates/registry.js`:

    ```javascript
    export const templateRegistry = {
      modern: {
        id: 'modern',
        name: 'Modern',
        description: 'Clean, professional look with accent colors',
        thumbnail: '/templates/modern-thumb.png',
        component: ModernTemplate,
      },
      classic: {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional, timeless resume style',
        thumbnail: '/templates/classic-thumb.png',
        component: ClassicTemplate,
      },
    };
    ```

- [ ] **Task 3: Generate Template Thumbnails** (AC: 3)
  - [ ] Create sample resume data for thumbnails
  - [ ] Generate `public/templates/modern-thumb.png`
  - [ ] Generate `public/templates/classic-thumb.png`
  - [ ] Thumbnail size: 200x280px (A4 ratio)

- [ ] **Task 4: Add Template Switching API** (AC: 2)
  - [ ] Ensure `PUT /api/resumes/:id` supports `templateId` update
  - [ ] (Should already exist from Story 2.2)
  - [ ] Verify backend validates `templateId` against allowed values

- [ ] **Task 5: Integrate Template Selection with Editor** (AC: 1, 2, 4)
  - [ ] Add templateId to editor state in `useResumeEditor.js`
  - [ ] Update template when user selects new option
  - [ ] Persist template change via auto-save
  - [ ] Verify content is preserved on template switch

- [ ] **Task 6: Add Template-Specific Styling** (AC: 1, 4)
  - [ ] Ensure each template has isolated CSS
  - [ ] Modern template: Sans-serif fonts, accent colors, modern spacing
  - [ ] Classic template: Serif fonts, traditional layouts, conservative spacing
  - [ ] Use CSS Modules or styled-components for isolation

- [ ] **Task 7: Backend Template Validation** (AC: 2)
  - [ ] Add template validation to resume validation schema:

    ```typescript
    templateId: z.enum(['modern', 'classic']).default('modern')
    ```

  - [ ] Return 400 if invalid templateId provided

## Dev Notes

### Architecture Compliance

- **Content/Presentation Separation:**
  - Resume content is stored in `sections` array (template-agnostic)
  - Template only affects visual presentation
  - Same content, different layouts

### Template System Design

```text
Resume Data (Content)
    │
    ▼
TemplateRenderer
    │
    ├── templateId: 'modern' → ModernTemplate.jsx + modern.css
    └── templateId: 'classic' → ClassicTemplate.jsx + classic.css
    │
    ▼
Preview / PDF Output
```

**Key Principle:** Templates are pure presentational components. They receive content as props and render it visually.

### Template Component Contract

```typescript
interface TemplateProps {
  sections: ResumeSection[];
  metadata?: {
    title: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

// All templates MUST implement this interface
const ModernTemplate: FC<TemplateProps> = ({ sections }) => { ... };
```

### Allowed Templates (MVP)

| ID | Name | Description |
| -- | ---- | ----------- |
| `modern` | Modern | Clean design with accent colors, sans-serif fonts |
| `classic` | Classic | Traditional layout with serif fonts |

### File Structure

```text
frontend/src/components/templates/
├── registry.js               # MODIFY: Add template metadata
├── TemplateRenderer.jsx      # EXISTING (from 2.4)
├── ModernTemplate.jsx        # EXISTING (from 2.4)
├── ClassicTemplate.jsx       # EXISTING (from 2.4)
├── modern.module.css         # NEW: Modern template styles
└── classic.module.css        # NEW: Classic template styles

frontend/src/pages/editor/
└── TemplateSelector.jsx      # NEW: Template picker UI

frontend/public/templates/
├── modern-thumb.png          # NEW: Modern template thumbnail
└── classic-thumb.png         # NEW: Classic template thumbnail
```

### UI Design for Template Selector

```text
┌─────────────────────────────────────┐
│ Choose Template                      │
│                                      │
│  ┌──────────┐    ┌──────────┐       │
│  │  Modern  │    │ Classic  │       │
│  │ [THUMB]  │    │ [THUMB]  │       │
│  │    ✓     │    │          │       │
│  └──────────┘    └──────────┘       │
│                                      │
│  Clean look...    Traditional...     │
└─────────────────────────────────────┘
```

### Testing Requirements

- [ ] Verify template switch updates preview immediately
- [ ] Verify templateId is persisted to database
- [ ] Verify content is unchanged after template switch
- [ ] Verify both template thumbnails display correctly
- [ ] Verify invalid templateId returns 400 error

### Previous Story Context

**Dependencies:**

- Story 2.4 (Live Preview) - Template components created

**From Story 2.4:**

- `ModernTemplate.jsx` and `ClassicTemplate.jsx` exist
- `TemplateRenderer.jsx` handles template selection
- Section preview components are memoized

### Future Enhancements (Out of MVP Scope)

- Custom color schemes per template
- Additional templates (Creative, Minimalist, etc.)
- Template marketplace
- Custom template creation

### References

- [PRD - FR-10, FR-11, FR-12](../planning-artifacts/prd.md) - Template selection, switching, MVP scope
- [Story 2.4](./2-4-live-preview-component.md) - Template rendering foundation

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
