import { describe, expect, it } from "vitest";
import { effectiveStatus } from "@/lib/catalogue-status";

describe("effective catalogue status", () => {
  it("keeps a published catalogue live before its expiry time", () => {
    const future = new Date(Date.now() + 60 * 60 * 1000);
    expect(effectiveStatus("published", future)).toBe("published");
  });

  it("marks a published catalogue expired after its expiry time", () => {
    const past = new Date(Date.now() - 60 * 60 * 1000);
    expect(effectiveStatus("published", past)).toBe("expired");
  });

  it("maps legacy inactive and expired rows back to draft", () => {
    expect(effectiveStatus("inactive", null)).toBe("draft");
    expect(effectiveStatus("expired", null)).toBe("draft");
  });

  it("keeps draft catalogues as draft", () => {
    expect(effectiveStatus("draft", null)).toBe("draft");
  });
});
