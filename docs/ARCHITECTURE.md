# Architecture

Design decisions and patterns used in this project.

## Layered Architecture

```
Request → Routes → Controller → Service → Repository → Model → MongoDB
```

| Layer      | Responsibility                        | Knows About |
| ---------- | ------------------------------------- | ----------- |
| Routes     | HTTP routing, middleware, validation  | Controller  |
| Controller | Request handling, response formatting | Service     |
| Service    | Business logic, orchestration         | Repository  |
| Repository | Data access, queries                  | Model       |
| Model      | Schema, database constraints          | MongoDB     |

### Why This Pattern?

- **Separation of concerns:** Each layer has one responsibility
- **Testability:** Mock dependencies at any layer
- **Scalability:** Swap implementations without affecting other layers
- **Maintainability:** Changes isolated to relevant layer

## Repository Pattern

### Base Repository

Located at `core/repository.core.ts`, provides standard CRUD operations:

```typescript
export abstract class Repository<T extends BaseDocument> {
  constructor(protected readonly model: Model<T>) {}

  // CREATE - uses new + save (triggers hooks/validators)
  async create(data: Partial<T>): Promise<T>;
  async createMany(data: Partial<T>[]): Promise<T[]>;

  // READ - uses lean() for performance
  async findById(id: string): Promise<LeanDoc<T> | null>;
  async findOne(filter: FilterQuery<T>): Promise<LeanDoc<T> | null>;
  async find(filter: FilterQuery<T>): Promise<LeanDoc<T>[]>;
  async findAll(query: object): Promise<PaginateResult<T>>;
  async count(filter: FilterQuery<T>): Promise<number>;
  async exists(filter: FilterQuery<T>): Promise<boolean>;

  // UPDATE - uses findById + save (triggers hooks)
  async updateById(id: string, data: UpdateQuery<T>): Promise<T | null>;
  async updateOne(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>,
  ): Promise<T | null>;
  async updateMany(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>,
  ): Promise<number>;

  // DELETE (hard)
  async deleteById(id: string): Promise<LeanDoc<T> | null>;
  async deleteOne(filter: FilterQuery<T>): Promise<LeanDoc<T> | null>;
  async deleteMany(filter: FilterQuery<T>): Promise<number>;

  // SOFT DELETE (mongoose-delete plugin)
  async softDeleteById(id: string): Promise<T | null>;
  async restoreById(id: string): Promise<T | null>;
  async findDeleted(filter: FilterQuery<T>): Promise<LeanDoc<T>[]>;
}
```

### Domain Repository Example

```typescript
@Service()
export class UserRepository extends Repository<IUser> {
  constructor() {
    super(User);
  }

  // Domain-specific queries
  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email });
  }

  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    const filter: Record<string, unknown> = { email };
    if (excludeUserId) filter._id = { $ne: excludeUserId };
    return this.exists(filter);
  }
}
```

### Best Practices

| Operation  | Method                         | Why                                    |
| ---------- | ------------------------------ | -------------------------------------- |
| Create     | `new Model()` + `.save()`      | Triggers pre/post hooks, validators    |
| Read       | `.lean()`                      | Returns plain objects, 10x faster      |
| Update     | `findById()` + `save()`        | Triggers hooks, version checking       |
| Bulk write | `insertMany()`, `updateMany()` | Performance, skips hooks intentionally |

## Dependency Injection

Using [TypeDI](https://github.com/typestack/typedi) for constructor injection:

```typescript
// Repository - injects Model
@Service()
export class UserRepository extends Repository<IUser> {
  constructor() {
    super(User);
  }
}

// Service - injects Repository
@Service()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventService: EventService,
  ) {}
}

// Controller - injects Service
@Service()
export class UserController {
  constructor(private readonly userService: UserService) {}
}

// Routes - gets Controller from container
const controller = Container.get(UserController);
```

### Why DI?

- **Testability:** Replace with mocks easily
- **Loose coupling:** Classes don't construct dependencies
- **Single instances:** Services are singletons by default

## Response Classes

Standardized API responses via response classes:

```typescript
// Success responses
new OK({ data: user }).send(res); // 200
new CREATED({ data: user }).send(res); // 201
new LIST({
  // 200 with pagination
  data: result.docs,
  total: result.totalDocs,
  page: result.page,
  pages: result.totalPages,
  limit: result.limit,
}).send(res);

// Errors (throw from Service or Controller)
throw new NotFoundError("User not found"); // 404
throw new BadRequestError("Invalid input"); // 400
throw new UnAuthorizedError("Not logged in"); // 401
throw new ForbiddenError("Access denied"); // 403
```

### Response Format

```json
{
  "status": "success",
  "message": "OK",
  "data": { ... }
}
```

```json
{
  "status": "success",
  "message": "OK",
  "data": [...],
  "total": 100,
  "page": 1,
  "pages": 10,
  "limit": 10
}
```

## Error Handling

### asyncHandler

Wraps controller methods to catch errors and forward to Express error handler:

```typescript
// helpers/async-handler.helper.ts
export const asyncHandler = (
  fn: (req: Request, res: Response) => Promise<void>,
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };
};

// Usage in routes
router.get("/:id", asyncHandler(controller.findOne.bind(controller)));
```

### Error Flow

```
Controller throws → asyncHandler catches → next(error) → Global Error Handler
```

## Validation

Using Zod with `express-zod-safe` middleware:

```typescript
// validation.ts
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

// routes
router.post("/", validate({ body: createUserSchema }), controller.create);
```

### Benefits

- Runtime type checking
- Auto-generated OpenAPI schemas
- TypeScript type inference

## Mongoose Plugins

### Applied Globally

| Plugin                           | Purpose                                              |
| -------------------------------- | ---------------------------------------------------- |
| `mongoose-paginate-v2`           | Pagination with `model.paginate()`                   |
| `mongoose-delete`                | Soft delete with `deleted`, `deletedAt`, `deletedBy` |
| `mongoose-aggregate-paginate-v2` | Aggregation pagination                               |

### Type Definitions

Custom types in `types/mongoose-plugins.d.ts`:

```typescript
declare module "mongoose" {
  interface SoftDeleteModel<T extends Document> {
    delete(filter?): Promise<{ deletedCount: number }>;
    deleteById(id): Promise<T | null>;
    restoreById(id): Promise<T | null>;
    findOneWithDeleted(filter?): Query<T | null, T>;
    findDeleted(filter?): Query<T[], T>;
  }

  interface PaginateModelWithDeleted<T extends Document>
    extends PaginateModel<T>, SoftDeleteModel<T> {}
}
```

## Directory Structure

```
backend/src/
├── api/                    # Feature modules
│   └── {resource}/
│       ├── {resource}.model.ts        # Schema, interface
│       ├── {resource}.repository.ts   # Data access
│       ├── {resource}.service.ts      # Business logic
│       ├── {resource}.controller.ts   # HTTP handling
│       ├── {resource}.validation.ts   # Zod schemas
│       ├── {resource}.doc.ts          # OpenAPI registry
│       └── index.ts                   # Routes
├── core/                   # Framework classes
│   ├── repository.core.ts             # Base repository
│   ├── response-success.core.ts       # OK, CREATED, LIST
│   ├── response-error.core.ts         # AppError, NotFoundError
│   └── base-document.core.ts          # Base interface
├── config/                 # Configuration
├── helpers/                # Utilities
├── middlewares/            # Express middlewares
├── services/               # Shared services
└── __tests__/              # Tests (mirrors src)
```

## Security Architecture

### Authentication Flow

```
Login → JWT Access Token (30min) + Encrypted Refresh Token (cookie, 30 days)
Request → Bearer Token in Authorization header → isAuth middleware → req.user
Refresh → Decrypt cookie → Verify JWT → Issue new tokens
```

1. **Login:** User provides email/password. Backend validates, generates JWT access token (returned in body) and refresh token (encrypted with AES-256-GCM, stored as httpOnly cookie).
2. **Authorization:** Requests include `Authorization: Bearer {accessToken}`. The `isAuth` middleware verifies the JWT and populates `req.user` with `{ sub, role }`.
3. **Token Refresh:** Client sends refresh token cookie to `/api/v1/auth/refresh-token`. Backend decrypts, validates, and issues new tokens.
4. **Role-Based Access:** The `authorize(...roles)` middleware checks `req.user.role` against allowed roles.

### CSRF Protection

Uses the **double-submit cookie pattern** via the [`csrf-csrf`](https://github.com/Psifi-Solutions/csrf-csrf) library:

```
Frontend: GET /api/v1/csrf-token → receives token in body + hash in cookie
Frontend: POST /api/v1/resource → sends token in X-CSRF-Token header + cookie
Backend: Validates HMAC(token) matches cookie hash
```

**Smart bypass logic** in `csrfProtection` middleware:

- **Skips** for `GET`, `HEAD`, `OPTIONS` (safe methods)
- **Skips** for Bearer token auth (API clients are inherently CSRF-safe)
- **Skips** when no `refreshToken` cookie exists (no session to protect — Swagger, curl, Postman)
- **Enforces** for state-changing requests with cookie-based sessions

Cookie name: `csrf` (development) or `__Host-csrf` (production, secure prefix).

### Encryption

AES-256-GCM authenticated encryption in `helpers/crypto.helper.ts`:

- **Algorithm:** AES-256-GCM (provides confidentiality + integrity)
- **Key Derivation:** `crypto.scryptSync` with random 16-byte salt per encryption
- **IV:** Random 12-byte initialization vector per encryption
- **Output Format:** `salt:iv:authTag:encrypted` (hex-encoded)
- **Key Source:** `config.encryption.key` (dedicated `ENCRYPTION_KEY` or fallback to `JWT_SECRET`)

### Middleware Stack (Order)

```
1. Swagger UI (before CORS)
2. Helmet (security headers)
3. CORS (configurable origins)
4. Trust proxy
5. Rate limiting (100 req/15min global, 5 req/15min auth)
6. Request ID injection
7. Morgan HTTP logging
8. Compression (gzip)
9. Body parsing (JSON, URL-encoded)
10. Cookie parsing
11. CSRF protection
12. Routes
13. Error handling (404, global error handler)
```

### Rate Limiting

- **Global:** 100 requests per 15 minutes on `/api/v1/*`
- **Auth:** 5 login attempts per 15 minutes
- **Storage:** Redis (with in-memory fallback)
- **Key:** User ID (`req.user.sub`) → IP (`req.ip`) → `'unknown'`

## Design Decisions

### No Base Controller/Service Classes

**Rationale:** Forces inheritance hierarchy, reduces flexibility, harder to test.

**Instead:** Standalone classes with injected dependencies.

### Repository Layer

**Rationale:** Separates query logic from business logic. Makes testing easier, allows query optimization without changing services.

### `new Model()` + `save()` vs `Model.create()`

**Rationale:** Both work, but `save()` provides:

- Instance available for hooks
- Middleware gets document context
- Version checking (\_\_v) on updates
- Consistent pattern for create/update

### `.lean()` for Reads

**Rationale:** Returns plain JavaScript objects:

- 10x faster than Mongoose documents
- Lower memory usage
- No accidental `.save()` on read-only data

### Soft Delete by Default

**Rationale:** Data recovery, audit trails, referential integrity.

- Uses `mongoose-delete` plugin
- Hard delete available when needed
