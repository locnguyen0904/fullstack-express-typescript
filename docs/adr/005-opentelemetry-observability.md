# ADR-005: OpenTelemetry for Observability

**Date:** 2026-02-07
**Status:** Accepted

## Context

The template lacked application-level observability (distributed tracing, metrics). OpenTelemetry is the CNCF standard for telemetry data collection, supported by all major observability platforms (Grafana, Datadog, New Relic, etc.).

## Decision

Add OpenTelemetry as an opt-in observability layer, enabled via `OTEL_ENABLED=true`.

### Architecture

- **Instrumentation file:** `src/instrumentation.ts` loaded via Node.js `--import` flag
- **Auto-instrumentation:** Express, MongoDB, Redis, HTTP automatically traced
- **Exporters:** OTLP/HTTP for both traces and metrics
- **SDK:** `@opentelemetry/sdk-node` with `@opentelemetry/auto-instrumentations-node`

### Configuration

| Variable                 | Description                  | Default            |
| ------------------------ | ---------------------------- | ------------------ |
| `OTEL_ENABLED`           | Enable/disable OpenTelemetry | `false`            |
| `OTEL_EXPORTER_ENDPOINT` | OTLP collector endpoint      | —                  |
| `OTEL_SERVICE_NAME`      | Service name for traces      | `backend-template` |

## Consequences

**Positive:**

- Vendor-neutral — works with any OTLP-compatible backend
- Zero-code instrumentation for Express, MongoDB, Redis
- Opt-in design means zero overhead when disabled
- Follows CNCF standard, future-proof

**Negative:**

- Adds several `@opentelemetry/*` dependencies (~15 packages in dependency tree)
- Requires an OTLP collector endpoint (Jaeger, Grafana Tempo, etc.) to be useful
- `--import` flag required in start/dev scripts
