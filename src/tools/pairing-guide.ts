import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPairingGuide(server: McpServer): void {
  server.registerTool(
    "pairing_guide",
    {
      title: "Pairing Guide",
      description:
        "Get beer and food pairing suggestions. Search by beer style or dish name. Returns pairing matches with complement, contrast, and cleanse principles.",
      inputSchema: {
        query: z
          .string()
          .describe("Beer style or dish name to find pairings for"),
      },
    },
    async ({ query }) => ({
      content: [
        {
          type: "text" as const,
          text: `pairing_guide: not yet implemented (query: ${query})`,
        },
      ],
    }),
  );
}
