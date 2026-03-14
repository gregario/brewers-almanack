// Common brewing adjuncts: sugars, finings, grains, spices, and flavourings.

import type { Adjunct } from "../types.js";

export const ADJUNCTS: Adjunct[] = [
  // ── Sugars ──────────────────────────────────────────────────────────

  {
    name: "Corn Sugar (Dextrose)",
    type: "sugar",
    fermentable: true,
    usageRate: "5-20% of grist, or 120g per 19L for priming",
    effect: "Raises ABV without adding body or flavour. Dries out the beer and lightens colour.",
    description:
      "Pure glucose monosaccharide. The most common priming sugar and a popular adjunct for boosting gravity in Belgian and American styles.",
  },
  {
    name: "Table Sugar (Sucrose)",
    type: "sugar",
    fermentable: true,
    usageRate: "5-20% of grist, or 100g per 19L for priming",
    effect: "Fully fermentable. Thins body and boosts ABV without adding flavour.",
    description:
      "Common cane or beet sugar. Fully fermentable by brewing yeast. Used in Belgian brewing traditions and for bottle conditioning.",
  },
  {
    name: "Belgian Candi Sugar (Light)",
    type: "sugar",
    fermentable: true,
    usageRate: "5-20% of grist",
    effect: "Increases ABV while keeping the beer light and dry. Adds subtle warmth.",
    description:
      "Crystallised beet sugar used in Belgian tripels and golden strong ales. Lightens body while boosting alcohol content.",
  },
  {
    name: "Belgian Candi Sugar (Dark)",
    type: "sugar",
    fermentable: true,
    usageRate: "5-15% of grist",
    effect: "Adds dark fruit, caramel, and toffee flavours. Deepens colour and raises ABV.",
    description:
      "Caramelised beet sugar essential in Belgian dubbels and dark strong ales. Provides complex dark fruit and burnt sugar character.",
  },
  {
    name: "Honey",
    type: "sugar",
    fermentable: true,
    usageRate: "5-30% of grist by weight",
    effect: "Adds delicate floral sweetness and dries out the finish. Flavour character varies by variety.",
    description:
      "Natural honey added to braggots, honey ales, and Belgian styles. Most honey character ferments out; add at flameout to preserve aroma.",
  },
  {
    name: "Molasses",
    type: "sugar",
    fermentable: true,
    usageRate: "2-10% of grist",
    effect: "Adds deep, earthy, slightly bitter sweetness and dark colour.",
    description:
      "By-product of sugar refining. Used in old ales, strong dark ales, and some stouts. Adds a rustic, treacle-like complexity.",
  },
  {
    name: "Lactose",
    type: "sugar",
    fermentable: false,
    usageRate: "150-500g per 19L",
    effect: "Adds residual sweetness and body. Not fermentable by Saccharomyces yeast.",
    description:
      "Milk sugar used in milk stouts, pastry stouts, and milkshake IPAs. Provides a creamy, sweet body since brewing yeast cannot ferment it.",
  },

  // ── Finings ─────────────────────────────────────────────────────────

  {
    name: "Irish Moss",
    type: "fining",
    fermentable: false,
    usageRate: "1 tsp (5g) per 19L, added 15 min before end of boil",
    effect: "Clarifies wort by coagulating proteins. Reduces chill haze.",
    description:
      "Dried red seaweed (Chondrus crispus). A traditional kettle fining that promotes hot break formation and protein coagulation.",
  },
  {
    name: "Whirlfloc",
    type: "fining",
    fermentable: false,
    usageRate: "1 tablet per 19L, added 5-10 min before end of boil",
    effect: "Clarifies wort by attracting and settling proteins and tannins.",
    description:
      "Concentrated tablet form of Irish moss blended with purified carrageenan. More convenient and consistent than raw Irish moss.",
  },
  {
    name: "Gelatin",
    type: "fining",
    fermentable: false,
    usageRate: "1-2 tsp dissolved in 150ml warm water per 19L",
    effect: "Clarifies beer by binding to polyphenols and yeast. Used cold-side.",
    description:
      "Animal-derived collagen protein. An effective cold-side fining agent that drops yeast and haze particles out of suspension rapidly.",
  },
  {
    name: "Isinglass",
    type: "fining",
    fermentable: false,
    usageRate: "Per manufacturer instructions, typically 1-2ml per litre",
    effect: "Attracts yeast cells and clarifies cask-conditioned ales.",
    description:
      "Collagen derived from fish swim bladders. The traditional cask ale fining, prized for producing brilliant clarity while preserving flavour.",
  },

  // ── Grains ──────────────────────────────────────────────────────────

  {
    name: "Flaked Rice",
    type: "grain",
    fermentable: true,
    usageRate: "10-40% of grist",
    effect: "Lightens body and colour. Produces a dry, crisp finish.",
    description:
      "Pre-gelatinised rice flakes. Used in Japanese lagers and American light lagers to produce a clean, light, refreshing beer.",
  },
  {
    name: "Flaked Maize",
    type: "grain",
    fermentable: true,
    usageRate: "10-30% of grist",
    effect: "Lightens body, adds subtle corn sweetness, smooths flavour.",
    description:
      "Pre-gelatinised corn flakes. Traditional adjunct in American lagers and cream ales. Adds a subtle sweet corn character.",
  },
  {
    name: "Torrified Wheat",
    type: "grain",
    fermentable: true,
    usageRate: "5-15% of grist",
    effect: "Improves head retention, adds body, increases haze.",
    description:
      "Wheat kernels heated until puffed. Adds protein for head retention and a bready character. Common in English bitters.",
  },

  // ── Spices & Flavourings ────────────────────────────────────────────

  {
    name: "Coriander Seed",
    type: "spice",
    fermentable: false,
    usageRate: "15-30g per 19L, added at flameout",
    effect: "Adds citrusy, slightly spicy, lemony character.",
    description:
      "Dried coriander seeds, lightly crushed before use. A defining ingredient in Belgian witbiers alongside orange peel.",
  },
  {
    name: "Orange Peel (Bitter)",
    type: "spice",
    fermentable: false,
    usageRate: "15-30g per 19L, added at flameout",
    effect: "Adds bitter citrus aroma and a zesty, marmalade-like character.",
    description:
      "Dried Curaçao or Seville orange peel. Essential in Belgian witbiers and many Belgian ales. Provides a complex bitter citrus note.",
  },
  {
    name: "Vanilla Beans",
    type: "spice",
    fermentable: false,
    usageRate: "1-3 beans per 19L, split and scraped, added to secondary",
    effect: "Adds smooth vanilla flavour and aroma. Rounds out roasted and sweet flavours.",
    description:
      "Whole vanilla pods added to secondary fermentation. Popular in porters, stouts, cream ales, and pastry-style beers.",
  },
  {
    name: "Cacao Nibs",
    type: "spice",
    fermentable: false,
    usageRate: "60-120g per 19L, added to secondary for 3-7 days",
    effect: "Adds roasted chocolate character without sweetness. Enhances malt complexity.",
    description:
      "Roasted, hulled cocoa beans. Adds genuine chocolate aroma and flavour to porters, stouts, and chocolate-themed beers.",
  },
  {
    name: "Coffee",
    type: "spice",
    fermentable: false,
    usageRate: "30-60g coarsely ground per 19L, cold-steeped or added to secondary",
    effect: "Adds coffee aroma and flavour. Complements roasted malt character.",
    description:
      "Coarsely ground coffee beans, often cold-steeped to avoid astringency. Popular in coffee stouts, porters, and breakfast-style beers.",
  },
  {
    name: "Ginger",
    type: "spice",
    fermentable: false,
    usageRate: "15-60g fresh grated per 19L, added at flameout",
    effect: "Adds a warm, spicy, pungent heat and zesty aroma.",
    description:
      "Fresh ginger root, peeled and grated. Used in ginger beers, saisons, wheat ales, and seasonal spiced ales.",
  },
];
