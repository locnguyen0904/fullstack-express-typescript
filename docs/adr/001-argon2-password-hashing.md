# ADR-001: Replace bcrypt with Argon2 for Password Hashing

**Date:** 2026-02-07
**Status:** Accepted

## Context

The template was using `bcrypt` for password hashing. OWASP's Password Storage Cheat Sheet recommends Argon2id as the preferred algorithm for password hashing. Argon2 won the 2015 Password Hashing Competition and provides better resistance against GPU and ASIC attacks through configurable memory costs.

## Decision

Replace `bcrypt` with `argon2` (Argon2id variant) for all password hashing operations.

## Consequences

**Positive:**
- Follows OWASP's primary recommendation
- Better resistance to GPU/ASIC brute-force attacks via memory-hard design
- Configurable memory, time, and parallelism parameters
- Native Node.js addon with prebuilt binaries

**Negative:**
- Existing bcrypt-hashed passwords would need rehashing on login (migration concern for downstream projects)
- Slightly larger dependency (includes native binaries)

**Migration:** Downstream projects using bcrypt hashes can implement a dual-verify strategy: attempt Argon2 first, fall back to bcrypt, then rehash with Argon2 on successful login.
