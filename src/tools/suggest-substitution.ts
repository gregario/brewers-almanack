import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { HOPS } from "../data/hops.js";
import { MALTS } from "../data/malts.js";
import { YEASTS } from "../data/yeasts.js";
import { fuzzySearch } from "../lib/search.js";
import type { Hop, Malt, Yeast } from "../types.js";

function formatHopSubstitutes(hop: Hop, substitutes: Hop[], role?: string): string {
  const lines = [
    `# Substitutes for ${hop.name} (Hop)`,
    `Origin: ${hop.origin} | AA: ${hop.alphaAcidMin}-${hop.alphaAcidMax}% | Purpose: ${hop.purpose}`,
    `Aromas: ${hop.aromas.join(", ")}`,
    "",
    "## Suggested Substitutes",
    "",
  ];

  let sorted = [...substitutes];
  if (role === "bittering") {
    sorted.sort((a, b) => b.alphaAcidMax - a.alphaAcidMax);
  }

  for (const sub of sorted) {
    lines.push(`- **${sub.name}** — AA: ${sub.alphaAcidMin}-${sub.alphaAcidMax}%, ${sub.purpose}`);
    lines.push(`  Aromas: ${sub.aromas.join(", ")}`);
  }

  if (role === "bittering") {
    lines.push("");
    lines.push("_Sorted by highest alpha acid for bittering use._");
  }

  return lines.join("\n");
}

function formatMaltSubstitutes(malt: Malt, substitutes: Malt[]): string {
  const lines = [
    `# Substitutes for ${malt.name} (Malt)`,
    `Type: ${malt.type} | Colour: ${malt.colour} EBC | Potential: ${malt.potential} PPG`,
    `Flavour: ${malt.flavour}`,
    "",
    "## Suggested Substitutes",
    "",
  ];

  for (const sub of substitutes) {
    lines.push(`- **${sub.name}** (${sub.producer}) — ${sub.colour} EBC, ${sub.type}`);
    lines.push(`  Flavour: ${sub.flavour}`);
  }

  return lines.join("\n");
}

function formatYeastSubstitutes(yeast: Yeast, substitutes: Yeast[]): string {
  const lines = [
    `# Substitutes for ${yeast.name} (Yeast)`,
    `${yeast.producer} ${yeast.code} | Type: ${yeast.type} | Form: ${yeast.form}`,
    `Attenuation: ${yeast.attenuationMin}-${yeast.attenuationMax}% | Temp: ${yeast.tempMin}-${yeast.tempMax}°C`,
    `Profile: ${yeast.flavourProfile}`,
    "",
    "## Suggested Substitutes",
    "",
  ];

  for (const sub of substitutes) {
    lines.push(`- **${sub.name}** (${sub.producer} ${sub.code}) — ${sub.form}`);
    lines.push(`  Attenuation: ${sub.attenuationMin}-${sub.attenuationMax}% | Temp: ${sub.tempMin}-${sub.tempMax}°C`);
    lines.push(`  Profile: ${sub.flavourProfile}`);
  }

  return lines.join("\n");
}

function findHopSubstitutes(hop: Hop): Hop[] {
  const subs: Hop[] = [];
  for (const subName of hop.substitutes) {
    const found = HOPS.find((h) => h.name.toLowerCase() === subName.toLowerCase());
    if (found) subs.push(found);
  }
  return subs;
}

function findMaltSubstitutes(malt: Malt): Malt[] {
  // Find malts of the same type with similar colour
  const colourRange = Math.max(malt.colour * 0.5, 2);
  return MALTS.filter(
    (m) =>
      m.name !== malt.name &&
      m.type === malt.type &&
      Math.abs(m.colour - malt.colour) <= colourRange,
  ).slice(0, 5);
}

function findYeastSubstitutes(yeast: Yeast): Yeast[] {
  const attRange = 5;
  return YEASTS.filter(
    (y) =>
      y.name !== yeast.name &&
      y.type === yeast.type &&
      Math.abs(y.attenuationMin - yeast.attenuationMin) <= attRange &&
      Math.abs(y.attenuationMax - yeast.attenuationMax) <= attRange,
  ).slice(0, 5);
}

export function registerSuggestSubstitution(server: McpServer): void {
  server.registerTool(
    "suggest_substitution",
    {
      title: "Suggest Ingredient Substitution",
      description:
        "Find substitutes for a brewing ingredient (hop, malt, or yeast). Suggests alternatives with similar characteristics, showing key properties for comparison.",
      inputSchema: {
        ingredient: z
          .string()
          .describe("Name of the ingredient to find substitutes for (e.g. 'Citra', 'Maris Otter', 'US-05')"),
        role: z
          .string()
          .optional()
          .describe("Role in recipe for context (e.g. 'bittering', 'aroma', 'base', 'specialty')"),
        style: z
          .string()
          .optional()
          .describe("Target beer style for context (e.g. 'American IPA', 'Stout')"),
      },
    },
    async ({ ingredient, role }) => {
      // Try hops first
      const hopMatches = fuzzySearch(HOPS, ingredient, ["name"]);
      if (hopMatches.length > 0) {
        const hop = hopMatches[0];
        const substitutes = findHopSubstitutes(hop);
        if (substitutes.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Found ${hop.name} but no substitutes are listed in the database.`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text: formatHopSubstitutes(hop, substitutes, role),
            },
          ],
        };
      }

      // Try malts
      const maltMatches = fuzzySearch(MALTS, ingredient, ["name"]);
      if (maltMatches.length > 0) {
        const malt = maltMatches[0];
        const substitutes = findMaltSubstitutes(malt);
        if (substitutes.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Found ${malt.name} but no similar malts found in the database.`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text: formatMaltSubstitutes(malt, substitutes),
            },
          ],
        };
      }

      // Try yeasts (search by name and code)
      const yeastMatches = fuzzySearch(YEASTS, ingredient, ["name", "code"]);
      if (yeastMatches.length > 0) {
        const yeast = yeastMatches[0];
        const substitutes = findYeastSubstitutes(yeast);
        if (substitutes.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Found ${yeast.name} but no similar yeasts found in the database.`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text: formatYeastSubstitutes(yeast, substitutes),
            },
          ],
        };
      }

      // Nothing found
      return {
        content: [
          {
            type: "text" as const,
            text: `Could not find '${ingredient}' in hops, malts, or yeasts. Try searching with a different name or check spelling.`,
          },
        ],
      };
    },
  );
}
