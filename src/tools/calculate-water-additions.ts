import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { WATER_PROFILES } from "../data/water-profiles.js";
import { fuzzySearch } from "../lib/search.js";

/**
 * Chemistry constants: ppm contribution per gram per litre of water.
 */
const SALTS = {
  gypsum: { calcium: 61.5, sulfate: 147.4 },
  calciumChloride: { calcium: 72.0, chloride: 127.4 },
  epsom: { magnesium: 26.1, sulfate: 103.0 },
  bakingSoda: { sodium: 72.3, bicarbonate: 176.1 },
} as const;

/**
 * Lactic acid (88%, 1mL/L): reduces alkalinity by ~50 ppm as CaCO3.
 * We approximate: 1 mL/L removes ~50 ppm bicarbonate equivalent.
 */
const LACTIC_ACID_BICARB_REDUCTION_PER_ML = 50;

interface WaterIons {
  calcium: number;
  magnesium: number;
  sodium: number;
  chloride: number;
  sulfate: number;
  bicarbonate: number;
}

interface Additions {
  gypsum: number;
  calciumChloride: number;
  epsom: number;
  bakingSoda: number;
  lacticAcidMl: number;
}

function resolveProfile(name: string): WaterIons | null {
  const results = fuzzySearch(WATER_PROFILES, name, ["name", "city"]);
  if (results.length === 0) return null;
  const p = results[0];
  return {
    calcium: p.calcium,
    magnesium: p.magnesium,
    sodium: p.sodium,
    chloride: p.chloride,
    sulfate: p.sulfate,
    bicarbonate: p.bicarbonate,
  };
}

function calculateAdditions(source: WaterIons, target: WaterIons): Additions {
  const delta = {
    calcium: Math.max(0, target.calcium - source.calcium),
    magnesium: Math.max(0, target.magnesium - source.magnesium),
    sodium: Math.max(0, target.sodium - source.sodium),
    chloride: Math.max(0, target.chloride - source.chloride),
    sulfate: Math.max(0, target.sulfate - source.sulfate),
    bicarbonate: target.bicarbonate - source.bicarbonate, // can be negative
  };

  // Sulfate deficit: 80% from gypsum, 20% from Epsom
  const sulfateFromGypsum = delta.sulfate * 0.8;
  const sulfateFromEpsom = delta.sulfate * 0.2;

  // g/L of gypsum needed for sulfate contribution
  let gypsumGPerL = sulfateFromGypsum / SALTS.gypsum.sulfate;
  // g/L of Epsom needed for sulfate contribution
  let epsomGPerL = sulfateFromEpsom / SALTS.epsom.sulfate;

  // Calcium contributed by gypsum
  const caFromGypsum = gypsumGPerL * SALTS.gypsum.calcium;

  // Chloride deficit: from CaCl2
  let cacl2GPerL = delta.chloride / SALTS.calciumChloride.chloride;
  const caFromCaCl2 = cacl2GPerL * SALTS.calciumChloride.calcium;

  // Remaining calcium need after gypsum + CaCl2 contributions
  const remainingCa = delta.calcium - caFromGypsum - caFromCaCl2;
  if (remainingCa > 0) {
    // Add more CaCl2 to cover remaining calcium
    const extraCaCl2 = remainingCa / SALTS.calciumChloride.calcium;
    cacl2GPerL += extraCaCl2;
  }

  // Magnesium beyond what Epsom already provides
  const mgFromEpsom = epsomGPerL * SALTS.epsom.magnesium;
  const remainingMg = delta.magnesium - mgFromEpsom;
  if (remainingMg > 0) {
    const extraEpsom = remainingMg / SALTS.epsom.magnesium;
    epsomGPerL += extraEpsom;
  }

  // Sodium deficit: from baking soda
  let bakingSodaGPerL = 0;
  if (delta.sodium > 0) {
    bakingSodaGPerL = delta.sodium / SALTS.bakingSoda.sodium;
  }

  // Bicarbonate: if target < source, need acid
  let lacticAcidMlPerL = 0;
  if (delta.bicarbonate < 0) {
    const bicarbReduction = Math.abs(delta.bicarbonate);
    lacticAcidMlPerL = bicarbReduction / LACTIC_ACID_BICARB_REDUCTION_PER_ML;
  }

  return {
    gypsum: gypsumGPerL,
    calciumChloride: cacl2GPerL,
    epsom: epsomGPerL,
    bakingSoda: bakingSodaGPerL,
    lacticAcidMl: lacticAcidMlPerL,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function registerCalculateWaterAdditions(server: McpServer): void {
  server.registerTool(
    "calculate_water_additions",
    {
      title: "Calculate Water Additions",
      description:
        "Calculate mineral salt additions needed to adjust brewing water from a source profile to a target profile. Supports named profiles or custom ion values.",
      inputSchema: {
        source_profile: z
          .string()
          .optional()
          .describe("Named source water profile (e.g. 'Reverse Osmosis', 'Dublin')"),
        source_calcium: z.number().optional().describe("Source calcium (ppm)"),
        source_magnesium: z.number().optional().describe("Source magnesium (ppm)"),
        source_sodium: z.number().optional().describe("Source sodium (ppm)"),
        source_chloride: z.number().optional().describe("Source chloride (ppm)"),
        source_sulfate: z.number().optional().describe("Source sulfate (ppm)"),
        source_bicarbonate: z.number().optional().describe("Source bicarbonate (ppm)"),
        target_profile: z
          .string()
          .optional()
          .describe("Named target water profile (e.g. 'Burton-on-Trent', 'Pilsen')"),
        target_calcium: z.number().optional().describe("Target calcium (ppm)"),
        target_magnesium: z.number().optional().describe("Target magnesium (ppm)"),
        target_sodium: z.number().optional().describe("Target sodium (ppm)"),
        target_chloride: z.number().optional().describe("Target chloride (ppm)"),
        target_sulfate: z.number().optional().describe("Target sulfate (ppm)"),
        target_bicarbonate: z.number().optional().describe("Target bicarbonate (ppm)"),
        volume_litres: z.number().describe("Water volume in litres"),
      },
    },
    async ({
      source_profile,
      source_calcium,
      source_magnesium,
      source_sodium,
      source_chloride,
      source_sulfate,
      source_bicarbonate,
      target_profile,
      target_calcium,
      target_magnesium,
      target_sodium,
      target_chloride,
      target_sulfate,
      target_bicarbonate,
      volume_litres,
    }) => {
      // Resolve source
      let source: WaterIons | null = null;
      if (source_profile) {
        source = resolveProfile(source_profile);
        if (!source) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Source profile '${source_profile}' not found. Try: ${WATER_PROFILES.map((p) => p.name).join(", ")}`,
              },
            ],
          };
        }
      } else if (
        source_calcium !== undefined ||
        source_magnesium !== undefined ||
        source_sodium !== undefined ||
        source_chloride !== undefined ||
        source_sulfate !== undefined ||
        source_bicarbonate !== undefined
      ) {
        source = {
          calcium: source_calcium ?? 0,
          magnesium: source_magnesium ?? 0,
          sodium: source_sodium ?? 0,
          chloride: source_chloride ?? 0,
          sulfate: source_sulfate ?? 0,
          bicarbonate: source_bicarbonate ?? 0,
        };
      } else {
        return {
          content: [
            {
              type: "text" as const,
              text: "Please provide either a source_profile name or custom source ion values (source_calcium, source_magnesium, etc.).",
            },
          ],
        };
      }

      // Resolve target
      let target: WaterIons | null = null;
      let targetName = "Custom";
      if (target_profile) {
        target = resolveProfile(target_profile);
        if (!target) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Target profile '${target_profile}' not found. Try: ${WATER_PROFILES.map((p) => p.name).join(", ")}`,
              },
            ],
          };
        }
        targetName = target_profile;
      } else if (
        target_calcium !== undefined ||
        target_magnesium !== undefined ||
        target_sodium !== undefined ||
        target_chloride !== undefined ||
        target_sulfate !== undefined ||
        target_bicarbonate !== undefined
      ) {
        target = {
          calcium: target_calcium ?? 0,
          magnesium: target_magnesium ?? 0,
          sodium: target_sodium ?? 0,
          chloride: target_chloride ?? 0,
          sulfate: target_sulfate ?? 0,
          bicarbonate: target_bicarbonate ?? 0,
        };
      } else {
        return {
          content: [
            {
              type: "text" as const,
              text: "Please provide either a target_profile name or custom target ion values (target_calcium, target_sulfate, etc.).",
            },
          ],
        };
      }

      // Check if source and target are identical
      const ionsMatch =
        source.calcium === target.calcium &&
        source.magnesium === target.magnesium &&
        source.sodium === target.sodium &&
        source.chloride === target.chloride &&
        source.sulfate === target.sulfate &&
        source.bicarbonate === target.bicarbonate;

      if (ionsMatch) {
        return {
          content: [
            {
              type: "text" as const,
              text: `# Water Additions: → ${targetName}\nVolume: ${volume_litres}L\n\n## No additions needed — source already matches target.`,
            },
          ],
        };
      }

      // Calculate additions per litre
      const additionsPerL = calculateAdditions(source, target);

      // Scale to batch volume
      const batch = {
        gypsum: round1(additionsPerL.gypsum * volume_litres),
        calciumChloride: round1(additionsPerL.calciumChloride * volume_litres),
        epsom: round1(additionsPerL.epsom * volume_litres),
        bakingSoda: round1(additionsPerL.bakingSoda * volume_litres),
        lacticAcidMl: round1(additionsPerL.lacticAcidMl * volume_litres),
      };

      // Build output
      const ions: Array<{ label: string; src: number; tgt: number }> = [
        { label: "Ca", src: source.calcium, tgt: target.calcium },
        { label: "Mg", src: source.magnesium, tgt: target.magnesium },
        { label: "Na", src: source.sodium, tgt: target.sodium },
        { label: "Cl", src: source.chloride, tgt: target.chloride },
        { label: "SO4", src: source.sulfate, tgt: target.sulfate },
        { label: "HCO3", src: source.bicarbonate, tgt: target.bicarbonate },
      ];

      const lines: string[] = [
        `# Water Additions: → ${targetName}`,
        `Volume: ${volume_litres}L`,
        "",
        "## Source → Target",
        "| Ion | Source | Target | Delta |",
        "|-----|--------|--------|-------|",
        ...ions.map((ion) => {
          const delta = ion.tgt - ion.src;
          const sign = delta >= 0 ? "+" : "";
          return `| ${ion.label} | ${ion.src} | ${ion.tgt} | ${sign}${delta} |`;
        }),
        "",
        "## Additions",
      ];

      const additionLines: string[] = [];
      if (batch.gypsum > 0) {
        additionLines.push(`- **Gypsum (CaSO4):** ${batch.gypsum} g`);
      }
      if (batch.calciumChloride > 0) {
        additionLines.push(
          `- **Calcium Chloride (CaCl2):** ${batch.calciumChloride} g`,
        );
      }
      if (batch.epsom > 0) {
        additionLines.push(`- **Epsom Salt (MgSO4):** ${batch.epsom} g`);
      }
      if (batch.bakingSoda > 0) {
        additionLines.push(`- **Baking Soda (NaHCO3):** ${batch.bakingSoda} g`);
      }
      if (batch.lacticAcidMl > 0) {
        additionLines.push(
          `- **Lactic Acid (88%):** ${batch.lacticAcidMl} mL`,
        );
      }

      if (additionLines.length === 0) {
        additionLines.push("No salt additions needed.");
      }

      lines.push(...additionLines);
      lines.push("");
      lines.push(
        "*Note: This is a simplified calculation. Actual results may vary based on water chemistry interactions, mash pH buffering, and grain bill composition. Always measure and adjust.*",
      );

      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
      };
    },
  );
}
