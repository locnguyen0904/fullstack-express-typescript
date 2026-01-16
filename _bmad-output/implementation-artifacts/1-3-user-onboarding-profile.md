# Story 1.3: User Onboarding Profile

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a New User,
I want to complete my profile with a role type (Student/Professional),
so that the system can tailor my experience.

## Acceptance Criteria

1. **Given** a logged-in user with no profile, **When** I submit `PUT /api/users/profile` with `roleType`, **Then** the system should update my user record.
2. **And** the response should include the updated user object.
3. **And** if input is invalid, it should return 400 Bad Request.

## Tasks / Subtasks

- [ ] Implement Profile Update Logic (Backend) (AC: 1, 2)
  - [ ] Update `User` model to include `roleType` (enum: Student, Professional) and other profile fields.
  - [ ] Implement `updateProfile` method in `UserService` to handle profile updates.
  - [ ] Create `updateProfile` controller method in `UserController`.
- [ ] Add Validation for Profile Updates (AC: 3)
  - [ ] Create Zod schema for profile update input in `user.validation.ts`.
  - [ ] Ensure validation middleware is applied to the update route.
- [ ] Define API Route (AC: 1)
  - [ ] Add `PUT /profile` route to `src/api/users/index.ts` (protected by AuthMiddleware).
- [ ] Update OpenAPI Documentation
  - [ ] Add documentation for the profile update endpoint in `user.doc.ts`.

## Dev Notes

- **Architecture Compliance:**
  - **Tenant Isolation:** Ensure updates are restricted to the authenticated user (`req.user`).
  - **Validation:** Use Zod for all input validation.
- **Project Structure:**
  - `backend/src/api/users/` contains model, service, controller, and validation logic.
- **References:**
  - [Architecture Document](../planning-artifacts/architecture.md) - API & Communication Patterns
  - [Project Context](../../project-context.md) - Coding Conventions

## Dev Agent Record

### Agent Model Used

O1-Mini / GPT-4o

### Debug Log References

### Completion Notes List

### File List
