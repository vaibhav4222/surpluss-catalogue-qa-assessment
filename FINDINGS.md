# Findings

The findings below were reproduced from the supplied assessment build. Each finding has a regression test that demonstrates the current behavior against the expected business rule.

---

## 1. Published catalogues with a future expiry date are marked as expired

**What happens**

`effectiveStatus()` treats a published catalogue as expired when `expiresAt` is in the future. The comparison is reversed: a catalogue should become expired after its validity date has passed.

**Steps to reproduce**

1. Open `src/lib/catalogue-status.ts` and use a published catalogue with `expiresAt` one day in the future.
2. Call `effectiveStatus("published", futureDate)`.
3. Observe that the function returns `expired`.

**What should happen instead**

A published catalogue whose expiry date is still in the future should remain `published`. It should only become `expired` once the expiry time is in the past.

**Impact — how bad is this, and why?**

Medium. This can cause the admin-facing effective status to disagree with the actual public catalogue lifecycle, potentially leading staff to treat a currently valid catalogue as expired.

**Failing test**

`tests/findings/catalogue-status-expiry.test.ts` — `does not mark a future expiry as expired`

---

## 2. Staff users can delete catalogues through the server action

**What happens**

The codebase documents catalogue deletion as Admin-only, but `deleteCatalogue()` checks only whether an actor is signed in. A Staff actor can therefore reach the Prisma delete operation directly.

**Steps to reproduce**

1. Sign in as `staff@catalogue.test` with password `Staff#2026`.
2. Invoke the `deleteCatalogue(catalogueId)` server action for a catalogue that can be deleted.
3. Observe that the catalogue is deleted instead of the request being rejected for insufficient privileges.

**What should happen instead**

The server action should reject Staff users before executing the database delete. Only an Admin should be able to delete a catalogue.

**Impact — how bad is this, and why?**

High. A compromised or mistaken Staff account can permanently remove catalogue data. The code comments explicitly state that deletion is an Admin-only operation because it destroys catalogue data and can affect lead history.

**Failing test**

`tests/api/admin-authorization.test.ts` — `rejects a Staff delete and never calls Prisma delete`

---

## 3. Staff users can publish catalogues through the catalogue PATCH API

**What happens**

The catalogue server action correctly uses `isAdmin()` before changing publication state, but `PATCH /api/admin/catalogues/:id` checks only for an authenticated session. A Staff user can submit `status: "published"` directly to the API.

**Steps to reproduce**

1. Sign in as `staff@catalogue.test`.
2. Obtain the ID of a draft catalogue.
3. Send a PATCH request to `/api/admin/catalogues/{id}` with a valid catalogue payload and `status: "published"`.
4. Observe that the request is processed instead of returning an authorization error.

**What should happen instead**

The API should enforce the same Admin-only publication rule as the server action and reject Staff users with an authorization response before updating the database.

**Impact — how bad is this, and why?**

High. Publishing exposes catalogue content and pricing to the public internet. A Staff account can bypass the UI restriction by calling the server endpoint directly.

**Failing test**

`tests/api/admin-authorization.test.ts` — `rejects a Staff PATCH that changes status to published`

---

## 4. Listing PATCH/DELETE operations are vulnerable to cross-catalogue object access

**What happens**

The listing API validates that the requested catalogue exists, but its PATCH and DELETE database operations filter only by `listingId`. They do not verify that the listing belongs to the catalogue ID in the URL.

**Steps to reproduce**

1. Identify a listing belonging to Catalogue B.
2. Authenticate as an admin/staff user allowed to use the endpoint.
3. Send `PATCH /api/admin/catalogues/{catalogue-A-id}/listings/{catalogue-B-listing-id}` with a valid listing update.
4. Observe that the listing update is applied to Catalogue B's listing even though Catalogue A was supplied in the URL.
5. The same object-binding issue exists in the DELETE handler.

**What should happen instead**

The database operation should require both IDs to match, for example by filtering on `{ id: listingId, catalogueId }`, and reject a listing that is not owned by the requested catalogue.

**Impact — how bad is this, and why?**

High. An authorized portal user can modify or delete a product listing belonging to another catalogue by changing the URL IDs. This is an object-level authorization/integrity failure.

**Failing test**

`tests/api/listing-idor.test.ts` — `rejects a listing ID that belongs to another catalogue`

---

## 5. The enquiry API accepts products from draft/expired catalogues

**What happens**

`POST /api/enquiries` verifies that the submitted products belong to the supplied catalogue and are visible, but it does not verify that the catalogue itself is currently published and unexpired. The seed data explicitly contains a confidential draft catalogue and a published catalogue whose pricing has expired.

**Steps to reproduce**

1. Use the seeded draft catalogue `festive-overstock-2026`, or the expired catalogue `monsoon-clearance-2026`.
2. Select a visible product listed in that catalogue.
3. POST a valid enquiry containing that catalogue ID and product ID.
4. Observe that the API proceeds to create the enquiry instead of rejecting the request because the catalogue is not currently live.

**What should happen instead**

The API should verify the catalogue lifecycle before accepting the enquiry: only a currently published and unexpired catalogue should accept buyer enquiries.

**Impact — how bad is this, and why?**

High. A buyer can submit an enquiry against confidential draft pricing or stale expired pricing. This bypasses a core business rule and can cause sales staff to receive leads for catalogues that should no longer be active.

**Failing test**

`tests/api/enquiry-lifecycle.test.ts` — `rejects enquiries for draft catalogues` / `rejects enquiries for expired catalogues`
