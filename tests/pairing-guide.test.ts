import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

describe("pairing_guide tool", () => {
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

  it("searches by style IPA returns pairings", async () => {
    const result = await client.callTool({
      name: "pairing_guide",
      arguments: { query: "IPA" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("IPA");
    expect(text).toContain("Dishes:");
  });

  it("searches by food returns matching styles", async () => {
    const result = await client.callTool({
      name: "pairing_guide",
      arguments: { query: "burger" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text.length).toBeGreaterThan(0);
    // Should find styles that pair with burgers
    expect(text).toContain("##");
  });

  it("results include pairing principles", async () => {
    const result = await client.callTool({
      name: "pairing_guide",
      arguments: { query: "IPA" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("Pairing principles:");
    expect(text).toContain("Complement");
  });

  it("no match returns helpful message", async () => {
    const result = await client.callTool({
      name: "pairing_guide",
      arguments: { query: "zzzzxyzzy" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("No pairing");
  });
});
