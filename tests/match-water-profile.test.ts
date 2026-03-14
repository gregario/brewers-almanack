import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

describe("match_water_profile tool", () => {
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

  it("looks up Burton returns Burton-on-Trent", async () => {
    const result = await client.callTool({
      name: "match_water_profile",
      arguments: { query: "Burton" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("Burton-on-Trent");
    expect(text).toContain("Ca:");
    expect(text).toContain("SO4:");
  });

  it("looks up by style IPA returns profiles with IPA in bestFor", async () => {
    const result = await client.callTool({
      name: "match_water_profile",
      arguments: { query: "IPA" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("IPA");
    expect(text).toContain("Best for:");
  });

  it("empty query lists all profiles", async () => {
    const result = await client.callTool({
      name: "match_water_profile",
      arguments: { query: "" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    // Should contain multiple profiles
    const headers = text.match(/## /g);
    expect(headers).not.toBeNull();
    expect(headers!.length).toBeGreaterThanOrEqual(10);
  });

  it("Burton has sulfate > 500", async () => {
    const result = await client.callTool({
      name: "match_water_profile",
      arguments: { query: "Burton" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    // Burton-on-Trent has sulfate of 800
    expect(text).toContain("SO4: 800");
  });
});
