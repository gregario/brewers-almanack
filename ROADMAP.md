# Roadmap

Where Brewers Almanack is headed. Phases are rough guides, not commitments — priorities shift based on what the community finds most useful.

## Phase 1 — Knowledge Base (v1.0) :white_check_mark:

The foundation: a curated brewing knowledge base accessible to any MCP-compatible AI assistant.

| Tool | What it does |
|------|-------------|
| `search_styles` | Search 85 BJCP beer styles by name, category, or characteristics |
| `search_ingredients` | Search 113 hops, 38 malts, 33 yeasts, and 21 adjuncts by name or property |
| `diagnose_off_flavour` | Identify off-flavours from taste/aroma descriptions with causes and prevention |
| `match_water_profile` | Find brewing water profiles by city or beer style (20 profiles) |
| `suggest_recipe` | Generate a recipe for any target style with grain bill, hops, yeast, and process |
| `pairing_guide` | Beer and food pairing suggestions with complement/contrast/cleanse principles |

All data is embedded — no external API calls, no network dependencies, no API keys.

## Phase 2 — Brewing Calculators

AI assistants currently approximate brewing maths. These tools give them precise answers mid-conversation.

- **IBU calculator** — Tinseth formula with boil time, gravity, and hop alpha acid inputs
- **ABV calculator** — From original and final gravity readings
- **SRM/colour calculator** — Estimate beer colour from the grain bill
- **Mash water calculator** — Strike water volume and temperature for target mash temp
- **Carbonation calculator** — Volumes CO2 to priming sugar weight (glucose, sucrose, DME)
- **Strike water temperature** — Adjust for grain temperature and equipment thermal mass

## Phase 3 — Recipe Intelligence

Move from "here's data" to "here's advice."

- **Recipe critique** — Analyse a recipe for balance, style conformance, and potential issues
- **Style comparison** — Side-by-side comparison of two styles (vitals, ingredients, character)
- **Ingredient substitution** — "I don't have Centennial, what can I use?" with flavour-match scoring
- **Hop schedule optimiser** — Balance IBU contributions across additions for a target bitterness-to-flavour ratio

## Phase 4 — Integrations

Connect to the brewer's existing workflow.

- **BeerXML import** — Parse BeerXML recipes and analyse them with existing tools
- **BeerJSON import/export** — Read and write BeerJSON format
- **Brewfather API bridge** — Pull recipes and batch data from Brewfather
- **Recipe export** — Export suggested recipes to BeerXML/BeerJSON

## Phase 5 — Brewing Journal

Turn the MCP server into a brewing companion that remembers your history.

- **Brew session logging** — Record brew day parameters, notes, and outcomes
- **Batch tracking** — Track fermentation progress, gravity readings, and tasting notes
- **Historical comparison** — Compare batches of the same recipe over time

## Vision

Longer-term ideas. No timelines, no commitments — just directions that seem interesting.

- **BJCP study companion** — Quiz mode, exam prep, style identification practice
- **Seasonal brewing calendar** — Style suggestions by season and local climate
- **Equipment upgrade advisor** — Recommendations based on what you brew and your current kit
- **Fermentation monitoring** — Integration with Tilt, iSpindel, and similar devices
- **Multi-language support** — Localised style descriptions and ingredient names
- **Community recipes** — Curated recipe collection from the brewing community
- **Brew day assistant** — Step-by-step guidance with timers and checkpoints

## Contributing

Contributions are welcome at every phase. Data contributions are especially valuable:

- **Hop varieties** — The database has 113; there are hundreds more regional and experimental varieties
- **Yeast strains** — More producers (Lallemand, Mangrove Jack's, Imperial, Omega) and more strains
- **Regional water profiles** — Only 20 cities covered; every brewing region has a distinctive profile
- **Food pairings** — More styles, more cuisines, more specific dish recommendations
- **Off-flavour entries** — Additional compounds and edge cases

See the [README](README.md) for development setup instructions.
