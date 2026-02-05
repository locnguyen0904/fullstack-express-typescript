# Backend Template

[![CI](https://github.com/YOUR_USERNAME/backend-template/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/backend-template/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/backend-template/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/backend-template)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

Production-ready Express.js + TypeScript + MongoDB backend template with best practices.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 22 + TypeScript 5 |
| Framework | Express.js 4 |
| Database | MongoDB 8 + Mongoose |
| Cache | Redis 6 |
| Validation | Zod 4 |
| API Docs | OpenAPI 3 (auto-generated) |
| Auth | JWT (access + refresh tokens) |
| DI | TypeDI |
| Testing | Jest 30 + Supertest |
| Container | Docker Compose |

## Quick Start

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

**Access points:**

| Service | URL |
|---------|-----|
| Backend API | http://localhost:3000/api/v1 |
| Swagger UI | http://localhost:3000/api-docs |
| Health Check | http://localhost:3000/health |
| Frontend | http://localhost:3001 |

## Architecture

```
Request → Routes → Controller → Service → Repository → Model → MongoDB
```

| Layer | File | Responsibility |
|-------|------|----------------|
| Controller | `*.controller.ts` | HTTP handling, call services |
| Service | `*.service.ts` | Business logic, uses repository |
| Repository | `*.repository.ts` | Data access, extends `Repository<T>` |
| Model | `*.model.ts` | Mongoose schema, TypeScript interface |

## Project Structure

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
├── helpers/                # Utilities (asyncHandler, etc.)
├── middlewares/            # Auth, logging, rate limiting
├── services/               # Shared services (Redis, Logger, Events)
└── __tests__/              # Test files (mirrors src structure)
```

## Commands

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
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_ACCESS_EXPIRATION_MINUTES` | Access token expiry (default: 30) | No |
| `JWT_REFRESH_EXPIRATION_DAYS` | Refresh token expiry (default: 30) | No |
| `REDIS_URL` | Redis connection string | No |
| `PORT` | Server port (default: 3000) | No |

## Features

- **Security:** Helmet, rate limiting, CORS, bcrypt password hashing
- **Validation:** Zod schemas with auto-generated OpenAPI docs
- **Database:** Pagination, soft delete, Redis caching
- **Testing:** Jest with ~77% coverage
- **DX:** Hot reload, path aliases (`@/`), ESLint + Prettier

## Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](CLAUDE.md) | AI coding assistant instructions |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Git flow, code standards |
| [docs/SETUP.md](docs/SETUP.md) | Detailed development setup |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Design decisions |

## License

ISC
