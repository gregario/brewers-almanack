import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GEB_INVENTORY, GEB_LAST_UPDATED } from "../data/geb-inventory.js";
import type { GebProduct } from "../data/geb-inventory.js";
import { HOPS } from "../data/hops.js";
import { MALTS } from "../data/malts.js";
import { YEASTS } from "../data/yeasts.js";

function searchInventory(query: string, category?: string): GebProduct[] {
  let items = GEB_INVENTORY;
  if (category) {
    items = items.filter((p) =>
      p.category.toLowerCase().includes(category.toLowerCase()),
    );
  }
  const queryLower = query.toLowerCase();
  return items.filter((p) => p.name.toLowerCase().includes(queryLower));
}

function formatPrice(product: GebProduct): string {
  if (product.unit === "per_gram") {
    // Show as £/kg for readability (price is stored per gram)
    return `£${(product.price_per_gram_gbp * 1000).toFixed(2)}/kg`;
  }
  return `£${product.price_per_gram_gbp.toFixed(2)} each`;
}

function formatStock(status: GebProduct["stock_status"]): string {
  switch (status) {
    case "in_stock": return "✓ In Stock";
    case "low_stock": return "⚠ Low Stock";
    case "out_of_stock": return "✗ Out of Stock";
  }
}

function isAvailable(product: GebProduct): boolean {
  return product.stock_status !== "out_of_stock";
}

function findSubstitutes(query: string): string[] {
  const hop = HOPS.find((h) =>
    h.name.toLowerCase().includes(query.toLowerCase()),
  );
  if (hop) return hop.substitutes;

  const malt = MALTS.find((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()),
  );
  if (malt) {
    const colourMin = malt.colour * 0.5;
    const colourMax = malt.colour * 1.5 + 2;
    return MALTS.filter(
      (m) =>
        m.name !== malt.name &&
        m.type === malt.type &&
        m.colour >= colourMin &&
        m.colour <= colourMax,
    )
      .slice(0, 3)
      .map((m) => m.name);
  }

  const yeast = YEASTS.find(
    (y) =>
      y.name.toLowerCase().includes(query.toLowerCase()) ||
      y.code.toLowerCase().includes(query.toLowerCase()),
  );
  if (yeast) {
    return YEASTS.filter((y) => y.name !== yeast.name && y.type === yeast.type)
      .slice(0, 3)
      .map((y) => `${y.name} (${y.code})`);
  }

  return [];
}

export function registerCheckGebStock(server: McpServer): void {
  server.registerTool(
    "check_geb_stock",
    {
      title: "Check GEB Stock",
      description:
        "Check GetErBrewed.com custom kit builder inventory for ingredient availability and pricing. Data is updated weekly. If an item is out of stock, suggests substitutions.",
      inputSchema: {
        query: z
          .string()
          .describe(
            "Ingredient to search for (e.g. 'Citra', 'Maris Otter', 'US-05')",
          ),
        category: z
          .string()
          .optional()
          .describe(
            "Filter by category (e.g. 'T90 Hops', 'Base Malt', 'Dried Yeast')",
          ),
      },
    },
    async ({ query, category }) => {
      const matches = searchInventory(query, category);

      const lines: string[] = [
        `# GEB Stock: ${query}`,
        `*Last updated: ${GEB_LAST_UPDATED.split("T")[0]}*`,
        "",
      ];

      if (GEB_INVENTORY.length === 0) {
        lines.push(
          "Inventory data not yet synced. Run `npm run fetch-geb` or wait for the weekly sync.",
        );
        return {
          content: [{ type: "text" as const, text: lines.join("\n") }],
        };
      }

      if (matches.length === 0) {
        lines.push(`No products found matching "${query}".`);

        const subs = findSubstitutes(query);
        if (subs.length > 0) {
          lines.push("", "## Try Instead");
          for (const sub of subs) {
            const subMatches = searchInventory(sub);
            const available = subMatches.filter(isAvailable);
            if (available.length > 0) {
              lines.push(
                `- **${sub}** — ${formatPrice(available[0])} ${formatStock(available[0].stock_status)}`,
              );
            } else if (subMatches.length > 0) {
              lines.push(`- **${sub}** — listed but out of stock`);
            } else {
              lines.push(`- **${sub}** — not found at GEB`);
            }
          }
        }
      } else {
        const available = matches.filter(isAvailable);
        const outOfStock = matches.filter((m) => !isAvailable(m));

        if (available.length > 0) {
          lines.push("## Available");
          for (const p of available) {
            lines.push(
              `- ${p.name} — ${formatPrice(p)} ${formatStock(p.stock_status)}`,
            );
          }
        }

        if (outOfStock.length > 0) {
          lines.push("", "## Out of Stock");
          for (const p of outOfStock) {
            lines.push(`- ${p.name} — ${formatPrice(p)}`);
          }

          if (available.length === 0) {
            const subs = findSubstitutes(query);
            if (subs.length > 0) {
              lines.push("", "## Substitutes Available at GEB");
              for (const sub of subs) {
                const subMatches = searchInventory(sub);
                const subAvailable = subMatches.filter(isAvailable);
                if (subAvailable.length > 0) {
                  lines.push(
                    `- **${sub}** — ${formatPrice(subAvailable[0])} ${formatStock(subAvailable[0].stock_status)}`,
                  );
                }
              }
            }
          }
        }
      }

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    },
  );
}
