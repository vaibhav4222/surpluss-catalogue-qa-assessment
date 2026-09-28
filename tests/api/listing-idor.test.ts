import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(async () => ({ user: { id: "admin-id", role: "admin" } })),
  findUnique: vi.fn(async () => ({ slug: "catalogue-a" })),
  updateMany: vi.fn(async () => ({ count: 1 })),
  deleteMany: vi.fn(async () => ({ count: 1 })),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    catalogue: { findUnique: mocks.findUnique },
    catalogueListing: {
      updateMany: mocks.updateMany,
      deleteMany: mocks.deleteMany,
    },
  }),
}));
vi.mock("@/app/api/admin/catalogues/[id]/listings/helpers", () => ({ revalidateCatalogue: vi.fn() }));

import { PATCH } from "@/app/api/admin/catalogues/[id]/listings/[listingId]/route";

const catalogueA = "11111111-1111-4111-8111-111111111111";
const listingFromCatalogueB = "22222222-2222-4222-8222-222222222222";

it("BUG-004: rejects a listing ID that belongs to another catalogue", async () => {
  const response = await PATCH(
    new Request(`http://localhost/api/admin/catalogues/${catalogueA}/listings/${listingFromCatalogueB}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isVisible: false }),
    }),
    { params: Promise.resolve({ id: catalogueA, listingId: listingFromCatalogueB }) },
  );

  expect(response.status).toBe(404);
  expect(mocks.updateMany).not.toHaveBeenCalled();
});

it("BUG-004: rejects DELETE for a listing that belongs to another catalogue", async () => {
  const { DELETE } = await import("@/app/api/admin/catalogues/[id]/listings/[listingId]/route");
  const response = await DELETE(
    new Request(`http://localhost/api/admin/catalogues/${catalogueA}/listings/${listingFromCatalogueB}`, { method: "DELETE" }),
    { params: Promise.resolve({ id: catalogueA, listingId: listingFromCatalogueB }) },
  );

  expect(response.status).toBe(404);
  expect(mocks.deleteMany).not.toHaveBeenCalled();
});
