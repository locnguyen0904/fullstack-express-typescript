# 🚀 Backend Template

A modern, full-stack application template featuring a Node.js/Express backend with TypeScript and a React Admin frontend.

## ✨ Features

- **Architecture**: Scalable Controller-Service-Model (CSM) architecture with Dependency Injection (TypeDI).
- **Validation**: Strict runtime request validation using `zod` and `express-zod-safe`.
- **Documentation**: Code-first OpenAPI/Swagger documentation (`/api-docs`) generated from Zod schemas.
- **Authentication**: Secure JWT-based authentication system with access and refresh tokens.
- **Security**:
  - Helmet for HTTP security headers.
  - Rate limiting for API endpoints.
  - CORS configuration.
- **Logging**: Structured logging with `winston` and daily log rotation.
- **Testing**: Jest setup with `supertest` for integration testing.
- **Database**: MongoDB with Mongoose ODM and pagination support.
- **CI/CD**: GitHub Actions workflows for linting, testing, and building.
- **Developer Experience**:
  - Hot reloading with `nodemon` (backend) and `vite` (frontend).
  - Pre-commit hooks with `husky` and `commitlint`.
  - Consistent code style with `eslint` and `prettier`.

## 🛠 Tech Stack

### 🔙 Backend

- **Runtime**: Node.js & Express
- **Language**: TypeScript
- **Database**: MongoDB & Mongoose
- **Validation**: Zod
- **Documentation**: Swagger UI Express & Zod-to-OpenAPI
- **Dependency Injection**: TypeDI
- **Logging**: Winston

### ⚛️ Frontend

- **Framework**: React 19
- **Admin Framework**: React Admin
- **Build Tool**: Vite
- **Testing**: Vitest

## 📋 Prerequisites

- [Docker (at least 1.10)](https://www.docker.com/)
- [Docker Compose (at least 1.6)](https://docs.docker.com/compose/install/)
- Node.js (v20+) and npm for local development

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend-template
```

### 2. Quick Start (Docker)

The easiest way to run the application is using Docker Compose:

1. **Copy the example environment file:**

   ```bash
   cp .env.example .env
   ```

2. **Build and start the containers:**

   ```bash
   npm run docker:up
   ```

3. **Access the application:**
   - Backend API: <http://localhost:3000/api/v1>
   - API Documentation: <http://localhost:3000/api-docs>
   - Admin Dashboard: <http://localhost:3001>

### 3. Local Development

#### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

#### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
backend-template/
├── backend/                # Node.js Express backend
│   ├── src/
│   │   ├── api/            # API routes, controllers, and validations
│   │   ├── config/         # Configuration files
│   │   ├── core/           # Core functionality and errors
│   │   ├── helpers/        # Helper functions
│   │   ├── middlewares/    # Express middlewares
│   │   ├── services/       # Business logic services
│   │   ├── types/          # TypeScript type definitions
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── tests/              # Test files
│   └── package.json        # Backend dependencies
├── frontend/               # React Admin frontend
│   ├── src/                # Frontend source code
│   └── package.json        # Frontend dependencies
├── .github/                # CI/CD workflows
├── .husky/                 # Git hooks
└── docker-compose.yml      # Docker Compose configuration
```

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
