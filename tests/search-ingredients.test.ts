import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

describe("search_ingredients tool", () => {
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

  it("searches hops by name", async () => {
    const result = await client.callTool({
      name: "search_ingredients",
      arguments: { query: "Cascade" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("Cascade");
    expect(text).toContain("Alpha");
    expect(text).toContain("Aromas:");
  });

  it("searches by aroma returning multiple hops", async () => {
    const result = await client.callTool({
      name: "search_ingredients",
      arguments: { query: "citrus", category: "hops" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("citrus");
    // Multiple hops should have citrus aromas
    const hopHeaders = text.match(/## /g);
    expect(hopHeaders).not.toBeNull();
    expect(hopHeaders!.length).toBeGreaterThanOrEqual(2);
  });

  it("filters by category to only search malts", async () => {
    const result = await client.callTool({
      name: "search_ingredients",
      arguments: { query: "Pale", category: "malts" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("Colour:");
    expect(text).toContain("Flavour:");
    // Should not contain hop-specific fields
    expect(text).not.toContain("Alpha Acids:");
  });

  it("searches yeasts by best-for style", async () => {
    const result = await client.callTool({
      name: "search_ingredients",
      arguments: { query: "IPA", category: "yeasts" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("Attenuation:");
    expect(text).toContain("Temp:");
  });

  it("returns helpful message for no results", async () => {
    const result = await client.callTool({
      name: "search_ingredients",
      arguments: { query: "zzzzxyzzy" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("No ingredients found");
    expect(text).toContain("zzzzxyzzy");
  });

  // Regression: yeast tempMin/tempMax data is in °C; the formatter previously
  // labelled it °F, which is incoherent (US-05 at 18-23°F would be near-frozen).
  it("formats yeast fermentation temperature in Celsius", async () => {
    const result = await client.callTool({
      name: "search_ingredients",
      arguments: { query: "US-05", category: "yeasts" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("US-05");
    expect(text).toMatch(/Temp:\s*\d+-\d+°C/);
    expect(text).not.toMatch(/Temp:\s*\d+-\d+°F/);
  });
});
