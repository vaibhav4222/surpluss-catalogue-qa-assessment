import { describe, expect, it } from "vitest";
import { autoMap, parseNumber, validateRows, type ParsedFile } from "@/lib/import-mapping";

describe("spreadsheet import mapping and validation", () => {
  it("maps common seller spreadsheet headers", () => {
    expect(autoMap(["SKU", "Product Name", "Brand", "Qty", "Selling Price"])).toEqual({
      SKU: "sku",
      "Product Name": "name",
      Brand: "brand",
      Qty: "quantity",
      "Selling Price": "offerPrice",
    });
  });

  it("parses common currency-formatted numbers", () => {
    expect(parseNumber("₹1,20,000")).toBe(120000);
    expect(parseNumber("  1,999.50 ")).toBe(1999.5);
    expect(parseNumber("not-a-number")).toBeNull();
  });

  it("accepts valid rows and captures optional attributes", () => {
    const file: ParsedFile = {
      name: "products.csv",
      sizeKB: 1,
      headers: ["SKU", "Product Name", "Qty", "Material"],
      rows: [{ SKU: "ABC-1", "Product Name": "Bottle", Qty: "25", Material: "Steel" }],
    };
    const result = validateRows(file, { SKU: "sku", "Product Name": "name", Qty: "quantity", Material: "attribute" });
    expect(result.issues).toEqual([]);
    expect(result.rows[0]).toMatchObject({ sku: "ABC-1", name: "Bottle", quantity: 25, attributes: { Material: "Steel" } });
  });

  it("blocks duplicate SKUs and invalid quantities", () => {
    const file: ParsedFile = {
      name: "products.csv",
      sizeKB: 1,
      headers: ["SKU", "Product Name", "Qty"],
      rows: [
        { SKU: "ABC-1", "Product Name": "Bottle", Qty: "25" },
        { SKU: "ABC-1", "Product Name": "Bottle 2", Qty: "25" },
        { SKU: "ABC-2", "Product Name": "Bottle 3", Qty: "-1" },
      ],
    };
    const result = validateRows(file, { SKU: "sku", "Product Name": "name", Qty: "quantity" });
    expect(result.issues).toHaveLength(2);
    expect(result.issues.map((issue) => issue.blocking)).toEqual([true, true]);
  });

  it("warns and skips non-HTTPS image links", () => {
    const file: ParsedFile = {
      name: "products.csv",
      sizeKB: 1,
      headers: ["SKU", "Product Name", "Qty", "Image"],
      rows: [{ SKU: "ABC-1", "Product Name": "Bottle", Qty: "25", Image: "http://example.com/a.jpg" }],
    };
    const result = validateRows(file, { SKU: "sku", "Product Name": "name", Qty: "quantity", Image: "imageUrl" });
    expect(result.warnings).toBe(1);
    expect(result.rows[0]?.imageUrl).toBeUndefined();
  });
});
