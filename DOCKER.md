# Docker Guide

This project uses multi-stage Dockerfiles to support both local development and production environments.

## Architecture

- **compose/backend/Dockerfile** - Multi-stage backend Dockerfile with `development` and `production` targets
- **compose/frontend/Dockerfile** - Multi-stage frontend Dockerfile with `development` and `production` targets
- **docker-compose.yml** - Base/shared configuration (images, healthchecks, volumes)
- **docker-compose.override.yml** - Development overrides (auto-loaded with `docker compose up`)
- **docker-compose.prod.yml** - Production overrides (resource limits, logging, prod targets)

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

2. Edit `.env.prod` with your production values:
   - Set a secure JWT secret (at least 32 characters)
   - Update DATABASE_URL if using external database

3. Generate MongoDB keyfile:

```bash
npm run generate:mongo-key
```

> **Linux production note:** The MongoDB keyfile must be readable by the `mongodb` user (UID 999) inside the container. After generating, fix ownership:
> ```bash
> sudo chown 999:999 compose/mongo/keys/keyfile.local
> ```
> This is not required on Docker Desktop (macOS/Windows) which handles file permissions transparently.

4. Set up Cloudflare Origin Certificate:

   1. In Cloudflare dashboard, go to SSL/TLS and set encryption mode to **Full (strict)**
   2. Go to SSL/TLS > Origin Server > Create Certificate
   3. Save the certificate and private key to:

```bash
mkdir -p compose/nginx/ssl
# Paste certificate content into cert.pem
# Paste private key content into key.pem
chmod 600 compose/nginx/ssl/*.pem
```

   - Certificate: `compose/nginx/ssl/cert.pem`
   - Private key: `compose/nginx/ssl/key.pem`
   - Origin Certificates last up to 15 years

5. Create secret files for production passwords:

```bash
mkdir -p secrets
echo "your-mongo-password" > secrets/mongo_root_password.txt
echo "your-redis-password" > secrets/redis_password.txt
chmod 600 secrets/*.txt
```

### Start production services

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d
```

### Build production images

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
```

### View production logs

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

### Stop production services

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
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

- Nginx (HTTPS via Cloudflare): `localhost:443`
- Backend: Internal only (proxied via nginx at `/api/*`)
- Frontend: Internal only (proxied via nginx at `/`)
- MongoDB: Internal only (backend-network)
- Redis: Internal only (backend-network)

## Volume Management

### Development Volumes

- `backend_node_modules` - Backend dependencies (persisted)
- `frontend_node_modules` - Frontend dependencies (persisted)
- `mongo_data` - MongoDB data
- Source code directories are bind-mounted for live reload

### Production Volumes

- `mongo_data` - MongoDB data (persistent, backup priority: critical)
- `redis_data` - Redis persistence data (backup priority: medium)
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
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale backend=3
```

Note: Requires load balancer configuration for proper traffic distribution.
