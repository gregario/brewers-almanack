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
  // Pick a base malt. For Pilsner/lager-pale styles prefer Pilsner Malt;
  // for English styles prefer Maris Otter; otherwise default to 2-Row.
  // Uses a mix of tag checks (preferred — explicit) and case-insensitive
  // word matches against name+category. Avoid bare substring checks like
  // .includes("red") because they false-match "lagered" etc.
  const baseMalts = MALTS.filter((m) => m.type === "base");
  const tagsLower = tags.map((t) => t.toLowerCase());
  const nameCat = (styleName + " " + category).toLowerCase();
  const hasWord = (s: string, word: string) =>
    new RegExp(`\\b${word}\\b`, "i").test(s);

  const isPilsnerLike =
    tagsLower.includes("pilsner-family") ||
    tagsLower.includes("pale-lager-family") ||
    hasWord(nameCat, "pilsner") ||
    hasWord(nameCat, "pils") ||
    hasWord(nameCat, "helles") ||
    /k(ö|o)lsch/i.test(nameCat);
  const isEnglish =
    hasWord(nameCat, "english") ||
    hasWord(nameCat, "british") ||
    hasWord(nameCat, "esb") ||
    /\bmild\b/i.test(styleName);
  const isWheat =
    tagsLower.includes("wheat-beer-family") ||
    hasWord(nameCat, "wheat") ||
    hasWord(nameCat, "hefeweizen") ||
    hasWord(nameCat, "weiss") ||
    hasWord(nameCat, "weissbier") ||
    hasWord(nameCat, "witbier");

  let base = baseMalts.find((m) => m.name === "2-Row Pale Malt") ?? baseMalts[0];
  if (isPilsnerLike) {
    base = baseMalts.find((m) => m.name === "Pilsner Malt") ?? base;
  } else if (isEnglish) {
    base = baseMalts.find((m) => m.name === "Maris Otter") ?? base;
  } else if (isWheat) {
    base = baseMalts.find((m) => m.name === "Wheat Malt") ?? base;
  }

  // Pick specialty malts based on style character. Use tag/word checks,
  // not bare substring matches, to avoid picking up "red" inside "lagered".
  const specialtyMalts = MALTS.filter((m) => m.type !== "base");

  const isDark =
    tagsLower.includes("dark-color") ||
    tagsLower.includes("stout-family") ||
    tagsLower.includes("dark-lager-family") ||
    hasWord(nameCat, "stout") ||
    hasWord(nameCat, "porter") ||
    hasWord(nameCat, "schwarzbier") ||
    hasWord(nameCat, "dunkel") ||
    hasWord(nameCat, "dunkles");
  if (isDark) {
    // Prefer actual roasted-type malts; fall back to crystals with roast
    // character only if no roasted malts qualify.
    const roasted = specialtyMalts.filter((m) => m.type === "roasted").slice(0, 2);
    return { base, specialty: roasted };
  }

  const isAmber =
    tagsLower.includes("amber-color") ||
    tagsLower.includes("amber-ale-family") ||
    tagsLower.includes("amber-lager-family") ||
    hasWord(nameCat, "amber") ||
    hasWord(nameCat, "red") ||
    hasWord(nameCat, "brown") ||
    hasWord(nameCat, "märzen") ||
    hasWord(nameCat, "marzen") ||
    hasWord(nameCat, "vienna") ||
    hasWord(nameCat, "altbier");
  if (isAmber) {
    const selected = specialtyMalts.filter((m) => {
      const mLower = (m.name + " " + m.flavour + " " + m.description).toLowerCase();
      return m.type === "crystal" || mLower.includes("caramel");
    }).slice(0, 2);
    return { base, specialty: selected };
  }

  if (isWheat) {
    // Wheat styles already have a wheat-malt base; add at most one specialty
    // grain (e.g. flaked wheat or flaked oats) for character.
    const selected = specialtyMalts.filter((m) => {
      const mLower = (m.name + " " + m.flavour + " " + m.description).toLowerCase();
      return mLower.includes("wheat") || mLower.includes("oat");
    }).slice(0, 1);
    return { base, specialty: selected };
  }

  // Pale styles (American IPA, American Pale Ale, Bohemian/German Pils,
  // Helles, Kölsch, Blonde Ale, Cream Ale, etc.): keep it base-malt-led.
  // Crystal malts in IPAs/pilsners are not idiomatic — leave specialty empty
  // and let the consumer scale base to 100%.
  const isPale =
    tagsLower.includes("pale-color") ||
    hasWord(nameCat, "pale") ||
    hasWord(nameCat, "ipa") ||
    hasWord(nameCat, "blonde") ||
    hasWord(nameCat, "cream") ||
    isPilsnerLike;
  if (isPale) {
    return { base, specialty: [] };
  }

  // Unknown/other styles: default to base-only rather than guessing crystal.
  return { base, specialty: [] };
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

// Unit conversions for grain weight calculation.
// Malt potential is conventionally expressed in PPG (points per pound per
// gallon at 100% mash efficiency). To work consistently in metric we convert
// the imperial PPG yield into a metric "points per kg per litre" yield.
const LITRES_PER_US_GALLON = 3.785411784;
const KG_PER_POUND = 0.45359237;
// 37 PPG (typical 2-Row pale malt) → ~308.8 points per kg per litre.
const POINTS_PER_KG_PER_LITRE_AT_37_PPG =
  (37 * LITRES_PER_US_GALLON) / KG_PER_POUND;

function calculateGrainWeight(
  ogTarget: number,
  batchLitres: number,
  efficiency: number = 0.72,
): number {
  // OG points: (OG - 1) * 1000. e.g. 1.065 → 65 gravity points per litre.
  const ogPoints = (ogTarget - 1) * 1000;
  // Total gravity-points needed across the whole batch (litre-points).
  const totalPoints = ogPoints * batchLitres;
  // Effective yield per kg of grain across the whole batch volume,
  // assuming a 37 PPG base malt at the given mash efficiency.
  // Result is in litre-points per kg of grain.
  const yieldPerKg = POINTS_PER_KG_PER_LITRE_AT_37_PPG * efficiency;
  return totalPoints / yieldPerKg;
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
      // When specialty malts are present, hold base ≈ 85% and split the
      // remaining 15% across specialty grains. With no specialty (e.g. pale
      // styles like American IPA / Pilsner) the base malt provides 100%.
      const baseFraction = malts.specialty.length > 0 ? 0.85 : 1.0;
      const baseKg = (totalGrainKg * baseFraction).toFixed(2);
      const specialtyKg = malts.specialty.length > 0
        ? (totalGrainKg * 0.15 / malts.specialty.length).toFixed(2)
        : "0";

      // Determine mash temp based on style character
      const tags = matchedStyle.tags.join(" ").toLowerCase();
      const isDry = tags.includes("bitter") || tags.includes("hoppy") || matchedStyle.name.toLowerCase().includes("ipa");
      const mashTemp = isDry ? "65°C (149°F) — lower for drier finish" : "67°C (153°F) — higher for fuller body";

      // Yeast tempMin/tempMax are stored in °C (see src/data/yeasts.ts —
      // ales 18–23, lagers 9–15, kveik 25–40). Convert °C → °F for display.
      const fermTempFMin = Math.round(yeast.tempMin * 9 / 5 + 32);
      const fermTempFMax = Math.round(yeast.tempMax * 9 / 5 + 32);
      const fermTemp = `${yeast.tempMin}-${yeast.tempMax}°C (${fermTempFMin}-${fermTempFMax}°F)`;

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
