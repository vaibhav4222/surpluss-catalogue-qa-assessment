import { describe, expect, it } from "vitest";
import { effectiveStatus } from "@/lib/catalogue-status";

describe("BUG-001: catalogue expiry status", () => {
  it("does not mark a future expiry as expired", () => {
    // This test intentionally fails against the supplied code. It is the
    // regression test required by FINDINGS.md for BUG-001.
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(effectiveStatus("published", future)).toBe("published");
  });
});
