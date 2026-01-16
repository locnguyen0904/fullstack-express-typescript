# Story 6.1: Admin Dashboard Implementation

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an Admin,
I want to see key metrics,
so that I know the system health.

## Acceptance Criteria

1. **Given** the Admin Route (`/admin`), **When** accessed by `role: admin`, **Then** the React Admin dashboard should load.
2. **And** if accessed by non-admin, redirect to unauthorized page.
3. **And** show dashboard cards for "Total Users", "Total Resumes", "Revenue".
4. **And** show charts for user growth and revenue trends.
5. **And** allow viewing user list and resume list.

## Tasks / Subtasks

- [ ] **Task 1: Create Admin Guard Middleware** (AC: 1, 2)
  - [ ] Create `backend/src/middlewares/admin.middleware.ts`
  - [ ] Check `req.user.role === 'admin'`
  - [ ] Return 403 if not admin

- [ ] **Task 2: Create Admin Stats API** (AC: 3, 4)
  - [ ] Create `backend/src/api/admin/admin.controller.ts`
  - [ ] `GET /api/admin/stats`:

    ```typescript
    {
      totalUsers: await User.countDocuments({ status: 'active' }),
      totalResumes: await Resume.countDocuments({ status: 'active' }),
      totalRevenue: await Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      userGrowth: [...], // Last 30 days
      revenueByDay: [...], // Last 30 days
    }
    ```

- [ ] **Task 3: Create User Management Endpoints** (AC: 5)
  - [ ] `GET /api/admin/users` - List all users (paginated)
  - [ ] `GET /api/admin/users/:id` - Get user details
  - [ ] `PATCH /api/admin/users/:id` - Update user status/role

- [ ] **Task 4: Create Resume Management Endpoints** (AC: 5)
  - [ ] `GET /api/admin/resumes` - List all resumes (paginated)
  - [ ] `GET /api/admin/resumes/:id` - Get resume details

- [ ] **Task 5: Configure React Admin Dashboard** (AC: 1, 3)
  - [ ] Update `frontend/src/App.jsx` for admin routes
  - [ ] Create custom Dashboard component:

    ```jsx
    const Dashboard = () => (
      <>
        <Card title="Total Users">{stats.totalUsers}</Card>
        <Card title="Total Resumes">{stats.totalResumes}</Card>
        <Card title="Revenue">${stats.totalRevenue/100}</Card>
      </>
    );
    ```

- [ ] **Task 6: Create Admin Resources** (AC: 5)
  - [ ] Create `frontend/src/pages/admin/users/`:
    - `UserList.jsx` - Datagrid with users
    - `UserEdit.jsx` - Edit user form
  - [ ] Create `frontend/src/pages/admin/resumes/`:
    - `ResumeList.jsx` - Datagrid with resumes
    - `ResumeShow.jsx` - View resume details

- [ ] **Task 7: Add Charts for Trends** (AC: 4)
  - [ ] Install charting library (recharts or chart.js)
  - [ ] Create `UserGrowthChart.jsx`
  - [ ] Create `RevenueChart.jsx`
  - [ ] Display last 30 days trends

- [ ] **Task 8: Register Admin Routes** (AC: all)
  - [ ] Create `backend/src/api/admin/index.ts`
  - [ ] Apply AuthMiddleware + AdminMiddleware
  - [ ] Register in main API router

## Dev Notes

### Architecture Compliance

- **Authorization:** All admin routes require `role: admin`
- **Tenant Isolation:** Admin can view ANY user/resume (no owner filter)

### Admin Route Structure

```text
/api/admin/stats        - Dashboard metrics
/api/admin/users        - User CRUD
/api/admin/resumes      - Resume listing
/api/admin/credit-packs - Credit pack management (Story 6.2)
```

### File Structure

```text
backend/src/
├── middlewares/
│   └── admin.middleware.ts   # NEW
├── api/admin/
│   ├── index.ts              # NEW: Router
│   ├── admin.controller.ts   # NEW: Stats, metrics
│   ├── users.controller.ts   # NEW: User management
│   └── resumes.controller.ts # NEW: Resume management

frontend/src/pages/admin/
├── Dashboard.jsx             # NEW: Main dashboard
├── users/
│   ├── UserList.jsx
│   └── UserEdit.jsx
└── resumes/
    ├── ResumeList.jsx
    └── ResumeShow.jsx
```

### API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/admin/stats` | Dashboard metrics |
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/users/:id` | Get user |
| PATCH | `/api/admin/users/:id` | Update user |
| GET | `/api/admin/resumes` | List resumes |
| GET | `/api/admin/resumes/:id` | Get resume |

### Testing Requirements

- [ ] Verify admin can access dashboard
- [ ] Verify non-admin gets 403
- [ ] Verify stats are accurate
- [ ] Verify user/resume lists work

### References

- [PRD - FR-37, FR-38](../planning-artifacts/prd.md) - Admin dashboard, metrics
- [React Admin Docs](https://marmelab.com/react-admin/)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
