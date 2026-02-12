# ADR-004: RFC 9457 Problem Details for Error Responses

**Date:** 2026-02-07
**Status:** Accepted

## Context

The template used a custom error response format. RFC 9457 (formerly RFC 7807) defines a standard format for HTTP API error responses, widely adopted by APIs and recognized by tooling.

## Decision

Adopt RFC 9457 "Problem Details for HTTP APIs" as the standard error response format.

### Response Format

```json
{
  "type": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404",
  "title": "Not Found",
  "status": 404,
  "detail": "User not found",
  "instance": "/api/v1/users/123"
}
```

### Content Type

Error responses are sent with `Content-Type: application/problem+json` as specified by the RFC.

### Implementation

- `AppError` base class includes `type` and `title` fields
- Each error subclass sets appropriate defaults (e.g., `NotFoundError` sets type to MDN 404 URL)
- Global error handler produces the `ProblemDetail` response shape

## Consequences

**Positive:**

- Industry-standard error format improves API client interoperability
- `type` field enables machine-readable error categorization
- `instance` field aids debugging by identifying the exact request path
- Proper content type enables client-side content negotiation

**Negative:**

- Breaking change for existing API consumers expecting the old format
- Slightly more verbose than minimal `{ message, code }` format
