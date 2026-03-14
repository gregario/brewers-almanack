import { describe, it, expect } from "vitest";
import { HOPS } from "../src/data/hops.js";

describe("hops data", () => {
  it("has at least 50 hop varieties", () => {
    expect(HOPS.length).toBeGreaterThanOrEqual(50);
  });

  it("each hop has required fields", () => {
    for (const hop of HOPS) {
      expect(hop.name).toBeTruthy();
      expect(hop.alphaAcidMin).toBeLessThanOrEqual(hop.alphaAcidMax);
      expect(["bittering", "aroma", "dual"]).toContain(hop.purpose);
      expect(hop.aromas.length).toBeGreaterThan(0);
    }
  });

  it("can find Cascade", () => {
    const cascade = HOPS.find((h) => h.name === "Cascade");
    expect(cascade).toBeDefined();
    expect(cascade!.origin).toBe("US");
    expect(cascade!.aromas).toContain("citrus");
  });

  it("has no duplicate names", () => {
    const names = HOPS.map((h) => h.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("has at least 100 hop varieties", () => {
    expect(HOPS.length).toBeGreaterThanOrEqual(100);
  });

  it("covers all major hop-growing regions", () => {
    const origins = new Set(HOPS.map((h) => h.origin));
    expect(origins.has("US")).toBe(true);
    expect(origins.has("Germany")).toBe(true);
    expect(origins.has("UK")).toBe(true);
    expect(origins.has("Czech Republic")).toBe(true);
    expect(origins.has("New Zealand")).toBe(true);
    expect(origins.has("Australia")).toBe(true);
  });

  it("includes classic and modern hops", () => {
    const names = HOPS.map((h) => h.name);
    // Classics
    expect(names).toContain("Cascade");
    expect(names).toContain("Centennial");
    expect(names).toContain("Saaz");
    expect(names).toContain("Hallertau Mittelfrüh");
    expect(names).toContain("Fuggle");
    expect(names).toContain("East Kent Goldings");
    // Modern
    expect(names).toContain("Citra");
    expect(names).toContain("Mosaic");
    expect(names).toContain("Galaxy");
    expect(names).toContain("Nelson Sauvin");
    expect(names).toContain("Simcoe");
  });

  it("each hop has valid alpha and beta acid ranges", () => {
    for (const hop of HOPS) {
      expect(hop.alphaAcidMin).toBeGreaterThanOrEqual(0);
      expect(hop.alphaAcidMax).toBeLessThanOrEqual(25);
      expect(hop.betaAcidMin).toBeGreaterThanOrEqual(0);
      expect(hop.betaAcidMax).toBeLessThanOrEqual(15);
    }
  });

  it("each hop has styles and substitutes", () => {
    for (const hop of HOPS) {
      expect(hop.styles.length).toBeGreaterThan(0);
      expect(hop.substitutes.length).toBeGreaterThan(0);
      expect(hop.description).toBeTruthy();
      expect(hop.origin).toBeTruthy();
    }
  });

  it("all purpose types are represented", () => {
    const purposes = new Set(HOPS.map((h) => h.purpose));
    expect(purposes.has("bittering")).toBe(true);
    expect(purposes.has("aroma")).toBe(true);
    expect(purposes.has("dual")).toBe(true);
  });
});
