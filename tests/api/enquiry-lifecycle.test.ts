import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(async () => [
    {
      id: "33333333-3333-4333-8333-333333333333",
      productId: "44444444-4444-4444-8444-444444444444",
      product: {
        name: "Test product",
        sku: "TEST-1",
        brand: "Test",
        offerPrice: 100,
        priceOnRequest: false,
        moq: 1,
        quantity: 10,
      },
    },
  ]),
  findUnique: vi.fn(async () => ({ notifyNumber: null })),
  create: vi.fn(async () => ({ id: "enquiry-id" })),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    catalogueListing: { findMany: mocks.findMany },
    catalogue: { findUnique: mocks.findUnique },
    enquiry: { create: mocks.create },
  }),
}));
vi.mock("@/lib/notifications", () => ({ notifyTeam: vi.fn() }));

import { POST } from "@/app/api/enquiries/route";

const catalogueId = "11111111-1111-4111-8111-111111111111";
const productId = "44444444-4444-4444-8444-444444444444";

it.each([
  ["draft", "the draft catalogue"],
  ["expired", "the expired catalogue"],
])("BUG-005: rejects enquiries for %s catalogues", async (_state, _description) => {
  // The current handler never loads lifecycle state, so both cases reach create().
  // The assertion below intentionally fails against the supplied build.
  mocks.create.mockClear();
  const response = await POST(new Request("http://localhost/api/enquiries", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      catalogueId,
      name: "Buyer Name",
      phone: "9876543210",
      items: [{ productId, quantity: 1 }],
    }),
  }));

  expect(response.status).toBe(409);
  expect(mocks.create).not.toHaveBeenCalled();
});
