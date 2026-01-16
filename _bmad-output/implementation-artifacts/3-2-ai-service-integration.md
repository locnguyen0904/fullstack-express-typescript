# Story 3.2: AI Service Integration

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to rewrite a bullet point using AI,
so that it sounds more professional.

## Acceptance Criteria

1. **Given** a text input, **When** I call `POST /api/ai/rewrite`, **Then** the backend should call OpenAI API with a "Professional" tone prompt.
2. **And** on success, deduct credits atomically AFTER successful AI response.
3. **And** on AI error, NO credits should be deducted.
4. **And** the response should include the rewritten text.
5. **When** I select a different tone (e.g., "Friendly"), **Then** the AI prompt should adapt accordingly.
6. **And** if insufficient credits, return 402 error before calling AI.
7. **And** AI rewrite latency should be p95 ≤ 5s (NFR-02).

## Tasks / Subtasks

- [ ] **Task 1: Configure OpenAI Integration** (AC: 1)
  - [ ] Install `openai` package
  - [ ] Create `backend/src/config/openai.config.ts`
  - [ ] Add environment variables:

    ```bash
    OPENAI_API_KEY=sk-...
    OPENAI_MODEL=gpt-4o-mini  # Cost-effective model
    AI_REWRITE_CREDIT_COST=1
    ```

- [ ] **Task 2: Create AI Service** (AC: 1, 4, 5, 7)
  - [ ] Create `backend/src/api/ai/ai.service.ts`
  - [ ] Implement `rewriteText(text: string, tone: string)`:

    ```typescript
    async rewriteText(text: string, tone: 'professional' | 'friendly' | 'concise') {
      const prompt = this.buildPrompt(text, tone);
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        timeout: 10000, // 10s timeout
      });
      return response.choices[0].message.content;
    }
    ```

  - [ ] Create tone-specific prompts
  - [ ] Add timeout handling
  - [ ] Add retry logic (1 retry on transient failure)

- [ ] **Task 3: Create Rewrite API Endpoint** (AC: 1-6)
  - [ ] Create `backend/src/api/ai/ai.controller.ts`
  - [ ] Implement `POST /api/ai/rewrite`:

    ```typescript
    async rewrite(req, res) {
      const { text, tone = 'professional' } = req.body;
      const userId = req.user.id;
      
      // 1. Check/grant daily credits
      await creditService.grantDailyCreditsIfNeeded(userId);
      
      // 2. Check balance BEFORE calling AI
      const balance = await creditService.getBalance(userId);
      if (balance < AI_REWRITE_CREDIT_COST) {
        throw new InsufficientFundsError();
      }
      
      // 3. Call AI service
      const rewrittenText = await aiService.rewriteText(text, tone);
      
      // 4. Deduct credits AFTER success
      await creditService.deductCredits(userId, AI_REWRITE_CREDIT_COST, 'ai_rewrite', {
        originalLength: text.length,
        rewrittenLength: rewrittenText.length,
      });
      
      return { rewrittenText, creditsRemaining: balance - AI_REWRITE_CREDIT_COST };
    }
    ```

  - [ ] Apply rate limiting (prevent abuse)

- [ ] **Task 4: Create AI Validation Schemas** (AC: 1, 5)
  - [ ] Create `backend/src/api/ai/ai.validation.ts`
  - [ ] Define `rewriteSchema`:

    ```typescript
    z.object({
      text: z.string().min(10).max(2000),
      tone: z.enum(['professional', 'friendly', 'concise']).default('professional'),
    })
    ```

- [ ] **Task 5: Create AI Prompt Templates** (AC: 1, 5)
  - [ ] Create `backend/src/api/ai/prompts.ts`
  - [ ] Define tone-specific prompts:

    ```typescript
    const PROMPTS = {
      professional: `Rewrite the following resume bullet point to sound more professional and impactful. Use action verbs and quantify achievements where possible:\n\n`,
      friendly: `Rewrite the following text in a friendly, approachable tone while maintaining professionalism:\n\n`,
      concise: `Rewrite the following text to be more concise and impactful, removing unnecessary words:\n\n`,
    };
    ```

- [ ] **Task 6: Create OpenAPI Documentation** (AC: all)
  - [ ] Create `backend/src/api/ai/ai.doc.ts`
  - [ ] Document rewrite endpoint
  - [ ] Document error responses (400, 402, 500)

- [ ] **Task 7: Register AI Routes** (AC: all)
  - [ ] Create `backend/src/api/ai/index.ts`
  - [ ] Apply AuthMiddleware
  - [ ] Apply rate limiting middleware
  - [ ] Register in main API router

## Dev Notes

### Architecture Compliance

- **Credit Deduction Order (CRITICAL):**
  1. Check balance BEFORE calling external API
  2. Call external API
  3. Deduct credits ONLY on success
  - This prevents charging users for failed requests

- **NFR-02 Performance:**
  - AI rewrite p95 ≤ 5s
  - Use timeout on OpenAI calls
  - Consider streaming for long responses

### AI Call Flow

```text
POST /api/ai/rewrite
    │
    ├── Validate Input (Zod)
    ├── Grant Daily Credits (if needed)
    ├── Check Balance >= Cost (pre-flight)
    │       │
    │       └── If insufficient → 402 InsufficientFundsError
    │
    ├── Call OpenAI API
    │       │
    │       ├── Success → Continue
    │       └── Error → Return 500, NO credit deduction
    │
    ├── Deduct Credits (transaction)
    │
    └── Return { rewrittenText, creditsRemaining }
```

### Rate Limiting

Apply rate limiting to prevent API abuse:

```typescript
// Per user: 10 requests per minute
app.use('/api/ai', rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user.id,
}));
```

### File Structure

```text
backend/src/
├── config/
│   └── openai.config.ts      # NEW: OpenAI configuration
├── api/ai/
│   ├── index.ts              # NEW: Router
│   ├── ai.service.ts         # NEW: AI operations
│   ├── ai.controller.ts      # NEW: HTTP handlers
│   ├── ai.validation.ts      # NEW: Zod schemas
│   ├── ai.doc.ts             # NEW: OpenAPI docs
│   └── prompts.ts            # NEW: Prompt templates
```

### API Endpoints

| Method | Endpoint | Description | Credits |
| ------ | -------- | ----------- | ------- |
| POST | `/api/ai/rewrite` | Rewrite text with AI | 1 credit |

### Error Responses

| Status | Error | Description |
| ------ | ----- | ----------- |
| 400 | ValidationError | Invalid input |
| 401 | Unauthorized | Not authenticated |
| 402 | InsufficientFundsError | Not enough credits |
| 429 | TooManyRequests | Rate limit exceeded |
| 500 | AIServiceError | OpenAI API failure |

### Testing Requirements

- [ ] Verify successful rewrite with professional tone
- [ ] Verify different tones produce different outputs
- [ ] Verify credits are deducted on success
- [ ] Verify credits NOT deducted on AI failure
- [ ] Verify 402 returned when insufficient credits
- [ ] Verify rate limiting works

### Previous Story Context

**Dependencies:**

- Story 3.1 (Credit System) - CreditService must exist

### References

- [PRD - FR-15, FR-16, NFR-02](../planning-artifacts/prd.md) - AI rewrite, tone selection, 5s latency
- [Story 3.1](./3-1-credit-ledger-balance-system.md) - Credit deduction service
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
