import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

describe("suggest_recipe sub-style awareness", () => {
  let client: Client;

  beforeAll(async () => {
    const server = createServer();
    client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  });

  it("resolves 'Black IPA' to a recipe with dark malts", async () => {
    const result = await client.callTool({ name: "suggest_recipe", arguments: { style: "Black IPA" } });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("Black IPA");
    expect(text).toMatch(/roasted|dehusked|debittered|carafa/i);
  });

  it("resolves 'Belgian IPA' to a recipe with Belgian yeast", async () => {
    const result = await client.callTool({ name: "suggest_recipe", arguments: { style: "Belgian IPA" } });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("Belgian IPA");
    expect(text).toMatch(/belgian/i);
  });

  it("resolves 'Rye IPA' to a recipe mentioning rye", async () => {
    const result = await client.callTool({ name: "suggest_recipe", arguments: { style: "Rye IPA" } });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("Rye IPA");
    expect(text).toMatch(/rye/i);
  });

  it("Black IPA has appropriate IBU range (50-90)", async () => {
    const result = await client.callTool({ name: "suggest_recipe", arguments: { style: "Black IPA" } });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const ibuMatch = text.match(/IBU:\s*(\d+)/);
    expect(ibuMatch).not.toBeNull();
    const ibu = parseInt(ibuMatch![1]);
    expect(ibu).toBeGreaterThanOrEqual(50);
    expect(ibu).toBeLessThanOrEqual(90);
  });

  it("plain 'Specialty IPA' still works as fallback", async () => {
    const result = await client.callTool({ name: "suggest_recipe", arguments: { style: "Specialty IPA" } });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).not.toContain("not find");
  });
});
