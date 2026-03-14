import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { STYLES } from "../data/styles.js";
import { HOPS } from "../data/hops.js";
import { MALTS } from "../data/malts.js";
import { YEASTS } from "../data/yeasts.js";
import { WATER_PROFILES } from "../data/water-profiles.js";
import { fuzzySearch } from "../lib/search.js";

function findStyle(query: string) {
  const results = fuzzySearch(STYLES, query, ["name", "category"]);
  return results.length > 0 ? results[0] : null;
}

function selectMalts(styleName: string, category: string, tags: string[]) {
  // Pick a base malt
  const baseMalts = MALTS.filter((m) => m.type === "base");
  const base = baseMalts[0]; // Default to first base malt (typically Pale Malt)

  // Pick specialty malts based on style character
  const specialtyMalts = MALTS.filter((m) => m.type !== "base");
  const lower = (category + " " + styleName + " " + tags.join(" ")).toLowerCase();

  const selected = specialtyMalts.filter((m) => {
    const mLower = (m.name + " " + m.flavour + " " + m.description).toLowerCase();
    // Match dark styles with roasted/dark malts
    if (lower.includes("stout") || lower.includes("porter")) {
      return m.type === "roasted" || mLower.includes("chocolate") || mLower.includes("roast");
    }
    if (lower.includes("amber") || lower.includes("red") || lower.includes("brown")) {
      return m.type === "crystal" || mLower.includes("caramel");
    }
    if (lower.includes("wheat")) {
      return mLower.includes("wheat");
    }
    // Default: pick a crystal malt for body
    return m.type === "crystal";
  }).slice(0, 2);

  return { base, specialty: selected.length > 0 ? selected : specialtyMalts.slice(0, 1) };
}

function selectHops(styleName: string) {
  // Find hops whose styles array includes this style
  const matching = HOPS.filter((h) =>
    h.styles.some((s) => s.toLowerCase().includes(styleName.toLowerCase()) ||
      styleName.toLowerCase().includes(s.toLowerCase())),
  );
  if (matching.length > 0) return matching.slice(0, 2);
  // Fallback: return first two dual/bittering hops
  return HOPS.filter((h) => h.purpose === "dual" || h.purpose === "bittering").slice(0, 2);
}

function selectYeast(styleName: string, tags: string[]) {
  // Find yeast whose bestFor includes this style
  const matching = YEASTS.filter((y) =>
    y.bestFor.some((bf) => bf.toLowerCase().includes(styleName.toLowerCase()) ||
      styleName.toLowerCase().includes(bf.toLowerCase())),
  );
  if (matching.length > 0) return matching[0];

  // Match by type based on tags
  const lower = tags.join(" ").toLowerCase();
  if (lower.includes("bottom-fermented") || lower.includes("lager")) {
    const lager = YEASTS.find((y) => y.type === "lager");
    if (lager) return lager;
  }
  if (lower.includes("wheat")) {
    const wheat = YEASTS.find((y) => y.type === "wheat");
    if (wheat) return wheat;
  }
  if (lower.includes("belgian")) {
    const belgian = YEASTS.find((y) => y.type === "belgian");
    if (belgian) return belgian;
  }
  // Default to first ale yeast
  return YEASTS.find((y) => y.type === "ale") ?? YEASTS[0];
}

function selectWater(styleName: string) {
  const matching = WATER_PROFILES.filter((wp) =>
    wp.bestFor.some((bf) => bf.toLowerCase().includes(styleName.toLowerCase()) ||
      styleName.toLowerCase().includes(bf.toLowerCase())),
  );
  return matching.length > 0 ? matching[0] : null;
}

function calculateGrainWeight(ogTarget: number, batchLitres: number, efficiency: number = 0.72): number {
  // Simplified grain weight calculation
  // OG points = (OG - 1) * 1000, e.g. 1.065 -> 65
  const ogPoints = (ogTarget - 1) * 1000;
  // Points needed for batch
  const totalPoints = ogPoints * batchLitres;
  // Base malt potential ~37 points per kg per litre at 100% efficiency
  const pointsPerKg = 37 * efficiency;
  return totalPoints / pointsPerKg;
}

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
    async ({ style: styleQuery, batch_size_litres }) => {
      const matchedStyle = findStyle(styleQuery);

      if (!matchedStyle) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Could not find a style matching '${styleQuery}'. Try names like 'American IPA', 'Stout', 'Pilsner', or 'Hefeweizen'.`,
            },
          ],
        };
      }

      const { vitalStats: v } = matchedStyle;
      const ogTarget = (v.ogMin + v.ogMax) / 2;
      const ibuTarget = Math.round((v.ibuMin + v.ibuMax) / 2);
      const abvTarget = ((v.abvMin + v.abvMax) / 2).toFixed(1);

      const malts = selectMalts(matchedStyle.name, matchedStyle.category, matchedStyle.tags);
      const hops = selectHops(matchedStyle.name);
      const yeast = selectYeast(matchedStyle.name, matchedStyle.tags);
      const water = selectWater(matchedStyle.name);

      const totalGrainKg = calculateGrainWeight(ogTarget, batch_size_litres);
      const baseKg = (totalGrainKg * 0.85).toFixed(1);
      const specialtyKg = malts.specialty.length > 0
        ? (totalGrainKg * 0.15 / malts.specialty.length).toFixed(1)
        : "0";

      // Determine mash temp based on style character
      const tags = matchedStyle.tags.join(" ").toLowerCase();
      const isDry = tags.includes("bitter") || tags.includes("hoppy") || matchedStyle.name.toLowerCase().includes("ipa");
      const mashTemp = isDry ? "65°C (149°F) — lower for drier finish" : "67°C (153°F) — higher for fuller body";

      const fermTemp = `${yeast.tempMin}-${yeast.tempMax}°F (${Math.round((yeast.tempMin - 32) * 5 / 9)}-${Math.round((yeast.tempMax - 32) * 5 / 9)}°C)`;

      const lines: string[] = [
        `# Recipe: ${matchedStyle.name}`,
        `Batch size: ${batch_size_litres} litres | Target OG: ${ogTarget.toFixed(3)} | IBU: ${ibuTarget} | ABV: ~${abvTarget}%`,
        "",
        "## Grain Bill",
        `- ${malts.base.name}: ${baseKg} kg (base)`,
        ...malts.specialty.map((m) => `- ${m.name}: ${specialtyKg} kg (${m.type})`),
        "",
        "## Hop Schedule",
      ];

      if (hops.length >= 1) {
        const bitteringHop = hops.find((h) => h.purpose === "bittering" || h.purpose === "dual") ?? hops[0];
        lines.push(`- ${bitteringHop.name}: 60 min (bittering) — target ~${ibuTarget} IBU`);
        const aromaHop = hops.length > 1 ? hops[1] : hops[0];
        lines.push(`- ${aromaHop.name}: 5 min (aroma)`);
        if (isDry) {
          lines.push(`- ${aromaHop.name}: dry hop 3-5 days`);
        }
      }

      lines.push(
        "",
        "## Yeast",
        `- ${yeast.name} (${yeast.producer} ${yeast.code})`,
        `  Type: ${yeast.type} | Attenuation: ${yeast.attenuationMin}-${yeast.attenuationMax}%`,
        `  Flavour: ${yeast.flavourProfile}`,
        "",
        "## Process",
        `- Mash: ${mashTemp}`,
        "- Boil: 60 minutes",
        `- Fermentation: ${fermTemp}`,
        `- Conditioning: ${tags.includes("lager") ? "4-6 weeks cold conditioning" : "2 weeks at room temperature"}`,
      );

      if (water) {
        lines.push(
          "",
          "## Water",
          `- Target profile: ${water.name} (${water.city})`,
          `  Ca: ${water.calcium} | Mg: ${water.magnesium} | SO4: ${water.sulfate} | Cl: ${water.chloride}`,
        );
      }

      return {
        content: [
          {
            type: "text" as const,
            text: lines.join("\n"),
          },
        ],
      };
    },
  );
}
