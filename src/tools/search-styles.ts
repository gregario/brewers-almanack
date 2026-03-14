import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerSearchStyles(server: McpServer): void {
  server.registerTool(
    "search_styles",
    {
      title: "Search Beer Styles",
      description:
        "Search BJCP beer styles by name, category, or characteristics. Returns vital statistics, overall impression, typical ingredients, and commercial examples.",
      inputSchema: {
        query: z
          .string()
          .describe(
            "Style name, category, or characteristic to search for",
          ),
      },
    },
    async ({ query }) => ({
      content: [
        {
          type: "text" as const,
          text: `search_styles: not yet implemented (query: ${query})`,
        },
      ],
    }),
  );
}
