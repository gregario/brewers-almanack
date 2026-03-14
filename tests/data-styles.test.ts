import { describe, it, expect } from "vitest";
import { STYLES } from "../src/data/styles.js";

describe("styles data", () => {
  it("has at least 30 styles", () => {
    expect(STYLES.length).toBeGreaterThanOrEqual(30);
  });

  it("each style has required fields", () => {
    for (const style of STYLES) {
      expect(style.id).toBeTruthy();
      expect(style.name).toBeTruthy();
      expect(style.category).toBeTruthy();
      expect(style.vitalStats.ogMin).toBeLessThanOrEqual(style.vitalStats.ogMax);
      expect(style.vitalStats.ibuMin).toBeLessThanOrEqual(style.vitalStats.ibuMax);
      expect(style.vitalStats.abvMin).toBeLessThanOrEqual(style.vitalStats.abvMax);
      expect(style.tags.length).toBeGreaterThan(0);
    }
  });

  it("can find American IPA", () => {
    const ipa = STYLES.find((s) => s.id === "21A");
    expect(ipa).toBeDefined();
    expect(ipa!.name).toBe("American IPA");
    expect(ipa!.vitalStats.ibuMin).toBeGreaterThanOrEqual(40);
  });

  it("has no duplicate IDs", () => {
    const ids = STYLES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each style has valid categoryNumber and styleLetter", () => {
    for (const style of STYLES) {
      expect(style.categoryNumber).toBeGreaterThanOrEqual(1);
      expect(style.styleLetter).toBeTruthy();
    }
  });

  it("each style has overallImpression, ingredients, and examples", () => {
    for (const style of STYLES) {
      expect(style.overallImpression).toBeTruthy();
      expect(style.ingredients).toBeTruthy();
      expect(style.examples).toBeTruthy();
    }
  });

  it("vital stats are in reasonable ranges", () => {
    for (const style of STYLES) {
      const { vitalStats: v } = style;
      // OG should be between 1.020 and 1.150
      expect(v.ogMin).toBeGreaterThanOrEqual(1.02);
      expect(v.ogMax).toBeLessThanOrEqual(1.15);
      // FG should be between 0.990 and 1.040
      expect(v.fgMin).toBeGreaterThanOrEqual(0.99);
      expect(v.fgMax).toBeLessThanOrEqual(1.04);
      // IBU 0-120
      expect(v.ibuMin).toBeGreaterThanOrEqual(0);
      expect(v.ibuMax).toBeLessThanOrEqual(120);
      // SRM 0-80
      expect(v.srmMin).toBeGreaterThanOrEqual(0);
      expect(v.srmMax).toBeLessThanOrEqual(80);
      // ABV 0-15
      expect(v.abvMin).toBeGreaterThanOrEqual(0);
      expect(v.abvMax).toBeLessThanOrEqual(15);
    }
  });

  it("covers major style families", () => {
    const categories = new Set(STYLES.map((s) => s.category));
    // Should have representation from key families
    expect(categories.size).toBeGreaterThanOrEqual(15);
  });
});
