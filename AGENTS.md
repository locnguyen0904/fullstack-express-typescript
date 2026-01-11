# Project Rules & Developer Guide

## 1. Architectural Patterns

The backend strictly follows a **Controller-Service-Model (CSM)** layered architecture with Dependency Injection.

- **Controllers (`*.controller.ts`):**
  - Handle HTTP requests/responses.
  - Parse input and call Services.
  - **Rule:** Never contain business logic.
  - **Rule:** Must extend the base `Controller` class.
  - **Rule:** Use `typedi` for injection.

- **Services (`*.service.ts`):**
  - Contain all business logic.
  - Interact with Mongoose Models.
  - **Rule:** Never access `req` or `res` objects directly.
  - **Rule:** Must extend the base `Service` class.
  - **Rule:** Throw errors (e.g., `AppError`, `NotFoundError`), do not return 404/500 responses directly.

- **Models (`*.model.ts`):**
  - Mongoose schema definitions and interfaces.
  - **Rule:** Define TypeScript interfaces (`IUser`, `IExample`) for type safety.

## 2. Validation & Documentation

- **Library:** `zod` and `express-zod-safe`.
- **OpenAPI:** Documentation is **code-first**.
  - **Rule:** Every validation schema must be registered with the `OpenAPIRegistry`.
  - **Rule:** Define Zod schemas in `*.validation.ts`.
  - **Rule:** Define OpenAPI routes/paths in `*.doc.ts` (or alongside routes if simple).
  - **Rule:** Use `extendZodWithOpenApi` to add examples/descriptions to schemas.

## 3. Code Style & Naming

- **Files:** Kebab-case (e.g., `user-profile.controller.ts`).
- **Classes:** PascalCase (e.g., `UserProfileController`).
- **Variables/Functions:** camelCase.
- **Async:** Always use `async/await`. Avoid callbacks or `.then()`.
- **Linting:** Strictly adhere to `.eslintrc.js` and `.prettierrc`.

## 4. Usage Guide: Adding a New Resource

1. **Model:** Create `src/api/resource/resource.model.ts`.
2. **Validation:** Create `src/api/resource/resource.validation.ts` with Zod schemas.
3. **Service:** Create `src/api/resource/resource.service.ts` extending `BaseService`.
4. **Controller:** Create `src/api/resource/resource.controller.ts` extending `Controller`.
5. **Docs:** Create `src/api/resource/resource.doc.ts` for OpenAPI registry.
6. **Route:** Create `src/api/resource/index.ts`, register routes, and import docs.
7. **Main:** Register the new route in `src/api/index.ts`.
