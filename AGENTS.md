# Development Rules & Guidelines

> Universal development guidelines for this project. Applicable to all developers and AI assistants.

## 1. Project Context

| Component    | Technology              | Purpose                |
| ------------ | ----------------------- | ---------------------- |
| Backend      | Express.js + TypeScript | REST API server        |
| Database     | MongoDB + Mongoose      | Data persistence       |
| Cache        | Redis                   | Session/caching layer  |
| Frontend     | React Admin             | Admin dashboard        |
| DI Container | typedi                  | Dependency injection   |
| Validation   | Zod + express-zod-safe  | Input validation       |
| Docs         | zod-to-openapi          | Auto-generated OpenAPI |

## 2. Architecture: Controller-Service-Model

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Controller │────▶│   Service   │────▶│    Model    │
│  (HTTP I/O) │     │  (Business) │     │  (Database) │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Controllers (`*.controller.ts`)

- ✅ Handle HTTP request/response
- ✅ Parse input and call Services
- ✅ Must extend base `Controller` class
- ✅ Use `typedi` for injection
- ❌ **Never** contain business logic

### Services (`*.service.ts`)

- ✅ Contain all business logic
- ✅ Interact with Mongoose Models
- ✅ Must extend base `Service` class
- ✅ Throw errors (`AppError`, `NotFoundError`)
- ❌ **Never** access `req` or `res` directly
- ❌ **Never** return HTTP status directly

### Models (`*.model.ts`)

- ✅ Mongoose schema definitions
- ✅ TypeScript interfaces (`IUser`, `IExample`)
- ✅ Static methods if needed
- ❌ **Never** contain business logic

## 3. Validation & Documentation

### Zod Schemas

```typescript
// *.validation.ts
import { z } from "zod";
import { registry } from "@/config/openapi.config";

export const createUserSchema = registry.register(
  "CreateUser",
  z.object({
    name: z.string().min(2).describe("User full name"),
    email: z.string().email().describe("User email address"),
  }),
);
```

### OpenAPI Routes

```typescript
// *.doc.ts
import { registry } from "@/config/openapi.config";
import { createUserSchema } from "./user.validation";

registry.registerPath({
  method: "post",
  path: "/api/users",
  tags: ["Users"],
  summary: "Create a new user",
  request: {
    body: { content: { "application/json": { schema: createUserSchema } } },
  },
  responses: {
    201: { description: "User created successfully" },
    400: { description: "Validation error" },
  },
});
```

### Rules

- ✅ Every schema **must** be registered with `OpenAPIRegistry`
- ✅ Use `extendZodWithOpenApi` for examples/descriptions
- ❌ **Never** write YAML/JSON manually for OpenAPI

## 4. Code Style

### Naming Conventions

| Type       | Convention                 | Example                      |
| ---------- | -------------------------- | ---------------------------- |
| Files      | kebab-case                 | `user-profile.controller.ts` |
| Classes    | PascalCase                 | `UserProfileController`      |
| Variables  | camelCase                  | `userData`                   |
| Functions  | camelCase                  | `getUserById`                |
| Constants  | SCREAMING_SNAKE            | `MAX_RETRY_COUNT`            |
| Interfaces | PascalCase with `I` prefix | `IUser`                      |

### Async/Await

```typescript
// ✅ Good
async function getUser(id: string): Promise<IUser> {
  const user = await UserModel.findById(id);
  if (!user) throw new NotFoundError('User not found');
  return user;
}

// ❌ Bad - using callbacks or .then()
function getUser(id: string) {
  return UserModel.findById(id).then(user => { ... });
}
```

### Imports

```typescript
// Use path aliases
import { Controller } from "@/core";
import { authMiddleware } from "@/middlewares";
import { AppError } from "@/helpers";
```

## 5. Adding a New Resource

Follow this checklist for each new API resource:

### Step 1: Model

```bash
# Create: src/api/{resource}/{resource}.model.ts
```

```typescript
import { Schema, model, Document } from "mongoose";

export interface IResource extends Document {
  name: string;
  createdAt: Date;
}

const ResourceSchema = new Schema<IResource>({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ResourceModel = model<IResource>("Resource", ResourceSchema);
```

### Step 2: Validation

```bash
# Create: src/api/{resource}/{resource}.validation.ts
```

### Step 3: Service

```bash
# Create: src/api/{resource}/{resource}.service.ts
```

### Step 4: Controller

```bash
# Create: src/api/{resource}/{resource}.controller.ts
```

### Step 5: Docs

```bash
# Create: src/api/{resource}/{resource}.doc.ts
```

### Step 6: Routes

```bash
# Create: src/api/{resource}/index.ts
```

### Step 7: Register

```typescript
// Add to: src/api/index.ts
import resourceRouter from "./resource";
router.use("/resources", resourceRouter);
```

## 6. Testing Requirements

```bash
# Test location
src/__tests__/api/{resource}/{resource}.{type}.test.ts

# Run tests
npm test                    # All tests
npm test -- --coverage      # With coverage
npm test -- --watch         # Watch mode
```

### Test Types

| Type        | Pattern                 | Purpose          |
| ----------- | ----------------------- | ---------------- |
| Unit        | `*.service.test.ts`     | Service logic    |
| Unit        | `*.controller.test.ts`  | Controller logic |
| Integration | `*.integration.test.ts` | Full API flow    |

### Requirements

- ✅ Integration tests for all API endpoints
- ✅ Unit tests for complex business logic
- ✅ Mock external dependencies
- ✅ Test error scenarios

## 7. Error Handling

```typescript
import { AppError, NotFoundError } from "@/helpers";

// Operational errors (expected)
throw new AppError("Invalid operation", 400);

// Not found errors
throw new NotFoundError("User not found");

// Let global handler manage response
// See: src/helpers/handle-errors.helper.ts
```

## 8. Environment Variables

| Variable       | Description                          | Required |
| -------------- | ------------------------------------ | -------- |
| `DATABASE_URL` | MongoDB connection string            | ✅       |
| `JWT_SECRET`   | Secret for JWT signing               | ✅       |
| `REDIS_URL`    | Redis connection string              | ✅       |
| `PORT`         | Server port (default: 3000)          | ❌       |
| `NODE_ENV`     | Environment (development/production) | ❌       |
