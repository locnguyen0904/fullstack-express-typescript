# Story 1.4: Client-Side Login & Logout

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Visitor,
I want to log in via Google/Email and log out,
so that I can access my account securely.

## Acceptance Criteria

1. **Given** the Login Page, **When** I click "Login with Google", **Then** the `auth-provider` should use Firebase SDK to authenticate and store the ID token.
2. **When** I click "Logout", **Then** the `auth-provider` should call Firebase `signOut` and clear local storage.
3. **And** I should be redirected to the public landing page.
4. **And** after successful login, the user should be redirected to the main application dashboard.
5. **And** if login fails, an appropriate error message should be displayed.

## Tasks / Subtasks

- [ ] **Task 1: Install and Configure Firebase Client SDK** (AC: 1)
  - [ ] Install `firebase` package in frontend
  - [ ] Create `frontend/src/config/firebase.config.js` with Firebase web config
  - [ ] Add Firebase config environment variables to `.env` and `.env.example`
  - [ ] Initialize Firebase App in config file

- [ ] **Task 2: Refactor auth-provider.js to use Firebase Auth** (AC: 1, 2, 3, 4, 5)
  - [ ] Replace `jwtDecode` with Firebase Auth state observer
  - [ ] Implement `login` method using `signInWithPopup` for Google provider
  - [ ] Implement `logout` method using Firebase `signOut()`
  - [ ] Update `checkAuth` to verify Firebase auth state
  - [ ] Update `getIdentity` to use Firebase user object
  - [ ] Update `getPermissions` to derive from Firebase user claims or backend sync
  - [ ] Handle authentication errors with user-friendly messages

- [ ] **Task 3: Refactor token-provider.js for Firebase ID Token** (AC: 1)
  - [ ] Replace localStorage JWT storage with Firebase `getIdToken()`
  - [ ] Implement token refresh using `getIdToken(true)` (force refresh)
  - [ ] Update `getToken` to return current Firebase ID Token
  - [ ] Remove `setToken` (Firebase manages tokens internally)

- [ ] **Task 4: Update http-client.js to use Firebase Token** (AC: 1)
  - [ ] Replace token retrieval from localStorage with token-provider's `getToken()`
  - [ ] Ensure all API requests include `Authorization: Bearer <firebase_id_token>`
  - [ ] Handle token refresh on 401 responses

- [ ] **Task 5: Create Custom Login Page (Optional Enhancement)** (AC: 1, 5)
  - [ ] Create `frontend/src/pages/login/LoginPage.jsx`
  - [ ] Add Google Sign-In button with proper branding
  - [ ] Add Email/Password sign-in form (optional for MVP)
  - [ ] Display loading state during authentication
  - [ ] Display error messages for failed logins

- [ ] **Task 6: Update App.jsx for Login Flow** (AC: 3, 4)
  - [ ] Configure React Admin's `loginPage` prop if using custom login page
  - [ ] Ensure redirect to dashboard after successful login
  - [ ] Ensure redirect to login page for unauthenticated access

## Dev Notes

### Architecture Compliance

- **Authentication Strategy:** Direct Firebase Token Verification (Simplified)
  - Frontend uses Firebase SDK for authentication
  - Backend verifies Firebase ID Token via `firebase-admin`
  - NO internal JWT minting - use Firebase tokens directly
  
- **Frontend Architecture (from project-context.md):**
  - Single Vite App (`frontend/`)
  - Shared `auth-provider.ts` handles Firebase Login/Token Refresh
  - Route Splitting: `/admin/*` → React Admin, `/app/*` → Custom Editor

- **Critical Rules:**
  - Firebase tokens are short-lived (~1 hour) - implement automatic refresh
  - Use `onAuthStateChanged` listener for reactive auth state
  - Clear all local state on logout (not just token)

### Previous Story Intelligence (Story 1.2)

From **1-2-firebase-auth-integration-backend.md**:

- Backend already has `firebase-admin` SDK integrated
- `AuthMiddleware` verifies tokens with `checkRevoked: true`
- User sync creates/updates local user record from Firebase UID
- Environment variables: `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`

**Key Learning:** Backend expects Bearer token in format: `Authorization: Bearer <firebase_id_token>`

### Library & Framework Requirements

| Library                        | Version    | Purpose                                          |
| ------------------------------ | ---------- | ------------------------------------------------ |
| firebase                       | ^10.x      | Firebase JavaScript SDK (Client)                 |
| react-admin                    | 5.13+      | Admin framework (already installed)              |
| @react-admin/ra-auth-firebase  | (optional) | Pre-built Firebase auth adapter for React Admin  |

**Note:** Consider using `@react-admin/ra-auth-firebase` for faster implementation, but ensure it meets our customization needs.

### File Structure Requirements

```text
frontend/src/
├── config/
│   └── firebase.config.js     # NEW: Firebase web SDK config
├── utils/
│   ├── auth-provider.js       # MODIFY: Refactor to use Firebase
│   ├── token-provider.js      # MODIFY: Use Firebase getIdToken()
│   └── http-client.js         # MODIFY: Use Firebase token
└── pages/
    └── login/                  # NEW (optional): Custom login page
        └── LoginPage.jsx
```

### Testing Requirements

- [ ] Verify Google Sign-In popup works
- [ ] Verify token is attached to API requests
- [ ] Verify 401 response triggers re-authentication
- [ ] Verify logout clears all auth state
- [ ] Verify page refresh maintains auth state

### Security Considerations

- **DO NOT** store Firebase tokens in localStorage (Firebase handles internally)
- **DO NOT** expose Firebase config secrets in client-side code (only use public config)
- **ALWAYS** use `getIdToken(true)` to force refresh when token might be stale
- **HANDLE** token revocation gracefully (backend returns 401 on revoked tokens)

### Firebase Web Config Example

```javascript
// frontend/src/config/firebase.config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
```

### References

- [PRD - FR-02, FR-04](../planning-artifacts/prd.md) - Authentication & Logout requirements
- [Architecture Document](../planning-artifacts/architecture.md) - Auth Strategy
- [Project Context](../../project-context.md) - Critical Rules (Auth)
- [Story 1.2](./1-2-firebase-auth-integration-backend.md) - Backend Firebase integration
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth/web/start) - Official docs

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
