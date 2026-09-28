import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  actor: { id: "staff-id", email: "staff@catalogue.test", role: "staff" as const },
  delete: vi.fn(),
  update: vi.fn(),
  auth: vi.fn(),
}));

vi.mock("@/auth-guards", () => ({
  currentActor: vi.fn(async () => mocks.actor),
  isAdmin: vi.fn((actor: { role: string } | null) => actor?.role === "admin"),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
  signOut: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    catalogue: {
      delete: mocks.delete,
      findUnique: vi.fn(async () => ({ slug: "live-catalogue", status: "draft" })),
      update: mocks.update,
    },
  }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/incomplete", () => ({
  findIncompleteProducts: vi.fn(async () => []),
  incompleteMessage: vi.fn(),
}));
vi.mock("@/app/api/admin/catalogues/helpers", () => ({
  CATALOGUE_INCLUDE: {},
  validUntilToExpiresAt: vi.fn(() => null),
  toCatalogueDto: vi.fn((catalogue: unknown) => catalogue),
}));

import { deleteCatalogue } from "@/app/admin/actions";
import { PATCH } from "@/app/api/admin/catalogues/[id]/route";

const catalogueId = "11111111-1111-4111-8111-111111111111";

function patchRequest(body: unknown) {
  return new Request("http://localhost/api/admin/catalogues/" + catalogueId, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("BUG-002: Staff cannot delete catalogues", () => {
  it("rejects a Staff delete and never calls Prisma delete", async () => {
    mocks.delete.mockResolvedValue({ slug: "live-catalogue", name: "Live" });
    const result = await deleteCatalogue(catalogueId);
    expect(result).toEqual({ error: "Only an admin can delete a catalogue." });
    expect(mocks.delete).not.toHaveBeenCalled();
  });
});

describe("BUG-003: Staff cannot publish through the catalogue API", () => {
  it("rejects a Staff PATCH that changes status to published", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "staff-id", role: "staff" } });
    mocks.update.mockResolvedValue({
      id: catalogueId,
      slug: "live-catalogue",
      name: "Live",
      description: "",
      category: null,
      banners: [],
      notifyNumber: null,
      expiresAt: null,
      status: "published",
      publishedAt: new Date(),
      listings: [],
    });

    const response = await PATCH(patchRequest({
      name: "Live",
      slug: "live-catalogue",
      description: "",
      category: "",
      notifyNumber: "",
      status: "published",
      banners: [],
      validUntil: null,
    }), { params: Promise.resolve({ id: catalogueId }) });

    expect(response.status).toBe(403);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
