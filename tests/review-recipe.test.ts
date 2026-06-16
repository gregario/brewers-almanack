import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

describe("review_recipe tool", () => {
  let client: Client;

  beforeAll(async () => {
    const server = createServer();
    client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  });

  it("passes a recipe within BJCP guidelines", async () => {
    const result = await client.callTool({
      name: "review_recipe",
      arguments: { style: "American IPA", og: 1.065, fg: 1.012, ibu: 60, srm: 8, abv: 6.5 },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("American IPA");
    expect(text).toContain("OG");
    expect(text).toMatch(/✓|pass|in range/i);
  });

  it("flags OG that is too high for style", async () => {
    const result = await client.callTool({
      name: "review_recipe",
      arguments: { style: "American IPA", og: 1.120, fg: 1.012, ibu: 60, srm: 8, abv: 6.5 },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toMatch(/OG.*high|OG.*above|OG.*✗|OG.*fail|OG.*out of range/i);
  });

  it("flags IBU below style minimum", async () => {
    const result = await client.callTool({
      name: "review_recipe",
      arguments: { style: "American IPA", og: 1.065, fg: 1.012, ibu: 20, srm: 8, abv: 6.5 },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toMatch(/IBU.*low|IBU.*below|IBU.*✗|IBU.*fail|IBU.*out of range/i);
  });

  it("handles unknown style gracefully", async () => {
    const result = await client.callTool({
      name: "review_recipe",
      arguments: { style: "Zygomorphic Pale Ale", og: 1.050, fg: 1.010, ibu: 30, srm: 5, abv: 5.0 },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("not find");
  });

  it("works with sub-styles like Black IPA", async () => {
    const result = await client.callTool({
      name: "review_recipe",
      arguments: { style: "Black IPA", og: 1.068, fg: 1.013, ibu: 70, srm: 30, abv: 6.7 },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("Black IPA");
    expect(text).not.toContain("not find");
  });
});
