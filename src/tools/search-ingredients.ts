import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { HOPS } from "../data/hops.js";
import { MALTS } from "../data/malts.js";
import { YEASTS } from "../data/yeasts.js";
import { ADJUNCTS } from "../data/adjuncts.js";
import { fuzzySearch } from "../lib/search.js";
import type { Hop, Malt, Yeast, Adjunct } from "../types.js";

function formatHop(hop: Hop): string {
  return [
    `## ${hop.name} (Hop)`,
    `Origin: ${hop.origin}`,
    `Alpha Acids: ${hop.alphaAcidMin}-${hop.alphaAcidMax}%`,
    `Purpose: ${hop.purpose}`,
    `Aromas: ${hop.aromas.join(", ")}`,
    `Substitutes: ${hop.substitutes.join(", ")}`,
  ].join("\n");
}

function formatMalt(malt: Malt): string {
  return [
    `## ${malt.name} (Malt)`,
    `Producer: ${malt.producer}`,
    `Colour: ${malt.colour} SRM`,
    `Type: ${malt.type}`,
    `Flavour: ${malt.flavour}`,
  ].join("\n");
}

function formatYeast(yeast: Yeast): string {
  return [
    `## ${yeast.name} (Yeast)`,
    `Producer: ${yeast.producer} | Code: ${yeast.code}`,
    `Type: ${yeast.type} | Form: ${yeast.form}`,
    `Temp: ${yeast.tempMin}-${yeast.tempMax}°F`,
    `Attenuation: ${yeast.attenuationMin}-${yeast.attenuationMax}%`,
    `Flocculation: ${yeast.flocculation}`,
    `Flavour: ${yeast.flavourProfile}`,
    `Best for: ${yeast.bestFor.join(", ")}`,
  ].join("\n");
}

function formatAdjunct(adjunct: Adjunct): string {
  return [
    `## ${adjunct.name} (Adjunct)`,
    `Type: ${adjunct.type}`,
    `Usage: ${adjunct.usageRate}`,
    `Effect: ${adjunct.effect}`,
  ].join("\n");
}

type FormattedResult = { text: string };

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
    async ({ query, category }) => {
      const results: FormattedResult[] = [];

      if (category === "all" || category === "hops") {
        const hops = fuzzySearch(HOPS, query, ["name", "origin", "purpose", "aromas", "styles", "description"]);
        results.push(...hops.map((h) => ({ text: formatHop(h) })));
      }

      if (category === "all" || category === "malts") {
        const malts = fuzzySearch(MALTS, query, ["name", "producer", "type", "flavour", "description"]);
        results.push(...malts.map((m) => ({ text: formatMalt(m) })));
      }

      if (category === "all" || category === "yeasts") {
        const yeasts = fuzzySearch(YEASTS, query, ["name", "producer", "code", "type", "flavourProfile", "bestFor"]);
        results.push(...yeasts.map((y) => ({ text: formatYeast(y) })));
      }

      if (category === "all" || category === "adjuncts") {
        const adjuncts = fuzzySearch(ADJUNCTS, query, ["name", "type", "effect", "description"]);
        results.push(...adjuncts.map((a) => ({ text: formatAdjunct(a) })));
      }

      const limited = results.slice(0, 10);

      if (limited.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No ingredients found matching '${query}'. Try searching by name (e.g. 'Cascade'), characteristic (e.g. 'citrus'), or type (e.g. 'base malt').`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: limited.map((r) => r.text).join("\n\n---\n\n"),
          },
        ],
      };
    },
  );
}
