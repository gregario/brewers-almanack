import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

describe("search_styles tool", () => {
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

  it("finds American IPA by name", async () => {
    const result = await client.callTool({
      name: "search_styles",
      arguments: { query: "American IPA" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("American IPA");
    expect(text).toContain("IPA");
    expect(text).toContain("OG:");
    expect(text).toContain("IBU:");
    expect(text).toContain("ABV:");
  });

  it("finds styles by category", async () => {
    const result = await client.callTool({
      name: "search_styles",
      arguments: { query: "stout" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text.toLowerCase()).toContain("stout");
  });

  it("finds styles by tag", async () => {
    const result = await client.callTool({
      name: "search_styles",
      arguments: { query: "session" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text.length).toBeGreaterThan(0);
    // Session tag should find session-strength styles
    expect(text).toContain("##");
  });

  it("returns helpful message for no results", async () => {
    const result = await client.callTool({
      name: "search_styles",
      arguments: { query: "zzzzxyzzy" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("No styles found matching");
    expect(text).toContain("zzzzxyzzy");
    expect(text).toContain("IPA");
  });
});
