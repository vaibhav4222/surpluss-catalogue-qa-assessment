# Write-up

## 1. Strategy

- I started by understanding the application boundaries: public catalogue, admin portal, API routes, server actions, catalogue lifecycle, pricing/import logic, and enquiry submission.
- I prioritized authorization and catalogue lifecycle because the assessment explicitly identifies those as business/security risks and the seeded database contains draft and expired catalogues specifically intended to exercise those rules.
- I then inspected the highest-risk deterministic business logic and added Vitest coverage for:
  - catalogue status/expiry
  - price and discount calculations
  - spreadsheet column mapping and row validation
  - enquiry validation through API tests
- For security testing I treated the server as the trust boundary rather than relying on the UI. I tested anonymous access, role boundaries, direct API calls, cross-object IDs, and lifecycle bypasses.
- For E2E I used one complete buyer-to-admin journey rather than creating many UI tests. The test opens a published catalogue, contacts the supplier for a product, submits the enquiry, then verifies the resulting lead in the Admin Leads Inbox.

## 2. The riskiest part of this product

The riskiest area is **server-side authorization around catalogue and listing management**.

If it is not protected, an authenticated Staff account can potentially perform operations intended for Admins, publish confidential pricing, or modify/delete objects belonging to another catalogue. Those failures affect business data and can expose pricing to buyers, so I prioritized them over cosmetic UI coverage.

The strongest examples found in this build are:

- Staff can reach `deleteCatalogue()` because the server action checks authentication but not the Admin role.
- The catalogue PATCH API checks authentication but not the Admin role before accepting `status: "published"`.
- Listing PATCH/DELETE operations validate the catalogue ID exists but do not bind the listing ID to that catalogue.

## 3. What I left out, and why

- I did not build exhaustive tests for every API endpoint. I prioritized endpoints that mutate catalogues/listings or create buyer leads.
- I did not build broad visual-regression coverage because it has lower business risk than authorization, catalogue lifecycle, pricing, and enquiry creation for this assessment.
- I did not add large browser matrices or cross-browser suites because the required E2E scenario is one reliable business journey and the assessment emphasizes reliability over test quantity.
- I did not complete the optional load-testing and AI-workflow sections before the mandatory Tasks 1–5. The assessment explicitly says the mandatory tasks should be completed properly before spending time on bonuses.

## 4. AI tool usage

- I used ChatGPT to help inspect the supplied project, identify high-risk paths, draft test structures, and review the reasoning behind the tests.
- I reviewed and adapted the generated test ideas to the actual application code, especially the existing role model, seeded catalogues, API contracts, and selector structure.
- I did not treat generated code as authoritative. The findings were based on the supplied source code and the expected behavior documented in the project comments/seed data and assessment.
- The important test assertions were written to express the business rule rather than merely assert the current implementation.

## 5. One thing this codebase gets wrong

The main quality problem is **authorization logic is duplicated across UI, server actions, and API routes without a single enforced authorization boundary**.

For example, the UI hides Admin-only catalogue controls and `setCatalogueStatus()` explicitly calls `isAdmin()`, but the catalogue PATCH API and `deleteCatalogue()` do not apply the same rule. This creates a false sense of security because the UI appears restricted while a direct request can bypass it.

I would centralize the server-side authorization checks into reusable guards such as `requireActor()` and `requireAdmin()`, then require those guards in every admin server action and API route. The UI should remain a convenience layer, but it should never be the security boundary.

I would also make object ownership explicit in database queries. For example, listing updates/deletes should filter by both `listingId` and `catalogueId` rather than trusting the URL relationship.

---

## Notes

- The supplied project did not contain an existing test suite; `tests/` and `e2e/` were empty apart from `.gitkeep`.
- The assessment build includes local Admin and Staff credentials in the seed data specifically for local testing.
- The project comments state that publishing and deleting catalogues are Admin-only operations.
- The seed data describes the draft catalogue as confidential and the expired catalogue as having stale pricing that must not be honoured.
- Findings tests intentionally express the expected secure/correct behavior, so those tests fail against the unmodified assessment build where the corresponding defect exists. This is intentional because Task 1 explicitly asks for an automated test that fails because of each discovered bug.
