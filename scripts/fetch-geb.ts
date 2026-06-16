/**
 * Fetch GEB custom kit builder inventory and generate embedded TypeScript data.
 *
 * Usage: npx tsx scripts/fetch-geb.ts
 * Requires FIRECRAWL_API_KEY environment variable.
 *
 * The GEB kit builder is a wizard at /custom-grain-kit/ with 10 product categories.
 * Each category is a step in the wizard. We use Firecrawl's JSON extraction
 * to pull structured product data from each step.
 */

import FirecrawlApp from "@mendable/firecrawl-js";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

const KIT_BUILDER_URL = "https://www.geterbrewed.com/custom-grain-kit/";

interface GebProduct {
  name: string;
  price_per_gram_gbp: number;
  unit: "per_gram" | "per_unit";
  category: string;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
}

// The kit builder has 10 product steps (steps 11-13 are Verify/Submit/Options — no products).
// Each step has a CSS selector for the step link. The page renders step 1 by default;
// steps 2-10 need a click to reveal their products.
const CATEGORIES = [
  { name: "Base Malt", step: 1, unit: "per_gram" as const },
  { name: "Lightly Kilned Malt", step: 2, unit: "per_gram" as const },
  { name: "Caramel & Crystal Malt", step: 3, unit: "per_gram" as const },
  { name: "Flaked & Unmalted Adjuncts", step: 4, unit: "per_gram" as const },
  { name: "Smoked Malts", step: 5, unit: "per_gram" as const },
  { name: "T90 Hops", step: 6, unit: "per_gram" as const },
  { name: "Dried Yeast", step: 7, unit: "per_unit" as const },
  { name: "Liquid Yeast", step: 8, unit: "per_unit" as const },
  { name: "Flavours", step: 9, unit: "per_unit" as const },
  { name: "Sugars", step: 10, unit: "per_gram" as const },
];

const PRODUCT_SCHEMA = {
  type: "object" as const,
  properties: {
    products: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          price_per_gram_gbp: { type: "number" as const },
          stock_status: {
            type: "string" as const,
            enum: ["in_stock", "low_stock", "out_of_stock"],
          },
        },
        required: ["name", "price_per_gram_gbp", "stock_status"],
      },
    },
  },
  required: ["products"],
};

async function main() {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.error("FIRECRAWL_API_KEY not set");
    process.exit(1);
  }

  const firecrawl = new FirecrawlApp({ apiKey });
  const allProducts: GebProduct[] = [];

  console.log("Scraping GEB kit builder...\n");

  // Step 1 (Base Malt) is visible on initial page load — no click needed
  console.log(`  [1/${CATEGORIES.length}] ${CATEGORIES[0].name}...`);
  try {
    const result = await firecrawl.scrapeUrl(KIT_BUILDER_URL, {
      formats: ["json"],
      jsonOptions: {
        prompt:
          "Extract all products from this page. Each product has a name, a price (shown as price per gram in GBP like £0.0036), and a stock status (in_stock if no stock label, low_stock if marked [low stock], out_of_stock if marked [out of stock]).",
        schema: PRODUCT_SCHEMA,
      },
      waitFor: 5000,
    });

    if (result.json?.products) {
      const products = result.json.products as Array<{
        name: string;
        price_per_gram_gbp: number;
        stock_status: string;
      }>;
      for (const p of products) {
        allProducts.push({
          name: p.name,
          price_per_gram_gbp: p.price_per_gram_gbp,
          unit: CATEGORIES[0].unit,
          category: CATEGORIES[0].name,
          stock_status: p.stock_status as GebProduct["stock_status"],
        });
      }
      console.log(`    → ${products.length} products`);
    }
  } catch (e) {
    console.warn(`    ✗ Failed: ${e}`);
  }

  // Steps 2-10: click the step tab to reveal products, then extract
  for (let i = 1; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    console.log(`  [${i + 1}/${CATEGORIES.length}] ${cat.name}...`);

    try {
      // Click the step link (wizard steps are numbered list items)
      // The step links are in an <ol> — we click the nth <li> <a>
      const result = await firecrawl.scrapeUrl(KIT_BUILDER_URL, {
        formats: ["json"],
        jsonOptions: {
          prompt: `Extract all products visible in the "${cat.name}" section/step of this kit builder. Each product has a name, a price per gram in GBP (like £0.0036), and a stock status (in_stock if no label, low_stock if [low stock], out_of_stock if [out of stock]).`,
          schema: PRODUCT_SCHEMA,
        },
        actions: [
          { type: "wait", milliseconds: 2000 },
          {
            type: "click",
            selector: `.custom-kit-steps li:nth-child(${cat.step}) a, ol li:nth-child(${cat.step}) a`,
          },
          { type: "wait", milliseconds: 3000 },
        ],
        waitFor: 3000,
      });

      if (result.json?.products) {
        const products = result.json.products as Array<{
          name: string;
          price_per_gram_gbp: number;
          stock_status: string;
        }>;
        for (const p of products) {
          allProducts.push({
            name: p.name,
            price_per_gram_gbp: p.price_per_gram_gbp,
            unit: cat.unit,
            category: cat.name,
            stock_status: p.stock_status as GebProduct["stock_status"],
          });
        }
        console.log(`    → ${products.length} products`);
      } else {
        console.warn(`    → 0 products (no JSON returned)`);
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
