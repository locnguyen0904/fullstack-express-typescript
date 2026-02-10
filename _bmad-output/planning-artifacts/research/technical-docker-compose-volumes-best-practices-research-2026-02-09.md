---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'Docker Compose volumes and configuration best practices for local and production'
research_goals: 'Review docker compose local and prod configurations, identify missing volumes and best practice improvements'
user_name: 'Loc Nguyen'
date: '2026-02-09'
web_research_enabled: true
source_verification: true
---

# Research Report: technical

**Date:** 2026-02-09
**Author:** Loc Nguyen
**Research Type:** technical

---

## Research Overview

[Research overview and methodology will be appended here]

---

## Technical Research Scope Confirmation

**Research Topic:** Docker Compose volumes and configuration best practices for local and production
**Research Goals:** Review docker compose local and prod configurations, identify missing volumes and best practice improvements

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-02-09

## Technology Stack Analysis

### Volume Types and Storage Mechanisms

Docker Compose supports three primary storage mechanisms, each suited for different use cases:

**Named Volumes** - Managed entirely by Docker, platform-independent, and abstract the storage location. Ideal for production because they simplify backup, restore, and migration. By default, `docker-compose down` preserves named volumes; you must explicitly add `--volumes` flag to delete them.
_Key advantage: On macOS, named volumes are 3.5x faster than bind mounts because they avoid the Docker Desktop VM file-sharing boundary._
_Source: [Docker Docs - Volumes](https://docs.docker.com/engine/storage/volumes/)_

**Bind Mounts** - Map a host directory directly into the container. Essential for development (live code reloading) but slower on macOS and less portable for production.
_macOS performance: VirtioFS (Docker Desktop 4.6+) reduces bind mount overhead significantly - MySQL imports 90% faster, `composer install` 87% faster, TypeScript app boot 80% faster compared to gRPC-FUSE._
_Source: [Docker Docs - Bind Mounts](https://docs.docker.com/engine/storage/bind-mounts/), [Docker Blog - VirtioFS](https://www.docker.com/blog/speed-boost-achievement-unlocked-on-docker-desktop-4-6-for-mac/)_

**tmpfs Mounts** - Memory-backed, temporary storage. Data is lost when the container stops. Best for sensitive data (secrets, session files) or non-persistent state data where disk write performance matters.
_Security: Pair tmpfs with `nosuid` and `noexec` mount options to reduce attack surface._
_Source: [Docker Docs - tmpfs](https://docs.docker.com/engine/storage/tmpfs/)_

### Database and Storage Technologies

#### MongoDB Volume Best Practices

MongoDB stores data at `/data/db` by default. Named volumes mapped to this path ensure data survives container recreation.
_Production considerations: Use replica sets for redundancy, configure WiredTiger storage engine, and separate config/keyfile volumes from data volumes._
_Backup strategy: Use `mongodump` via `docker exec` for binary exports, or volume-level backups with tools like `offen/docker-volume-backup`._
_Source: [MongoDB Docker Compatibility](https://www.mongodb.com/compatibility/docker), [DataCamp - MongoDB in Docker](https://www.datacamp.com/tutorial/running-mongodb-in-docker)_

#### Redis Volume Persistence

Redis persistence requires explicit volume configuration at `/data`. Without a volume, all cached data is lost on container restart.
_AOF (Append Only File): Provides durability with `appendonly yes` and `appendfsync everysec`. AOF files can grow large; periodic rewrites compact them._
_RDB (Snapshotting): Creates point-in-time snapshots. Recommended save policies: `save 900 1`, `save 300 10`, `save 60 10000`._
_Best practice: Enable both AOF and RDB for production - AOF for durability, RDB for faster restarts and smaller backup files._
_Source: [Redis Persistence on Docker - Medium](https://medium.com/redis-with-raphael-de-lio/understanding-persistence-in-redis-aof-rdb-on-docker-dcc176ea439), [Running Redis in Docker](https://www.dragonflydb.io/guides/running-redis-in-docker-a-practical-guide)_

### Development Tools and Platforms

#### Docker Desktop and VirtioFS (macOS)

Docker Desktop 4.6+ with VirtioFS provides substantial performance improvements for bind mounts on macOS. The Apple Virtualization Framework with file synchronization reduces operation times by ~59% over standard Docker-VZ.
_Hybrid approach recommended: Named volumes for `node_modules` and build artifacts, bind mounts for source code only._
_Source: [Docker on MacOS Performance 2025](https://www.paolomainardi.com/posts/docker-performance-macos-2025/), [Jeff Geerling - VirtioFS](https://www.jeffgeerling.com/blog/2022/new-docker-mac-virtiofs-file-sync-4x-faster)_

#### Backup Tools

- **Docker Desktop 4.29+**: Built-in volume backup in the Volumes tab
- **offen/docker-volume-backup**: Recurring or one-off backups as a container service
- **Cron + shell scripts**: Automated backups with `rsync` or AWS CLI for cloud offloading
_Source: [Docker Backup Strategies 2025](https://portalzine.de/docker-backup-strategies-for-2025-protecting-your-container-environment/), [Automated Docker Volume Backups](https://www.thepolyglotdeveloper.com/2025/05/easy-automated-docker-volume-backups-database-friendly/)_

### Security Best Practices for Volumes

**Read-only mounts**: Append `:ro` to volumes that don't need write access to reduce exposure risk.
**Secrets management**: Use Docker secrets (mounted at `/run/secrets/`) instead of environment variables - they're encrypted at rest and mounted on tmpfs, never persisted to disk.
**Container hardening**: Apply `security_opt: no-new-privileges`, `cap_drop: ALL` with selective `cap_add`, `read_only` root filesystem, and tmpfs with `noexec,nosuid`.
**Monitoring**: Set alerts when volume storage reaches 80% capacity to prevent service interruptions.
_Source: [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html), [Docker Secrets Docs](https://docs.docker.com/engine/swarm/secrets/)_

### Technology Adoption Trends

_Volume management evolution: Named volumes are the established default for production data. The trend is toward combining volume types strategically - named volumes for persistent data, bind mounts for development code, tmpfs for sensitive/ephemeral data._
_Backup automation: Tools like `offen/docker-volume-backup` and Docker Desktop built-in backups are replacing manual cron-based approaches._
_Configuration management: Storing Docker Compose files and env templates in Git remains the standard; `.env.example` files with documented variables are best practice._
_Source: [12 Best Practices for Docker Volume Management](https://www.devopstraininginstitute.com/blog/12-best-practices-for-docker-volume-management), [Docker Compose Volumes Guide](https://compose-it.top/posts/docker-compose-volumes)_

## Integration Patterns Analysis

### Inter-Service Volume Sharing

Docker Compose enables volume sharing between services by declaring named volumes at the top level and mounting them into multiple services. This is the primary mechanism for file-based data exchange between containers.

**Shared Volume Pattern:**
Multiple services reference the same named volume (e.g., `uploads:/var/www/html/uploads`). This enables real-time file exchange for use cases like image processing, log aggregation, or shared configuration.
_Access control: Use `:ro` suffix for read-only consumers to prevent accidental writes. Align container user IDs when sharing volumes to avoid permission conflicts._
_Source: [Docker Docs - Compose Volumes](https://docs.docker.com/reference/compose-file/volumes/), [Baeldung - Share Volume](https://www.baeldung.com/ops/docker-share-volume-multiple-containers)_

**Current Project Gap:** Your configurations don't use shared volumes between services (e.g., no shared upload or static asset volume between backend and frontend). This is fine for the current architecture where frontend communicates with backend via HTTP API.

### Service Networking and DNS

Docker Compose's built-in DNS enables service-to-service communication using service names as hostnames. Services on the same network resolve each other automatically.

**Best Practices Applied to Your Config:**
- Your services correctly use a shared `app-network` bridge network
- MongoDB connection uses `mongo:27017` (service name, not IP) - correct pattern
- Redis connection uses `redis:6379` - correct pattern
- No ports need exposing between services on the same network; `ports` are only needed for host access

**Network Isolation Consideration:** For production, consider separating into `frontend-network` and `backend-network` so frontend can only reach backend, not directly access mongo/redis.
_Source: [Docker Docs - Networking](https://docs.docker.com/compose/how-tos/networking/), [Netdata - Docker Compose Networking](https://www.netdata.cloud/academy/docker-compose-networking-mysteries/)_

### Service Dependencies and Health Checks

The `depends_on` with `condition: service_healthy` pattern ensures services start only after their dependencies are truly ready, not just started.

**Your Current Config Analysis:**
- `mongo`: Has a robust healthcheck using `mongosh` to verify replica set status - good practice
- `redis`: Uses `redis-cli ping` - correct and lightweight
- `backend`: Uses `condition: service_healthy` for both mongo and redis - correct
- `frontend`: Uses basic `depends_on: backend` without health condition

**Recommended Improvement:** Add a healthcheck to `backend` and update frontend's dependency to `condition: service_healthy`. This ensures frontend only starts when backend is actually serving requests, not just when the container is running.

**Production Tuning:** Your prod config correctly uses longer intervals (30s vs 10s) and start periods (15s vs 5s) for mongo, which accounts for slower startup in resource-constrained production environments.
_Source: [Docker Docs - Startup Order](https://docs.docker.com/compose/how-tos/startup-order/), [Health Checks Practical Guide](https://www.tvaidyan.com/2025/02/13/health-checks-in-docker-compose-a-practical-guide/)_

### Environment Variables and Secrets Management

**Your Current Approach:**
- Local: Uses `.env` file via `env_file` directive + inline `environment` for some services
- Production: Uses `.env.prod` file
- Some defaults provided via `${VAR:-default}` syntax

**Security Concerns Identified:**
1. **Default passwords in compose file**: `MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD:-password123}` exposes a default credential in local dev
2. **Production compose has no default for `MONGO_INITDB_ROOT_PASSWORD`** - good, forces explicit configuration
3. **Redis password in production** uses `${REDIS_PASSWORD}` env var - exposed in process listing and `docker inspect`

**Best Practice: Use Docker Compose Secrets for Production:**
Secrets are mounted as files at `/run/secrets/<name>` on a tmpfs filesystem, never written to disk. Applications read the secret from file instead of environment variables.
_Pattern: Check for `_FILE` suffix env var containing file path, read secret from file if present, fall back to env var for dev._
_Source: [Docker Docs - Compose Secrets](https://docs.docker.com/compose/how-tos/use-secrets/), [Docker Docs - Environment Variables Best Practices](https://docs.docker.com/compose/how-tos/environment-variables/best-practices/)_

### Integration Security Patterns

**Network-Level Isolation:**
- Production services should not expose ports to host unless necessary (your prod Redis and Mongo correctly omit host port mappings)
- Use internal networks for database services that shouldn't be accessible from outside

**Volume-Level Security:**
- Mount config files and keyfiles as `:ro` to prevent tampering
- Use tmpfs for sensitive runtime data (session files, temporary credentials)
- Production containers should run with `read_only` root filesystem where possible

**Container Hardening (Production):**
- `security_opt: [no-new-privileges:true]` - prevents privilege escalation
- `cap_drop: [ALL]` with selective `cap_add` - minimizes Linux capabilities
- Your prod config correctly includes resource limits (`deploy.resources`) but lacks these security hardening options
_Source: [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html), [Phase - Docker Compose Secrets Guide](https://phase.dev/blog/docker-compose-secrets/)_

## Architectural Patterns and Design

### Multi-Environment Architecture

Your project uses **separate compose files** (`docker-compose.yml` for dev, `docker-compose.prod.yml` for production) - a valid approach. However, there are more modern patterns to consider:

**Override Files Pattern (Recommended):**
Use a base `docker-compose.yml` with `docker-compose.override.yml` for local dev (auto-loaded by Docker Compose) and `docker-compose.prod.yml` for production overrides. This eliminates duplication between files - shared service definitions live in the base file, environment-specific tweaks in overrides.
_Merge rules: Scalar values replaced by overrides, arrays extend, environment variables favor later values for same keys, volumes allow new paths while overwriting same-path volumes._
_Source: [Docker Docs - Use Compose in Production](https://docs.docker.com/compose/how-tos/production/), [Docker Approaches to Multiple Environments](https://www.simplethread.com/docker-approaches-to-multiple-environments/)_

**Compose Profiles Pattern:**
Docker Compose V2 supports profiles to selectively activate services within a single file: `profiles: [dev]` on debug tools, `profiles: [prod]` on monitoring. Services without profiles always start.
_Source: [Collabnix - Compose Profiles](https://collabnix.com/leveraging-compose-profiles-for-dev-prod-test-and-staging-environments/)_

**Your Current Gap:** Both files duplicate the full service definitions for mongo, redis, backend, frontend. Shared configuration (healthchecks, networks, base environment) is repeated, making maintenance error-prone.

### Volume Architecture Design Principles

**Separate Data by Lifecycle:**
Each data type should have its own volume with appropriate backup and retention strategies:

| Volume Purpose | Volume Name | Backup Priority | Retention |
|---|---|---|---|
| Database data | `mongo_data` | Critical | Long-term |
| Cache/session data | `redis_data` | Medium | Short-term |
| User uploads | `uploads` | Critical | Long-term |
| Application logs | `app_logs` | Low | Rotate weekly |
| Config files | Read-only bind mounts | N/A (in Git) | Version controlled |

**Your Current Gap:**
- `redis_data` volume: **Missing entirely** - Redis data lost on container restart
- `uploads` volume: Not defined (if your app handles file uploads)
- `app_logs` volume: Not defined (logs only accessible via `docker logs`)
- Config/keyfile volumes: MongoDB keyfile baked into Dockerfile rather than mounted

_Source: [Docker Docs - Volumes](https://docs.docker.com/engine/storage/volumes/), [Semaphore - Docker Volumes](https://semaphore.io/blog/docker-volumes)_

### Reverse Proxy and SSL Architecture

**Current Gap:** Your production config exposes the backend directly on port 3000 and frontend on port 80. A production deployment typically needs:

**Nginx Pattern (Simple):**
An nginx reverse proxy container handles SSL termination, forwards requests to backend/frontend services by service name, and serves static assets.

**Traefik Pattern (Dynamic):**
Traefik auto-discovers services via Docker labels, handles Let's Encrypt SSL certificates automatically, and supports dynamic routing without manual config updates.
_Recommendation: For a template project, nginx is simpler and more widely understood. Traefik shines when running many services with frequent changes._
_Source: [Nginx Reverse Proxy with Docker](https://oneuptime.com/blog/post/2026-01-16-docker-nginx-reverse-proxy/view), [Traefik Docker Compose Guide](https://www.simplehomelab.com/traefik-docker-compose-guide-2024/)_

### Scalability Architecture

**Horizontal Scaling with Replicas:**
Docker Compose supports `deploy.replicas` to run multiple instances of a service. For your Node.js backend, this enables horizontal scaling behind a load balancer.

```yaml
deploy:
  replicas: 3
  resources:
    limits:
      memory: 512M
```

**Considerations for Your Architecture:**
- Backend must be stateless (no in-process sessions) - use Redis for session storage (already in your stack)
- When using replicas, remove `container_name` (must be unique, conflicts with multiple instances)
- A reverse proxy (nginx/Traefik) is required to distribute traffic across replicas
- MongoDB replica set is already configured (good for production readiness)

_Resource rule of thumb: Cap memory per container to ~70% of host RAM divided by replica count._
_Source: [Scaling Express.js with Docker Compose](https://moldstud.com/articles/p-scaling-expressjs-applications-with-docker-compose-a-comprehensive-guide), [Docker Compose Deploy Spec](https://docs.docker.com/reference/compose-file/deploy/)_

### Security Architecture Patterns

**Defense-in-Depth for Docker Compose Production:**

1. **Network isolation**: Separate frontend-network (frontend + backend) from backend-network (backend + mongo + redis). Frontend should never reach databases directly.
2. **Read-only filesystem**: Set `read_only: true` on containers, use tmpfs for `/tmp` and other writable paths.
3. **No new privileges**: `security_opt: [no-new-privileges:true]` on all services.
4. **Capability dropping**: `cap_drop: [ALL]` then selectively `cap_add` only what's needed.
5. **Non-root users**: Containers should run as non-root users (your Dockerfiles should use `USER` directive).
6. **Secrets over env vars**: Use `secrets:` top-level key for passwords, API keys.

**Your Current State:**
- Production has resource limits (good)
- Production has logging configuration (good)
- Missing: network isolation, read-only fs, security_opt, cap_drop, secrets
_Source: [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html), [Nick Janetakis - Production Ready Docker Compose](https://nickjanetakis.com/blog/best-practices-around-production-ready-web-apps-with-docker-compose)_

### Data Architecture Patterns

**Volume Naming Convention:**
Use a consistent naming scheme that indicates purpose and environment:
- `{project}_mongo_data` - Database persistent storage
- `{project}_redis_data` - Cache persistent storage
- `{project}_uploads` - User-generated content
- `{project}_logs` - Application logs

**Volume Labels and Documentation:**
Label volumes with metadata for management tooling:
```yaml
volumes:
  mongo_data:
    labels:
      com.project.description: "MongoDB data directory"
      com.project.backup: "critical"
```

**Backup Architecture:**
- Critical volumes (mongo_data, uploads): Daily backups with 30-day retention
- Medium volumes (redis_data): Weekly backups with 7-day retention
- Low volumes (logs): Rotate, no backup needed
_Source: [Docker Volume Management Best Practices](https://www.devopstraininginstitute.com/blog/12-best-practices-for-docker-volume-management), [Docker Compose Volumes Guide](https://www.devopsroles.com/docker-compose-volumes-a-comprehensive-guide/)_

## Implementation Approaches and Technology Adoption

### Migration Strategy: Refactoring to Override Files

**Recommended approach: Incremental migration** from separate compose files to the override pattern.

**Step 1 - Extract shared base configuration:**
Move common service definitions (mongo, redis with shared healthchecks/networks) into the base `docker-compose.yml`. Keep only what's truly shared.

**Step 2 - Create `docker-compose.override.yml` for development:**
Move dev-specific settings: bind mounts for source code, debug ports (9229), `target: development`, `stdin_open`/`tty`. This file is auto-loaded by `docker compose up` - no `-f` flag needed.

**Step 3 - Slim down `docker-compose.prod.yml`:**
Only production overrides remain: `target: production`, resource limits, logging config, security hardening. Run with `docker compose -f docker-compose.yml -f docker-compose.prod.yml up`.

**Merge rules to remember:**
- Single-value options (image, command, mem_limit): new value replaces old
- Multi-value options (ports, expose, dns): values concatenate
- environment, labels, volumes: merge with local values taking precedence
- Use `docker compose config` to review the merged result before deploying

_Source: [Docker Docs - Merge Compose Files](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/), [Override Values When Merging](https://mwop.net/blog/2025-04-04-docker-compose-override.html)_

### CI/CD Integration

**GitHub Actions Pipeline for Docker Compose:**

1. **Build stage**: Build images with `docker compose build`, leverage build cache with `--cache-from`
2. **Test stage**: Spin up services with `docker compose up -d`, wait for healthchecks, run integration tests, tear down with `docker compose down`
3. **Push stage**: Tag and push images to container registry (GHCR or Docker Hub)
4. **Deploy stage**: SSH to production, pull new images, `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

**Security in CI/CD:**
- Scan images for vulnerabilities using `docker scout` or `trivy`
- Use GitHub Secrets for registry credentials and deployment keys
- Run containers as non-root in CI just like production

_Source: [CI/CD with GitHub Actions and Docker](https://runcloud.io/blog/setup-docker-github-actions-ci-cd), [Docker CI Docs](https://docs.docker.com/build/ci/)_

### Testing and Quality Assurance

**Integration Testing with Docker Compose:**
Your project already uses Docker Compose for the test environment (MongoDB replica set in tests). For more robust testing:

- Add healthcheck verification before running tests (wait for `service_healthy` conditions)
- Use `docker compose --profile test up` to spin up test-specific services
- Testcontainers can programmatically spin up containers from Docker Compose files for isolated test runs

**Health Check Verification in CI:**
After deployment, run health check verification:
```bash
curl --retry 5 --retry-delay 3 --fail http://localhost:3000/health
```

_Source: [Docker Compose Integration Testing Guide](https://medium.com/@alexandre.therrien3/docker-compose-for-integration-testing-a-practical-guide-for-any-project-49b361a52f8c), [Docker Testcontainers](https://docs.docker.com/testcontainers/)_

### Observability and Monitoring

**Production Monitoring Stack (Optional Enhancement):**
Add Prometheus + Grafana + Loki as a Compose profile for production observability:

- **Prometheus**: Scrape metrics from Node.js backend (via `prom-client`), MongoDB exporter, Redis exporter
- **Grafana**: Visualize dashboards for request rates, error rates, latency, resource usage
- **Loki + Promtail**: Aggregate container logs, replace json-file logging driver with Loki driver

**Current logging approach** (json-file with max-size/max-file) is adequate for small deployments. Scale to Loki when log searching becomes a pain point.

_Source: [Grafana LGTM with Docker Compose](https://blog.samzhu.dev/2025/03/25/Building-a-Complete-Grafana-LGTM-Observability-Platform-with-Docker-Compose/), [Prometheus with Docker Compose](https://last9.io/blog/prometheus-with-docker-compose/)_

### Cost Optimization and Resource Management

**Resource Limits (Your prod config already does this well):**
Your production config sets memory limits and reservations for all services. Recommendations:
- Monitor actual usage and adjust limits accordingly
- Set alerts at 80% capacity to prevent OOM kills
- Consider `cpus` limits alongside memory to prevent CPU starvation

**Volume Storage Optimization:**
- Use `docker system prune --volumes` periodically to clean unused volumes
- Monitor volume disk usage with `docker system df -v`
- Implement log rotation (already done in prod with json-file driver)

### Risk Assessment and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Redis data loss (no volume) | Medium | **High** | Add `redis_data` volume immediately |
| Secrets in env vars leaked | High | Medium | Migrate to Docker Compose secrets for prod |
| No SSL termination | High | High (if public) | Add nginx/Traefik reverse proxy |
| Single point of failure (no replicas) | High | Medium | Add `deploy.replicas` + load balancer |
| No backup automation | High | Medium | Implement volume backup strategy |
| Outdated Redis image (6.2.13) | Medium | Low | Upgrade to Redis 7.x for security patches |

## Technical Research Recommendations

### Implementation Roadmap

**Phase 1 - Critical Fixes (Immediate):**
1. Add `redis_data` named volume to both local and prod compose files
2. Add healthcheck to backend service
3. Update frontend `depends_on` to use `condition: service_healthy`

**Phase 2 - Production Hardening (Short-term):**
4. Refactor to base + override file pattern to reduce duplication
5. Add network isolation (separate frontend/backend networks)
6. Add security hardening (`security_opt`, `cap_drop`, `read_only`)
7. Migrate production secrets from env vars to Docker Compose secrets

**Phase 3 - Architecture Improvements (Medium-term):**
8. Add nginx reverse proxy with SSL termination for production
9. Upgrade Redis to 7.x
10. Add volume labels and backup automation
11. Consider Compose profiles for optional services (monitoring, debug tools)

### Specific Configuration Recommendations

**Redis volume fix (both files):**
```yaml
redis:
  volumes:
    - redis_data:/data
# Add to top-level volumes:
volumes:
  redis_data:
```

**Backend healthcheck (both files):**
```yaml
backend:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 15s
```

**Network isolation (prod):**
```yaml
networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
# frontend: networks [frontend-network]
# backend: networks [frontend-network, backend-network]
# mongo, redis: networks [backend-network]
```

### Success Metrics

- Zero data loss on container restart (all stateful services have volumes)
- All services use healthcheck-based dependency ordering
- No secrets exposed via environment variables in production
- SSL/TLS enabled for all public-facing endpoints
- Automated backup verification passes weekly
