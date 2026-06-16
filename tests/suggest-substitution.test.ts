import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

describe("suggest_substitution tool", () => {
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

  it("suggests hop substitutes for Citra", async () => {
    const result = await client.callTool({
      name: "suggest_substitution",
      arguments: { ingredient: "Citra" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      .text;
    expect(text).toContain("Citra");
    // Citra's substitutes are Mosaic, Galaxy, Simcoe
    expect(text).toContain("Mosaic");
    expect(text).toContain("Galaxy");
    expect(text).toContain("Simcoe");
  });

  it("suggests malt substitutes for Maris Otter", async () => {
    const result = await client.callTool({
      name: "suggest_substitution",
      arguments: { ingredient: "Maris Otter" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      .text;
    expect(text).toContain("Maris Otter");
    // Should suggest other base malts with similar colour (3.0 EBC, range ~1.5)
    // Golden Promise (2.5 EBC), Pale Ale Malt (3.5 EBC), Vienna (3.5 EBC) are all within range
    expect(text).toMatch(/Golden Promise|Pale Ale Malt|Vienna/);
  });

  it("suggests yeast substitutes for US-05", async () => {
    const result = await client.callTool({
      name: "suggest_substitution",
      arguments: { ingredient: "US-05" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      .text;
    // Should find SafAle US-05 by code and suggest similar clean ale yeasts
    expect(text).toMatch(/US-05|SafAle/i);
    // Nottingham (77-82) and San Diego Super (76-83) are close matches
    expect(text).toMatch(/Nottingham|San Diego|BRY-97|California Ale/i);
  });

  it("returns helpful message for unknown ingredient", async () => {
    const result = await client.callTool({
      name: "suggest_substitution",
      arguments: { ingredient: "Zymurgian Hops of Mystery" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      .text;
    expect(text).toMatch(/Could not find/i);
  });

  it("respects role context for hops", async () => {
    const result = await client.callTool({
      name: "suggest_substitution",
      arguments: { ingredient: "Cascade", role: "bittering" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      .text;
    expect(text).toContain("Cascade");
    // Should contain alpha acid info and bittering sort note
    expect(text).toMatch(/alpha/i);
  });
});
