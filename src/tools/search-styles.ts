import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { STYLES } from "../data/styles.js";
import { fuzzySearch } from "../lib/search.js";
import type { BeerStyle } from "../types.js";

function formatStyle(style: BeerStyle): string {
  const { vitalStats: v } = style;
  return [
    `## ${style.name} (${style.id})`,
    `Category: ${style.category}`,
    `OG: ${v.ogMin}-${v.ogMax} | FG: ${v.fgMin}-${v.fgMax}`,
    `IBU: ${v.ibuMin}-${v.ibuMax} | SRM: ${v.srmMin}-${v.srmMax} | ABV: ${v.abvMin}-${v.abvMax}%`,
    "",
    style.overallImpression,
    "",
    `Ingredients: ${style.ingredients}`,
    `Examples: ${style.examples}`,
  ].join("\n");
}

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
    async ({ query }) => {
      const results = fuzzySearch(
        STYLES,
        query,
        ["name", "category", "overallImpression", "ingredients", "tags"],
      ).slice(0, 5);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No styles found matching '${query}'. Try broader terms like 'IPA', 'stout', 'lager', or 'Belgian'.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: results.map(formatStyle).join("\n\n---\n\n"),
          },
        ],
      };
    },
  );
}
