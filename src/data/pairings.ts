import type { FoodPairing } from "../types.js";

export const PAIRINGS: FoodPairing[] = [
  {
    style: "IPA",
    dishes: [
      "Spicy Thai curry",
      "Fish tacos with mango salsa",
      "Blue cheese burger",
      "Jalapeño poppers",
      "Strong aged cheddar",
    ],
    principles: [
      "Complement: citrus and tropical hop notes echo fruit-forward salsas and chutneys",
      "Contrast: bitterness cuts through rich, fatty foods like burgers and fried dishes",
      "Cleanse: high carbonation and bitterness scrub the palate between bites of spicy food",
    ],
    avoid: ["Delicate seafood (overpowered by hops)", "Light salads", "Subtle desserts"],
  },
  {
    style: "Pale Ale",
    dishes: [
      "Roast chicken",
      "Fish and chips",
      "Cheddar cheese",
      "Caesar salad with grilled chicken",
      "Pizza margherita",
    ],
    principles: [
      "Complement: moderate maltiness pairs with roasted and grilled meats",
      "Contrast: balanced bitterness cuts through mild richness",
      "Cleanse: medium carbonation refreshes between bites of fried foods",
    ],
    avoid: ["Extremely spicy dishes", "Rich chocolate desserts", "Heavily smoked meats"],
  },
  {
    style: "Stout",
    dishes: [
      "Oysters (dry stout)",
      "Chocolate lava cake",
      "Beef and Guinness pie",
      "Espresso brownies",
      "Barbecue ribs",
    ],
    principles: [
      "Complement: roasted malt echoes chocolate, coffee, and char flavours",
      "Contrast: dry bitterness balances sweet desserts",
      "Cleanse: roast character cuts through rich, fatty meats",
    ],
    avoid: ["Light, delicate fish", "Fresh fruit salads", "Mild white cheeses"],
  },
  {
    style: "Porter",
    dishes: [
      "Smoked sausages",
      "Pulled pork",
      "Mushroom risotto",
      "Dark chocolate truffles",
      "Gruyère cheese",
    ],
    principles: [
      "Complement: chocolate and toffee malt notes match caramelised and roasted dishes",
      "Contrast: moderate bitterness balances smoky, sweet barbecue sauces",
    ],
    avoid: ["Light citrus dishes", "Raw sushi", "Very spicy food"],
  },
  {
    style: "Wheat Beer",
    dishes: [
      "Garden salads with vinaigrette",
      "Lighter seafood (prawns, white fish)",
      "Goat cheese",
      "Fruit tarts",
      "Chicken schnitzel",
    ],
    principles: [
      "Complement: light, bready character matches delicate dishes",
      "Contrast: crisp wheat acidity refreshes the palate with creamy cheeses",
      "Cleanse: effervescent carbonation lifts fried foods",
    ],
    avoid: ["Heavy stews", "Very rich or dark chocolate", "Intensely smoked meats"],
  },
  {
    style: "Belgian Tripel",
    dishes: [
      "Moules frites (mussels and chips)",
      "Roast turkey",
      "Aged Gouda",
      "Crème brûlée",
      "Lobster with drawn butter",
    ],
    principles: [
      "Complement: fruity esters and peppery phenols match herbal and spiced dishes",
      "Contrast: dry finish and high carbonation cut through buttery richness",
      "Cleanse: effervescence and alcohol warmth refresh between rich bites",
    ],
    avoid: ["Very bitter or charred foods", "Extremely spicy dishes", "Light green salads"],
  },
  {
    style: "Saison",
    dishes: [
      "Charcuterie board",
      "Grilled vegetables",
      "Herbed goat cheese",
      "Steamed mussels",
      "Thai green papaya salad",
    ],
    principles: [
      "Complement: peppery, earthy yeast character matches herbed and rustic dishes",
      "Contrast: bone-dry finish lifts rich cured meats and pâtés",
      "Cleanse: high carbonation and tartness refresh with every sip",
    ],
    avoid: ["Very sweet desserts", "Heavy cream sauces", "Milk chocolate"],
  },
  {
    style: "Pilsner",
    dishes: [
      "Grilled bratwurst",
      "Sushi and sashimi",
      "Light salads with lemon dressing",
      "Steamed dumplings",
      "Mild white fish",
    ],
    principles: [
      "Complement: clean, bready malt pairs with subtle, delicate flavours",
      "Contrast: crisp hop bitterness balances mild fattiness",
      "Cleanse: high carbonation and dry finish refresh the palate",
    ],
    avoid: ["Heavy barbecue", "Rich chocolate desserts", "Extremely pungent cheeses"],
  },
  {
    style: "Amber Ale",
    dishes: [
      "Roast pork loin",
      "Caramelised onion tart",
      "Smoked Gouda",
      "Meat loaf",
      "Autumn squash soup",
    ],
    principles: [
      "Complement: caramel and toffee malt notes echo roasted and caramelised dishes",
      "Contrast: moderate bitterness balances sweetness in glazes and caramelised foods",
    ],
    avoid: ["Very delicate raw fish", "Light citrus desserts", "Plain steamed vegetables"],
  },
  {
    style: "Brown Ale",
    dishes: [
      "Roast beef",
      "Pecan pie",
      "Sharp cheddar",
      "Bangers and mash",
      "Mushroom and onion pie",
    ],
    principles: [
      "Complement: nutty, toasty malt character matches roasted nuts and caramelised meats",
      "Contrast: mild bitterness balances sweet, nutty desserts",
    ],
    avoid: ["Spicy Asian dishes", "Delicate shellfish", "Citrus-forward salads"],
  },
  {
    style: "Barleywine",
    dishes: [
      "Stilton cheese",
      "Foie gras",
      "Dark chocolate with sea salt",
      "Bread pudding with caramel sauce",
      "Walnuts and dried fruit",
    ],
    principles: [
      "Complement: rich toffee, dark fruit, and sherry-like notes match complex, intense desserts",
      "Contrast: high alcohol warmth balances strong blue cheeses",
    ],
    avoid: ["Light, fresh dishes", "Delicate seafood", "Green salads"],
  },
  {
    style: "Sour Beer",
    dishes: [
      "Fresh oysters",
      "Goat cheese salad",
      "Ceviche",
      "Fruit tarts and lemon curd",
      "Vietnamese pho",
    ],
    principles: [
      "Complement: tartness echoes citrus and vinegar-dressed dishes",
      "Contrast: acidity cuts through rich, creamy cheeses and fatty dishes",
      "Cleanse: sharp sourness refreshes the palate with each sip",
    ],
    avoid: ["Very sweet desserts", "Heavy chocolate dishes", "Charred or heavily smoked meats"],
  },
  {
    style: "Belgian Dubbel",
    dishes: [
      "Braised short ribs",
      "Carbonnade flamande (Belgian beef stew)",
      "Aged Gouda or Chimay cheese",
      "Pear and walnut salad",
      "Bread pudding",
    ],
    principles: [
      "Complement: dark fruit and caramel malt notes match braised and caramelised dishes",
      "Contrast: moderate dryness balances rich, stewed meats",
    ],
    avoid: ["Very spicy dishes", "Light sushi", "Citrus-forward salads"],
  },
  {
    style: "Hefeweizen",
    dishes: [
      "Weisswurst with sweet mustard",
      "Banana bread",
      "Light seafood (prawns, calamari)",
      "Waldorf salad",
      "Lemon-herbed chicken",
    ],
    principles: [
      "Complement: banana and clove yeast character pairs beautifully with the classic Bavarian breakfast",
      "Contrast: wheat tartness and effervescence cut through mild richness",
      "Cleanse: high carbonation refreshes with fried or battered dishes",
    ],
    avoid: ["Heavy beef stews", "Dark chocolate", "Intensely spicy food"],
  },
  {
    style: "Scottish Ale",
    dishes: [
      "Haggis",
      "Lamb stew",
      "Smoked salmon",
      "Oatcakes with cheddar",
      "Sticky toffee pudding",
    ],
    principles: [
      "Complement: caramel and light smoky malt notes match rich, savoury Highland dishes",
      "Contrast: low bitterness and malty sweetness balance smoked and salted foods",
    ],
    avoid: ["Very spicy food", "Citrus-forward dishes", "Light, fresh salads"],
  },
  {
    style: "American Lager",
    dishes: [
      "Hot dogs",
      "Burgers",
      "Nachos",
      "Fried chicken",
      "Light cheese (Monterey Jack, mild American)",
    ],
    principles: [
      "Complement: clean, neutral flavour does not compete with simple, satisfying foods",
      "Cleanse: high carbonation and dry finish cut through grease and salt",
    ],
    avoid: ["Complex, intensely flavoured dishes", "Rich desserts", "Strong blue cheeses"],
  },
  {
    style: "Bock",
    dishes: [
      "Roast pork shank (Schweinshaxe)",
      "Smoked ham",
      "Pretzels with mustard",
      "Gruyère fondue",
      "Apple strudel",
    ],
    principles: [
      "Complement: rich, bready malt character matches hearty Germanic dishes",
      "Contrast: moderate alcohol warmth balances salty, smoked meats",
    ],
    avoid: ["Delicate raw fish", "Very spicy cuisine", "Light fruit desserts"],
  },
  {
    style: "Maerzen/Oktoberfest",
    dishes: [
      "Roast chicken (Hendl)",
      "Obatzda (Bavarian cheese spread)",
      "Sausages and sauerkraut",
      "Schnitzel",
      "Soft pretzels",
    ],
    principles: [
      "Complement: toasty, biscuity malt pairs with roasted meats and baked bread",
      "Contrast: clean lager finish balances rich, fatty dishes",
      "Cleanse: moderate carbonation refreshes between bites of sausage and cheese",
    ],
    avoid: ["Very spicy food", "Dark chocolate", "Raw seafood"],
  },
  {
    style: "Witbier",
    dishes: [
      "Steamed mussels with white wine",
      "Crab cakes",
      "Light pasta with lemon and herbs",
      "Fresh fruit with mascarpone",
      "Mild soft cheeses (Brie, Camembert)",
    ],
    principles: [
      "Complement: coriander and orange peel spicing echoes citrus and herbal dishes",
      "Contrast: light body and wheat tartness cut through creamy, rich sauces",
      "Cleanse: effervescence refreshes the palate with shellfish and buttery dishes",
    ],
    avoid: ["Heavy barbecue", "Very strong cheeses", "Intensely spiced curries"],
  },
  {
    style: "Imperial Stout",
    dishes: [
      "Dark chocolate torte",
      "Espresso tiramisu",
      "Blue cheese (Roquefort, Gorgonzola)",
      "Braised oxtail",
      "Chocolate-covered cherries",
    ],
    principles: [
      "Complement: intense roast, chocolate, and coffee flavours match rich, dark desserts",
      "Contrast: high alcohol and roast bitterness balance intense, pungent blue cheeses",
    ],
    avoid: ["Delicate white fish", "Light salads", "Subtle, mild dishes"],
  },
  {
    style: "Gose",
    dishes: [
      "Ceviche",
      "Watermelon and feta salad",
      "Shrimp cocktail",
      "Light tacos with lime",
      "Cucumber gazpacho",
    ],
    principles: [
      "Complement: salt and tartness echo bright, citrus-dressed seafood",
      "Contrast: sourness cuts through mild richness of cheese and shellfish",
      "Cleanse: effervescence and acidity refresh between bites",
    ],
    avoid: ["Rich, heavy stews", "Dark chocolate", "Heavily smoked meats"],
  },
  {
    style: "Doppelbock",
    dishes: [
      "Roast duck",
      "Dark bread with butter",
      "Aged alpine cheeses (Emmental, Appenzeller)",
      "Dried fruit and nut platters",
      "Caramel flan",
    ],
    principles: [
      "Complement: rich, bready, and dried-fruit malt character matches hearty roasted meats",
      "Contrast: smooth alcohol warmth balances salty, nutty cheeses",
    ],
    avoid: ["Spicy food", "Delicate sushi", "Fresh fruit salads"],
  },
  {
    style: "Belgian Strong Golden Ale",
    dishes: [
      "Herb-crusted rack of lamb",
      "Gruyère soufflé",
      "Scallops with brown butter",
      "Fruit-topped pavlova",
      "Baked Camembert",
    ],
    principles: [
      "Complement: fruity esters and spicy phenols match herbed and aromatic dishes",
      "Contrast: bone-dry finish and high carbonation cut through buttery, rich foods",
      "Cleanse: effervescence lifts palate between bites of rich cheese and seafood",
    ],
    avoid: ["Very bitter dishes", "Heavily smoked meats", "Extremely spicy food"],
  },
];
