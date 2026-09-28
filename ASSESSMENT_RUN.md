# Assessment Run Guide

## Local setup

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL: `docker compose up -d postgres`.
3. Install dependencies: `npm ci`.
4. Generate the Prisma client: `npm run db:generate`.
5. Apply/reset the local database and seed it: `npm run db:reset`.
6. Start the app: `npm run dev`.

Seed credentials:

- Admin: `admin@catalogue.test` / `Admin#2026`
- Staff: `staff@catalogue.test` / `Staff#2026`

## Tests

- Unit/integration: `npm test`
- Playwright: `npm run test:e2e`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`

## Important assessment behavior

The tests under `tests/findings/` and the authorization/lifecycle regression tests intentionally fail against the unmodified assessment build because the failures are the defects documented in `FINDINGS.md`. This is deliberate: Task 1 requires an automated test that fails because of each discovered bug.

The normal unit coverage under `tests/unit/` is intended to pass.

For a production fix, the expected changes would be:

- reverse the expiry comparison in `effectiveStatus()`;
- enforce `isAdmin()` in `deleteCatalogue()`;
- enforce Admin authorization in the catalogue PATCH API before publishing;
- scope listing PATCH/DELETE queries by both `listingId` and `catalogueId`;
- require a published, unexpired catalogue in the enquiry API.
