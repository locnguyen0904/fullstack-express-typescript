---
epic: 2
title: "Developer Experience Improvements"
status: done
priority: high
estimated_effort: "1-2 days"
dependencies: []
stories_count: 4
---

# Epic 2: Developer Experience Improvements

**Goal:** Streamline development workflow for faster iteration, easier onboarding, and reduced boilerplate.

**Why:** These changes directly impact how productive teams are when using the template daily. Faster dev startup, faster commits, and automated module scaffolding.

---

## Story 2.1: Replace ts-node + nodemon with tsx

**Priority:** High
**Effort:** Small (1-2 hours)

### Description

Replace `ts-node`, `nodemon`, and `tsconfig-paths` with `tsx` for TypeScript execution and development file watching. `tsx` is esbuild-powered, handles path aliases natively, and includes watch mode.

### Acceptance Criteria

- [ ] `ts-node`, `nodemon`, `tsconfig-paths` are uninstalled from devDependencies
- [ ] `tsx` is installed as devDependency
- [ ] `package.json` `dev` script changed to `tsx watch src/server.ts`
- [ ] `package.json` `seed:dev` script changed to `tsx src/db/seeds/index.ts`
- [ ] `nodemon.json` is deleted
- [ ] Path alias `@/` resolves correctly with `tsx`
- [ ] Hot reload works on file changes
- [ ] Application starts successfully in development mode
- [ ] Docker development target updated if using nodemon command

### Technical Notes

- `tsx` uses esbuild under the hood — significantly faster than ts-node
- `tsx` resolves `paths` from `tsconfig.json` natively — no `tsconfig-paths/register` needed
- Watch mode is built-in — no separate `nodemon` needed
- Keep `tsc-alias` for production builds (not affected)

### Files to Modify

- `backend/package.json` — swap deps, update scripts
- `backend/nodemon.json` — delete file
- `compose/backend/Dockerfile` — update dev target command if referencing nodemon

---

## Story 2.2: Add lint-staged for faster pre-commit

**Priority:** Medium
**Effort:** Small (1 hour)

### Description

Add `lint-staged` to run linters and formatters only on staged files during pre-commit, replacing the current full-codebase lint + test approach.

### Acceptance Criteria

- [ ] `lint-staged` installed as root devDependency
- [ ] `lint-staged` config in root `package.json` targets `*.{ts,js}` files with eslint and prettier
- [ ] `.husky/pre-commit` updated to run `npx lint-staged` instead of full lint + test
- [ ] Pre-commit completes in under 5 seconds for typical changes
- [ ] Full lint and tests remain in CI pipeline (not removed, just moved from pre-commit)
- [ ] Backend and frontend files both covered by lint-staged patterns

### Technical Notes

- Current pre-commit runs: `npm run backend:lint && npm run backend:test && npm run frontend:lint && npm run frontend:build`
- This is slow (30-60 seconds+) — developers will skip hooks
- lint-staged runs only on changed files, keeping commit speed fast
- Tests should run in CI, not pre-commit

### Files to Modify

- `package.json` (root) — add `lint-staged` devDependency and config
- `.husky/pre-commit` — replace with `npx lint-staged`

---

## Story 2.3: Remove asyncHandler wrapper

**Priority:** Medium
**Effort:** Small (1-2 hours)

### Description

Remove the `asyncHandler` helper since Express 5 natively handles rejected promises from async middleware and route handlers.

### Acceptance Criteria

- [ ] `backend/src/helpers/async-handler.helper.ts` is deleted
- [ ] `asyncHandler` export removed from `backend/src/helpers/index.ts`
- [ ] All route registrations unwrapped — remove `asyncHandler(...)` calls
- [ ] Routes use direct method binding: `controller.findOne.bind(controller)`
- [ ] Error handling still works — async errors reach global error handler
- [ ] All existing tests pass
- [ ] No reference to `asyncHandler` remains in codebase

### Technical Notes

- Express 5 change: _"Rejected promises from middleware/handlers are now automatically handled"_
- This is purely a code cleanup — no behavioral change
- Verify error flow: throw in service → Express catches → `logErrors` → `errorHandle`

### Files to Modify

- `backend/src/helpers/async-handler.helper.ts` — delete
- `backend/src/helpers/index.ts` — remove export
- `backend/src/api/examples/index.ts` — unwrap handlers
- `backend/src/api/users/index.ts` — unwrap handlers
- `backend/src/api/auth/index.ts` — unwrap handlers
- Any other route files using asyncHandler

---

## Story 2.4: Add Plop.js module scaffolding

**Priority:** Medium
**Effort:** Medium (3-4 hours)

### Description

Add Plop.js code generator to scaffold complete feature modules (model, repository, service, controller, validation, docs, routes, test) from a single command.

### Acceptance Criteria

- [ ] `plop` installed as devDependency
- [ ] `plopfile.js` (or `.ts`) created in `backend/` root
- [ ] `module` generator prompts for resource name
- [ ] Generator creates all 8 files with correct naming conventions (kebab-case files, PascalCase classes)
- [ ] Generated model extends `BaseDocument` with timestamps and standard plugins
- [ ] Generated repository extends `Repository<T>` base class
- [ ] Generated service has CRUD operations with TypeDI `@Service()` decorator
- [ ] Generated controller has standard handlers with proper response classes
- [ ] Generated validation has create/update Zod schemas registered in OpenAPI registry
- [ ] Generated doc file has OpenAPI path registrations for all CRUD endpoints
- [ ] Generated index.ts has routes with auth, validation, and rate limiting
- [ ] Generated test file has test skeleton with AAA pattern
- [ ] `npm run generate` or `npx plop module <name>` works correctly
- [ ] Generated module compiles without errors
- [ ] README or CONTRIBUTING.md updated with scaffolding instructions

### Technical Notes

- Plop uses Handlebars templates — create templates in `backend/plop-templates/`
- Built-in case helpers: `camelCase`, `pascalCase`, `kebabCase`, `snakeCase`
- Use `addMany` action to generate all files from one prompt
- Templates should mirror the `examples` module as the reference implementation

### Files to Create

- `backend/plopfile.js` — generator definition
- `backend/plop-templates/` — Handlebars template files for each module file
- `backend/package.json` — add `"generate": "plop"` script
