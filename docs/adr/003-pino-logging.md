# ADR-003: Replace Winston with Pino for Logging

**Date:** 2026-02-07
**Status:** Accepted

## Context

The template was using `winston` with `winston-daily-rotate-file` for logging and `morgan` for HTTP request logging. Pino is ~5x faster than Winston in benchmarks due to its low-overhead JSON serialization, and provides a simpler API.

## Decision

Replace `winston` + `morgan` with `pino` + `pino-http`.

### Key Changes

- **Development:** Pretty-printed logs via `pino-pretty` (dev dependency)
- **Production:** Structured JSON to stdout (12-factor app compliant)
- **Test:** Silent (`level: 'silent'`)
- **HTTP logging:** `pino-http` replaces `morgan`, integrated with request ID tracking

### API Migration

```typescript
// Winston (old)
logger.error('Redis error', { error: err.message });

// Pino (new)
logger.error({ error: err.message }, 'Redis error');
```

## Consequences

**Positive:**
- ~5x faster throughput (important under load)
- JSON-first output — better for log aggregation (ELK, Datadog, etc.)
- Smaller dependency footprint (removed winston, winston-daily-rotate-file, morgan)
- Built-in request ID correlation via pino-http

**Negative:**
- Different argument order (`logger.error(obj, msg)` vs `logger.error(msg, obj)`)
- No built-in file rotation (use OS-level log rotation or external transport)
