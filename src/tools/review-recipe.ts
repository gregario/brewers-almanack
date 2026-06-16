import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { STYLES } from "../data/styles.js";
import { fuzzySearch } from "../lib/search.js";
import type { BeerStyle } from "../types.js";

type VitalStats = BeerStyle["vitalStats"];

function findStyleOrSubStyle(query: string): { name: string; vitalStats: VitalStats } | null {
  const lower = query.toLowerCase();

  // First: exact match on sub-style names
  for (const style of STYLES) {
    if (style.subStyles) {
      for (const sub of style.subStyles) {
        if (sub.name.toLowerCase() === lower) {
          return { name: sub.name, vitalStats: sub.vitalStats };
        }
      }
    }
  }

  // Second: partial match on sub-style names
  for (const style of STYLES) {
    if (style.subStyles) {
      for (const sub of style.subStyles) {
        if (sub.name.toLowerCase().includes(lower) || lower.includes(sub.name.toLowerCase())) {
          return { name: sub.name, vitalStats: sub.vitalStats };
        }
      }
    }
  }

  // Third: fuzzy search on main styles
  const results = fuzzySearch(STYLES, query, ["name", "category"]);
  if (results.length > 0) {
    return { name: results[0].name, vitalStats: results[0].vitalStats };
  }

  return null;
}

type CheckResult = {
  label: string;
  value: number;
  min: number;
  max: number;
  pass: boolean;
  detail: string;
};

function checkParam(label: string, value: number, min: number, max: number): CheckResult {
  if (value < min) {
    return {
      label,
      value,
      min,
      max,
      pass: false,
      detail: `too low (min ${formatValue(label, min)})`,
    };
  }
  if (value > max) {
    return {
      label,
      value,
      min,
      max,
      pass: false,
      detail: `too high (max ${formatValue(label, max)})`,
    };
  }
  return {
    label,
    value,
    min,
    max,
    pass: true,
    detail: "in range",
  };
}

function formatValue(label: string, value: number): string {
  if (label === "OG" || label === "FG") {
    return value.toFixed(3);
  }
  if (label === "ABV") {
    return value.toFixed(1);
  }
  return String(value);
}

function formatRange(label: string, min: number, max: number): string {
  return `[${formatValue(label, min)}–${formatValue(label, max)}]`;
}

export function registerReviewRecipe(server: McpServer): void {
  server.registerTool(
    "review_recipe",
    {
      title: "Review Recipe",
      description:
        "Review a beer recipe against BJCP style guidelines. Checks OG, FG, IBU, SRM, and ABV against the style's vital statistics and returns a scorecard.",
      inputSchema: {
        style: z.string().describe("Target beer style to check against (e.g. 'American IPA', 'Black IPA')"),
        og: z.number().describe("Original gravity (e.g. 1.065)"),
        fg: z.number().describe("Final gravity (e.g. 1.012)"),
        ibu: z.number().describe("International Bitterness Units"),
        srm: z.number().describe("Standard Reference Method (colour)"),
        abv: z.number().describe("Alcohol by volume percentage"),
      },
    },
    async ({ style: styleQuery, og, fg, ibu, srm, abv }) => {
      const matched = findStyleOrSubStyle(styleQuery);

      if (!matched) {
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

      const { name, vitalStats: v } = matched;

      const checks: CheckResult[] = [
        checkParam("OG", og, v.ogMin, v.ogMax),
        checkParam("FG", fg, v.fgMin, v.fgMax),
        checkParam("IBU", ibu, v.ibuMin, v.ibuMax),
        checkParam("SRM", srm, v.srmMin, v.srmMax),
        checkParam("ABV", abv, v.abvMin, v.abvMax),
      ];

      const passCount = checks.filter((c) => c.pass).length;
      const total = checks.length;

      const lines: string[] = [
        `# Recipe Review: ${name}`,
        "",
        `## Vital Stats Check (${passCount}/${total} in range)`,
        "",
      ];

      for (const c of checks) {
        const icon = c.pass ? "✓" : "✗";
        const valueStr = formatValue(c.label, c.value);
        const rangeStr = formatRange(c.label, c.min, c.max);
        if (c.pass) {
          lines.push(`- ${icon} **${c.label}**: ${valueStr} — in range ${rangeStr}`);
        } else {
          lines.push(`- ${icon} **${c.label}**: ${valueStr} — ${c.detail} ${rangeStr}`);
        }
      }

      lines.push("", "## Summary");

      const issues = checks.filter((c) => !c.pass);
      if (issues.length === 0) {
        lines.push("All parameters are within BJCP guidelines for this style. Recipe looks good!");
      } else {
        lines.push(`${issues.length} parameter${issues.length > 1 ? "s" : ""} out of range:`);
        for (const issue of issues) {
          lines.push(`- **${issue.label}** is ${issue.detail}`);
        }
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
