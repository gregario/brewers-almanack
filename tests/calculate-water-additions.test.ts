import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

describe("calculate_water_additions tool", () => {
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

  it("calculates additions from RO water to Burton profile", async () => {
    const result = await client.callTool({
      name: "calculate_water_additions",
      arguments: {
        source_profile: "Reverse Osmosis",
        target_profile: "Burton-on-Trent",
        volume_litres: 20,
      },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      .text;
    expect(text).toContain("Burton");
    expect(text).toMatch(/gypsum|CaSO4/i);
    // Burton has 800 SO4 — should need lots of gypsum
    const gypsumMatch =
      text.match(/gypsum.*?(\d+\.?\d*)\s*g/i) ||
      text.match(/(\d+\.?\d*)\s*g.*?gypsum/i);
    expect(gypsumMatch).not.toBeNull();
    const gypsumG = parseFloat(gypsumMatch![1]);
    expect(gypsumG).toBeGreaterThan(5);
  });

  it("calculates Dublin source with custom target values", async () => {
    const result = await client.callTool({
      name: "calculate_water_additions",
      arguments: {
        source_profile: "Dublin",
        target_calcium: 200,
        target_sulfate: 300,
        target_chloride: 50,
        volume_litres: 19,
      },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      .text;
    expect(text).toMatch(/gypsum|calcium chloride|lactic/i);
  });

  it("handles custom source profile with numeric values", async () => {
    const result = await client.callTool({
      name: "calculate_water_additions",
      arguments: {
        source_calcium: 120,
        source_magnesium: 4,
        source_sodium: 12,
        source_chloride: 19,
        source_sulfate: 54,
        source_bicarbonate: 315,
        target_profile: "Burton-on-Trent",
        volume_litres: 20,
      },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      .text;
    expect(text).toContain("Burton");
    expect(text).toMatch(/gypsum|CaSO4/i);
  });

  it("recommends lactic acid when bicarbonate needs reducing", async () => {
    const result = await client.callTool({
      name: "calculate_water_additions",
      arguments: {
        source_profile: "Dublin",
        target_profile: "Pilsen",
        volume_litres: 20,
      },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      .text;
    // Dublin 315 bicarb → Pilsen 15 bicarb = needs acid
    expect(text).toMatch(/lactic acid/i);
  });

  it("returns no additions when source matches target", async () => {
    const result = await client.callTool({
      name: "calculate_water_additions",
      arguments: {
        source_profile: "Dublin",
        target_profile: "Dublin",
        volume_litres: 20,
      },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      .text;
    expect(text).toMatch(/no additions|already match|0.*g/i);
  });
});
