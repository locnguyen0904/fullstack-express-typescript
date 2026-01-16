---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
---

# backend-template - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for backend-template, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-01: Visitor can access a limited trial experience without creating an account (trial limits defined by product policy).
FR-02: Visitor can create an account and log in using a managed authentication provider.
FR-03: Registered user can complete onboarding by selecting a profile type (e.g., Student, Professional) to tailor defaults and guidance.
FR-04: Registered user can log out and revoke active sessions.
FR-05: Registered user can create, rename, and delete resume drafts.
FR-06: Registered user can edit resume content using a structured, section-based editor.
FR-07: Registered user can add, remove, and reorder resume sections.
FR-08: Registered user can see a live preview of the resume while editing.
FR-09: Registered user can use a mobile-friendly editing mode with an explicit switch between edit and preview.
FR-10: Registered user can select a template for a resume.
FR-11: Registered user can switch templates for an existing resume while preserving content.
FR-12: System can provide at least two templates in MVP scope.
FR-13: System can automatically save resume edits without requiring manual save (with a defined debounce window).
FR-14: Registered user can recover the latest saved state after refresh/reload.
FR-15: Registered user can request an AI rewrite for a selected section or bullet point.
FR-16: Registered user can select a rewrite tone (e.g., Professional, Friendly) for AI rewrite requests.
FR-17: System can deduct credits only when an AI rewrite request completes successfully.
FR-18: Registered user can see current credit balance and recent credit consumption.
FR-19: System can grant a daily free credit allowance to Free users that resets daily and does not accumulate.
FR-20: Registered user can run an ATS readiness check on a resume.
FR-21: System can highlight ATS risks and suggestions (e.g., missing sections, overly long bullets, missing keywords, inconsistent headings).
FR-22: Registered user can provide a target role description and receive suggested keywords to incorporate.
FR-23: System can ensure exported PDFs follow ATS-friendly formatting constraints (e.g., selectable text, consistent headings, avoid content loss).
FR-24: Registered user can export a resume as a standard PDF (A4).
FR-25: System can apply watermarking rules to exports based on the user’s entitlement tier.
FR-26: Paid user can export a watermark-free PDF when they meet paid export entitlement rules (including any required credit deduction policy).
FR-27: Registered user can generate a public, view-only share link for a resume.
FR-28: Public viewer can open a share link and view the resume content without authentication.
FR-29: System can restrict share links to read-only access (no editing).
FR-30: Registered user can view available credit packs and prices on a pricing page.
FR-31: Registered user can purchase credits through a payment gateway checkout flow.
FR-32: System can grant purchased credits after confirmed payment completion.
FR-33: System can prevent paid entitlements from being granted when payment is incomplete, failed, or reversed.
FR-34: Admin can view a dashboard showing user count, resume count, and revenue proxy metrics.
FR-35: Admin can view AI usage metrics sufficient to monitor operational cost drivers.
FR-36: Admin can create, update, enable/disable, and reorder credit pack offerings and prices.
FR-37: System can publish pricing changes so the pricing page reflects current configuration.

### NonFunctional Requirements

NFR-01 (Live preview): p95 preview update latency ≤ 100ms
NFR-02 (AI rewrite): p95 AI rewrite completion time ≤ 5s
NFR-03 (PDF export): p95 export completion time ≤ 10s
NFR-04 (API availability): ≥ 99.5% monthly uptime for core API routes
NFR-05 (Export success): ≥ 99% successful export jobs
NFR-06 (Graceful degradation): AI downtime does not block non-AI editing and export
NFR-07 (Data isolation): Users can access only their own resumes and credit balances
NFR-08 (Sensitive data handling): Resume data is encrypted in transit and protected at rest per platform standards
NFR-09 (Deletion): Users can request account deletion and have personal data removed within 30 days
NFR-10 (Observability): Core user flows emit structured logs and metrics

### Additional Requirements

- **Starter Template:** Project initialized using existing custom boilerplate (Node.js/Express + React/Vite/React Admin).
- **Authentication:** Use Firebase Auth for client-side login and "Direct Firebase Token Verification" on backend (No internal JWT minting).
- **Worker Infrastructure:** Implement separate worker process with BullMQ + Redis for async tasks (Exports).
- **Frontend Architecture:** Single SPA Monolith with Route Splitting (`/admin/*` vs `/app/*`) sharing `auth-provider`.
- **Database:** MongoDB 7.0+ with Replica Set for Transactions (Credits).
- **Tenant Isolation:** Enforce `ownerUserId` filtering in Service Layer.
- **Job Queue:** Redis persistence required (AOF/RDB).

### FR Coverage Map

- FR-01: Epic 1 - Trial access
- FR-02: Epic 1 - Account creation & login
- FR-03: Epic 1 - Onboarding profile
- FR-04: Epic 1 - Logout & session revocation
- FR-05: Epic 2 - Create/Rename/Delete drafts
- FR-06: Epic 2 - Content editing
- FR-07: Epic 2 - Section management
- FR-08: Epic 2 - Live preview
- FR-09: Epic 2 - Mobile editing
- FR-10: Epic 2 - Template selection
- FR-11: Epic 2 - Template switching
- FR-12: Epic 2 - MVP templates
- FR-13: Epic 2 - Auto-save
- FR-14: Epic 2 - State recovery
- FR-15: Epic 3 - AI rewrite request
- FR-16: Epic 3 - Tone selection
- FR-17: Epic 3 - Credit deduction
- FR-18: Epic 3 - Credit balance view
- FR-19: Epic 3 - Daily free credits
- FR-20: Epic 5 - ATS check
- FR-21: Epic 5 - ATS suggestions
- FR-22: Epic 5 - Keyword targeting
- FR-23: Epic 4 - ATS-friendly export format
- FR-24: Epic 4 - PDF Export
- FR-25: Epic 4 - Watermarking
- FR-26: Epic 4 - Paid export entitlement
- FR-27: Epic 4 - Share link generation
- FR-28: Epic 4 - Public view
- FR-29: Epic 4 - Read-only restriction
- FR-30: Epic 5 - Pricing page
- FR-31: Epic 5 - Purchase flow
- FR-32: Epic 5 - Credit granting
- FR-33: Epic 5 - Payment validation
- FR-34: Epic 6 - Admin KPI dashboard
- FR-35: Epic 6 - AI usage monitoring
- FR-36: Epic 6 - Credit pack management
- FR-37: Epic 6 - Pricing publishing

## Epic List

### Epic 1: Infrastructure & Authentication Foundation

Establish system foundation, implement Managed Auth with Firebase, and enable User Onboarding.
**FRs covered:** FR-01, FR-02, FR-03, FR-04, NFR-09

### Epic 2: Core Resume Management (The Editor)

Enable users to create, edit, and manage resume content with structured sections and live preview.
**FRs covered:** FR-05, FR-06, FR-07, FR-08, FR-09, FR-10, FR-11, FR-12, FR-13, FR-14, NFR-01

### Epic 3: AI-Assisted Writing & Credits

Integrate AI services for content rewriting and implement the Credit System for usage management.
**FRs covered:** FR-15, FR-16, FR-17, FR-18, FR-19, NFR-02

### Epic 4: Advanced Export & Sharing

Implement high-fidelity PDF export (watermarked/clean) and public sharing capabilities via unique links.
**FRs covered:** FR-23, FR-24, FR-25, FR-26, FR-27, FR-28, FR-29, NFR-03, NFR-05

### Epic 5: ATS Optimization & Payments

Implement ATS readiness checks and the Payment Gateway integration for credit purchasing.
**FRs covered:** FR-20, FR-21, FR-22, FR-30, FR-31, FR-32, FR-33

### Epic 6: Admin Operations

Build the Admin Dashboard for system monitoring, metrics tracking, and pricing configuration.
**FRs covered:** FR-34, FR-35, FR-36, FR-37

## Epic 1: Infrastructure & Authentication Foundation

Establish system foundation, implement Managed Auth with Firebase, and enable User Onboarding.

### Story 1.1: Project Initialization & Docker Setup

As a Developer,
I want to initialize the project infrastructure with Docker Compose,
So that I have a consistent environment for development.

**Acceptance Criteria:**

**Given** the existing boilerplate
**When** I run `docker-compose up`
**Then** MongoDB (Replica Set), Redis, Backend API, and Worker containers should start healthy
**And** the backend service should connect successfully to Mongo and Redis
**And** the frontend service should be reachable via localhost

### Story 1.2: Firebase Auth Integration (Backend)

As a Developer,
I want to integrate Firebase Admin SDK into the backend,
So that I can verify client-side tokens securely.

**Acceptance Criteria:**

**Given** a valid Firebase ID Token
**When** sent to a protected endpoint in `Authorization` header
**Then** the `AuthMiddleware` should verify it via Firebase Admin and attach the user to `req.user`
**And** if the token is invalid/expired, it should return 401 Unauthorized
**And** if the local user is `status=disabled`, it should return 403 Forbidden
**And** if the token is revoked (checkRevoked), it should return 401

### Story 1.3: User Onboarding Profile

As a New User,
I want to complete my profile with a role type (Student/Professional),
So that the system can tailor my experience.

**Acceptance Criteria:**

**Given** a logged-in user with no profile
**When** I submit `PUT /api/users/profile` with `roleType`
**Then** the system should update my user record
**And** the response should include the updated user object
**And** if input is invalid, it should return 400 Bad Request

### Story 1.4: Client-Side Login & Logout

As a Visitor,
I want to log in via Google/Email and log out,
So that I can access my account securely.

**Acceptance Criteria:**

**Given** the Login Page
**When** I click "Login with Google"
**Then** the `auth-provider` should use Firebase SDK to authenticate and store the ID token
**When** I click "Logout"
**Then** the `auth-provider` should call Firebase `signOut` and clear local storage
**And** I should be redirected to the public landing page

### Story 1.5: User Deletion & Data Cleanup

As a User,
I want my data to be removed when I delete my account,
To comply with privacy laws.

**Acceptance Criteria:**

**Given** a delete request
**When** confirmed
**Then** soft-delete the User record immediately (`status=deleted`)
**When** the daily cleanup job runs
**Then** hard-delete all Resumes, Credits, and Exports associated with that user

## Epic 2: Core Resume Management (The Editor)

Enable users to create, edit, and manage resume content with structured sections and live preview.

### Story 2.1: Resume CRUD Operations

As a User,
I want to create, rename, and delete resume drafts,
So that I can manage different versions of my CV.

**Acceptance Criteria:**

**Given** a user
**When** I POST to `/api/resumes`
**Then** a new resume document should be created with default sections
**When** I PUT to `/api/resumes/:id/title`
**Then** the title should be updated
**When** I DELETE a resume
**Then** it should be soft-deleted or removed from the DB

### Story 2.2: Structured Content Editor (Backend)

As a User,
I want to save detailed resume sections (Education, Experience),
So that my data is stored structurally.

**Acceptance Criteria:**

**Given** a resume ID
**When** I PUT to `/api/resumes/:id` with nested section data
**Then** the system should validate the structure using Zod
**And** update the `updatedAt` timestamp
**And** preserve data integrity with last-write-wins strategy

### Story 2.3: Frontend Editor UI & State

As a User,
I want a visual editor to input my resume details,
So that I can easily enter information.

**Acceptance Criteria:**

**Given** the Editor Page
**When** I type in a form field
**Then** the local state should update immediately
**And** when I stop typing (debounce), the data should auto-save to the backend
**And** on page reload, the latest saved data should be loaded

### Story 2.4: Live Preview Component

As a User,
I want to see a live preview of my resume,
So that I know how it looks as I type.

**Acceptance Criteria:**

**Given** the split-screen view
**When** I update the editor form
**Then** the Preview component should re-render within 100ms (p95)
**And** ONLY the modified section's component should re-render (verified via React Profiler)
**And** it should use the selected Template layout

### Story 2.5: Template System Foundation

As a User,
I want to switch between two basic templates,
So that I can choose a style.

**Acceptance Criteria:**

**Given** two templates (Modern, Classic)
**When** I select "Classic"
**Then** the Preview should immediately switch CSS/Layout structure
**And** the `templateId` should be persisted in the Resume document

### Story 2.6: Resume Lifecycle Management

As a User,
I want to manage my resume drafts completely,
So I can organize my work.

**Acceptance Criteria:**

**Given** a resume list
**When** I delete a resume
**Then** the system must also invalidate any active Share Links and cancel pending Export Jobs (Cascade Delete)
**When** I duplicate a resume
**Then** a deep copy of all sections should be created

## Epic 3: AI-Assisted Writing & Credits

Integrate AI services for content rewriting and implement the Credit System for usage management.

### Story 3.1: Credit Ledger & Balance System

As a System,
I want to track user credits transactionally,
So that balances are accurate.

**Acceptance Criteria:**

**Given** a `CreditService`
**When** `deductCredits` is called
**Then** it must run inside a MongoDB Transaction
**And** if balance is insufficient, throw `InsufficientFundsError` and abort
**And** on success, `CreditLedger` should show the entry and `User` balance should update

### Story 3.2: AI Service Integration

As a User,
I want to rewrite a bullet point using AI,
So that it sounds more professional.

**Acceptance Criteria:**

**Given** a text input
**When** I call `POST /api/ai/rewrite`
**Then** the backend should call OpenAI API with a "Professional" prompt
**And** on success, deduct credits atomically
**And** on error, NO credits should be deducted

### Story 3.3: Frontend AI Interaction

As a User,
I want to click a "Rewrite" button next to a text field,
So that I can get suggestions inline.

**Acceptance Criteria:**

**Given** a text area
**When** I click "Magic Rewrite"
**Then** a loading spinner should appear
**And** on success, the text area should update
**And** if credits are low, a "Top-up Credits" modal should appear

## Epic 4: Advanced Export & Sharing

Implement high-fidelity PDF export (watermarked/clean) and public sharing capabilities via unique links.

### Story 4.1: Async Export Queue Setup

As a System,
I want to process PDF exports in a background queue,
So that the API remains responsive.

**Acceptance Criteria:**

**Given** an export request
**When** `POST /api/exports` is called
**Then** it should add a job to BullMQ and return a `jobId`
**When** client polls `GET /api/exports/:jobId`
**Then** it should return the status or download URL

### Story 4.2: PDF Rendering Worker

As a Worker,
I want to render the resume HTML to PDF,
So that the user gets a high-quality file.

**Acceptance Criteria:**

**Given** a resume data object
**When** the worker runs
**Then** it should launch a headless browser to capture the PDF
**And** if Free user, inject watermark
**And** if Paid user, remove watermark

### Story 4.3: Public Sharing Link

As a User,
I want to generate a public link,
So that I can share my CV with recruiters.

**Acceptance Criteria:**

**Given** a resume
**When** I toggle "Public Share"
**Then** the system should generate a unique, obscure URL
**When** a public viewer accesses the link
**Then** they should see the Read-Only version without logging in

## Epic 5: ATS Optimization & Payments

Implement ATS readiness checks and the Payment Gateway integration for credit purchasing.

### Story 5.1: Payment Gateway Integration

As a User,
I want to buy a credit pack,
So that I can use more AI features.

**Acceptance Criteria:**

**Given** a selected Credit Pack
**When** I click "Buy"
**Then** the system should create a Payment Session and return checkout URL
**When** payment completes (Webhook)
**Then** the backend should verify signature and invoke `CreditService.addCredits`

### Story 5.2: ATS Readiness Logic

As a User,
I want to check if my resume is ATS-friendly,
So that I don't get rejected by bots.

**Acceptance Criteria:**

**Given** a resume
**When** I click "ATS Check"
**Then** the system should run a rule-based analysis
**And** list specific warnings (e.g., "Avoid columns", "Missing email")

## Epic 6: Admin Operations

Build the Admin Dashboard for system monitoring, metrics tracking, and pricing configuration.

### Story 6.1: Admin Dashboard Implementation

As an Admin,
I want to see key metrics,
So that I know the system health.

**Acceptance Criteria:**

**Given** the Admin Route (`/admin`)
**When** accessed by `role: admin`
**Then** the React Admin dashboard should load
**And** show cards for "Total Users", "Total Resumes", "Revenue"

### Story 6.2: Credit Pack Management

As an Admin,
I want to configure credit packages,
So that I can change pricing without code deploys.

**Acceptance Criteria:**

**Given** the Admin resource "Credit Packs"
**When** I create/edit a pack
**Then** the changes should reflect in the DB
**And** the User Pricing Page should fetch the active packs
