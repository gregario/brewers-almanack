import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerMatchWaterProfile(server: McpServer): void {
  server.registerTool(
    "match_water_profile",
    {
      title: "Match Water Profile",
      description:
        "Find brewing water profiles by city name or beer style. Returns mineral composition (Ca, Mg, Na, Cl, SO4, HCO3) and style recommendations.",
      inputSchema: {
        query: z
          .string()
          .describe("City name or beer style to find water profile for"),
      },
    },
    async ({ query }) => ({
      content: [
        {
          type: "text" as const,
          text: `match_water_profile: not yet implemented (query: ${query})`,
        },
      ],
    }),
  );
}
