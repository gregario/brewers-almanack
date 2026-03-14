import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OFF_FLAVOURS } from "../data/off-flavours.js";
import { fuzzySearch } from "../lib/search.js";
import type { OffFlavour } from "../types.js";

function formatOffFlavour(of: OffFlavour): string {
  return [
    `## ${of.name}`,
    `Compound: ${of.compound}`,
    `Character: ${of.character}`,
    `Threshold: ${of.threshold}`,
    "",
    "Causes:",
    ...of.causes.map((c) => `- ${c}`),
    "",
    "Prevention:",
    ...of.prevention.map((p) => `- ${p}`),
    "",
    `Acceptable in: ${of.acceptableIn.length > 0 ? of.acceptableIn.join(", ") : "None"}`,
  ].join("\n");
}

export function registerDiagnoseOffFlavour(server: McpServer): void {
  server.registerTool(
    "diagnose_off_flavour",
    {
      title: "Diagnose Off-Flavour",
      description:
        "Diagnose beer off-flavours from taste or aroma descriptions. Returns the likely compound, causes, prevention steps, detection threshold, and styles where it may be acceptable.",
      inputSchema: {
        description: z
          .string()
          .describe("Taste or aroma description of the off-flavour"),
      },
    },
    async ({ description }) => {
      const results = fuzzySearch(
        OFF_FLAVOURS,
        description,
        ["name", "compound", "character"],
      ).slice(0, 3);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: [
                `No specific off-flavour matched '${description}'. Here are some general tips to troubleshoot:`,
                "",
                "1. Review your sanitation process — most off-flavours come from contamination",
                "2. Check fermentation temperature — too hot or too cold causes many issues",
                "3. Ensure adequate yeast health and pitch rate",
                "4. Review your water chemistry",
                "5. Try describing the flavour differently (e.g. 'buttery', 'skunky', 'cardboard', 'metallic')",
              ].join("\n"),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: results.map(formatOffFlavour).join("\n\n---\n\n"),
          },
        ],
      };
    },
  );
}
