# Claude AI Instructions

> This file provides context and rules for Claude AI when working on this project.

## Project Overview

This is a full-stack web application template with:

- **Backend:** Express.js + TypeScript with MongoDB
- **Frontend:** React Admin
- **Infrastructure:** Docker Compose (MongoDB, Redis, Backend, Frontend)

## Quick Commands

```bash
# Development
docker compose up -d              # Start all services
docker compose logs -f backend    # View backend logs

# Verification
cd backend && npm run lint        # Check linting
cd backend && npm test            # Run tests
cd backend && npm run build       # Build project

# Fix issues
cd backend && npm run prettier:fix && npm run lint:fix
```

## Architecture Rules

### Controller-Service-Model Pattern

| Layer      | File Pattern      | Responsibility                                    |
| ---------- | ----------------- | ------------------------------------------------- |
| Controller | `*.controller.ts` | HTTP handling, input parsing, call services       |
| Service    | `*.service.ts`    | Business logic, throw errors (not HTTP responses) |
| Model      | `*.model.ts`      | Mongoose schema, TypeScript interfaces            |

### Key Constraints

1. **Controllers** must extend `Controller` base class
2. **Services** must extend `Service` base class and never access `req`/`res`
3. **All inputs** must be validated with Zod at route level
4. **All routes** must be registered in OpenAPI registry

## Code Standards

### File Structure (`backend/src`)

```
api/              # Feature modules
├── {resource}/
│   ├── {resource}.controller.ts
│   ├── {resource}.service.ts
│   ├── {resource}.model.ts
│   ├── {resource}.validation.ts
│   ├── {resource}.doc.ts
│   └── index.ts
core/             # Base classes (Controller, Service, Response)
config/           # App configuration (Env, OpenAPI)
helpers/          # Utilities (Error handling, Response formatting)
middlewares/      # Express middlewares (Auth, Logging, RateLimit)
__tests__/        # Test files (mirrors src structure)
```

### Naming Conventions

| Type                | Convention      | Example                      |
| ------------------- | --------------- | ---------------------------- |
| Files               | kebab-case      | `user-profile.controller.ts` |
| Classes             | PascalCase      | `UserProfileController`      |
| Variables/Functions | camelCase       | `getUserById`                |
| Interfaces          | Prefix with `I` | `IUser`, `IExample`          |

### OpenAPI Documentation

```typescript
// *.validation.ts - Register schemas
export const mySchema = registry.register('MySchema', z.object({ ... }));

// *.doc.ts - Register routes
registry.registerPath({
  method: 'get',
  path: '/path',
  request: { params: z.object(...) },
  responses: { ... }
});
```

### Error Handling

- Use `AppError` for operational errors
- Use `NotFoundError` for missing resources
- Let global error handler manage response format

## Checklist Before Committing

- [ ] All inputs validated with Zod
- [ ] Route registered in OpenAPI registry
- [ ] Rate limiting applied (global by default)
- [ ] Tests written for new features
- [ ] TypeScript interfaces defined
- [ ] `npm run lint` passes
- [ ] `npm test` passes

## Troubleshooting

| Issue                   | Solution                                                |
| ----------------------- | ------------------------------------------------------- |
| Swagger UI fails        | Check `openapi.config.ts`, ensure registry is populated |
| Docker connection error | Ensure `mongo` and `redis` are "healthy" first          |
| Lint errors             | Run `npm run prettier:fix` then `npm run lint:fix`      |

## Do NOT

- ❌ Write YAML/JSON for OpenAPI manually
- ❌ Use callbacks or `.then()` - always `async/await`
- ❌ Access `req`/`res` in Services
- ❌ Put business logic in Controllers
- ❌ Skip input validation
