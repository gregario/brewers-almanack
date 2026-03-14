import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerSuggestRecipe(server: McpServer): void {
  server.registerTool(
    "suggest_recipe",
    {
      title: "Suggest Recipe",
      description:
        "Suggest a beer recipe for a target style. Returns grain bill, hop schedule, yeast selection, and process parameters.",
      inputSchema: {
        style: z.string().describe("Target beer style for the recipe"),
        batch_size_litres: z
          .number()
          .default(20)
          .describe("Batch size in litres"),
      },
    },
    async ({ style, batch_size_litres }) => ({
      content: [
        {
          type: "text" as const,
          text: `suggest_recipe: not yet implemented (style: ${style}, batch_size_litres: ${batch_size_litres})`,
        },
      ],
    }),
  );
}
