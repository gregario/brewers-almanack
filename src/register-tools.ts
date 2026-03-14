import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSearchStyles } from "./tools/search-styles.js";
import { registerSearchIngredients } from "./tools/search-ingredients.js";
import { registerDiagnoseOffFlavour } from "./tools/diagnose-off-flavour.js";
import { registerMatchWaterProfile } from "./tools/match-water-profile.js";
import { registerSuggestRecipe } from "./tools/suggest-recipe.js";
import { registerPairingGuide } from "./tools/pairing-guide.js";

export function registerTools(server: McpServer): void {
  registerSearchStyles(server);
  registerSearchIngredients(server);
  registerDiagnoseOffFlavour(server);
  registerMatchWaterProfile(server);
  registerSuggestRecipe(server);
  registerPairingGuide(server);
}
