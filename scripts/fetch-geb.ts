/**
 * Fetch GEB custom kit builder inventory and generate embedded TypeScript data.
 *
 * Usage: npx tsx scripts/fetch-geb.ts
 * Requires FIRECRAWL_API_KEY environment variable.
 */

import FirecrawlApp from "@mendable/firecrawl-js";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

const GEB_BASE = "https://www.geterbrewed.com";
const KIT_BUILDER_URL = `${GEB_BASE}/index.php?route=custom_kit/type`;

interface GebProduct {
  name: string;
  price_gbp: number;
  unit: string;
  category: string;
  in_stock: boolean;
}

async function main() {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.error("FIRECRAWL_API_KEY not set");
    process.exit(1);
  }

  const firecrawl = new FirecrawlApp({ apiKey });
  const allProducts: GebProduct[] = [];

  console.log("Scraping GEB kit builder...");

  // The categories are known from previous research.
  const categories = [
    { name: "Base Malt", unit: "per kg" },
    { name: "Specialty Malt", unit: "per kg" },
    { name: "Hops", unit: "per 100g" },
    { name: "Yeast", unit: "each" },
    { name: "Sugar", unit: "per kg" },
    { name: "Finings", unit: "each" },
    { name: "Dry Hops", unit: "per 100g" },
    { name: "Caps & Bottles", unit: "each" },
    { name: "Water Treatment", unit: "each" },
    { name: "Extras", unit: "each" },
    { name: "Barrel Chips/Spirals", unit: "each" },
    { name: "Spices", unit: "each" },
    { name: "Fruit", unit: "each" },
  ];

  // Scrape the main kit builder page to get category structure
  const mainPage = await firecrawl.scrapeUrl(KIT_BUILDER_URL, {
    formats: ["markdown"],
  });
  if (!mainPage.success) {
    console.error("Failed to scrape main page:", mainPage);
    process.exit(1);
  }

  // The kit builder renders one category at a time via wizard-style navigation.
  // Parse products from the markdown content.
  const markdown = mainPage.markdown || "";

  const lines = markdown.split("\n");
  let currentCategory = "";

  for (const line of lines) {
    // Detect category headers
    const catMatch = categories.find((c) =>
      line.toLowerCase().includes(c.name.toLowerCase()),
    );
    if (catMatch && (line.startsWith("#") || line.startsWith("**"))) {
      currentCategory = catMatch.name;
      continue;
    }

    // Parse product lines — typically "Product Name ... £X.XX"
    const priceMatch = line.match(/(.+?)[\s—–-]+£(\d+\.?\d*)/);
    if (priceMatch && currentCategory) {
      allProducts.push({
        name: priceMatch[1]
          .trim()
          .replace(/^\*+|\*+$/g, "")
          .replace(/^-\s*/, ""),
        price_gbp: parseFloat(priceMatch[2]),
        unit: categories.find((c) => c.name === currentCategory)?.unit || "each",
        category: currentCategory,
        in_stock: !line.toLowerCase().includes("out of stock"),
      });
    }
  }

  // If main page didn't yield products (wizard-style), try map endpoint for URLs
  if (allProducts.length === 0) {
    console.log(
      "Main page yielded no products, trying category-by-category scrape...",
    );

    // Use firecrawl map to find all category URLs
    const mapResult = await firecrawl.mapUrl(GEB_BASE, {
      search: "custom kit",
    });

    if (mapResult.success && mapResult.links) {
      const kitUrls = (mapResult.links as string[]).filter(
        (url: string) =>
          url.includes("custom_kit") || url.includes("custom-kit"),
      );

      for (const url of kitUrls.slice(0, 20)) {
        console.log(`  Scraping: ${url}`);
        try {
          const page = await firecrawl.scrapeUrl(url, {
            formats: ["markdown"],
          });
          if (page.success && page.markdown) {
            // Parse products from this category page
            const pageLines = page.markdown.split("\n");
            for (const pLine of pageLines) {
              const pm = pLine.match(/(.+?)[\s—–-]+£(\d+\.?\d*)/);
              if (pm) {
                allProducts.push({
                  name: pm[1]
                    .trim()
                    .replace(/^\*+|\*+$/g, "")
                    .replace(/^-\s*/, ""),
                  price_gbp: parseFloat(pm[2]),
                  unit: "each",
                  category: "Unknown",
                  in_stock: !pLine.toLowerCase().includes("out of stock"),
                });
              }
            }
          }
        } catch (e) {
          console.warn(`  Failed: ${url}`, e);
        }
      }
    }
  }

  console.log(`\nTotal products found: ${allProducts.length}`);

  // Even if we get 0 products (scraping issues), write the file so the build doesn't break.
  // The workflow will detect no data change via git diff.

  // Write src/data/geb-inventory.ts
  const outputPath = join(ROOT, "src", "data", "geb-inventory.ts");
  const content = [
    "// Auto-generated by scripts/fetch-geb.ts — do not edit manually",
    `// Generated: ${new Date().toISOString()}`,
    "// Source: https://www.geterbrewed.com (custom kit builder)",
    "",
    "export interface GebProduct {",
    "  name: string;",
    "  price_gbp: number;",
    "  unit: string;",
    "  category: string;",
    "  in_stock: boolean;",
    "}",
    "",
    `export const GEB_INVENTORY: GebProduct[] = ${JSON.stringify(allProducts, null, 2)};`,
    "",
    `export const GEB_LAST_UPDATED = "${new Date().toISOString()}";`,
    "",
  ].join("\n");

  writeFileSync(outputPath, content, "utf-8");
  console.log(`Wrote ${outputPath} (${allProducts.length} products)`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
