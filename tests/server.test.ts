import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

describe("brewers-almanack server", () => {
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

  it("lists 6 tools", async () => {
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(6);
  });

  it("has search_styles tool", async () => {
    const { tools } = await client.listTools();
    expect(tools.find((t) => t.name === "search_styles")).toBeDefined();
  });

  it("has search_ingredients tool", async () => {
    const { tools } = await client.listTools();
    expect(tools.find((t) => t.name === "search_ingredients")).toBeDefined();
  });

  it("has diagnose_off_flavour tool", async () => {
    const { tools } = await client.listTools();
    expect(tools.find((t) => t.name === "diagnose_off_flavour")).toBeDefined();
  });

  it("has match_water_profile tool", async () => {
    const { tools } = await client.listTools();
    expect(tools.find((t) => t.name === "match_water_profile")).toBeDefined();
  });

  it("has suggest_recipe tool", async () => {
    const { tools } = await client.listTools();
    expect(tools.find((t) => t.name === "suggest_recipe")).toBeDefined();
  });

  it("has pairing_guide tool", async () => {
    const { tools } = await client.listTools();
    expect(tools.find((t) => t.name === "pairing_guide")).toBeDefined();
  });
});
