import { describe, expect, it } from "vitest";
import { discountPercent, needsPricesForSale, priceLabel, PRICE_ON_REQUEST_LABEL, NO_PRICE_LABEL } from "@/lib/pricing";

describe("pricing", () => {
  it.each([
    [{ priceOnRequest: false, mrp: 1000, offerPrice: 900 }, 10],
    [{ priceOnRequest: false, mrp: 1000, offerPrice: 500 }, 50],
    [{ priceOnRequest: false, mrp: 1000, offerPrice: 1000 }, 0],
    [{ priceOnRequest: true, mrp: 1000, offerPrice: 500 }, 0],
    [{ priceOnRequest: false, mrp: null, offerPrice: 500 }, 0],
  ] as const)("calculates discount correctly for %#", (facts, expected) => {
    expect(discountPercent(facts)).toBe(expected);
  });

  it("uses the correct display label for price-on-request", () => {
    expect(priceLabel({ priceOnRequest: true, offerPrice: null }, String)).toBe(PRICE_ON_REQUEST_LABEL);
    expect(priceLabel({ priceOnRequest: false, offerPrice: null }, String)).toBe(NO_PRICE_LABEL);
    expect(priceLabel({ priceOnRequest: false, offerPrice: 1250 }, (value) => `₹${value}`)).toBe("₹1250");
  });

  it("requires prices for sale unless price-on-request is enabled", () => {
    expect(needsPricesForSale({ priceOnRequest: false, mrp: null, offerPrice: 100 })).toBe(true);
    expect(needsPricesForSale({ priceOnRequest: false, mrp: 100, offerPrice: null })).toBe(true);
    expect(needsPricesForSale({ priceOnRequest: false, mrp: 100, offerPrice: 80 })).toBe(false);
    expect(needsPricesForSale({ priceOnRequest: true, mrp: null, offerPrice: null })).toBe(false);
  });
});
