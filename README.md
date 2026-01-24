# 🚀 Backend Template

A modern, production-ready full-stack application template featuring a Node.js/Express backend with TypeScript and a React Admin frontend.

## ✨ Features

### 🏗️ Architecture

- **Controller-Service-Model (CSM)** pattern with clean separation of concerns
- **Dependency Injection** using TypeDI for loose coupling and testability
- **Barrel exports** for clean, organized imports (`@/core`, `@/middlewares`)
- **Base classes** (`Controller`, `Service`) to reduce boilerplate

### 🔒 Security

- **Helmet** for HTTP security headers
- **Rate limiting** with configurable limits per endpoint
- **CORS** configuration
- **JWT authentication** with access/refresh token pattern
- **Password hashing** with bcrypt

### ✅ Validation & Documentation

- **Zod schemas** for runtime request validation
- **OpenAPI/Swagger** documentation auto-generated from Zod schemas (`/api-docs`)
- **express-zod-safe** for type-safe request handling

### 📊 Database & Caching

- **MongoDB** with Mongoose ODM
- **Pagination** support with `mongoose-paginate-v2`
- **Soft delete** with `mongoose-delete` and `includeDeleted` query filtering
- **Redis caching** (optional) with cache invalidation

### 🧪 Testing

- **Jest** test framework with ~77% code coverage
- **100 unit tests** for core modules
- Organized test structure in `__tests__/` directory
- Coverage reporting with thresholds

### 🔧 Developer Experience

- **Hot reloading** with `nodemon` (backend) and `vite` (frontend)
- **Path aliases** (`@/`) for cleaner imports
- **Pre-commit hooks** with `husky` and `commitlint`
- **ESLint + Prettier** for consistent code style
- **Structured logging** with `winston` and daily log rotation

## 🛠 Tech Stack

### Backend

| Category      | Technology                 |
| ------------- | -------------------------- |
| Runtime       | Node.js 20+                |
| Framework     | Express 4.x                |
| Language      | TypeScript 5.x             |
| Database      | MongoDB 8.x, Mongoose      |
| Validation    | Zod 4.x                    |
| Documentation | Swagger UI, zod-to-openapi |
| DI Container  | TypeDI                     |
| Caching       | Redis (ioredis)            |
| Logging       | Winston                    |
| Testing       | Jest 30.x, Supertest       |

### Frontend

| Category   | Technology      |
| ---------- | --------------- |
| Framework  | React 19        |
| Admin UI   | React Admin 5.x |
| Build Tool | Vite 7.x        |
| Testing    | Vitest          |

## 📋 Prerequisites

- **Docker** (>= 1.10) & **Docker Compose** (>= 1.6)
- **Node.js** (v20+) for local development

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend-template
```

### 2. Quick Start (Docker)

```bash
# Copy environment file
cp .env.example .env

# Start all services
npm run docker:up
```

**Access points:**
| Service | URL |
|---------|-----|
| Backend API | http://localhost:3000/api/v1 |
| API Docs | http://localhost:3000/api-docs |
| Health Check | http://localhost:3000/health |
| Admin Dashboard | http://localhost:3001 |

### 3. Local Development

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📂 Project Structure

```
backend-template/
├── backend/
│   ├── src/
│   │   ├── __tests__/       # Unit & integration tests
│   │   │   ├── api/         # API-specific tests
│   │   │   ├── core/        # Core module tests
│   │   │   ├── helpers/     # Helper function tests
│   │   │   └── middlewares/ # Middleware tests
│   │   ├── api/             # Feature modules
│   │   │   ├── auth/        # Authentication
│   │   │   ├── users/       # User management
│   │   │   ├── examples/    # Example CRUD module
│   │   │   └── health/      # Health check endpoint
│   │   ├── common/          # Shared schemas & constants
│   │   ├── config/          # App configuration
│   │   ├── core/            # Base classes & error types
│   │   │   ├── index.ts     # Barrel exports
│   │   │   ├── controller.core.ts
│   │   │   ├── service.core.ts
│   │   │   ├── response-error.core.ts
│   │   │   └── response-success.core.ts
│   │   ├── db/              # Database seeds
│   │   ├── helpers/         # Utility functions
│   │   ├── middlewares/     # Express middlewares
│   │   ├── services/        # Shared services (cache, logger, events)
│   │   ├── types/           # TypeScript declarations
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entry point
│   ├── jest.config.js       # Jest configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Admin pages
│   │   ├── components/      # Reusable components
│   │   ├── utils/           # Utility functions
│   │   └── validates/       # Form validations
│   └── package.json
├── compose/                  # Docker compose configs
├── .github/workflows/        # CI/CD pipelines
├── .husky/                   # Git hooks
├── docker-compose.yml
└── package.json              # Root scripts
```

## 📜 Available Scripts

### Root Level

```bash
npm run docker:up       # Start all containers
npm run docker:down     # Stop all containers
npm run backend:test    # Run backend tests
npm run backend:lint    # Lint backend code
```

### Backend (`cd backend`)

```bash
npm run dev             # Start dev server with hot reload
npm run build           # Build for production
npm test                # Run tests
npm run test:coverage   # Run tests with coverage report
npm run lint            # Check for lint errors
npm run lint:fix        # Auto-fix lint errors
npm run seed:dev        # Seed database (development)
```

### Frontend (`cd frontend`)

```bash
npm run dev             # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm test                # Run tests
npm run lint            # Check for lint errors
```

## 🧪 Test Coverage

Current coverage statistics:
| Metric | Coverage |
|--------|----------|
| Statements | ~77% |
| Branches | ~62% |
| Functions | ~63% |
| Lines | ~77% |

## 🔐 Environment Variables

| Variable                        | Description                          | Required |
| ------------------------------- | ------------------------------------ | -------- |
| `DATABASE_URL`                  | MongoDB connection string            | ✅       |
| `JWT_SECRET`                    | Secret for JWT signing               | ✅       |
| `JWT_ACCESS_EXPIRATION_MINUTES` | Access token expiry (default: 30)    | ❌       |
| `JWT_REFRESH_EXPIRATION_DAYS`   | Refresh token expiry (default: 30)   | ❌       |
| `REDIS_URL`                     | Redis connection string              | ❌       |
| `PORT`                          | Server port (default: 3000)          | ❌       |
| `NODE_ENV`                      | Environment (development/production) | ❌       |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your commits follow [Conventional Commits](https://www.conventionalcommits.org/).

## 📄 License

This project is licensed under the ISC License.
