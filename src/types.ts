export type BeerStyle = {
  id: string;
  name: string;
  category: string;
  categoryNumber: number;
  styleLetter: string;
  overallImpression: string;
  vitalStats: {
    ogMin: number; ogMax: number;
    fgMin: number; fgMax: number;
    ibuMin: number; ibuMax: number;
    srmMin: number; srmMax: number;
    abvMin: number; abvMax: number;
  };
  ingredients: string;
  examples: string;
  tags: string[];
};

export type Hop = {
  name: string;
  origin: string;
  alphaAcidMin: number;
  alphaAcidMax: number;
  betaAcidMin: number;
  betaAcidMax: number;
  purpose: "bittering" | "aroma" | "dual";
  aromas: string[];
  styles: string[];
  substitutes: string[];
  description: string;
};

export type Malt = {
  name: string;
  producer: string;
  colour: number;
  potential: number;
  fermentability: number;
  type: "base" | "crystal" | "roasted" | "adjunct" | "specialty";
  flavour: string;
  description: string;
};

export type Yeast = {
  name: string;
  producer: string;
  code: string;
  type: "ale" | "lager" | "wheat" | "belgian" | "wild" | "kveik";
  form: "dry" | "liquid";
  attenuationMin: number;
  attenuationMax: number;
  tempMin: number;
  tempMax: number;
  flocculation: "low" | "medium" | "high" | "very high";
  alcoholTolerance: number;
  flavourProfile: string;
  bestFor: string[];
};

export type Adjunct = {
  name: string;
  type: "sugar" | "fining" | "spice" | "fruit" | "grain" | "other";
  fermentable: boolean;
  usageRate: string;
  effect: string;
  description: string;
};

export type WaterProfile = {
  name: string;
  city: string;
  calcium: number;
  magnesium: number;
  sodium: number;
  chloride: number;
  sulfate: number;
  bicarbonate: number;
  description: string;
  bestFor: string[];
};

export type OffFlavour = {
  name: string;
  compound: string;
  character: string;
  causes: string[];
  prevention: string[];
  threshold: string;
  acceptableIn: string[];
};

export type FoodPairing = {
  style: string;
  dishes: string[];
  principles: string[];
  avoid: string[];
};
