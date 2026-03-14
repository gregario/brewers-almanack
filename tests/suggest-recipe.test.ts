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
});
