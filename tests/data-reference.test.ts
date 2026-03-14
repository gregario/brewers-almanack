import { describe, it, expect } from "vitest";
import { WATER_PROFILES } from "../src/data/water-profiles.js";
import { OFF_FLAVOURS } from "../src/data/off-flavours.js";
import { PAIRINGS } from "../src/data/pairings.js";

describe("water profiles data", () => {
  it("has at least 10 profiles", () => {
    expect(WATER_PROFILES.length).toBeGreaterThanOrEqual(10);
  });
  it("each profile has mineral content", () => {
    for (const wp of WATER_PROFILES) {
      expect(wp.name).toBeTruthy();
      expect(wp.calcium).toBeGreaterThanOrEqual(0);
      expect(wp.sulfate).toBeGreaterThanOrEqual(0);
      expect(wp.bestFor.length).toBeGreaterThan(0);
    }
  });
  it("includes Burton-on-Trent", () => {
    const burton = WATER_PROFILES.find((w) => w.name === "Burton-on-Trent");
    expect(burton).toBeDefined();
    expect(burton!.sulfate).toBeGreaterThan(500);
  });
});

describe("off-flavours data", () => {
  it("has at least 15 off-flavours", () => {
    expect(OFF_FLAVOURS.length).toBeGreaterThanOrEqual(15);
  });
  it("each off-flavour has causes and prevention", () => {
    for (const of_ of OFF_FLAVOURS) {
      expect(of_.name).toBeTruthy();
      expect(of_.character).toBeTruthy();
      expect(of_.causes.length).toBeGreaterThan(0);
      expect(of_.prevention.length).toBeGreaterThan(0);
    }
  });
  it("includes diacetyl", () => {
    const diacetyl = OFF_FLAVOURS.find((o) => o.name === "Diacetyl");
    expect(diacetyl).toBeDefined();
    expect(diacetyl!.character.toLowerCase()).toContain("butter");
  });
});

describe("pairings data", () => {
  it("has at least 15 pairings", () => {
    expect(PAIRINGS.length).toBeGreaterThanOrEqual(15);
  });
  it("each pairing has dishes and principles", () => {
    for (const p of PAIRINGS) {
      expect(p.style).toBeTruthy();
      expect(p.dishes.length).toBeGreaterThan(0);
      expect(p.principles.length).toBeGreaterThan(0);
    }
  });
});
