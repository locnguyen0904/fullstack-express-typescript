# Gemini AI Instructions

> This file provides operational context and rules for Gemini AI when working on this project.

## Project Summary

| Aspect         | Details                             |
| -------------- | ----------------------------------- |
| Type           | Full-stack web application template |
| Backend        | Express.js + TypeScript + MongoDB   |
| Frontend       | React Admin                         |
| Infrastructure | Docker Compose                      |

## Environment Setup

### Prerequisites

- Docker & Docker Compose
- Node.js v20+
- npm or yarn

### Configuration

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Configure required variables
DATABASE_URL=mongodb://localhost:27017/mydb
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
```

## Development Workflow

### Start Development

```bash
# Start all services (DB, Redis, Backend, Frontend)
docker compose up -d

# View logs
docker compose logs -f backend    # Backend only
docker compose logs -f            # All services

# Access applications
# Frontend: http://localhost:3001
# Backend:  http://localhost:3000
# Swagger:  http://localhost:3000/api-docs
```

### Verification Commands

```bash
cd backend

# Linting
npm run lint              # Check for issues
npm run lint:fix          # Auto-fix issues
npm run prettier:fix      # Format code

# Testing
npm test                  # Run all tests
npm test -- --coverage    # With coverage report
npm test -- --watch       # Watch mode

# Building
npm run build             # Production build
```

### Stop Development

```bash
docker compose down       # Stop services
docker compose down -v    # Stop and remove volumes
```

## Source Code Navigation

```
backend/src/
├── server.ts             # Entry point - initializes server
├── app.ts               # App config - middleware & routes
├── api/                 # Feature modules
│   ├── index.ts         # Route aggregation
│   └── {resource}/      # Resource module
│       ├── *.controller.ts
│       ├── *.service.ts
│       ├── *.model.ts
│       ├── *.validation.ts
│       ├── *.doc.ts
│       └── index.ts
├── core/                # Base classes
├── config/              # Configuration
├── helpers/             # Utilities
├── middlewares/         # Express middlewares
└── __tests__/           # Test files
```

## Pre-Commit Checklist

Before committing any code changes, verify:

| Check            | Command         | Expected                    |
| ---------------- | --------------- | --------------------------- |
| ✅ Validation    | Review code     | Zod schemas for all inputs  |
| ✅ Documentation | Review code     | Route registered in OpenAPI |
| ✅ Security      | Review code     | Rate limiting applied       |
| ✅ Tests         | `npm test`      | All tests pass              |
| ✅ Types         | Review code     | Interfaces defined          |
| ✅ Lint          | `npm run lint`  | No errors                   |
| ✅ Build         | `npm run build` | Compiles successfully       |

## Troubleshooting

### Common Issues

| Problem                        | Cause                  | Solution                                           |
| ------------------------------ | ---------------------- | -------------------------------------------------- |
| Swagger UI fails to load       | Registry not populated | Check `backend/src/config/openapi.config.ts`       |
| Backend can't connect to DB    | Services not ready     | Wait for `mongo` container to be "healthy"         |
| Backend can't connect to Redis | Services not ready     | Wait for `redis` container to be "healthy"         |
| Lint errors persist            | Formatting issues      | Run `npm run prettier:fix` then `npm run lint:fix` |
| Tests fail randomly            | Async issues           | Ensure all promises are awaited                    |
| TypeScript errors              | Missing types          | Define interfaces in model files                   |

### Docker Issues

```bash
# Rebuild containers
docker compose build --no-cache

# View container status
docker compose ps

# Check container health
docker compose ps --format "table {{.Name}}\t{{.Status}}"

# Access container shell
docker compose exec backend sh
docker compose exec mongo mongosh
```

### Database Issues

```bash
# Access MongoDB shell
docker compose exec mongo mongosh

# Reset database
docker compose down -v
docker compose up -d
```

## Key Rules Summary

| Rule             | Description                                 |
| ---------------- | ------------------------------------------- |
| CSM Architecture | Controller → Service → Model pattern        |
| Strict Typing    | `noImplicitAny` enabled, all types required |
| Validation First | Zod validation at route level               |
| Code-First Docs  | Use `zod-to-openapi`, no manual YAML        |
| Async/Await      | No callbacks or `.then()` chains            |
| Error Handling   | Use `AppError`/`NotFoundError` classes      |
| DI with typedi   | All services use dependency injection       |
