import { describe, it, expect } from "vitest";
import { fuzzySearch } from "../src/lib/search.js";

const items = [
  { name: "Cascade", origin: "US", aromas: ["citrus", "grapefruit"] },
  { name: "Centennial", origin: "US", aromas: ["citrus", "floral"] },
  { name: "East Kent Goldings", origin: "UK", aromas: ["earthy", "herbal"] },
  { name: "Saaz", origin: "Czech Republic", aromas: ["spicy", "herbal"] },
];

describe("fuzzySearch", () => {
  it("matches by name (case-insensitive)", () => {
    const results = fuzzySearch(items, "cascade", ["name"]);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Cascade");
  });

  it("matches partial names", () => {
    const results = fuzzySearch(items, "kent", ["name"]);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("East Kent Goldings");
  });

  it("matches across multiple fields", () => {
    const results = fuzzySearch(items, "citrus", ["name", "aromas"]);
    expect(results).toHaveLength(2);
  });

  it("matches array fields", () => {
    const results = fuzzySearch(items, "herbal", ["aromas"]);
    expect(results).toHaveLength(2);
  });

  it("returns empty for no match", () => {
    const results = fuzzySearch(items, "nonexistent", ["name"]);
    expect(results).toHaveLength(0);
  });

  it("returns all items when query is empty", () => {
    const results = fuzzySearch(items, "", ["name"]);
    expect(results).toHaveLength(4);
  });
});
