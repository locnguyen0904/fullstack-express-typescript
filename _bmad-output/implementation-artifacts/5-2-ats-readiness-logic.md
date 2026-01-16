# Story 5.2: ATS Readiness Logic

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to check if my resume is ATS-friendly,
so that I don't get rejected by bots.

## Acceptance Criteria

1. **Given** a resume, **When** I click "ATS Check", **Then** the system should run a rule-based analysis.
2. **And** return a list of specific warnings (e.g., "Avoid columns", "Missing email").
3. **And** each warning should have a severity (critical, warning, suggestion).
4. **And** the overall ATS score should be calculated (0-100).
5. **And** suggestions for improvement should be provided.

## Tasks / Subtasks

- [ ] **Task 1: Create ATS Rules Engine** (AC: 1, 2, 3)
  - [ ] Create `backend/src/api/ats/ats-rules.ts`
  - [ ] Define rule categories:

    ```typescript
    const ATS_RULES = [
      // Contact Info
      { id: 'email_missing', check: (r) => !r.personal?.email, severity: 'critical', message: 'Email address is missing' },
      { id: 'phone_missing', check: (r) => !r.personal?.phone, severity: 'warning', message: 'Phone number is missing' },
      
      // Content Issues
      { id: 'summary_too_short', check: (r) => (r.summary?.text?.length || 0) < 50, severity: 'suggestion', message: 'Summary is too short' },
      { id: 'experience_empty', check: (r) => !r.experience?.items?.length, severity: 'critical', message: 'No work experience listed' },
      { id: 'bullet_too_long', check: (r) => hasBulletOver(r, 150), severity: 'warning', message: 'Some bullet points exceed 150 characters' },
      
      // ATS-Specific
      { id: 'no_keywords', check: (r) => extractKeywordDensity(r) < 0.02, severity: 'warning', message: 'Low keyword density' },
      { id: 'inconsistent_dates', check: (r) => hasDateGaps(r), severity: 'suggestion', message: 'Employment date gaps detected' },
    ];
    ```

- [ ] **Task 2: Create ATS Service** (AC: 1, 2, 3, 4, 5)
  - [ ] Create `backend/src/api/ats/ats.service.ts`
  - [ ] Implement `analyzeResume(resumeId, userId)`:

    ```typescript
    async analyzeResume(resumeId: string, userId: string) {
      const resume = await resumeService.findById(resumeId, userId);
      
      const issues = [];
      for (const rule of ATS_RULES) {
        if (rule.check(resume.sections)) {
          issues.push({
            id: rule.id,
            severity: rule.severity,
            message: rule.message,
            suggestion: rule.suggestion,
          });
        }
      }
      
      const score = calculateScore(issues);
      return { score, issues, passedCount, totalRules };
    }
    ```

- [ ] **Task 3: Implement Scoring Algorithm** (AC: 4)
  - [ ] Create scoring logic:

    ```typescript
    function calculateScore(issues) {
      let score = 100;
      for (const issue of issues) {
        if (issue.severity === 'critical') score -= 20;
        if (issue.severity === 'warning') score -= 10;
        if (issue.severity === 'suggestion') score -= 5;
      }
      return Math.max(0, score);
    }
    ```

- [ ] **Task 4: Create ATS API Endpoint** (AC: 1-5)
  - [ ] Create `backend/src/api/ats/ats.controller.ts`
  - [ ] `POST /api/resumes/:id/ats-check`:
    - Run analysis
    - Return score, issues, suggestions

- [ ] **Task 5: Create OpenAPI Documentation** (AC: all)
  - [ ] Create `backend/src/api/ats/ats.doc.ts`

- [ ] **Task 6: Frontend ATS Check UI** (AC: 1-5)
  - [ ] Create `frontend/src/components/ats/ATSCheckModal.jsx`
  - [ ] Display score with progress circle
  - [ ] List issues by severity (critical first)
  - [ ] Show suggestions inline
  - [ ] Add "Run ATS Check" button to editor

## Dev Notes

### ATS Rules Categories

| Category | Examples |
| -------- | -------- |
| Contact Info | Email, phone, location required |
| Content | Summary length, bullet point quality |
| Keywords | Skill keywords, action verbs |
| Formatting | Date consistency, section completeness |
| Length | Appropriate resume length for experience |

### Score Interpretation

| Score | Rating | Description |
| ----- | ------ | ----------- |
| 90-100 | Excellent | ATS-optimized |
| 70-89 | Good | Minor improvements needed |
| 50-69 | Fair | Several issues to address |
| 0-49 | Poor | Major improvements needed |

### File Structure

```text
backend/src/api/ats/
├── index.ts              # NEW: Router
├── ats-rules.ts          # NEW: Rule definitions
├── ats.service.ts        # NEW: Analysis service
├── ats.controller.ts     # NEW: HTTP handlers
└── ats.doc.ts            # NEW: OpenAPI docs

frontend/src/components/ats/
├── ATSCheckModal.jsx     # NEW: Results display
└── ATSScoreCircle.jsx    # NEW: Score visualization
```

### API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/resumes/:id/ats-check` | Run ATS analysis |

### Response Format

```json
{
  "score": 75,
  "rating": "Good",
  "issues": [
    {
      "id": "phone_missing",
      "severity": "warning",
      "message": "Phone number is missing",
      "suggestion": "Add a professional phone number to improve contact options"
    }
  ],
  "passedCount": 8,
  "totalRules": 10
}
```

### Testing Requirements

- [ ] Verify all rules are checked
- [ ] Verify score calculation
- [ ] Verify critical issues reduce score more
- [ ] Verify UI displays results correctly

### References

- [PRD - FR-20, FR-21](../planning-artifacts/prd.md) - ATS check, suggestions

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
