import { describe, it, expect } from "vitest";
import { MALTS } from "../src/data/malts.js";
import { YEASTS } from "../src/data/yeasts.js";
import { ADJUNCTS } from "../src/data/adjuncts.js";

describe("malts data", () => {
  it("has at least 20 malts", () => {
    expect(MALTS.length).toBeGreaterThanOrEqual(20);
  });
  it("each malt has required fields", () => {
    for (const malt of MALTS) {
      expect(malt.name).toBeTruthy();
      expect(malt.colour).toBeGreaterThanOrEqual(0);
      expect(["base", "crystal", "roasted", "adjunct", "specialty"]).toContain(malt.type);
    }
  });
  it("has at least one base malt", () => {
    expect(MALTS.some((m) => m.type === "base")).toBe(true);
  });
});

describe("yeasts data", () => {
  it("has at least 20 yeast strains", () => {
    expect(YEASTS.length).toBeGreaterThanOrEqual(20);
  });
  it("each yeast has required fields", () => {
    for (const yeast of YEASTS) {
      expect(yeast.name).toBeTruthy();
      expect(yeast.tempMin).toBeLessThan(yeast.tempMax);
      expect(yeast.attenuationMin).toBeLessThanOrEqual(yeast.attenuationMax);
      expect(["low", "medium", "high", "very high"]).toContain(yeast.flocculation);
    }
  });
  it("has both ale and lager yeasts", () => {
    expect(YEASTS.some((y) => y.type === "ale")).toBe(true);
    expect(YEASTS.some((y) => y.type === "lager")).toBe(true);
  });
});

describe("adjuncts data", () => {
  it("has at least 10 adjuncts", () => {
    expect(ADJUNCTS.length).toBeGreaterThanOrEqual(10);
  });
  it("each adjunct has required fields", () => {
    for (const adj of ADJUNCTS) {
      expect(adj.name).toBeTruthy();
      expect(typeof adj.fermentable).toBe("boolean");
    }
  });
});
