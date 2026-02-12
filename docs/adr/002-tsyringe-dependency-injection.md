# ADR-002: Replace TypeDI with tsyringe for Dependency Injection

**Date:** 2026-02-07
**Status:** Accepted

## Context

The template was using `typedi` for dependency injection. TypeDI has been unmaintained since January 2021, with no new releases or security patches. The project's GitHub shows accumulated unresolved issues and no active maintainers.

## Decision

Replace `typedi` with `tsyringe` (maintained by Microsoft).

### Migration Mapping

| TypeDI                             | tsyringe                               |
| ---------------------------------- | -------------------------------------- |
| `@Service()`                       | `@singleton()`                         |
| `Container.get(Class)`             | `container.resolve(Class)`             |
| `import { Service } from 'typedi'` | `import { singleton } from 'tsyringe'` |

## Consequences

**Positive:**

- Actively maintained by Microsoft
- Same decorator-based DI pattern (minimal migration effort)
- Compatible with `reflect-metadata` and existing TypeScript decorator config
- Supports `@injectable()` (transient) and `@singleton()` scopes

**Negative:**

- API differences require a one-time migration of all DI references
- tsyringe is more explicit about singleton vs transient scope (TypeDI defaults to singleton)
