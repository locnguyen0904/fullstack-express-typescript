# Story 3.1: Credit Ledger & Balance System

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a System,
I want to track user credits transactionally,
so that balances are accurate.

## Acceptance Criteria

1. **Given** a `CreditService`, **When** `deductCredits` is called, **Then** it must run inside a MongoDB Transaction.
2. **And** if balance is insufficient, throw `InsufficientFundsError` and abort transaction.
3. **And** on success, `CreditLedger` should show the entry and `User.creditBalance` should update atomically.
4. **When** `addCredits` is called, **Then** it should also run in transaction and update balance.
5. **And** each credit transaction should be logged in CreditLedger with type, amount, balance after, and metadata.
6. **When** I call `GET /api/credits/balance`, **Then** I should see my current credit balance.
7. **When** I call `GET /api/credits/history`, **Then** I should see my credit transaction history.
8. **And** daily free credits should be granted on first action of the day (non-accumulating).

## Tasks / Subtasks

- [ ] **Task 1: Create CreditLedger Model** (AC: 3, 5)
  - [ ] Create `backend/src/api/credits/credit-ledger.model.ts`
  - [ ] Define `ICreditLedger` interface:

    ```typescript
    interface ICreditLedger {
      userId: ObjectId;
      type: 'purchase' | 'daily_grant' | 'ai_rewrite' | 'export' | 'refund';
      amount: number; // positive for credit, negative for debit
      balanceAfter: number;
      metadata?: {
        orderId?: string;
        resumeId?: string;
        description?: string;
      };
      createdAt: Date;
    }
    ```

  - [ ] Add indexes: `{ userId: 1, createdAt: -1 }`

- [ ] **Task 2: Add Credit Fields to User Model** (AC: 3, 4)
  - [ ] Update `backend/src/api/users/user.model.ts`
  - [ ] Add fields:

    ```typescript
    creditBalance: { type: Number, default: 0, min: 0 },
    lastDailyGrant: { type: Date, default: null },
    ```

  - [ ] Update `IUser` interface

- [ ] **Task 3: Create CreditService with Transactions** (AC: 1, 2, 3, 4, 5)
  - [ ] Create `backend/src/api/credits/credit.service.ts`
  - [ ] Implement `deductCredits(userId, amount, type, metadata)`:

    ```typescript
    async deductCredits(userId: string, amount: number, type: string, metadata?: object) {
      return mongooseService.withTransaction(async (session) => {
        const user = await User.findById(userId).session(session);
        if (!user || user.creditBalance < amount) {
          throw new InsufficientFundsError('Not enough credits');
        }
        user.creditBalance -= amount;
        await user.save({ session });
        await CreditLedger.create([{
          userId, type, amount: -amount,
          balanceAfter: user.creditBalance, metadata
        }], { session });
        return user.creditBalance;
      });
    }
    ```

  - [ ] Implement `addCredits(userId, amount, type, metadata)`
  - [ ] Implement `getBalance(userId)`
  - [ ] Implement `getHistory(userId, pagination)`

- [ ] **Task 4: Implement Daily Free Credits** (AC: 8)
  - [ ] Create configuration: `DAILY_FREE_CREDITS = 5` (env variable)
  - [ ] Implement `grantDailyCredits(userId)`:
    - Check if `lastDailyGrant` is today
    - If not today, grant credits and update `lastDailyGrant`
    - Non-accumulating: only grant if not already granted today
  - [ ] Call this on first credit-consuming action of the day

- [ ] **Task 5: Create Credit API Endpoints** (AC: 6, 7)
  - [ ] Create `backend/src/api/credits/credit.controller.ts`
  - [ ] `GET /api/credits/balance` - Get current balance
  - [ ] `GET /api/credits/history` - Get transaction history (paginated)
  - [ ] Create router and register in API

- [ ] **Task 6: Create Credit Validation Schemas** (AC: all)
  - [ ] Create `backend/src/api/credits/credit.validation.ts`
  - [ ] Pagination schema for history endpoint

- [ ] **Task 7: Create OpenAPI Documentation** (AC: all)
  - [ ] Create `backend/src/api/credits/credit.doc.ts`
  - [ ] Document all endpoints and schemas

- [ ] **Task 8: Create InsufficientFundsError** (AC: 2)
  - [ ] Add to `backend/src/core/response-error.core.ts`:

    ```typescript
    export class InsufficientFundsError extends AppError {
      constructor(message = 'Insufficient credits') {
        super(402, message); // 402 Payment Required
      }
    }
    ```

## Dev Notes

### Architecture Compliance

- **Transaction Management (CRITICAL from project-context.md):**
  - ALL operations modifying `CreditLedger` or `UserBalance` MUST run inside a Transaction
  - Pattern: `mongooseService.withTransaction(async (session) => { ... })`

- **Tenant Isolation:**
  - Users can only view/modify their own credit balance
  - Filter all queries by authenticated userId

### MongoDB Transaction Pattern

```typescript
// From mongoose.service.ts
async withTransaction<T>(fn: (session: ClientSession) => Promise<T>): Promise<T> {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### Credit Transaction Flow

```text
AI Rewrite Request
    │
    ▼
Check Daily Grant (grant if needed)
    │
    ▼
CreditService.deductCredits(userId, cost, 'ai_rewrite', { resumeId })
    │
    ├── Start Transaction
    ├── Lock User Document
    ├── Check Balance >= Cost
    ├── Update User.creditBalance
    ├── Create CreditLedger Entry
    ├── Commit Transaction
    └── Return New Balance
```

### File Structure

```text
backend/src/
├── api/credits/
│   ├── index.ts              # NEW: Router
│   ├── credit-ledger.model.ts # NEW: Ledger model
│   ├── credit.service.ts     # NEW: Credit operations
│   ├── credit.controller.ts  # NEW: HTTP handlers
│   ├── credit.validation.ts  # NEW: Zod schemas
│   └── credit.doc.ts         # NEW: OpenAPI docs
├── api/users/
│   └── user.model.ts         # MODIFY: Add credit fields
├── core/
│   └── response-error.core.ts # MODIFY: Add InsufficientFundsError
└── services/
    └── mongoose.service.ts   # VERIFY: Transaction support exists
```

### API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/credits/balance` | Get current credit balance |
| GET | `/api/credits/history` | Get transaction history |

### Testing Requirements

- [ ] Verify transaction rollback on insufficient funds
- [ ] Verify balance updates atomically
- [ ] Verify ledger entries are created
- [ ] Verify daily grant works correctly
- [ ] Verify daily grant doesn't accumulate
- [ ] Verify history pagination

### Previous Story Context

**Dependencies:**

- Story 1.5 (User Deletion) - May introduce BullMQ (check for QueueService)

**From project-context.md:**

- MongoDB 7.0+ with Replica Set for Transactions
- Transaction pattern established

### References

- [PRD - FR-17, FR-18, FR-19](../planning-artifacts/prd.md) - Credit deduction, balance view, daily grants
- [Project Context](../../project-context.md#2-transaction-management-backend) - Transaction pattern

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
