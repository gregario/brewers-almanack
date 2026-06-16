import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

describe("check_geb_stock tool", () => {
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

  it("returns valid response for any inventory state", async () => {
    const result = await client.callTool({
      name: "check_geb_stock",
      arguments: { query: "Citra" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      .text;
    expect(text).toContain("GEB Stock");
    expect(text).toMatch(/synced|products? found|Available|Out of Stock|Try Instead|No products/i);
  });

  it("includes last updated date", async () => {
    const result = await client.callTool({
      name: "check_geb_stock",
      arguments: { query: "Cascade" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      .text;
    expect(text).toMatch(/last updated/i);
  });

  it("accepts category filter parameter", async () => {
    const result = await client.callTool({
      name: "check_geb_stock",
      arguments: { query: "Maris Otter", category: "Base Malt" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      .text;
    expect(text).toContain("GEB Stock");
  });
});
