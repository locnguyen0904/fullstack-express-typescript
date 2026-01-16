# Story 6.2: Credit Pack Management

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an Admin,
I want to configure credit packages,
so that I can change pricing without code deploys.

## Acceptance Criteria

1. **Given** the Admin resource "Credit Packs", **When** I create/edit a pack, **Then** the changes should reflect in the DB.
2. **And** the User Pricing Page should fetch the active packs.
3. **And** I should be able to activate/deactivate packs.
4. **And** changes should be visible immediately without restart.
5. **And** I should be able to set display order for packs.

## Tasks / Subtasks

- [ ] **Task 1: Create Credit Pack Admin Endpoints** (AC: 1, 3, 5)
  - [ ] Create `backend/src/api/admin/credit-packs.controller.ts`
  - [ ] `GET /api/admin/credit-packs` - List all packs
  - [ ] `POST /api/admin/credit-packs` - Create pack
  - [ ] `PUT /api/admin/credit-packs/:id` - Update pack
  - [ ] `DELETE /api/admin/credit-packs/:id` - Soft delete pack

- [ ] **Task 2: Create Credit Pack Admin UI** (AC: 1, 3, 5)
  - [ ] Create `frontend/src/pages/admin/credit-packs/`:
    - `CreditPackList.jsx` - Datagrid with packs
    - `CreditPackCreate.jsx` - Create form
    - `CreditPackEdit.jsx` - Edit form
  - [ ] Fields: name, credits, price, currency, isActive, displayOrder

- [ ] **Task 3: Add Stripe Price ID Management** (AC: 1)
  - [ ] Add `stripePriceId` field to form
  - [ ] Validate Stripe Price ID format
  - [ ] Document that admin must create price in Stripe first

- [ ] **Task 4: Update Public Credit Packs API** (AC: 2, 4)
  - [ ] Ensure `GET /api/credit-packs` returns only active packs
  - [ ] Order by `displayOrder` ascending
  - [ ] No caching (changes visible immediately)

- [ ] **Task 5: Create Credit Pack Validation** (AC: 1)
  - [ ] Create validation schema:

    ```typescript
    z.object({
      name: z.string().min(1).max(50),
      credits: z.number().min(1),
      price: z.number().min(100), // Min $1.00
      currency: z.enum(['usd', 'vnd']),
      stripePriceId: z.string().regex(/^price_/),
      isActive: z.boolean().default(true),
      displayOrder: z.number().default(0),
    })
    ```

- [ ] **Task 6: Seed Default Credit Packs** (AC: 2)
  - [ ] Create seed script for initial packs:

    ```typescript
    const DEFAULT_PACKS = [
      { name: 'Starter', credits: 10, price: 499, displayOrder: 1 },
      { name: 'Pro', credits: 50, price: 1999, displayOrder: 2 },
      { name: 'Enterprise', credits: 200, price: 4999, displayOrder: 3 },
    ];
    ```

- [ ] **Task 7: Add Reorder Functionality** (AC: 5)
  - [ ] Add drag-and-drop reordering in admin UI
  - [ ] Or use displayOrder input field

## Dev Notes

### Architecture Compliance

- **Admin-Only:** All CRUD operations require admin role
- **Immediate Updates:** No caching on public endpoint

### Credit Pack Lifecycle

```text
Admin creates pack in Stripe → Gets stripePriceId
    │
    ▼
Admin creates pack in CVCraft Admin
    │
    ├── name: "Pro Pack"
    ├── credits: 50
    ├── price: 1999 (cents)
    ├── stripePriceId: "price_xxx"
    └── isActive: true
    │
    ▼
User sees pack on Pricing Page
    │
    ▼
User purchases → Stripe Checkout uses stripePriceId
```

### File Structure

```text
backend/src/api/admin/
└── credit-packs.controller.ts  # NEW

frontend/src/pages/admin/credit-packs/
├── CreditPackList.jsx          # NEW
├── CreditPackCreate.jsx        # NEW
└── CreditPackEdit.jsx          # NEW
```

### API Endpoints

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| GET | `/api/admin/credit-packs` | Admin | List all packs |
| POST | `/api/admin/credit-packs` | Admin | Create pack |
| PUT | `/api/admin/credit-packs/:id` | Admin | Update pack |
| DELETE | `/api/admin/credit-packs/:id` | Admin | Delete pack |
| GET | `/api/credit-packs` | Public | Active packs |

### Testing Requirements

- [ ] Verify pack creation
- [ ] Verify pack updates reflect immediately
- [ ] Verify only active packs shown publicly
- [ ] Verify displayOrder sorting works

### Previous Story Context

**Dependencies:**

- Story 5.1 (Payments) - CreditPack model exists
- Story 6.1 (Admin Dashboard) - Admin middleware exists

### References

- [PRD - FR-39, FR-40](../planning-artifacts/prd.md) - Credit pack management
- [Story 5.1](./5-1-payment-gateway-integration.md) - CreditPack model
- [Story 6.1](./6-1-admin-dashboard-implementation.md) - Admin infrastructure

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
