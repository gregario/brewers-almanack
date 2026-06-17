import { describe, it, expect } from "vitest";
import { fuzzySearchInventory } from "../src/lib/fuzzy-search.js";

describe("fuzzySearchInventory", () => {
  it("finds exact product names", () => {
    const results = fuzzySearchInventory("Citra T90");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toMatch(/Citra/i);
  });

  it("handles trademark symbols in product names", () => {
    const results = fuzzySearchInventory("Carafa Special Type 3");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toMatch(/Carafa/i);
  });

  it("resolves brewing abbreviations", () => {
    const mo = fuzzySearchInventory("MO");
    expect(mo.length).toBeGreaterThan(0);
    expect(mo[0].name).toMatch(/Maris Otter/i);

    const ekg = fuzzySearchInventory("EKG");
    expect(ekg.length).toBeGreaterThan(0);
    expect(ekg[0].name).toMatch(/East Kent Goldings/i);

    const ctz = fuzzySearchInventory("ctz");
    expect(ctz.length).toBeGreaterThan(0);
    expect(ctz[0].name).toMatch(/Columbus/i);
  });

  it("resolves yeast shorthand", () => {
    const us05 = fuzzySearchInventory("us05");
    expect(us05.length).toBeGreaterThan(0);
    expect(us05[0].name).toMatch(/US-05/i);

    const notti = fuzzySearchInventory("notti");
    expect(notti.length).toBeGreaterThan(0);
    expect(notti[0].name).toMatch(/Nottingham/i);
  });

  it("handles typos via fuzzy matching", () => {
    const results = fuzzySearchInventory("simco");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toMatch(/Simcoe/i);
  });

  it("filters by category when provided", () => {
    const results = fuzzySearchInventory("Munich", "Base Malt");
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.category).toBe("Base Malt");
    }
  });

  it("multi-word queries match all terms", () => {
    const results = fuzzySearchInventory("carafa special 3");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name.includes("Type 3"))).toBe(true);
  });
});
