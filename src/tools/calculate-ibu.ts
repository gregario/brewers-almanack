import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Tinseth IBU formula:
 *   IBU = (W_grams × AA_decimal × U × 1000) / V_litres
 *   U = bignessFactor × boilTimeFactor
 *   bignessFactor = 1.65 × 0.000125^(OG - 1)
 *   boilTimeFactor = (1 - e^(-0.04 × t)) / 4.15
 */
function tinsethIbu(
  weightGrams: number,
  alphaAcidPct: number,
  boilMinutes: number,
  batchVolumeLitres: number,
  originalGravity: number,
): number {
  if (boilMinutes <= 0) return 0;

  const alphaDecimal = alphaAcidPct / 100;
  const bignessFactor = 1.65 * Math.pow(0.000125, originalGravity - 1);
  const boilTimeFactor = (1 - Math.exp(-0.04 * boilMinutes)) / 4.15;
  const utilisation = bignessFactor * boilTimeFactor;

  return (weightGrams * alphaDecimal * utilisation * 1000) / batchVolumeLitres;
}

export function registerCalculateIbu(server: McpServer): void {
  server.registerTool(
    "calculate_ibu",
    {
      title: "Calculate IBU",
      description:
        "Calculate International Bitterness Units using the Tinseth formula. Accepts batch volume, original gravity, and a list of hop additions with weight, alpha acid percentage, and boil time.",
      inputSchema: {
        batch_volume_litres: z
          .number()
          .describe("Final batch volume in litres"),
        original_gravity: z
          .number()
          .describe("Original gravity (e.g. 1.065)"),
        hop_additions: z
          .array(
            z.object({
              name: z.string().describe("Hop variety name"),
              weight_g: z.number().describe("Hop weight in grams"),
              alpha_acid_pct: z
                .number()
                .describe("Alpha acid percentage (e.g. 10 for 10%)"),
              boil_minutes: z
                .number()
                .describe("Boil time in minutes (0 for dry hop/whirlpool)"),
            }),
          )
          .describe("List of hop additions"),
      },
    },
    async ({ batch_volume_litres, original_gravity, hop_additions }) => {
      const additions = hop_additions.map((hop) => {
        const ibu = tinsethIbu(
          hop.weight_g,
          hop.alpha_acid_pct,
          hop.boil_minutes,
          batch_volume_litres,
          original_gravity,
        );
        return {
          name: hop.name,
          weight_g: hop.weight_g,
          alpha_acid_pct: hop.alpha_acid_pct,
          boil_minutes: hop.boil_minutes,
          ibu: Math.round(ibu * 10) / 10,
        };
      });

      const totalIbu =
        Math.round(additions.reduce((sum, a) => sum + a.ibu, 0) * 10) / 10;

      const lines: string[] = [
        `# IBU Calculation (Tinseth)`,
        `Batch: ${batch_volume_litres}L | OG: ${original_gravity}`,
        "",
        "## Hop Additions",
        ...additions.map(
          (a) =>
            `- ${a.name}: ${a.weight_g}g @ ${a.alpha_acid_pct}% AA, ${a.boil_minutes} min → ${a.ibu.toFixed(1)} IBU`,
        ),
        "",
        `## Total: ${totalIbu.toFixed(1)} IBU`,
      ];

      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
      };
    },
  );
}
