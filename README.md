# 🚀 Backend Template

[![CI](https://github.com/locnguyen0904/backend-template/actions/workflows/ci.yml/badge.svg)](https://github.com/locnguyen0904/backend-template/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/locnguyen0904/backend-template/branch/main/graph/badge.svg)](https://codecov.io/gh/locnguyen0904/backend-template)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

> Production-ready **Express.js + TypeScript + MongoDB** full-stack template with security best practices, auto-generated API docs, and Docker Compose orchestration.

---

## 🛠 Tech Stack

| Layer | Technology | |
|-------|------------|---|
| **Runtime** | Node.js 24 + TypeScript 5 | ![Node](https://img.shields.io/badge/Node.js-24_LTS-339933?logo=node.js&logoColor=white) |
| **Framework** | Express.js 5 | ![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white) |
| **Database** | MongoDB 8 + Mongoose 8 | ![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white) |
| **Cache** | Redis 6 | ![Redis](https://img.shields.io/badge/Redis-6-DC382D?logo=redis&logoColor=white) |
| **Validation** | Zod 4 | ![Zod](https://img.shields.io/badge/Zod-4-3E67B1?logo=zod&logoColor=white) |
| **API Docs** | OpenAPI 3 (auto-generated) | ![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3-85EA2D?logo=swagger&logoColor=black) |
| **Auth** | JWT + CSRF + AES-256-GCM | ![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white) |
| **DI** | TypeDI | |
| **Testing** | Jest 30 + Supertest | ![Jest](https://img.shields.io/badge/Jest-30-C21325?logo=jest&logoColor=white) |
| **Container** | Docker Compose | ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white) |
| **Frontend** | React Admin 5 + Vite 7 | ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) |

---

## ⚡ Quick Start

```bash
# 1. Clone and setup
git clone <repo-url> my-project
cd my-project
cp .env.example .env

# 2. Start all services
docker compose up -d

# 3. View logs
docker compose logs -f backend
```

### 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| 🔗 Backend API | http://localhost:3000/api/v1 | REST API endpoints |
| 📖 Swagger UI | http://localhost:3000/api-docs | Interactive API docs |
| 💚 Health Check | http://localhost:3000/health | Service health status |
| 🖥 Frontend | http://localhost:3001 | React Admin dashboard |

---

## 🏗 Architecture

```
Request → Routes → Controller → Service → Repository → Model → MongoDB
```

| Layer | File | Responsibility |
|-------|------|----------------|
| 🎮 Controller | `*.controller.ts` | HTTP handling, call services |
| ⚙️ Service | `*.service.ts` | Business logic, uses repository |
| 💾 Repository | `*.repository.ts` | Data access, extends `Repository<T>` |
| 📋 Model | `*.model.ts` | Mongoose schema, TypeScript interface |

---

## 📁 Project Structure

```
backend/src/
├── 📂 api/                    # Feature modules
│   └── {resource}/
│       ├── {resource}.controller.ts
│       ├── {resource}.service.ts
│       ├── {resource}.repository.ts
│       ├── {resource}.model.ts
│       ├── {resource}.validation.ts
│       ├── {resource}.doc.ts
│       └── index.ts
├── 📂 core/                   # Repository base, Response classes, Errors
├── 📂 config/                 # Environment, OpenAPI config
├── 📂 helpers/                # Utilities (asyncHandler, etc.)
├── 📂 middlewares/            # Auth, CSRF, logging, rate limiting
├── 📂 services/               # Shared services (Redis, Logger, Events)
└── 📂 __tests__/              # Test files (mirrors src structure)
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|---------------|
| 🛡 CSRF Protection | Double-submit cookie via `csrf-csrf` |
| 🔑 Authentication | JWT access + encrypted refresh tokens |
| 🔒 Encryption | AES-256-GCM with scrypt key derivation |
| 🚦 Rate Limiting | Redis-backed (100 req/15min, 5 login/15min) |
| 🪖 Security Headers | Helmet.js (CSP, X-Frame-Options, etc.) |
| 🌐 CORS | Configurable allowed origins |
| 🔐 Password Hashing | bcrypt with salt rounds |

---

## 💻 Commands

```bash
# 🐳 Docker
docker compose up -d              # Start all services
docker compose logs -f backend    # View backend logs
docker compose down               # Stop all services

# 🔧 Backend (run from backend/)
npm run dev                       # Start dev server
npm run build                     # Build for production
npm run lint                      # Check linting
npm run lint:fix                  # Fix lint issues
npm run prettier:fix              # Format code
npm test                          # Run tests
npm run test:coverage             # Tests with coverage
npm run seed:dev                  # Seed database
```

---

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|:--------:|
| `DATABASE_URL` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | ✅ |
| `JWT_ACCESS_EXPIRATION_MINUTES` | Access token expiry (default: 30) | |
| `JWT_REFRESH_EXPIRATION_DAYS` | Refresh token expiry (default: 30) | |
| `ENCRYPTION_KEY` | AES-256-GCM key (min 32 chars, defaults to JWT_SECRET) | |
| `REDIS_URL` | Redis connection string | |
| `ALLOWED_ORIGINS` | CORS origins, comma-separated | |
| `PORT` | Server port (default: 3000) | |

---

## ✨ Features

- 🛡 **Security** — Helmet, CSRF protection, rate limiting, CORS, bcrypt, AES-256-GCM encryption
- 🔑 **Auth** — JWT access/refresh tokens, encrypted cookies, role-based access control
- ✅ **Validation** — Zod schemas with auto-generated OpenAPI docs
- 🗄 **Database** — Pagination, soft delete, Redis caching, repository pattern
- 🧪 **Testing** — Jest with 90+ tests
- 🔥 **DX** — Hot reload, path aliases (`@/`), ESLint + Prettier, Docker Compose
- 🖥 **Frontend** — React Admin with CSRF-aware auth flow

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| 📘 [Setup Guide](docs/SETUP.md) | Development environment setup |
| 📐 [Architecture](docs/ARCHITECTURE.md) | Design decisions and patterns |
| 📡 [API Reference](docs/API.md) | Endpoint documentation |
| 🔐 [Security](SECURITY.md) | Security architecture and policy |
| 🤝 [Contributing](CONTRIBUTING.md) | Git flow, code standards |
| 🐳 [Docker](DOCKER.md) | Docker and deployment guide |
| 🚀 [Deployment](docs/DEPLOYMENT.md) | Google Cloud Run deployment |
| 🤖 [Claude AI](CLAUDE.md) | AI coding assistant instructions |

---

## 📄 License

[ISC](LICENSE) © 2026
