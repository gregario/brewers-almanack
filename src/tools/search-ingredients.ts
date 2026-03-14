import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerSearchIngredients(server: McpServer): void {
  server.registerTool(
    "search_ingredients",
    {
      title: "Search Brewing Ingredients",
      description:
        "Search brewing ingredients (hops, malts, yeasts, adjuncts) by name, type, or characteristic. Returns detailed properties like alpha acids, colour, attenuation, and flavour profiles.",
      inputSchema: {
        query: z
          .string()
          .describe(
            "Ingredient name, type, or characteristic to search for",
          ),
        category: z
          .enum(["hops", "malts", "yeasts", "adjuncts", "all"])
          .default("all")
          .describe("Category of ingredient to search within"),
      },
    },
    async ({ query, category }) => ({
      content: [
        {
          type: "text" as const,
          text: `search_ingredients: not yet implemented (query: ${query}, category: ${category})`,
        },
      ],
    }),
  );
}
