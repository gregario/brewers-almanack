/**
 * Fetch GEB custom kit builder inventory and generate embedded TypeScript data.
 *
 * Usage: npx tsx scripts/fetch-geb.ts
 * Requires FIRECRAWL_API_KEY environment variable.
 *
 * Strategy: The kit builder wizard at /custom-grain-kit/ renders each category
 * server-side when accessed via the `step=` URL parameter. We scrape each
 * category's URL as markdown (1 credit each) and parse the product listings.
 * No click actions or JSON extraction needed.
 */

import FirecrawlApp from "@mendable/firecrawl-js";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

const BASE_URL =
  "https://www.geterbrewed.com/index.php?route=custom_kit/type&custom_kit_type_id=1";

interface GebProduct {
  name: string;
  price_per_gram_gbp: number;
  unit: "per_gram" | "per_unit";
  category: string;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
}

// data-step values from the wizard tabs (NOT sequential 1-10)
const CATEGORIES = [
  { name: "Base Malt", stepId: "27", unit: "per_gram" as const },
  { name: "Lightly Kilned Malt", stepId: "30", unit: "per_gram" as const },
  { name: "Caramel & Crystal Malt", stepId: "28", unit: "per_gram" as const },
  { name: "Flaked & Unmalted Adjuncts", stepId: "29", unit: "per_gram" as const },
  { name: "Smoked Malts", stepId: "32", unit: "per_gram" as const },
  { name: "T90 Hops", stepId: "123", unit: "per_gram" as const },
  { name: "Dried Yeast", stepId: "159", unit: "per_unit" as const },
  { name: "Liquid Yeast", stepId: "112", unit: "per_unit" as const },
  { name: "Flavours", stepId: "15", unit: "per_unit" as const },
  { name: "Sugars", stepId: "26", unit: "per_gram" as const },
];

function parseProducts(markdown: string, category: string, unit: GebProduct["unit"]): GebProduct[] {
  const products: GebProduct[] = [];

  // Products appear as lines like:
  //   Citra T90 Hop Pellets (USA) (2025) AA: 13.9%
  //   \[ £0.0792\]
  //
  // Or with stock status:
  //   Cascade T90 Hop Pellets (USA) (2025) AA: 6.1%
  //   \[ £0.0599\]  \[low stock\]
  //
  // Or disabled (out of stock):
  //   Admiral T90 Hop Pellets (UK) (2025) AA: 14.58%
  //   \[ £0.0531\]  \[out of stock\]
  //
  // Some per-unit items show as:
  //   Fermentis SafAle US-05
  //   \[ £3.50\]

  // Match product name + price line patterns
  const lines = markdown.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Look for price pattern: \[ £X.XXXX\] with optional stock status
    const priceMatch = line.match(
      /\\?\[?\s*£(\d+\.?\d*)\s*\\?\]?\s*(?:\\?\[?(low stock|out of stock)\\?\]?)?/i
    );

    if (priceMatch) {
      // The product name is on the previous non-empty line
      let nameLineIdx = i - 1;
      while (nameLineIdx >= 0 && !lines[nameLineIdx].trim()) {
        nameLineIdx--;
      }

      if (nameLineIdx < 0) continue;

      const name = lines[nameLineIdx]
        .trim()
        .replace(/^\*\*/, "")
        .replace(/\*\*$/, "")
        .replace(/^[-*]\s*/, "");

      // Skip navigation/header lines
      if (!name || name.startsWith("#") || name === "Kg" || name === "Gr" ||
          name.startsWith("Search") || name.startsWith("Please select") ||
          name.startsWith("[") || name.length < 3) {
        continue;
      }

      const price = parseFloat(priceMatch[1]);
      const stockLabel = priceMatch[2]?.toLowerCase();

      let stock_status: GebProduct["stock_status"] = "in_stock";
      if (stockLabel === "out of stock") {
        stock_status = "out_of_stock";
      } else if (stockLabel === "low stock") {
        stock_status = "low_stock";
      }

      products.push({
        name,
        price_per_gram_gbp: price,
        unit,
        category,
        stock_status,
      });
    }
  }

  return products;
}

async function main() {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.error("FIRECRAWL_API_KEY not set");
    process.exit(1);
  }

  const firecrawl = new FirecrawlApp({ apiKey });
  const allProducts: GebProduct[] = [];

  console.log("Scraping GEB kit builder...\n");

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const url = `${BASE_URL}&step=${cat.stepId}`;
    console.log(`  [${i + 1}/${CATEGORIES.length}] ${cat.name}...`);

    try {
      const result = await firecrawl.scrapeUrl(url, {
        formats: ["markdown"],
        waitFor: 3000,
      });

      if (result.markdown) {
        const products = parseProducts(result.markdown, cat.name, cat.unit);
        allProducts.push(...products);
        console.log(`    → ${products.length} products`);
      } else {
        console.warn(`    → 0 products (no markdown returned)`);
      }
    } catch (e) {
      console.warn(`    ✗ Failed: ${e}`);
    }
  }

  console.log(`\nTotal products found: ${allProducts.length}`);

  // Guard: refuse to overwrite with empty or suspiciously small data.
  const MIN_EXPECTED_PRODUCTS = 10;
  if (allProducts.length < MIN_EXPECTED_PRODUCTS) {
    console.log(
      `Only ${allProducts.length} products scraped (minimum: ${MIN_EXPECTED_PRODUCTS}) — keeping existing inventory unchanged.`,
    );
    process.exit(0);
  }

  // Write src/data/geb-inventory.ts
  const outputPath = join(ROOT, "src", "data", "geb-inventory.ts");
  const content = [
    "// Auto-generated by scripts/fetch-geb.ts — do not edit manually",
    `// Generated: ${new Date().toISOString()}`,
    "// Source: https://www.geterbrewed.com/custom-grain-kit/",
    "",
    "export interface GebProduct {",
    "  name: string;",
    "  price_per_gram_gbp: number;",
    '  unit: "per_gram" | "per_unit";',
    "  category: string;",
    '  stock_status: "in_stock" | "low_stock" | "out_of_stock";',
    "}",
    "",
    `export const GEB_INVENTORY: GebProduct[] = ${JSON.stringify(allProducts, null, 2)};`,
    "",
    `export const GEB_LAST_UPDATED = "${new Date().toISOString()}";`,
    "",
  ].join("\n");

  writeFileSync(outputPath, content, "utf-8");
  console.log(`\nWrote ${outputPath} (${allProducts.length} products)`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
