# ADR-006: Require MongoDB Replica Set for All Environments

**Date:** 2026-03-10
**Status:** Accepted

## Context

The template uses MongoDB with Mongoose. Two critical capabilities depend on MongoDB
running as a replica set:

1. **Multi-document ACID transactions** — Mongoose sessions (`session.startTransaction()`)
   only work on replica sets. Templates should be ready for transactional workflows
   out of the box.

2. **Change streams** — MongoDB Change Streams (used for event-driven patterns and
   real-time features) require replica set oplog. The event-driven architecture
   demonstrated in this template benefits from this capability.

The Docker Compose setup (`compose/mongo/Dockerfile`) already configures MongoDB with
`--replSet rs0` and auto-initialises the replica set on first start via a startup
script. However, the `DATABASE_URL` environment variable — and therefore any
developer running MongoDB locally outside Docker — also needs to include the
`replicaSet=rs0` parameter.

Without a replica set:

- `session.startTransaction()` throws `MongoServerError: Transaction numbers are only allowed on a replica member or mongos`
- Change streams throw `MongoServerError: The $changeStream stage is only supported on replica sets`

## Decision

Mandate `replicaSet=rs0` in the `DATABASE_URL` connection string for all environments
(development, CI, production). The connection string format is:

```
mongodb://<user>:<pass>@<host>:<port>/<db>?authSource=admin&replicaSet=rs0
```

The Docker Compose setup configures this automatically. Developers running MongoDB
locally (outside Docker) MUST start MongoDB with the `--replSet rs0` argument:

```bash
mongod --replSet rs0 --bind_ip_all
# Then initialise (one-time):
mongosh --eval "rs.initiate()"
```

This requirement is documented in `docs/SETUP.md` under "Local Development (Without Docker)".

## Consequences

**Positive:**

- ACID transactions available by default — no refactoring needed when a feature
  requires transactional consistency
- Change streams enabled — event-driven features can be built without infra changes
- Production-like behaviour in development — avoids "works locally" issues
- CI already uses Docker Compose, so replica set is always available in pipelines

**Negative:**

- Developers running standalone MongoDB locally must add `--replSet rs0` to their
  startup command (one-time setup)
- Slightly longer initial Docker startup on first run (replica set initiation adds
  ~3–5 seconds)
- `mongodb-memory-server` used in tests automatically configures replica sets when
  sessions/transactions are needed — no test-specific action required

**Migration for downstream projects:**

Projects cloned from this template inherit the `replicaSet=rs0` requirement. If an
existing standalone MongoDB instance is in use, the migration path is:

1. Stop MongoDB
2. Restart with `--replSet rs0`
3. Run `rs.initiate()` in mongosh

No data migration is required — data is preserved.
