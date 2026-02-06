# Security

Security architecture and policies for this project.

## Security Features

### Authentication

- **JWT tokens** with short-lived access tokens (30 min) and long-lived refresh tokens (30 days)
- **Refresh tokens** encrypted with AES-256-GCM before storing in httpOnly cookies
- **Password hashing** using bcrypt with salt rounds
- **Role-based access control** (admin, user)

### CSRF Protection

- **Double-submit cookie pattern** via [`csrf-csrf`](https://github.com/Psifi-Solutions/csrf-csrf) library
- HMAC-based token validation
- Production cookie prefix: `__Host-csrf` (requires HTTPS, strict SameSite)
- Smart bypass: skips for Bearer auth, safe methods, and unauthenticated requests

### Encryption

- **Algorithm:** AES-256-GCM (authenticated encryption with integrity)
- **Key derivation:** `scryptSync` with random 16-byte salt per operation
- **IV:** Random 12-byte initialization vector per encryption
- **Dedicated key:** `ENCRYPTION_KEY` environment variable (falls back to `JWT_SECRET`)

### HTTP Security

- **Helmet.js** for security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
- **CORS** with configurable allowed origins via `ALLOWED_ORIGINS`
- **Rate limiting** on all API routes (100 req/15 min) and auth endpoints (5 req/15 min)
- **Cookie security:** httpOnly, secure (production), strict SameSite

### Infrastructure

- **Non-root containers:** All Docker images run as user `app:1001`
- **Multi-stage builds:** Production images contain only compiled code and production dependencies
- **MongoDB replica set** with keyfile authentication
- **Redis** for distributed rate limiting

## Environment Variables

| Variable | Security Note |
|----------|---------------|
| `JWT_SECRET` | Min 32 characters. Used for JWT signing. |
| `ENCRYPTION_KEY` | Min 32 characters. Used for AES-256-GCM. Falls back to JWT_SECRET if not set. |
| `MONGO_INITDB_ROOT_PASSWORD` | Use a strong password in production. |
| `REDIS_PASSWORD` | Required in production (`docker-compose.prod.yml`). |
| `ALLOWED_ORIGINS` | Set explicitly in production. Do not use wildcards. |

## Security Checklist (Production)

- [ ] Set strong, unique values for `JWT_SECRET` and `ENCRYPTION_KEY`
- [ ] Set strong database and Redis passwords
- [ ] Configure `ALLOWED_ORIGINS` to your frontend domain(s)
- [ ] Set `NODE_ENV=production`
- [ ] Restrict database ports (don't expose MongoDB/Redis to host)
- [ ] Use HTTPS (required for `__Host-` cookie prefix)
- [ ] Review rate limiting thresholds for your traffic
- [ ] Enable log rotation (configured in `docker-compose.prod.yml`)

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email the maintainers with details of the vulnerability
3. Include steps to reproduce if possible
4. Allow reasonable time for a fix before public disclosure

We aim to acknowledge reports within 48 hours and provide a fix timeline within 7 days.
