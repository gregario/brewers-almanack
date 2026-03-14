import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDiagnoseOffFlavour(server: McpServer): void {
  server.registerTool(
    "diagnose_off_flavour",
    {
      title: "Diagnose Off-Flavour",
      description:
        "Diagnose beer off-flavours from taste or aroma descriptions. Returns the likely compound, causes, prevention steps, detection threshold, and styles where it may be acceptable.",
      inputSchema: {
        description: z
          .string()
          .describe("Taste or aroma description of the off-flavour"),
      },
    },
    async ({ description }) => ({
      content: [
        {
          type: "text" as const,
          text: `diagnose_off_flavour: not yet implemented (description: ${description})`,
        },
      ],
    }),
  );
}
