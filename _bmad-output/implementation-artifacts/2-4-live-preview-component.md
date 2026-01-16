# Story 2.4: Live Preview Component

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to see a live preview of my resume,
so that I know how it looks as I type.

## Acceptance Criteria

1. **Given** the split-screen view, **When** I update the editor form, **Then** the Preview component should re-render within 100ms (p95).
2. **And** ONLY the modified section's component should re-render (verified via React Profiler).
3. **And** the preview should use the selected Template layout.
4. **And** the preview should accurately represent the final PDF output.
5. **And** on mobile, there should be an explicit toggle between edit and preview modes.

## Tasks / Subtasks

- [ ] **Task 1: Create Split-Screen Layout** (AC: 1, 5)
  - [ ] Update `EditorLayout.jsx` to support split-screen view
  - [ ] Left panel: Editor form (scrollable)
  - [ ] Right panel: Preview (fixed, A4 aspect ratio)
  - [ ] Add responsive behavior:
    - Desktop (≥1024px): Side-by-side split
    - Tablet/Mobile (<1024px): Toggle between edit/preview modes
  - [ ] Create `EditPreviewToggle.jsx` for mobile view

- [ ] **Task 2: Create Preview Container** (AC: 1, 4)
  - [ ] Create `frontend/src/pages/editor/preview/PreviewContainer.jsx`
  - [ ] Implement A4 paper simulation (210mm x 297mm ratio)
  - [ ] Add zoom controls (fit to width, 100%, 150%)
  - [ ] Add shadow/border to simulate paper look
  - [ ] Implement scroll for multi-page preview

- [ ] **Task 3: Create Template Renderer** (AC: 3, 4)
  - [ ] Create `frontend/src/components/templates/` directory
  - [ ] Create `TemplateRenderer.jsx`:

    ```javascript
    function TemplateRenderer({ templateId, sections }) {
      const Template = templates[templateId] || templates.modern;
      return <Template sections={sections} />;
    }
    ```

  - [ ] Create template registry mapping templateId to component

- [ ] **Task 4: Create Modern Template** (AC: 3, 4)
  - [ ] Create `frontend/src/components/templates/ModernTemplate.jsx`
  - [ ] Implement clean, professional layout:
    - Header with name and contact info
    - Summary section
    - Two-column layout for experience/education
    - Skills section with tags
  - [ ] Use CSS that matches PDF output styling
  - [ ] Ensure print-friendly styles

- [ ] **Task 5: Create Classic Template** (AC: 3, 4)
  - [ ] Create `frontend/src/components/templates/ClassicTemplate.jsx`
  - [ ] Implement traditional resume layout:
    - Single-column layout
    - Bold section headers
    - Serif font styling
  - [ ] Ensure print-friendly styles

- [ ] **Task 6: Optimize Re-render Performance** (AC: 1, 2)
  - [ ] Use `React.memo()` for section preview components
  - [ ] Implement granular updates:

    ```javascript
    // Each section component should only re-render when its data changes
    const PersonalPreview = React.memo(({ content }) => { ... });
    const ExperiencePreview = React.memo(({ content }) => { ... });
    ```

  - [ ] Use `useMemo` for computed styles
  - [ ] Verify performance with React DevTools Profiler
  - [ ] Target: <100ms re-render time

- [ ] **Task 7: Create Section Preview Components** (AC: 2, 3)
  - [ ] Create `frontend/src/components/templates/sections/`:
    - `PersonalPreview.jsx`
    - `SummaryPreview.jsx`
    - `ExperiencePreview.jsx`
    - `EducationPreview.jsx`
    - `SkillsPreview.jsx`
  - [ ] Each component renders section content in template style
  - [ ] Memoize to prevent unnecessary re-renders

- [ ] **Task 8: Integrate Preview with Editor** (AC: 1, 2, 3)
  - [ ] Update `EditorPage.jsx` to pass resume state to Preview
  - [ ] Ensure immediate preview updates on form changes
  - [ ] Pass `templateId` to preview for template selection

## Dev Notes

### Architecture Compliance

- **Performance (NFR-01):** p95 preview update latency ≤ 100ms
- **Method:** Frontend performance telemetry measuring keystroke-to-render update time

### Performance Optimization Strategy

```text
Form Input → State Update → Preview Re-render
               │
               ▼
      Selective Re-render
      (React.memo + props comparison)
               │
               ▼
      Only affected section re-renders
```

**Key Optimizations:**

1. **React.memo:** Memoize section preview components
2. **Granular Props:** Pass only relevant section data to each preview component
3. **Stable References:** Use `useMemo`/`useCallback` for objects and functions
4. **Avoid Prop Drilling:** Consider context for template settings

### Template Architecture

```text
TemplateRenderer (templateId, sections)
    │
    ├── templates['modern'] → ModernTemplate
    └── templates['classic'] → ClassicTemplate
                │
                ├── HeaderSection (personal)
                ├── SummarySection (summary)
                ├── ExperienceSection (experience)
                ├── EducationSection (education)
                └── SkillsSection (skills)
```

### File Structure

```text
frontend/src/
├── pages/editor/
│   ├── EditorLayout.jsx         # MODIFY: Add split-screen
│   ├── preview/
│   │   ├── PreviewContainer.jsx # NEW: A4 preview wrapper
│   │   └── EditPreviewToggle.jsx # NEW: Mobile toggle
├── components/
│   └── templates/
│       ├── index.js             # NEW: Template registry
│       ├── TemplateRenderer.jsx # NEW: Template switcher
│       ├── ModernTemplate.jsx   # NEW: Modern layout
│       ├── ClassicTemplate.jsx  # NEW: Classic layout
│       └── sections/
│           ├── PersonalPreview.jsx
│           ├── SummaryPreview.jsx
│           ├── ExperiencePreview.jsx
│           ├── EducationPreview.jsx
│           └── SkillsPreview.jsx
```

### CSS Considerations

**Preview Accuracy:**

- Use same fonts as PDF export (e.g., Inter, Roboto)
- Match exact spacing and margins
- Use `@media print` styles for consistency
- Consider CSS-in-JS or CSS Modules for scoped styles

**A4 Preview Styling:**

```css
.preview-container {
  width: 210mm;
  min-height: 297mm;
  padding: 20mm;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.preview-wrapper {
  transform-origin: top left;
  /* Scale to fit container width */
}
```

### Testing Requirements

- [ ] Verify preview updates within 100ms (use React Profiler)
- [ ] Verify only modified section re-renders
- [ ] Verify both templates render correctly
- [ ] Verify mobile toggle works correctly
- [ ] Verify A4 aspect ratio is maintained
- [ ] Verify content matches expected PDF layout

### Performance Profiling

Use React DevTools Profiler to verify:

1. Open DevTools → Profiler tab
2. Start recording
3. Type in editor
4. Stop recording
5. Check "Ranked" chart for component render times
6. Ensure preview section renders are <100ms

### Previous Story Context

**Dependencies:**

- Story 2.3 (Frontend Editor UI) - Editor layout and state management

**From Story 2.3:**

- `useResumeEditor` hook provides resume state
- `EditorLayout.jsx` provides layout structure
- Section data structure established

### References

- [PRD - FR-08, NFR-01](../planning-artifacts/prd.md) - Live preview, 100ms latency
- [Story 2.3](./2-3-frontend-editor-ui-state.md) - Editor state management
- [React Performance](https://react.dev/reference/react/memo) - React memoization docs

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
