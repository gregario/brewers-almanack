import Fuse from "fuse.js";
import type { GebProduct } from "../data/geb-inventory.js";
import { GEB_INVENTORY } from "../data/geb-inventory.js";

const BREWING_SYNONYMS: Record<string, string[]> = {
  "maris otter": ["mo", "maris", "otter"],
  "east kent goldings": ["ekg", "east kent", "kent goldings"],
  "saaz": ["czech saaz"],
  "safale us-05": ["us05", "us-05", "us 05", "safale us05", "safale american"],
  "safale s-04": ["s04", "s-04", "s 04", "safale english"],
  "safale s-33": ["s33", "s-33", "s 33"],
  "nottingham": ["notti", "danstar nottingham"],
  "belle saison": ["belle"],
  "carafa special": ["carafa", "carafa iii", "carafa ii", "carafa i", "carafa 3", "carafa 2", "carafa 1"],
  "chocolate malt": ["choc malt", "choc"],
  "crystal malt": ["crystal", "caramel malt"],
  "roasted barley": ["roast barley"],
  "torrefied wheat": ["torrefied", "flaked torrefied"],
  "columbus": ["ctz", "tomahawk", "zeus"],
  "centennial": ["cent"],
  "chinook": ["chin"],
  "simcoe": ["simco"],
  "cascade": ["casc"],
  "amarillo": ["ama"],
  "nelson sauvin": ["nelson"],
  "styrian goldings": ["styrian", "styrian golding"],
  "hallertau mittelfruh": ["hallertau", "mittelfruh", "mittelfrueh"],
  "wlp001": ["california ale", "cal ale", "001"],
  "wlp002": ["english ale", "002"],
  "wlp004": ["irish ale", "004"],
  "wyeast 1056": ["1056", "american ale"],
  "wyeast 1968": ["1968", "london esb"],
  "wyeast 3068": ["3068", "weihenstephan"],
};

function normalise(text: string): string {
  return text
    .replace(/[®™©]/g, "")
    .replace(/['']/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function expandQuery(query: string): string {
  const normalised = normalise(query);

  for (const [canonical, aliases] of Object.entries(BREWING_SYNONYMS)) {
    for (const alias of aliases) {
      if (normalised === alias || normalised === normalise(canonical)) {
        return canonical;
      }
    }
  }

  return normalised;
}

interface NormalisedProduct {
  original: GebProduct;
  normalisedName: string;
}

let fuseInstance: Fuse<NormalisedProduct> | null = null;
let normalisedProducts: NormalisedProduct[] | null = null;

function getIndex(): { fuse: Fuse<NormalisedProduct>; products: NormalisedProduct[] } {
  if (!fuseInstance || !normalisedProducts) {
    normalisedProducts = GEB_INVENTORY.map((p) => ({
      original: p,
      normalisedName: normalise(p.name),
    }));

    fuseInstance = new Fuse(normalisedProducts, {
      keys: [
        { name: "normalisedName", weight: 0.7 },
        { name: "original.category", weight: 0.3 },
      ],
      threshold: 0.35,
      distance: 100,
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }

  return { fuse: fuseInstance, products: normalisedProducts };
}

export function fuzzySearchInventory(
  query: string,
  category?: string,
): GebProduct[] {
  const { fuse, products } = getIndex();
  const expanded = expandQuery(query);

  let pool = products;
  if (category) {
    const catLower = normalise(category);
    pool = products.filter((p) =>
      normalise(p.original.category).includes(catLower),
    );
  }

  // If we have a category filter, build a scoped Fuse instance
  const searchFuse = category
    ? new Fuse(pool, {
        keys: [
          { name: "normalisedName", weight: 0.7 },
          { name: "original.category", weight: 0.3 },
        ],
        threshold: 0.35,
        distance: 100,
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 2,
      })
    : fuse;

  const results = searchFuse.search(expanded);

  // Also try multi-word: all words must appear somewhere in the name
  const words = expanded.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length > 1) {
    const multiWordMatches = pool.filter((p) =>
      words.every((w) => p.normalisedName.includes(w)),
    );

    // Merge: multi-word exact matches first, then fuzzy
    const seen = new Set<GebProduct>();
    const merged: GebProduct[] = [];

    for (const m of multiWordMatches) {
      if (!seen.has(m.original)) {
        seen.add(m.original);
        merged.push(m.original);
      }
    }

    for (const r of results) {
      if (!seen.has(r.item.original)) {
        seen.add(r.item.original);
        merged.push(r.item.original);
      }
    }

    return merged;
  }

  return results.map((r) => r.item.original);
}
