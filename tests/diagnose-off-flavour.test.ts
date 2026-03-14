import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

describe("diagnose_off_flavour tool", () => {
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

  it("finds Diacetyl for 'buttery'", async () => {
    const result = await client.callTool({
      name: "diagnose_off_flavour",
      arguments: { description: "butter" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("Diacetyl");
    expect(text).toContain("Causes:");
    expect(text).toContain("Prevention:");
  });

  it("finds DMS for 'cooked corn'", async () => {
    const result = await client.callTool({
      name: "diagnose_off_flavour",
      arguments: { description: "cooked corn" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("DMS");
  });

  it("finds Oxidation for 'cardboard'", async () => {
    const result = await client.callTool({
      name: "diagnose_off_flavour",
      arguments: { description: "cardboard" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("Oxidation");
  });

  it("searches by compound name", async () => {
    const result = await client.callTool({
      name: "diagnose_off_flavour",
      arguments: { description: "acetaldehyde" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("Acetaldehyde");
  });

  it("returns troubleshooting advice for no match", async () => {
    const result = await client.callTool({
      name: "diagnose_off_flavour",
      arguments: { description: "zzzzxyzzy" },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain("troubleshoot");
  });
});
