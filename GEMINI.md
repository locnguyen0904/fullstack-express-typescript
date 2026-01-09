# Operational Guide & Context

## Environment Setup

1. **Prerequisites:** Docker, Node.js (v20+).
2. **Configuration:** Copy `.env.example` to `.env`.
    * `DATABASE_URL`: MongoDB connection string.
    * `JWT_SECRET`: Secret for auth signing.

## Operational Workflow

* **Development:**
  * Run: `docker compose up -d` (Starts DB, Redis, Backend, Frontend).
  * Backend Logs: `docker compose logs -f backend`.
  * Access: Frontend @ `localhost:3001`, Backend @ `localhost:3000`.
* **Verification:**
  * **Lint:** `cd backend && npm run lint` (Fix with `lint:fix`).
  * **Test:** `cd backend && npm test`.
  * **Build:** `cd backend && npm run build`.

## Source Code Navigation

* **Entry Point:** `backend/src/server.ts` initializes the server.
* **App Config:** `backend/src/app.ts` sets up middleware and routes.
* **Routes:** `backend/src/api/index.ts` aggregates feature routes.

## Best Practices Checklist

* [ ] **Validation:** Is the request body/query validated with Zod?
* [ ] **Docs:** Is the route registered in the OpenAPI registry?
* [ ] **Security:** Is rate limiting applied? (Global by default).
* [ ] **Tests:** Does a test file exist for the new feature?
* [ ] **Types:** Are interfaces defined for Models and Requests?

## Troubleshooting

* **Swagger Error:** If Swagger UI fails, check `backend/src/config/openapi.config.ts` and ensure `registry` is populated.
* **Docker Connection:** Ensure `mongo` and `redis` services are "healthy" before backend starts.
* **Lint Errors:** Run `npm run prettier:fix` followed by `npm run lint:fix`.
