// Malt data sourced from published maltster spec sheets (Briess, Weyermann, Simpsons, Crisp, Château).

import type { Malt } from "../types.js";

export const MALTS: Malt[] = [
  // ── Base Malts ──────────────────────────────────────────────────────

  {
    name: "2-Row Pale Malt",
    producer: "Briess",
    colour: 1.8,
    potential: 37,
    fermentability: 0.81,
    type: "base",
    flavour: "Clean, sweet, mild malty",
    description:
      "Standard North American 2-row base malt. Clean and neutral, suitable for virtually any beer style.",
  },
  {
    name: "Pilsner Malt",
    producer: "Weyermann",
    colour: 1.6,
    potential: 37,
    fermentability: 0.81,
    type: "base",
    flavour: "Light, sweet, delicate grainy",
    description:
      "Traditional German pilsner malt from 2-row spring barley. The lightest base malt, essential for lagers and Belgian ales.",
  },
  {
    name: "Maris Otter",
    producer: "Crisp",
    colour: 3.0,
    potential: 38,
    fermentability: 0.82,
    type: "base",
    flavour: "Rich, biscuity, slightly nutty",
    description:
      "Heritage English 2-row winter barley variety. Widely regarded as the finest pale ale malt, prized for its rich, complex flavour.",
  },
  {
    name: "Munich Malt (Light)",
    producer: "Weyermann",
    colour: 6.0,
    potential: 37,
    fermentability: 0.77,
    type: "base",
    flavour: "Bready, malty, toasty",
    description:
      "German Munich malt kilned at higher temperatures. Provides a rich, malty backbone for Oktoberfest, bock, and Munich-style lagers.",
  },
  {
    name: "Munich Malt (Dark)",
    producer: "Weyermann",
    colour: 9.0,
    potential: 36,
    fermentability: 0.75,
    type: "base",
    flavour: "Intensely malty, bread crust, honey",
    description:
      "Darker Munich malt with pronounced melanoidin character. Adds deep malt complexity to dunkels, bocks, and amber lagers.",
  },
  {
    name: "Vienna Malt",
    producer: "Weyermann",
    colour: 3.5,
    potential: 37,
    fermentability: 0.78,
    type: "base",
    flavour: "Lightly toasty, biscuit, malty",
    description:
      "Classic Austrian-style base malt. Kilned slightly higher than pilsner malt, adding a gentle toasty character to Vienna lagers and Märzens.",
  },
  {
    name: "Wheat Malt",
    producer: "Weyermann",
    colour: 2.0,
    potential: 37,
    fermentability: 0.80,
    type: "base",
    flavour: "Light, bready, slightly tart",
    description:
      "Malted wheat for weizens, witbiers, and wheat ales. Contributes a bready flavour and aids head retention due to high protein content.",
  },
  {
    name: "Pale Ale Malt",
    producer: "Briess",
    colour: 3.5,
    potential: 37,
    fermentability: 0.81,
    type: "base",
    flavour: "Biscuity, malty, slightly sweet",
    description:
      "Slightly more kilned than standard 2-row. A versatile base malt for pale ales, IPAs, and amber ales with a touch more colour and flavour.",
  },
  {
    name: "Golden Promise",
    producer: "Simpsons",
    colour: 2.5,
    potential: 37,
    fermentability: 0.80,
    type: "base",
    flavour: "Sweet, clean, honey-like",
    description:
      "Scottish heritage barley variety. Produces exceptionally clean, sweet wort. Famously used in Traquair House Ale and many Scottish ales.",
  },

  // ── Crystal / Caramel Malts ─────────────────────────────────────────

  {
    name: "Crystal 10L",
    producer: "Briess",
    colour: 10,
    potential: 35,
    fermentability: 0.60,
    type: "crystal",
    flavour: "Light caramel, honey, sweet",
    description:
      "Very light crystal malt. Adds subtle sweetness, light body, and golden colour without heavy caramel flavour.",
  },
  {
    name: "Crystal 20L",
    producer: "Briess",
    colour: 20,
    potential: 35,
    fermentability: 0.58,
    type: "crystal",
    flavour: "Light caramel, slightly nutty",
    description:
      "Light crystal malt adding gentle caramel sweetness and improved body. Suitable for pale ales and lighter amber styles.",
  },
  {
    name: "Crystal 40L",
    producer: "Briess",
    colour: 40,
    potential: 34,
    fermentability: 0.55,
    type: "crystal",
    flavour: "Caramel, toffee, mild sweetness",
    description:
      "Medium crystal malt providing classic caramel flavour and amber colour. A staple in English-style ales and American ambers.",
  },
  {
    name: "Crystal 60L",
    producer: "Briess",
    colour: 60,
    potential: 34,
    fermentability: 0.52,
    type: "crystal",
    flavour: "Pronounced caramel, toffee, raisin",
    description:
      "Widely used medium-dark crystal malt. Delivers rich caramel and toffee notes with deep amber to copper colour.",
  },
  {
    name: "Crystal 80L",
    producer: "Briess",
    colour: 80,
    potential: 34,
    fermentability: 0.48,
    type: "crystal",
    flavour: "Dark caramel, dried fruit, slight roast",
    description:
      "Dark crystal malt contributing deep caramel, raisin, and prune flavours. Used in porters, brown ales, and strong ales.",
  },
  {
    name: "Crystal 120L",
    producer: "Briess",
    colour: 120,
    potential: 33,
    fermentability: 0.42,
    type: "crystal",
    flavour: "Burnt caramel, dark fruit, roasty",
    description:
      "Very dark crystal malt with intense caramel, burnt sugar, and dark fruit character. Used sparingly in stouts and barleywines.",
  },
  {
    name: "CaraMunich I",
    producer: "Weyermann",
    colour: 34,
    potential: 34,
    fermentability: 0.55,
    type: "crystal",
    flavour: "Rich caramel, toffee, bready",
    description:
      "German-style caramel malt. Adds caramel sweetness and deep amber colour. Excellent in Märzens, bocks, and amber lagers.",
  },
  {
    name: "CaraVienne",
    producer: "Château",
    colour: 22,
    potential: 34,
    fermentability: 0.57,
    type: "crystal",
    flavour: "Light toffee, caramel, biscuit",
    description:
      "Belgian light caramel malt. Adds gentle toffee and caramel character with a touch of colour to Belgian and abbey ales.",
  },
  {
    name: "Special B",
    producer: "Château",
    colour: 150,
    potential: 33,
    fermentability: 0.40,
    type: "crystal",
    flavour: "Dark fruit, raisin, plum, heavy caramel",
    description:
      "Uniquely Belgian specialty crystal malt. Produces intense raisin, plum, and dark caramel flavours. Essential in Belgian dubbels and dark strong ales.",
  },
  {
    name: "Honey Malt",
    producer: "Gambrinus",
    colour: 25,
    potential: 34,
    fermentability: 0.55,
    type: "crystal",
    flavour: "Honey-like, sweet, graham cracker",
    description:
      "Canadian specialty malt with distinctive honey-like sweetness. Adds a unique sweet, almost brûlée character to any style.",
  },

  // ── Roasted Malts ──────────────────────────────────────────────────

  {
    name: "Chocolate Malt",
    producer: "Crisp",
    colour: 350,
    potential: 28,
    fermentability: 0.60,
    type: "roasted",
    flavour: "Bittersweet chocolate, dark coffee, roast",
    description:
      "Deeply roasted malt providing rich chocolate and coffee flavours. A key ingredient in porters, brown ales, and milder stouts.",
  },
  {
    name: "Black Patent Malt",
    producer: "Briess",
    colour: 500,
    potential: 25,
    fermentability: 0.55,
    type: "roasted",
    flavour: "Sharp roast, acrid, dry, burnt",
    description:
      "The darkest roasted malt. Provides intense colour and sharp roasted character. Used sparingly in stouts and schwarzbiers.",
  },
  {
    name: "Roasted Barley",
    producer: "Crisp",
    colour: 300,
    potential: 25,
    fermentability: 0.55,
    type: "roasted",
    flavour: "Coffee, dry roast, espresso, sharp",
    description:
      "Unmalted roasted barley. Provides the distinctive dry, coffee-like roast of Irish stouts. Essential in dry stout recipes.",
  },
  {
    name: "Carafa I",
    producer: "Weyermann",
    colour: 300,
    potential: 32,
    fermentability: 0.58,
    type: "roasted",
    flavour: "Mild roast, chocolate, coffee",
    description:
      "Dehusked dark roasted malt providing colour and mild roasted flavour without harshness. Excellent for schwarzbier and dark lagers.",
  },
  {
    name: "Carafa II",
    producer: "Weyermann",
    colour: 400,
    potential: 32,
    fermentability: 0.57,
    type: "roasted",
    flavour: "Moderate roast, chocolate, espresso",
    description:
      "Medium dehusked roasted malt. More roast intensity than Carafa I while remaining smooth. Suited for porters and dark Belgian ales.",
  },
  {
    name: "Carafa III",
    producer: "Weyermann",
    colour: 500,
    potential: 31,
    fermentability: 0.55,
    type: "roasted",
    flavour: "Intense roast, dark chocolate, black coffee",
    description:
      "The darkest Carafa malt. Provides deep black colour and smooth roast character without the acrid bite of black patent malt.",
  },
  {
    name: "Black Malt",
    producer: "Simpsons",
    colour: 550,
    potential: 25,
    fermentability: 0.50,
    type: "roasted",
    flavour: "Dry, sharp roast, charcoal, bitter",
    description:
      "Intensely roasted malt providing very deep colour and dry, acrid roasted character. Used in stouts and porters for colour and intensity.",
  },
  {
    name: "Coffee Malt",
    producer: "Simpsons",
    colour: 150,
    potential: 30,
    fermentability: 0.60,
    type: "roasted",
    flavour: "Coffee, mocha, light roast",
    description:
      "Medium-roasted malt with a distinct coffee-like character. Milder than chocolate malt, bridging the gap between crystal and dark roasted malts.",
  },

  // ── Specialty Malts ─────────────────────────────────────────────────

  {
    name: "Biscuit Malt",
    producer: "Château",
    colour: 23,
    potential: 36,
    fermentability: 0.75,
    type: "specialty",
    flavour: "Warm biscuit, bread crust, toasty",
    description:
      "Belgian specialty malt kilned to produce warm biscuit and bread crust flavours. Adds complexity to Belgian ales, English bitters, and brown ales.",
  },
  {
    name: "Victory Malt",
    producer: "Briess",
    colour: 28,
    potential: 34,
    fermentability: 0.73,
    type: "specialty",
    flavour: "Toasty, nutty, biscuit, warm",
    description:
      "Lightly roasted specialty malt with a warm, nutty, toasty character. Similar to biscuit malt but with more pronounced nuttiness.",
  },
  {
    name: "Melanoidin Malt",
    producer: "Weyermann",
    colour: 27,
    potential: 36,
    fermentability: 0.75,
    type: "specialty",
    flavour: "Intense malty, honey, biscuit",
    description:
      "Specialty malt rich in melanoidins. Replicates the malty depth achieved by decoction mashing. Ideal for bocks, Märzens, and red ales.",
  },
  {
    name: "Acidulated Malt",
    producer: "Weyermann",
    colour: 1.8,
    potential: 27,
    fermentability: 0.50,
    type: "specialty",
    flavour: "Tart, sour, lightly acidic",
    description:
      "Malt sprayed with lactic acid to lower mash pH naturally. Used at 1-5% of the grist in German brewing to comply with Reinheitsgebot.",
  },
  {
    name: "Aromatic Malt",
    producer: "Château",
    colour: 20,
    potential: 36,
    fermentability: 0.76,
    type: "specialty",
    flavour: "Intensely malty, almost overpowering malt aroma",
    description:
      "Belgian malt similar to Munich but more intensely flavoured. Provides strong malt aroma and deep colour. Useful in Belgian ales and bocks.",
  },
  {
    name: "Smoked Malt (Rauchmalz)",
    producer: "Weyermann",
    colour: 2.0,
    potential: 37,
    fermentability: 0.80,
    type: "specialty",
    flavour: "Campfire smoke, bacon, woody",
    description:
      "Beechwood-smoked base malt from Bamberg, Germany. The traditional malt for Rauchbier. Can be used from 5-100% depending on desired smoke intensity.",
  },
  {
    name: "Rye Malt",
    producer: "Weyermann",
    colour: 3.0,
    potential: 36,
    fermentability: 0.78,
    type: "specialty",
    flavour: "Spicy, dry, slightly sharp",
    description:
      "Malted rye adding a distinctive spicy, dry character. Used in roggenbiers, rye IPAs, and saisons. High beta-glucan content aids body.",
  },
  {
    name: "Flaked Barley",
    producer: "Briess",
    colour: 1.5,
    potential: 32,
    fermentability: 0.70,
    type: "adjunct",
    flavour: "Grainy, smooth, neutral",
    description:
      "Pre-gelatinised barley flakes. Adds body, head retention, and a smooth mouthfeel. Traditional in dry Irish stouts.",
  },
  {
    name: "Flaked Oats",
    producer: "Briess",
    colour: 1.5,
    potential: 33,
    fermentability: 0.70,
    type: "adjunct",
    flavour: "Smooth, silky, creamy",
    description:
      "Pre-gelatinised oat flakes. Adds a silky, creamy mouthfeel and aids head retention. Essential in oatmeal stouts and New England IPAs.",
  },
  {
    name: "Flaked Wheat",
    producer: "Briess",
    colour: 1.5,
    potential: 33,
    fermentability: 0.70,
    type: "adjunct",
    flavour: "Light, bready, wheaty",
    description:
      "Pre-gelatinised wheat flakes. Increases body, head retention, and haze. Common in witbiers, wheat ales, and hazy IPAs.",
  },
];
