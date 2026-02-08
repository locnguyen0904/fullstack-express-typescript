# 🚀 Backend Template

[![CI](https://github.com/locnguyen0904/backend-template/actions/workflows/ci.yml/badge.svg)](https://github.com/locnguyen0904/backend-template/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/locnguyen0904/backend-template/branch/main/graph/badge.svg)](https://codecov.io/gh/locnguyen0904/backend-template)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

Production-ready Express.js + TypeScript + MongoDB backend template with best practices.

## 🛠 Tech Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Runtime       | Node.js 24 + TypeScript 5                       |
| Framework     | Express.js 5                                    |
| Database      | MongoDB 8 + Mongoose                            |
| Cache         | Redis 6                                         |
| Validation    | Zod 4                                           |
| API Docs      | OpenAPI 3 (auto-generated)                      |
| Auth          | JWT (access + refresh tokens, token revocation) |
| DI            | tsyringe (Microsoft)                            |
| Logging       | Pino (JSON stdout)                              |
| Jobs          | BullMQ + Bull Board UI                          |
| Observability | OpenTelemetry (opt-in)                          |
| Testing       | Jest 30 + Supertest + mongodb-memory-server     |
| Container     | Docker Compose                                  |

## ⚡ Quick Start

```bash
# Clone and setup
git clone <repo-url> my-project
cd my-project
cp .env.example .env

# Start all services
docker compose up -d

# View logs
docker compose logs -f backend
```

**🌐 Access points:**

| Service             | URL                                |
| ------------------- | ---------------------------------- |
| Backend API         | http://localhost:3000/api/v1       |
| Swagger UI          | http://localhost:3000/api-docs     |
| Health Check        | http://localhost:3000/health       |
| Bull Board (Queues) | http://localhost:3000/admin/queues |
| Frontend            | http://localhost:3001              |

## 🏗 Architecture

```
Request → Routes → Controller → Service → Repository → Model → MongoDB
```

| Layer      | File              | Responsibility                        |
| ---------- | ----------------- | ------------------------------------- |
| Controller | `*.controller.ts` | HTTP handling, call services          |
| Service    | `*.service.ts`    | Business logic, uses repository       |
| Repository | `*.repository.ts` | Data access, extends `Repository<T>`  |
| Model      | `*.model.ts`      | Mongoose schema, TypeScript interface |

## 📁 Project Structure

```
backend/src/
├── api/                    # Feature modules
│   └── {resource}/
│       ├── {resource}.controller.ts
│       ├── {resource}.service.ts
│       ├── {resource}.repository.ts
│       ├── {resource}.model.ts
│       ├── {resource}.validation.ts
│       ├── {resource}.doc.ts
│       └── index.ts
├── core/                   # Repository base, Response classes, Errors
├── config/                 # Environment, OpenAPI config
├── helpers/                # Utilities (Error handling)
├── middlewares/            # Auth, CSRF, logging, rate limiting
├── services/               # Shared services (Redis, Logger, Events, TokenBlacklist)
├── jobs/                   # BullMQ queues and workers
└── __tests__/              # Test files (mirrors src structure)
```

## 💻 Commands

```bash
# Docker
docker compose up -d              # Start all services
docker compose logs -f backend    # View backend logs
docker compose down               # Stop all services

# Backend (run from backend/)
npm run dev                       # Start dev server
npm run build                     # Build for production
npm run lint                      # Check linting
npm run lint:fix                  # Fix lint issues
npm run prettier:fix              # Format code
npm test                          # Run tests
npm run test:coverage             # Tests with coverage
npm run seed:dev                  # Seed database
npm run generate                  # Generate new API module (Plop)
```

## 🔑 Environment Variables

| Variable                        | Description                           | Required |
| ------------------------------- | ------------------------------------- | -------- |
| `DATABASE_URL`                  | MongoDB connection string             | Yes      |
| `JWT_SECRET`                    | Secret for JWT signing                | Yes      |
| `JWT_ACCESS_EXPIRATION_MINUTES` | Access token expiry (default: 30)     | No       |
| `JWT_REFRESH_EXPIRATION_DAYS`   | Refresh token expiry (default: 30)    | No       |
| `REDIS_URL`                     | Redis connection string               | No       |
| `PORT`                          | Server port (default: 3000)           | No       |
| `LOG_LEVEL`                     | Pino log level (default: info)        | No       |
| `OTEL_ENABLED`                  | Enable OpenTelemetry (default: false) | No       |
| `OTEL_EXPORTER_ENDPOINT`        | OTLP exporter URL                     | No       |

## ✨ Features

- 🔒 **Security:** Helmet, CSRF (double submit cookie), rate limiting, CORS, Argon2 password hashing, JWT token revocation
- ✅ **Validation:** Zod schemas with auto-generated OpenAPI docs
- 🗄️ **Database:** Pagination, soft delete, Redis caching
- 🚨 **Errors:** RFC 9457 Problem Details (`application/problem+json`)
- 📝 **Logging:** Pino (JSON stdout, 12-Factor compliant)
- ⚙️ **Jobs:** BullMQ background queues with Bull Board monitoring UI
- 📊 **Observability:** OpenTelemetry auto-instrumentation (opt-in)
- 🧪 **Testing:** Jest with mongodb-memory-server (no external DB needed), 68 tests
- 🛠️ **DX:** tsx hot reload, Plop module scaffolding, lint-staged, path aliases (`@/`)

## 📚 Documentation

| Document                                     | Description                      |
| -------------------------------------------- | -------------------------------- |
| [CLAUDE.md](CLAUDE.md)                       | AI coding assistant instructions |
| [CONTRIBUTING.md](CONTRIBUTING.md)           | Git flow, code standards         |
| [docs/SETUP.md](docs/SETUP.md)               | Detailed development setup       |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Design decisions                 |
| [docs/adr/](docs/adr/)                       | Architectural Decision Records   |

## 📄 License

ISC © Loc Nguyen
