import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { WATER_PROFILES } from "../data/water-profiles.js";
import { STYLES } from "../data/styles.js";
import { fuzzySearch } from "../lib/search.js";
import type { WaterProfile } from "../types.js";

function formatProfile(wp: WaterProfile): string {
  const ratio =
    wp.chloride > 0
      ? (wp.sulfate / wp.chloride).toFixed(1)
      : wp.sulfate > 0
        ? "∞"
        : "0.0";
  return [
    `## ${wp.name} (${wp.city})`,
    `Ca: ${wp.calcium} | Mg: ${wp.magnesium} | Na: ${wp.sodium}`,
    `Cl: ${wp.chloride} | SO4: ${wp.sulfate} | HCO3: ${wp.bicarbonate}`,
    `Sulfate:Chloride ratio: ${ratio}`,
    "",
    wp.description,
    "",
    `Best for: ${wp.bestFor.join(", ")}`,
  ].join("\n");
}

export function registerMatchWaterProfile(server: McpServer): void {
  server.registerTool(
    "match_water_profile",
    {
      title: "Match Water Profile",
      description:
        "Find brewing water profiles by city name or beer style. Returns mineral composition (Ca, Mg, Na, Cl, SO4, HCO3) and style recommendations.",
      inputSchema: {
        query: z
          .string()
          .describe("City name or beer style to find water profile for"),
      },
    },
    async ({ query }) => {
      // Strategy 1: search water profiles by name/city
      let results = fuzzySearch(WATER_PROFILES, query, ["name", "city"]);

      // Strategy 2: if no direct match, search by bestFor (style name)
      if (results.length === 0 && query.trim()) {
        results = fuzzySearch(WATER_PROFILES, query, ["bestFor"]);
      }

      // Strategy 3: if still no match, search styles first, then find water profiles for those styles
      if (results.length === 0 && query.trim()) {
        const matchedStyles = fuzzySearch(STYLES, query, ["name", "category"]);
        if (matchedStyles.length > 0) {
          const styleNames = matchedStyles.map((s) => s.name.toLowerCase());
          results = WATER_PROFILES.filter((wp) =>
            wp.bestFor.some((bf) =>
              styleNames.some((sn) => bf.toLowerCase().includes(sn) || sn.includes(bf.toLowerCase())),
            ),
          );
        }
      }

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No water profiles found matching '${query}'. Try a city name (e.g. 'Burton', 'Dublin') or beer style (e.g. 'IPA', 'Pilsner').`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: results.map(formatProfile).join("\n\n---\n\n"),
          },
        ],
      };
    },
  );
}
