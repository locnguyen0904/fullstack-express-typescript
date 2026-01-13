# Docker Guide

This project uses multi-stage Dockerfiles to support both local development and production environments.

## Architecture

- **compose/backend/Dockerfile** - Multi-stage backend Dockerfile with `development` and `production` targets
- **compose/frontend/Dockerfile** - Multi-stage frontend Dockerfile with `development` and `production` targets
- **docker-compose.yml** - Local development configuration
- **docker-compose.prod.yml** - Production configuration

## Local Development

### Start all services

```bash
docker compose up -d
```

### Build specific service

```bash
docker compose build backend
docker compose build frontend
```

### View logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### Stop all services

```bash
docker compose down
```

### Clean up (remove volumes)

```bash
docker compose down -v
```

## Production Deployment

### Prerequisites

1. Copy environment variables:

```bash
cp .env.prod.example .env.prod
```

1. Edit `.env.prod` with your production values:
   - Set strong passwords for MongoDB and Redis
   - Set a secure JWT secret (at least 32 characters)
   - Update DATABASE_URL if using external database

### Start production services

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### Build production images

```bash
docker compose -f docker-compose.prod.yml build
```

### View production logs

```bash
docker compose -f docker-compose.prod.yml logs -f
```

### Stop production services

```bash
docker compose -f docker-compose.prod.yml down
```

## Docker Build Targets

### Backend

**Development target:**

```bash
docker build --target development -f compose/backend/Dockerfile -t backend:dev .
```

- Uses nodemon for hot reload
- Includes dev dependencies
- Exposes debugger port 9229
- Source code mounted as volume

**Production target:**

```bash
docker build --target production -f compose/backend/Dockerfile -t backend:prod .
```

- Compiled TypeScript (dist folder)
- Only production dependencies
- Optimized image size
- Includes health checks
- Uses dumb-init for proper signal handling

### Frontend

**Development target:**

```bash
docker build --target development -f compose/frontend/Dockerfile -t frontend:dev .
```

- Vite dev server with HMR
- Source code mounted as volume
- All dev dependencies included

**Production target:**

```bash
docker build --target production -f compose/frontend/Dockerfile -t frontend:prod .
```

- Static build served by nginx
- Optimized bundle size
- Includes health checks

## Port Mapping

### Development

- Backend: `localhost:3000`
- Backend Debugger: `localhost:9229`
- Frontend: `localhost:3001`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

### Production

- Backend: `localhost:3000`
- Frontend: `localhost:80`
- MongoDB: `localhost:27017` (consider restricting in production)
- Redis: `localhost:6379` (consider restricting in production)

## Volume Management

### Development Volumes

- `backend_node_modules` - Backend dependencies (persisted)
- `frontend_node_modules` - Frontend dependencies (persisted)
- `mongo_data` - MongoDB data
- Source code directories are bind-mounted for live reload

### Production Volumes

- `mongo_data` - MongoDB data (persistent)
- No source code volumes (built into images)

## Best Practices

1. **Security**
   - Never commit `.env.prod` file
   - Use strong passwords in production
   - Restrict database ports in production (don't expose to host)
   - Use secrets management in production (Docker secrets, vault, etc.)

2. **Image Optimization**
   - Multi-stage builds reduce final image size
   - Production images only contain necessary files
   - Layer caching optimizes build time

3. **Health Checks**
   - Backend includes HTTP health check
   - Frontend includes nginx health check
   - Database services include ping health checks

4. **Logging**
   - Production uses JSON file driver with rotation
   - Maximum 3 log files of 10MB each

## Troubleshooting

### Backend not starting

```bash
docker compose logs backend
# Check environment variables
docker compose exec backend env
```

### Database connection issues

```bash
# Check MongoDB health
docker compose exec mongo mongosh --eval "db.adminCommand('ping')"
```

### Frontend build errors

```bash
docker compose logs frontend
# Rebuild without cache
docker compose build --no-cache frontend
```

### Permission issues

```bash
# All containers run as non-root user (app:1001)
# Check file ownership if mounting volumes
```

## Advanced Usage

### Run specific command in container

```bash
docker compose exec backend npm run test
docker compose exec backend npm run lint
```

### Access container shell

```bash
docker compose exec backend sh
docker compose exec mongo mongosh
```

### Rebuild specific service

```bash
docker compose up -d --build backend
```

### Scale services (production)

```bash
docker compose -f docker-compose.prod.yml up -d --scale backend=3
```

Note: Requires load balancer configuration for proper traffic distribution.
