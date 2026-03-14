import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PAIRINGS } from "../data/pairings.js";
import { fuzzySearch } from "../lib/search.js";
import type { FoodPairing } from "../types.js";

function formatPairing(pairing: FoodPairing): string {
  const lines = [
    `## ${pairing.style}`,
    `Dishes: ${pairing.dishes.join(", ")}`,
    "",
    "Pairing principles:",
    ...pairing.principles.map((p) => `- ${p}`),
  ];
  if (pairing.avoid.length > 0) {
    lines.push("", `Avoid: ${pairing.avoid.join(", ")}`);
  }
  return lines.join("\n");
}

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
    async ({ query }) => {
      // Search by style name
      let results = fuzzySearch(PAIRINGS, query, ["style"]);

      // Also search by dish text
      const byDish = fuzzySearch(PAIRINGS, query, ["dishes"]);

      // Merge, deduplicating
      const seen = new Set(results.map((r) => r.style));
      for (const p of byDish) {
        if (!seen.has(p.style)) {
          results.push(p);
          seen.add(p.style);
        }
      }

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No pairing suggestions found for '${query}'. Try a beer style (e.g. 'IPA', 'Stout', 'Pilsner') or a food (e.g. 'steak', 'cheese', 'chocolate').`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: results.map(formatPairing).join("\n\n---\n\n"),
          },
        ],
      };
    },
  );
}
