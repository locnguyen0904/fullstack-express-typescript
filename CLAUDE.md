# Codebase Rules & Style Guidelines

## Core Principles

1. **Strict Typing:** `noImplicitAny` is enabled. All function arguments and return types must be typed.
2. **Dependency Injection:** Use `typedi`.

    ```typescript
    @Service()
    class MyService extends BaseService<IMyModel> { ... }
    ```

3. **Validation First:** Inputs must be validated at the route level using `express-zod-safe`.
4. **Immutability:** Prefer `const` over `let`.

## Backend Structure (`backend/src`)

- `api/` - Feature modules (Controller, Service, Model, Validation, Docs).
- `core/` - Abstract base classes (`Controller`, `Service`, `Response`).
- `config/` - App configuration (Env, OpenAPI).
- `helpers/` - Utilities (Error handling, Response formatting).
- `middlewares/` - Express middlewares (Auth, Logging, RateLimit).

## Coding Standards

### API Documentation (OpenAPI)

- **Do NOT** write YAML/JSON manually.

- **DO** use `zod-to-openapi` registry.
- **Pattern:**

    ```typescript
    // in *.validation.ts
    export const mySchema = registry.register('MySchema', z.object({ ... }));

    // in *.doc.ts
    registry.registerPath({
      method: 'get',
      path: '/path',
      request: { params: z.object(...) },
      responses: { ... }
    });
    ```

### Error Handling

- Use `AppError` for known operational errors.

- Use `NotFoundError` for missing resources.
- Let the global error handler (`handle-errors.helper.ts`) manage the response format.

### Database

- Use Mongoose `Model` interface.

- Ensure all database queries are awaited.

## Frontend Guidelines (`frontend/src`)

- **Framework:** React Admin.

- **Components:** Functional components with Hooks.
- **Data Provider:** `restProvider` handles JSON-Server style API interactions.
- **Resources:** Defined in `App.jsx`.

## Testing

- **Backend:** Jest + Supertest.

- **Location:** `src/api/{resource}/{resource}.test.ts`.
- **Requirement:** Integration tests for all new API endpoints.
