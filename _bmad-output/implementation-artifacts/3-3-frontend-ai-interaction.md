# Story 3.3: Frontend AI Interaction

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to click a "Rewrite" button next to a text field,
so that I can get suggestions inline.

## Acceptance Criteria

1. **Given** a text area in the editor, **When** I click "Magic Rewrite" button, **Then** a loading spinner should appear.
2. **And** on success, the text area should update with the AI-generated content.
3. **And** if credits are low (balance < cost), a "Top-up Credits" modal should appear.
4. **And** I should see my current credit balance in the editor header.
5. **And** after each AI action, the credit balance should update in real-time.
6. **And** I should be able to select a tone (Professional, Friendly, Concise) before rewriting.

## Tasks / Subtasks

- [ ] **Task 1: Create AI Rewrite Button Component** (AC: 1, 2, 6)
  - [ ] Create `frontend/src/components/ai/RewriteButton.jsx`
  - [ ] Props: `text`, `onRewrite`, `disabled`
  - [ ] Show magic wand icon with tooltip
  - [ ] Show loading spinner during API call
  - [ ] Add tone selector dropdown

- [ ] **Task 2: Create Credit Balance Display** (AC: 4, 5)
  - [ ] Create `frontend/src/components/credits/CreditBalance.jsx`
  - [ ] Fetch balance on mount
  - [ ] Display current balance with icon
  - [ ] Add to editor header
  - [ ] Update after successful AI actions

- [ ] **Task 3: Create Credit Context Provider** (AC: 4, 5)
  - [ ] Create `frontend/src/context/CreditContext.jsx`
  - [ ] Provide balance state and refresh function
  - [ ] Wrap app with provider

    ```javascript
    const CreditContext = createContext();
    
    export function CreditProvider({ children }) {
      const [balance, setBalance] = useState(0);
      const refreshBalance = async () => { ... };
      return (
        <CreditContext.Provider value={{ balance, refreshBalance }}>
          {children}
        </CreditContext.Provider>
      );
    }
    ```

- [ ] **Task 4: Create Top-up Credits Modal** (AC: 3)
  - [ ] Create `frontend/src/components/credits/TopUpModal.jsx`
  - [ ] Display when balance is insufficient
  - [ ] Show credit pack options (from API)
  - [ ] Link to purchase flow (Epic 5)
  - [ ] Allow dismissal

- [ ] **Task 5: Create AI API Client** (AC: 1, 2)
  - [ ] Update `frontend/src/api/ai.js`:

    ```javascript
    export const aiApi = {
      rewrite: async (text, tone = 'professional') => {
        const response = await fetch('/api/ai/rewrite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await tokenProvider.getToken()}`,
          },
          body: JSON.stringify({ text, tone }),
        });
        
        if (response.status === 402) {
          throw new InsufficientCreditsError();
        }
        
        return response.json();
      },
    };
    ```

- [ ] **Task 6: Create useAIRewrite Hook** (AC: 1, 2, 3, 5)
  - [ ] Create `frontend/src/hooks/useAIRewrite.js`:

    ```javascript
    function useAIRewrite() {
      const [isLoading, setIsLoading] = useState(false);
      const [showTopUp, setShowTopUp] = useState(false);
      const { refreshBalance } = useCreditContext();
      
      const rewrite = async (text, tone) => {
        setIsLoading(true);
        try {
          const result = await aiApi.rewrite(text, tone);
          await refreshBalance();
          return result.rewrittenText;
        } catch (error) {
          if (error instanceof InsufficientCreditsError) {
            setShowTopUp(true);
          }
          throw error;
        } finally {
          setIsLoading(false);
        }
      };
      
      return { rewrite, isLoading, showTopUp, setShowTopUp };
    }
    ```

- [ ] **Task 7: Integrate AI Button with Experience Section** (AC: 1, 2, 6)
  - [ ] Update `ExperienceSection.jsx`
  - [ ] Add RewriteButton next to each bullet point textarea
  - [ ] On rewrite success, update the bullet content
  - [ ] Show toast notification on success/error

- [ ] **Task 8: Add Credits API Client** (AC: 4)
  - [ ] Create `frontend/src/api/credits.js`:

    ```javascript
    export const creditsApi = {
      getBalance: () => fetch('/api/credits/balance', { ... }),
      getHistory: (page = 1) => fetch(`/api/credits/history?page=${page}`, { ... }),
    };
    ```

## Dev Notes

### Architecture Compliance

- **Frontend Architecture:**
  - Use React Context for global credit state
  - Use custom hooks for AI interaction logic
  - Keep components focused and reusable

### AI Rewrite UX Flow

```text
User clicks "Rewrite" button
    │
    ├── Show loading spinner
    ├── Disable button
    │
    ▼
Call AI API
    │
    ├── Success
    │   ├── Update text field
    │   ├── Refresh credit balance
    │   └── Show success toast
    │
    └── Failure
        ├── 402: Show Top-up Modal
        ├── 429: Show "Rate limited" message
        └── 500: Show "AI error" message
```

### File Structure

```text
frontend/src/
├── api/
│   ├── ai.js                 # NEW: AI API client
│   └── credits.js            # NEW: Credits API client
├── context/
│   └── CreditContext.jsx     # NEW: Credit state provider
├── hooks/
│   └── useAIRewrite.js       # NEW: AI rewrite hook
├── components/
│   ├── ai/
│   │   └── RewriteButton.jsx # NEW: AI rewrite button
│   └── credits/
│       ├── CreditBalance.jsx # NEW: Balance display
│       └── TopUpModal.jsx    # NEW: Top-up modal
├── pages/editor/sections/
│   └── ExperienceSection.jsx # MODIFY: Add AI button
```

### Component Design

**RewriteButton:**

```text
┌─────────────────────────────────┐
│ [Bullet text area]              │
│                                 │
│ [Tone: Professional ▾] [✨ Rewrite] │
└─────────────────────────────────┘
```

**CreditBalance (Header):**

```text
┌──────────────────────────────────────────┐
│ My Resume             💎 15 credits      │
└──────────────────────────────────────────┘
```

### Testing Requirements

- [ ] Verify loading state shows during API call
- [ ] Verify text updates on successful rewrite
- [ ] Verify top-up modal shows on 402
- [ ] Verify credit balance updates after rewrite
- [ ] Verify tone selector works
- [ ] Verify error messages display correctly

### Previous Story Context

**Dependencies:**

- Story 3.2 (AI Service) - Backend AI endpoint
- Story 3.1 (Credits) - Credit balance API
- Story 2.3 (Editor) - Section form components

### References

- [PRD - FR-15, FR-16, FR-18](../planning-artifacts/prd.md) - AI rewrite, tone, balance view
- [Story 3.2](./3-2-ai-service-integration.md) - Backend AI API
- [Story 2.3](./2-3-frontend-editor-ui-state.md) - Editor components

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
