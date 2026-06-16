import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

describe("calculate_ibu tool", () => {
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

  it("calculates IBU for a single hop addition (Centennial 28g @ 10% AA, 60min, 20L, OG 1.065)", async () => {
    const result = await client.callTool({
      name: "calculate_ibu",
      arguments: {
        batch_volume_litres: 20,
        original_gravity: 1.065,
        hop_additions: [
          { name: "Centennial", weight_g: 28, alpha_acid_pct: 10, boil_minutes: 60 },
        ],
      },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;

    // Verify output format
    expect(text).toContain("# IBU Calculation (Tinseth)");
    expect(text).toContain("Batch: 20L | OG: 1.065");
    expect(text).toContain("## Hop Additions");
    expect(text).toContain("Centennial");
    expect(text).toContain("28g @ 10% AA");
    expect(text).toContain("60 min");
    expect(text).toContain("## Total:");

    // Tinseth formula for 28g @ 10% AA, 60min, 20L, OG 1.065:
    // bignessFactor = 1.65 * 0.000125^0.065 ≈ 0.920
    // boilTimeFactor = (1 - e^(-2.4)) / 4.15 ≈ 0.219
    // U ≈ 0.2015
    // IBU = (28 * 0.10 * 0.2015 * 1000) / 20 ≈ 28.2
    const ibuMatch = text.match(/## Total:\s*([\d.]+)\s*IBU/);
    expect(ibuMatch).not.toBeNull();
    const totalIbu = parseFloat(ibuMatch![1]);
    expect(totalIbu).toBeGreaterThan(27);
    expect(totalIbu).toBeLessThan(30);
  });

  it("sums multiple hop additions correctly", async () => {
    const result = await client.callTool({
      name: "calculate_ibu",
      arguments: {
        batch_volume_litres: 20,
        original_gravity: 1.050,
        hop_additions: [
          { name: "Magnum", weight_g: 15, alpha_acid_pct: 12, boil_minutes: 60 },
          { name: "Cascade", weight_g: 30, alpha_acid_pct: 5.5, boil_minutes: 15 },
        ],
      },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;

    // Should have both hop additions listed
    expect(text).toContain("Magnum");
    expect(text).toContain("Cascade");

    // Extract individual IBUs
    const additionMatches = text.match(/→\s*([\d.]+)\s*IBU/g);
    expect(additionMatches).not.toBeNull();
    expect(additionMatches).toHaveLength(2);

    // Extract total
    const totalMatch = text.match(/## Total:\s*([\d.]+)\s*IBU/);
    expect(totalMatch).not.toBeNull();
    const total = parseFloat(totalMatch![1]);

    // Sum individual contributions
    const individual1 = parseFloat(additionMatches![0].match(/([\d.]+)/)?.[1] ?? "0");
    const individual2 = parseFloat(additionMatches![1].match(/([\d.]+)/)?.[1] ?? "0");
    const summed = parseFloat((individual1 + individual2).toFixed(1));

    expect(total).toBe(summed);
  });

  it("returns 0 IBU for 0-minute addition (dry hop/whirlpool)", async () => {
    const result = await client.callTool({
      name: "calculate_ibu",
      arguments: {
        batch_volume_litres: 20,
        original_gravity: 1.055,
        hop_additions: [
          { name: "Citra", weight_g: 50, alpha_acid_pct: 12, boil_minutes: 0 },
        ],
      },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;

    // Individual addition should show 0 IBU
    expect(text).toMatch(/Citra.*→\s*0\.0\s*IBU/);

    // Total should be 0
    const totalMatch = text.match(/## Total:\s*([\d.]+)\s*IBU/);
    expect(totalMatch).not.toBeNull();
    expect(parseFloat(totalMatch![1])).toBe(0);
  });

  it("higher gravity reduces utilisation (same hop, low OG vs high OG)", async () => {
    const hopAddition = [
      { name: "Centennial", weight_g: 28, alpha_acid_pct: 10, boil_minutes: 60 },
    ];

    const resultLow = await client.callTool({
      name: "calculate_ibu",
      arguments: {
        batch_volume_litres: 20,
        original_gravity: 1.040,
        hop_additions: hopAddition,
      },
    });
    const resultHigh = await client.callTool({
      name: "calculate_ibu",
      arguments: {
        batch_volume_litres: 20,
        original_gravity: 1.090,
        hop_additions: hopAddition,
      },
    });

    const textLow = (resultLow.content as Array<{ type: string; text: string }>)[0].text;
    const textHigh = (resultHigh.content as Array<{ type: string; text: string }>)[0].text;

    const totalLow = parseFloat(textLow.match(/## Total:\s*([\d.]+)\s*IBU/)![1]);
    const totalHigh = parseFloat(textHigh.match(/## Total:\s*([\d.]+)\s*IBU/)![1]);

    // Lower gravity → higher utilisation → more IBU
    expect(totalLow).toBeGreaterThan(totalHigh);
  });
});
