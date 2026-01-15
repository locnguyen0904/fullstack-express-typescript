---
classification:
  projectType: Consumer Web App (SaaS)
  domain: Career Development / Productivity
  complexity: Medium
  projectContext: Greenfield
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-e-01-discovery
  - step-e-02-review
  - step-e-03-edit
inputDocuments: []
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
workflowType: 'prd'
lastEdited: '2026-01-16'
editHistory:
  - date: '2026-01-16'
    changes: 'Systematic rewrite for Density, Measurability, Leakage removal, Traceability'
---

# Product Requirements Document (PRD) — CVCraft.ai

**Author:** Locnguyen  
**Date:** 2026-01-16  
**Status:** MVP Planning  

## 1. Product Overview

CVCraft.ai is a web-based (SaaS) resume builder focused on producing strong resume content and ATS-friendly structure. The product reduces “writer’s block” by turning rough notes into professional resume language using an AI-assisted writing capability, while keeping formatting consistent through a structured editor and templates (rather than a fully freeform design tool).

### Problem
Many job seekers struggle to:
- Convert experience into concise, high-quality resume bullet points
- Use the right tone and structure for professional roles
- Ensure resumes remain readable and compatible with automated screening systems (ATS)

### Target outcome
Users can produce a professional, ATS-ready resume quickly, export it to PDF, and share a view-only link.

## 2. Success Criteria

### 2.1 User Success (MVP)
- Users can create a complete resume (all core sections filled) without external help.
- Users perceive AI suggestions as improving clarity and professionalism.
- Users can export a PDF that preserves layout and remains ATS-readable.

### 2.2 Business Success (MVP Targets)
- **Acquisition:** 100 new registered users in the first month after launch.
- **Activation:** 60% of registered users complete at least one resume.
- **Monetization:** 5% conversion from Free to Paid credit purchase within 30 days.

### 2.3 Technical Success (Measurable)
- **Editor responsiveness:** Live preview update latency p95 ≤ 100ms during typing on a typical modern laptop.
- **AI rewrite latency:** AI rewrite response time p95 ≤ 5s for standard rewrite requests.
- **Export reliability:** ≥ 99% of PDF exports succeed without layout corruption (measured by export job success rate).

## 3. Product Scope (MVP)

### 3.1 In Scope
- Structured resume editor with section management (add/remove/reorder).
- Template-based layout system (MVP includes 2 templates).
- Live preview (desktop split view; mobile single-column with preview toggle).
- AI-assisted rewriting with tone selection and context awareness.
- Credit-based usage model:
  - Credits consumed on successful AI actions.
  - Free daily credits with a non-accumulating reset.
- Payment capability for one-time credit purchases via a payment gateway.
- PDF export with watermarking rules by entitlement tier.
- Public, view-only share link.
- ATS optimization support (MVP-level):
  - ATS-friendly structure rules and export formatting
  - Keyword guidance and basic ATS checks (capability-defined; implementation can vary)
- Admin capabilities:
  - Basic KPI dashboard (users, resumes, revenue proxy)
  - AI usage monitoring
  - Pricing/pack configuration management for credit bundles

### 3.2 Out of Scope (MVP)
- Full drag-and-drop layout designer / arbitrary positioning.
- Multi-document suite (cover letters, portfolios) beyond a minimal resume focus.
- Multi-language resume generation and localization (UI and content).
- Multi-user teams, organization accounts, and role-based permissions beyond a single Admin role.
- Integrations with external ATS platforms, job boards, or HRIS systems.
- Built-in job application tracking beyond basic resume versioning.
- Native mobile apps (iOS/Android).
- Advanced plagiarism detection, grammar certification, or human review marketplace.

## 4. Users, Roles, and Actors

- **Visitor (Guest):** Unauthenticated user exploring the product and optionally trying a limited trial.
- **Registered Free User:** Logged-in user with limited credits/entitlements.
- **Paid User:** Logged-in user with purchased credits and paid export entitlements.
- **Admin:** Operator who monitors usage and configures pricing/credit packs.
- **Public Viewer:** Anyone with a share link who can view a resume in read-only mode.

## 5. User Journeys (End-to-End)

### Journey A — New Grad creates a first resume and upgrades
1. Visitor lands on the product page and starts a limited trial.
2. Visitor signs up/logs in using a managed authentication method.
3. Registered user selects a resume template.
4. User enters rough notes for education/projects and uses AI rewrite to generate professional bullet points.
5. System deducts credits only after successful AI rewrite completion.
6. User runs a basic ATS check and receives improvement suggestions (e.g., missing keywords, section completeness).
7. User exports a PDF:
   - Free export includes watermarking per policy.
8. User decides to remove watermark and continue AI usage, purchases credits via payment gateway.
9. User exports a watermark-free PDF according to paid export policy.

### Journey B — Career switcher refines content and shares a link
1. User logs in and creates a new resume version for a target role.
2. User rewrites experience bullets to match the target role and selects tone.
3. User applies ATS guidance to align keywords with the role description.
4. User generates a shareable view-only link.
5. Public viewer opens the link and views the resume without editing permissions.

### Journey C — Admin monitors usage and adjusts pricing
1. Admin logs in to an admin dashboard.
2. Admin reviews KPIs (new users, resume creation volume, credit usage, revenue proxy).
3. Admin reviews AI usage metrics to identify cost/usage trends.
4. Admin creates/updates credit pack pricing and availability (e.g., pack sizes, prices, promotional flags).
5. System applies pricing updates to the pricing page for all users.

## 6. Functional Requirements (FR)

All functional requirements are written in the format: **[Actor] can [capability].**

### 6.1 Authentication & Onboarding
- **FR-01:** Visitor can access a limited trial experience without creating an account (trial limits defined by product policy).
- **FR-02:** Visitor can create an account and log in using a managed authentication provider.
- **FR-03:** Registered user can complete onboarding by selecting a profile type (e.g., Student, Professional) to tailor defaults and guidance.
- **FR-04:** Registered user can log out and revoke active sessions.

### 6.2 Resume Creation & Editing
- **FR-05:** Registered user can create, rename, and delete resume drafts.
- **FR-06:** Registered user can edit resume content using a structured, section-based editor.
- **FR-07:** Registered user can add, remove, and reorder resume sections.
- **FR-08:** Registered user can see a live preview of the resume while editing.
- **FR-09:** Registered user can use a mobile-friendly editing mode with an explicit switch between edit and preview.

### 6.3 Templates
- **FR-10:** Registered user can select a template for a resume.
- **FR-11:** Registered user can switch templates for an existing resume while preserving content.
- **FR-12:** System can provide at least two templates in MVP scope.

### 6.4 Auto-Save & Version Safety
- **FR-13:** System can automatically save resume edits without requiring manual save (with a defined debounce window).
- **FR-14:** Registered user can recover the latest saved state after refresh/reload.

### 6.5 AI-Assisted Writing (Credits-Based)
- **FR-15:** Registered user can request an AI rewrite for a selected section or bullet point.
- **FR-16:** Registered user can select a rewrite tone (e.g., Professional, Friendly) for AI rewrite requests.
- **FR-17:** System can deduct credits only when an AI rewrite request completes successfully.
- **FR-18:** Registered user can see current credit balance and recent credit consumption.
- **FR-19:** System can grant a daily free credit allowance to Free users that resets daily and does not accumulate.

### 6.6 ATS Optimization (MVP-Level)
- **FR-20:** Registered user can run an ATS readiness check on a resume.
- **FR-21:** System can highlight ATS risks and suggestions (e.g., missing sections, overly long bullets, missing keywords, inconsistent headings).
- **FR-22:** Registered user can provide a target role description and receive suggested keywords to incorporate.
- **FR-23:** System can ensure exported PDFs follow ATS-friendly formatting constraints (e.g., selectable text, consistent headings, avoid content loss).

### 6.7 Export
- **FR-24:** Registered user can export a resume as a standard PDF (A4).
- **FR-25:** System can apply watermarking rules to exports based on the user’s entitlement tier.
- **FR-26:** Paid user can export a watermark-free PDF when they meet paid export entitlement rules (including any required credit deduction policy).

### 6.8 Sharing
- **FR-27:** Registered user can generate a public, view-only share link for a resume.
- **FR-28:** Public viewer can open a share link and view the resume content without authentication.
- **FR-29:** System can restrict share links to read-only access (no editing).

### 6.9 Payments & Entitlements
- **FR-30:** Registered user can view available credit packs and prices on a pricing page.
- **FR-31:** Registered user can purchase credits through a payment gateway checkout flow.
- **FR-32:** System can grant purchased credits after confirmed payment completion.
- **FR-33:** System can prevent paid entitlements from being granted when payment is incomplete, failed, or reversed.

### 6.10 Admin & Operations
- **FR-34:** Admin can view a dashboard showing user count, resume count, and revenue proxy metrics.
- **FR-35:** Admin can view AI usage metrics sufficient to monitor operational cost drivers.
- **FR-36:** Admin can create, update, enable/disable, and reorder credit pack offerings and prices.
- **FR-37:** System can publish pricing changes so the pricing page reflects current configuration.

## 7. Non-Functional Requirements (NFR) — Measurable

Each NFR includes **metric**, **method**, and **context**.

### 7.1 Performance
- **NFR-01 (Live preview):** p95 preview update latency ≤ 100ms  
  - **Method:** Frontend performance telemetry (RUM) measuring keystroke-to-render update time  
  - **Context:** Standard editing session with typical resume size (1–2 pages)
- **NFR-02 (AI rewrite):** p95 AI rewrite completion time ≤ 5s  
  - **Method:** Server-side timing around AI rewrite requests (request start → response parsed)  
  - **Context:** Typical rewrite payload size; exclude user network latency where possible
- **NFR-03 (PDF export):** p95 export completion time ≤ 10s  
  - **Method:** Export job timing metrics (enqueue → completed)  
  - **Context:** Standard resume size; includes server-side render and storage

### 7.2 Reliability & Availability
- **NFR-04 (API availability):** ≥ 99.5% monthly uptime for core API routes  
  - **Method:** Synthetic monitoring + uptime tracking  
  - **Context:** Excludes scheduled maintenance windows (must be documented)
- **NFR-05 (Export success):** ≥ 99% successful export jobs  
  - **Method:** Export job success rate monitoring  
  - **Context:** Failures categorized (render error, timeout, invalid input)
- **NFR-06 (Graceful degradation):** AI downtime does not block non-AI editing and export  
  - **Method:** Chaos testing / forced AI error simulation in staging  
  - **Context:** Editor and export remain available; user receives actionable error message for AI actions

### 7.3 Security & Privacy
- **NFR-07 (Data isolation):** Users can access only their own resumes and credit balances  
  - **Method:** Automated authorization tests + periodic review of access control rules  
  - **Context:** Applies to all APIs handling resumes, exports, and billing entitlements
- **NFR-08 (Sensitive data handling):** Resume data is encrypted in transit and protected at rest per platform standards  
  - **Method:** TLS verification + storage configuration verification  
  - **Context:** Applies to resumes, exported documents, and share link access

### 7.4 Compliance & Data Rights
- **NFR-09 (Deletion):** Users can request account deletion and have personal data removed within 30 days  
  - **Method:** Admin/audit workflow with completion logs  
  - **Context:** Includes resumes and exported documents; excludes payment records that must be retained for legal reasons (policy-defined)

### 7.5 Maintainability & Operability
- **NFR-10 (Observability):** Core user flows emit structured logs and metrics  
  - **Method:** Dashboards for AI usage, export jobs, checkout confirmations, and error rates  
  - **Context:** Enables debugging and cost monitoring for MVP operations

## 8. Assumptions & Dependencies (Capability-Based)

### Assumptions
- Users are willing to start from structured sections rather than a blank canvas design tool.
- A credit-based model is acceptable for AI usage and aligns with perceived value.

### Dependencies
- A **managed authentication capability** for account creation and login.
- An **AI/LLM capability** for rewriting text.
- A **payment gateway capability** for one-time purchases and payment confirmation.
- A **server-side PDF rendering capability** that reliably preserves layout and produces selectable text.
- Basic **analytics/telemetry capability** for funnel measurement and operational monitoring.

## 9. Analytics & Event Tracking (MVP)

### Key events
- `signup_completed`
- `resume_created`
- `template_selected`
- `ai_rewrite_requested`
- `ai_rewrite_succeeded`
- `ai_rewrite_failed`
- `credits_granted_daily`
- `credits_purchased`
- `pdf_export_requested`
- `pdf_export_succeeded`
- `share_link_created`
- `share_link_viewed`
- `ats_check_run`

### Funnel metrics
- Visitor → Signup conversion
- Signup → First resume created
- Resume created → First export
- Free export → Credit purchase conversion
- Credit purchase → Watermark-free export

## 10. Open Questions

- What are the exact trial limits for Guests (time, credits, export restrictions)?
- What is the exact watermark policy (text, placement, opacity)?
- What is the credit cost model for AI rewrite and watermark-free export (fixed vs configurable)?
- What is the MVP definition of “ATS check” (rule-based checklist vs scoring vs keyword match)?
- Should share links support expiration and/or revocation in MVP?
