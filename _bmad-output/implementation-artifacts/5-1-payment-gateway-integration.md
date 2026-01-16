# Story 5.1: Payment Gateway Integration

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to buy a credit pack,
so that I can use more AI features.

## Acceptance Criteria

1. **Given** a selected Credit Pack, **When** I click "Buy", **Then** the system should create a Payment Session and return checkout URL.
2. **When** payment completes (Webhook), **Then** the backend should verify signature and invoke `CreditService.addCredits`.
3. **And** the payment should be idempotent (same webhook received twice doesn't double credits).
4. **And** if payment fails or is cancelled, no credits should be added.
5. **And** payment records should be stored for audit purposes.

## Tasks / Subtasks

- [ ] **Task 1: Setup Stripe Integration** (AC: 1)
  - [ ] Install `stripe` package
  - [ ] Create `backend/src/config/stripe.config.ts`
  - [ ] Add environment variables:

    ```bash
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    STRIPE_SUCCESS_URL=http://localhost:3001/credits/success
    STRIPE_CANCEL_URL=http://localhost:3001/credits/cancel
    ```

- [ ] **Task 2: Create CreditPack Model** (AC: 1)
  - [ ] Create `backend/src/api/credit-packs/credit-pack.model.ts`
  - [ ] Define `ICreditPack` interface:

    ```typescript
    interface ICreditPack {
      name: string;
      credits: number;
      price: number; // In cents
      currency: string;
      stripePriceId: string;
      isActive: boolean;
      displayOrder: number;
    }
    ```

- [ ] **Task 3: Create Payment/Order Model** (AC: 5)
  - [ ] Create `backend/src/api/payments/payment.model.ts`
  - [ ] Define `IPayment` interface:

    ```typescript
    interface IPayment {
      userId: ObjectId;
      creditPackId: ObjectId;
      stripeSessionId: string;
      stripePaymentIntentId?: string;
      amount: number;
      credits: number;
      status: 'pending' | 'completed' | 'failed' | 'refunded';
      createdAt: Date;
      completedAt?: Date;
    }
    ```

  - [ ] Add indexes: `{ stripeSessionId: 1 }` (unique), `{ userId: 1 }`

- [ ] **Task 4: Create Payment Service** (AC: 1, 2, 3, 4)
  - [ ] Create `backend/src/api/payments/payment.service.ts`
  - [ ] Implement `createCheckoutSession(userId, creditPackId)`:

    ```typescript
    async createCheckoutSession(userId: string, creditPackId: string) {
      const pack = await CreditPack.findById(creditPackId);
      
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price: pack.stripePriceId,
          quantity: 1,
        }],
        metadata: { userId, creditPackId },
        success_url: STRIPE_SUCCESS_URL,
        cancel_url: STRIPE_CANCEL_URL,
      });
      
      // Create pending payment record
      await Payment.create({
        userId, creditPackId, stripeSessionId: session.id,
        amount: pack.price, credits: pack.credits, status: 'pending',
      });
      
      return session.url;
    }
    ```

  - [ ] Implement `handleWebhook(event)`:
    - Verify signature
    - Find pending payment by sessionId
    - If already completed, return (idempotent)
    - Update payment status
    - Add credits via CreditService

- [ ] **Task 5: Create Payment API Endpoints** (AC: 1)
  - [ ] Create `backend/src/api/payments/payment.controller.ts`
  - [ ] `POST /api/payments/checkout` - Create checkout session
  - [ ] `POST /api/webhooks/stripe` - Handle webhook (raw body)
  - [ ] `GET /api/payments/history` - User's payment history

- [ ] **Task 6: Create Credit Pack API** (AC: 1)
  - [ ] Create `backend/src/api/credit-packs/credit-pack.controller.ts`
  - [ ] `GET /api/credit-packs` - List active packs (public)

- [ ] **Task 7: Configure Webhook Endpoint** (AC: 2, 3)
  - [ ] Create raw body parser for webhook route:

    ```typescript
    app.post('/api/webhooks/stripe', 
      express.raw({ type: 'application/json' }),
      webhookController.handleStripe
    );
    ```

  - [ ] Verify Stripe signature
  - [ ] Handle `checkout.session.completed` event

- [ ] **Task 8: Frontend Pricing Page** (AC: 1)
  - [ ] Create `frontend/src/pages/credits/PricingPage.jsx`
  - [ ] Display credit packs from API
  - [ ] Add "Buy" button that redirects to Stripe Checkout

## Dev Notes

### Architecture Compliance

- **Idempotent Webhook Handling:**
  - Check if payment already completed before adding credits
  - Use `stripeSessionId` as idempotency key

- **Audit Trail:**
  - All payments stored in Payment model
  - Payment records retained even for failed/cancelled

### Payment Flow

```text
User clicks "Buy 50 Credits"
    │
    ├── POST /api/payments/checkout { creditPackId }
    │   ├── Create Stripe Checkout Session
    │   ├── Create Payment record (status=pending)
    │   └── Return checkout URL
    │
    ├── Redirect to Stripe Checkout
    │
    ├── User completes payment
    │
    ├── Stripe sends webhook
    │   ├── POST /api/webhooks/stripe
    │   ├── Verify signature
    │   ├── Find Payment by sessionId
    │   ├── If already completed → return (idempotent)
    │   ├── Update Payment status=completed
    │   └── CreditService.addCredits(userId, credits)
    │
    └── User lands on success page
```

### File Structure

```text
backend/src/
├── config/
│   └── stripe.config.ts      # NEW: Stripe configuration
├── api/credit-packs/
│   ├── index.ts              # NEW
│   ├── credit-pack.model.ts  # NEW
│   └── credit-pack.controller.ts # NEW
├── api/payments/
│   ├── index.ts              # NEW
│   ├── payment.model.ts      # NEW
│   ├── payment.service.ts    # NEW
│   └── payment.controller.ts # NEW
```

### API Endpoints

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| GET | `/api/credit-packs` | ❌ | List credit packs |
| POST | `/api/payments/checkout` | ✅ | Create checkout |
| POST | `/api/webhooks/stripe` | ❌ (verified) | Handle webhook |
| GET | `/api/payments/history` | ✅ | Payment history |

### Stripe Test Cards

| Card Number | Result |
| ----------- | ------ |
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |

### Testing Requirements

- [ ] Verify checkout session is created
- [ ] Verify webhook adds credits on success
- [ ] Verify idempotent (no double credits)
- [ ] Verify failed payment doesn't add credits
- [ ] Verify payment history is recorded

### Previous Story Context

**Dependencies:**

- Story 3.1 (Credits) - CreditService.addCredits

### References

- [PRD - FR-30, FR-31, FR-32, FR-33](../planning-artifacts/prd.md) - Pricing, purchase, credit grant
- [Story 3.1](./3-1-credit-ledger-balance-system.md) - Credit service
- [Stripe Docs](https://stripe.com/docs/checkout)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
