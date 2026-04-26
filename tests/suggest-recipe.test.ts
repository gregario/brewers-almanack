import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

describe("suggest_recipe tool", () => {
  let client: Client;

  beforeAll(async () => {
    const server = createServer();
    client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  });

  it("suggests recipe for American IPA with all sections", async () => {
    const result = await client.callTool({
      name: "suggest_recipe",
      arguments: { style: "American IPA" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("American IPA");
    expect(text).toContain("Grain Bill");
    expect(text).toContain("Hop Schedule");
    expect(text).toContain("Yeast");
    expect(text).toContain("Process");
  });

  it("contains appropriate ingredients for IPA", async () => {
    const result = await client.callTool({
      name: "suggest_recipe",
      arguments: { style: "American IPA" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    // Should contain at least one common IPA hop
    const hasIpaHop =
      text.includes("Cascade") ||
      text.includes("Centennial") ||
      text.includes("Citra") ||
      text.includes("Simcoe") ||
      text.includes("Mosaic") ||
      text.includes("Columbus") ||
      text.includes("Amarillo") ||
      text.includes("Chinook");
    expect(hasIpaHop).toBe(true);
  });

  it("handles unknown style gracefully", async () => {
    const result = await client.callTool({
      name: "suggest_recipe",
      arguments: { style: "zzzzxyzzy" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("not find");
  });

  it("respects batch_size_litres parameter", async () => {
    const result20 = await client.callTool({
      name: "suggest_recipe",
      arguments: { style: "American IPA", batch_size_litres: 20 },
    });
    const result40 = await client.callTool({
      name: "suggest_recipe",
      arguments: { style: "American IPA", batch_size_litres: 40 },
    });
    const text20 = (result20.content as Array<{ type: string; text: string }>)[0].text;
    const text40 = (result40.content as Array<{ type: string; text: string }>)[0].text;
    expect(text20).toContain("20");
    expect(text40).toContain("40");
  });

  // Regression test for grain bill unit bug: previously the calculation
  // mismatched imperial PPG and metric (kg/L), producing grain weights
  // ~8.3x too high (e.g. 40 kg of base malt for a 20L IPA, which would
  // give an impossible OG). For a normal-strength all-grain beer the
  // total grain bill should land around 0.15–0.30 kg per litre.
  describe("grain bill weight is realistic (regression)", () => {
    const cases: Array<{ style: string; batchLitres: number }> = [
      { style: "American IPA", batchLitres: 20 },
      { style: "American IPA", batchLitres: 40 },
      { style: "American Pale Ale", batchLitres: 20 },
      { style: "American Stout", batchLitres: 20 },
      { style: "Weissbier", batchLitres: 20 },
      { style: "German Pils", batchLitres: 20 },
    ];

    function parseGrainBillKg(text: string): number {
      // Parse the markdown grain bill section and sum the kg numbers.
      const lines = text.split("\n");
      const grainStart = lines.findIndex((l) => l.startsWith("## Grain Bill"));
      expect(grainStart).toBeGreaterThanOrEqual(0);
      let total = 0;
      for (let i = grainStart + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith("##")) break;
        const match = line.match(/:\s*([\d.]+)\s*kg/);
        if (match) total += parseFloat(match[1]);
      }
      return total;
    }

    it.each(cases)(
      "$style at $batchLitres L produces a sensible grain bill",
      async ({ style, batchLitres }) => {
        const result = await client.callTool({
          name: "suggest_recipe",
          arguments: { style, batch_size_litres: batchLitres },
        });
        const text = (result.content as Array<{ type: string; text: string }>)[0].text;
        const totalKg = parseGrainBillKg(text);
        const kgPerLitre = totalKg / batchLitres;

        // Sanity floor: too small means a unit went the other way (g vs kg).
        // Sanity ceiling: 0.30 kg/L covers strong styles up to ~OG 1.085-ish.
        // Anything above that suggests a unit/efficiency bug returning.
        expect(kgPerLitre).toBeGreaterThan(0.1);
        expect(kgPerLitre).toBeLessThan(0.35);
      },
    );

    it("American IPA at 20L stays well under the broken value (~40 kg)", async () => {
      const result = await client.callTool({
        name: "suggest_recipe",
        arguments: { style: "American IPA", batch_size_litres: 20 },
      });
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const totalKg = parseGrainBillKg(text);
      // Pre-fix: total would be ~47 kg. Post-fix it should be ~5–6 kg.
      expect(totalKg).toBeLessThan(10);
      expect(totalKg).toBeGreaterThan(3);
    });
  });

  // Regression test for fermentation temperature display bug: previously the
  // tool labelled the Celsius source data as °F and applied an (F-32)*5/9
  // conversion, producing nonsense like "18-23°F (-8--5°C)" for US-05.
  describe("fermentation temperature display (regression)", () => {
    function extractFermLine(text: string): string {
      const lines = text.split("\n");
      const line = lines.find((l) => l.includes("Fermentation:"));
      expect(line).toBeDefined();
      return line as string;
    }

    it("American IPA shows sensible Celsius ferm temp for US-05 (~18-22°C)", async () => {
      const result = await client.callTool({
        name: "suggest_recipe",
        arguments: { style: "American IPA" },
      });
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const fermLine = extractFermLine(text);
      // Must report Celsius range that is plausible for ale fermentation.
      const cMatch = fermLine.match(/(\d+)-(\d+)°C/);
      expect(cMatch).not.toBeNull();
      const cMin = Number(cMatch![1]);
      const cMax = Number(cMatch![2]);
      // Ale yeasts ferment roughly 15-25°C. Anything below 5°C is the bug.
      expect(cMin).toBeGreaterThanOrEqual(10);
      expect(cMax).toBeLessThanOrEqual(30);
      expect(cMin).toBeLessThan(cMax);
    });

    it("does not contain the broken negative-Celsius output", async () => {
      const result = await client.callTool({
        name: "suggest_recipe",
        arguments: { style: "American IPA" },
      });
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      // Pre-fix output looked like "18-23°F (-8--5°C)" — a leading minus sign
      // immediately after "(" before a digit was the smoking gun.
      expect(text).not.toMatch(/\(-\d/);
      // Two consecutive minus signs in the temperature line are also impossible
      // for a sensible Celsius range like "-8--5".
      expect(text).not.toMatch(/--/);
    });

    it("German Pils shows lager-range ferm temp (~9-13°C)", async () => {
      const result = await client.callTool({
        name: "suggest_recipe",
        arguments: { style: "German Pils" },
      });
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      const fermLine = extractFermLine(text);
      const cMatch = fermLine.match(/(\d+)-(\d+)°C/);
      expect(cMatch).not.toBeNull();
      const cMin = Number(cMatch![1]);
      const cMax = Number(cMatch![2]);
      // Lager yeasts ferment roughly 8-15°C.
      expect(cMin).toBeGreaterThanOrEqual(5);
      expect(cMax).toBeLessThanOrEqual(20);
    });
  });
});
