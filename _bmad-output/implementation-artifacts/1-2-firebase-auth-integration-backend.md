# Story 1.2: Firebase Auth Integration (Backend)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want to integrate Firebase Admin SDK into the backend,
so that I can verify client-side tokens securely.

## Acceptance Criteria

1. **Given** a valid Firebase ID Token, **When** sent to a protected endpoint in `Authorization` header, **Then** the `AuthMiddleware` should verify it via Firebase Admin and attach the user to `req.user`.
2. **And** if the token is invalid/expired, it should return 401 Unauthorized.
3. **And** if the local user is `status=disabled`, it should return 403 Forbidden.
4. **And** if the token is revoked (checkRevoked), it should return 401.

## Tasks / Subtasks

- [x] Install and Configure Firebase Admin SDK (AC: 1)
  - [x] Add `firebase-admin` dependency
  - [x] Create `backend/src/config/firebase.config.ts` to load credentials from ENV
  - [x] Initialize Firebase Admin app in `backend/src/services/firebase.service.ts`
- [x] Implement Auth Middleware (AC: 1, 2, 4)
  - [x] Create/Update `backend/src/middlewares/auth.middleware.ts`
  - [x] Extract Bearer token from header
  - [x] Verify token using `admin.auth().verifyIdToken(token, checkRevoked=true)`
  - [x] Handle errors (expired, revoked, invalid) -> 401
- [x] Implement User Sync/Hydration (AC: 1, 3)
  - [x] In middleware, find local user by `firebaseUid` (from token claims)
  - [x] If user missing, create minimal record (Sync/Onboarding logic)
  - [x] If user exists but `status=disabled`, return 403
  - [x] Attach user object to `req.user`
- [x] Update Environment Config
  - [x] Add `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` to `.env` (and `.env.example`)

## Dev Notes

- **Architecture Compliance:**
  - **Auth Strategy:** Direct Firebase Token Verification (Simplified). No internal JWT minting.
  - **Middleware:** Must map Firebase UID to internal MongoDB `_id` for Tenant Isolation (`ownerUserId`).
- **Security:**
  - `checkRevoked: true` is critical for instant session revocation (Logout).
  - Do NOT commit Firebase Service Account keys. Load from ENV.
- **References:**
  - [Architecture Document](../planning-artifacts/architecture.md) - Authentication Section
  - [Project Context](../../project-context.md) - Critical Rules (Auth)

## Dev Agent Record

### Agent Model Used

O1-Mini / GPT-4o

### Debug Log References

### Completion Notes List

- Installed `firebase-admin`.
- Configured environment variables for Firebase.
- Implemented `FirebaseService` to initialize the Admin SDK.
- Implemented `AuthMiddleware` with token verification, user sync, and status checks.
- Updated `User` model to support `firebaseUid` and `status`.
- Updated `UserService` to handle user creation/lookup via Firebase UID.
- Verified TypeScript compilation.

### File List

- backend/package.json
- backend/src/config/env.config.ts
- backend/src/services/firebase.service.ts
- backend/src/middlewares/auth.middleware.ts
- backend/src/api/users/user.service.ts
- backend/src/api/users/user.model.ts
- backend/.env.example
