# API Reference

Base URL: `http://localhost:3000`

Interactive documentation available at [Swagger UI](http://localhost:3000/api-docs).

## Health

### GET /health

Health check endpoint. No authentication required.

**Response:**

```json
{
  "status": "ok",
  "uptime": 12345,
  "timestamp": "2026-01-01T00:00:00.000Z",
  "checks": {
    "database": "connected",
    "redis": "connected"
  }
}
```

## CSRF Token

### GET /api/v1/csrf-token

Get a CSRF token for state-changing requests. Sets a `csrf` cookie and returns the token in the body.

**Response:**

```json
{
  "csrfToken": "token-string"
}
```

**Usage:** Include the token in the `X-CSRF-Token` header for POST/PUT/DELETE requests when using cookie-based auth.

## Authentication

### POST /api/v1/auth/login

Login with email and password. Rate limited: 5 attempts per 15 minutes.

**Request:**

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Headers:** `X-CSRF-Token` (required when auth cookies present)

**Response:**

```json
{
  "status": "success",
  "data": {
    "user": { "id": "...", "fullName": "...", "email": "...", "role": "admin" },
    "token": "jwt-access-token"
  }
}
```

Also sets an encrypted `refreshToken` httpOnly cookie.

### POST /api/v1/auth/refresh-token

Refresh the access token using the refresh token cookie.

**Request:** No body. Requires `refreshToken` cookie.

**Response:**

```json
{
  "status": "success",
  "data": {
    "token": "new-jwt-access-token"
  }
}
```

### POST /api/v1/auth/logout

Clear the refresh token cookie.

**Response:**

```json
{
  "status": "success",
  "message": "Logout successfully"
}
```

## Users

All user endpoints require `Authorization: Bearer {token}` with `admin` role.

### GET /api/v1/users

List users with pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 25 | Items per page |
| `sort` | string | `-createdAt` | Sort field (prefix `-` for descending) |
| `includeDeleted` | boolean | false | Include soft-deleted users |

**Response:**

```json
{
  "status": "success",
  "data": [{ "id": "...", "fullName": "...", "email": "...", "role": "user" }],
  "total": 100,
  "page": 1,
  "pages": 4,
  "limit": 25
}
```

### GET /api/v1/users/:id

Get a single user by ID.

### POST /api/v1/users

Create a new user.

**Request:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepass",
  "role": "user"
}
```

**Response:** `201 Created`

### PUT /api/v1/users/:id

Update a user. All fields optional.

### DELETE /api/v1/users/:id

Soft delete a user. Returns the deleted user object.

## Examples

Public read endpoints. Write endpoints require `admin` role.

### GET /api/v1/examples

List examples with pagination. Cached in Redis (300s TTL). No auth required.

**Query Parameters:** Same as users endpoint.

### GET /api/v1/examples/:id

Get a single example. No auth required.

### POST /api/v1/examples

Create an example. Requires `admin` role.

**Request:**

```json
{
  "title": "Example Title",
  "content": "Example content"
}
```

**Response:** `201 Created`

### PUT /api/v1/examples/:id

Update an example. Requires `admin` role.

### DELETE /api/v1/examples/:id

Soft delete an example. Requires `admin` role.

## Authentication Guide

### For API Clients (Postman, curl, scripts)

Use Bearer token authentication. CSRF is not required.

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  | jq -r '.data.token')

# Use token
curl http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

### For Browser Clients (Frontend)

Use CSRF + cookie-based refresh tokens:

1. `GET /api/v1/csrf-token` (with `credentials: "include"`)
2. `POST /api/v1/auth/login` with `X-CSRF-Token` header
3. Store access token in memory/localStorage
4. Include `Authorization: Bearer {token}` on subsequent requests
5. Refresh via `POST /api/v1/auth/refresh-token` when token expires

## Error Responses

All errors follow this format:

```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions or CSRF failure) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/v1/*` (global) | 100 requests | 15 minutes |
| `/api/v1/auth/login` | 5 requests | 15 minutes |
