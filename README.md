<!-- mcp-name: io.github.gregario/brewers-almanack -->
<p align="center">
  <h1 align="center">Brewers Almanack</h1>
  <p align="center">A brewing knowledge MCP server — beer styles, ingredients, off-flavour diagnosis, water chemistry, and recipe guidance for AI assistants.</p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/brewers-almanack"><img src="https://img.shields.io/npm/v/brewers-almanack.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/brewers-almanack"><img src="https://img.shields.io/npm/dm/brewers-almanack.svg" alt="npm downloads"></a>
  <a href="https://github.com/gregario/brewers-almanack/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT Licence"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="Node.js 18+"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-purple.svg" alt="MCP Compatible"></a>
  <a href="https://glama.ai/mcp/servers/gregario/brewers-almanack"><img src="https://glama.ai/mcp/servers/gregario/brewers-almanack/badges/card.svg" alt="brewers-almanack MCP server"></a>
</p>

---

Ask your AI assistant about beer styles, diagnose off-flavours, build recipes, match water profiles, and pair food — all backed by real brewing data, not hallucinations.

**6 tools. Zero config. Works with every MCP-compatible IDE.**

[![Brewers almanack MCP server](https://glama.ai/mcp/servers/gregario/brewers-almanack/badges/card.svg)](https://glama.ai/mcp/servers/gregario/brewers-almanack)

## Install

```bash
npx -y brewers-almanack
```

No API keys, no network dependencies. All brewing data is embedded.

### Add to your IDE

<details open>
<summary><strong>Claude Code</strong></summary>

```bash
claude mcp add brewers-almanack -- npx -y brewers-almanack
```
</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%/Claude/claude_desktop_config.json` (Windows):
```json
{
  "mcpServers": {
    "brewers-almanack": {
      "command": "npx",
      "args": ["-y", "brewers-almanack"]
    }
  }
}
```
</details>

<details>
<summary><strong>Cursor</strong></summary>

Add to `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "brewers-almanack": {
      "command": "npx",
      "args": ["-y", "brewers-almanack"]
    }
  }
}
```
</details>

<details>
<summary><strong>VS Code (Copilot)</strong></summary>

Add to `.vscode/mcp.json`:
```json
{
  "servers": {
    "brewers-almanack": {
      "command": "npx",
      "args": ["-y", "brewers-almanack"]
    }
  }
}
```
</details>

<details>
<summary><strong>Windsurf</strong></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:
```json
{
  "mcpServers": {
    "brewers-almanack": {
      "command": "npx",
      "args": ["-y", "brewers-almanack"]
    }
  }
}
```
</details>

<details>
<summary><strong>Zed</strong></summary>

Add to `settings.json`:
```json
{
  "context_servers": {
    "brewers-almanack": {
      "command": {
        "path": "npx",
        "args": ["-y", "brewers-almanack"]
      }
    }
  }
}
```
</details>

## Tools

| Tool | Description |
|------|-------------|
| `search_styles` | Search 85 BJCP beer styles by name, category, or characteristics. Returns vital statistics, overall impression, ingredients, and commercial examples. |
| `search_ingredients` | Search hops, malts, yeasts, and adjuncts by name, type, or characteristic. Filter by category or search across all. |
| `diagnose_off_flavour` | Identify off-flavours from taste or aroma descriptions. Returns the likely compound, causes, prevention steps, and styles where it may be acceptable. |
| `match_water_profile` | Find brewing water profiles by city name or beer style. Returns mineral composition (Ca, Mg, Na, Cl, SO4, HCO3) and style recommendations. |
| `suggest_recipe` | Generate a recipe for a target beer style. Returns grain bill, hop schedule, yeast selection, water profile, and process parameters. |
| `pairing_guide` | Beer and food pairing suggestions. Search by beer style or dish name. Returns matches with complement, contrast, and cleanse principles. |

## Example Conversations

**"What hops work in a Belgian Dubbel?"**
> Searches ingredients for hops that complement Belgian styles — returns varieties like Styrian Goldings and Saaz with alpha acid ranges, aromas, and substitutes.

**"My beer tastes like butter — what went wrong?"**
> Diagnoses diacetyl: identifies the compound, explains causes (incomplete fermentation, premature racking), and gives prevention steps (diacetyl rest, healthy yeast pitch).

**"Suggest a recipe for a West Coast IPA"**
> Builds a complete recipe: pale malt base with crystal malt, Centennial/Cascade hop schedule with dry hop additions, American ale yeast, and a Burton-style water profile.

**"What food pairs well with a stout?"**
> Returns pairing suggestions — oysters, chocolate desserts, grilled meats — with principles explaining why each pairing works (complement, contrast, or cleanse).

## Data Sources

| Dataset | Records | Source | Licence / Basis |
|---------|---------|--------|-----------------|
| Beer styles | 85 | [BJCP 2021 Guidelines](https://www.bjcp.org/style/2021/beer/) via [beerjson/bjcp-json](https://github.com/beerjson/bjcp-json) | MIT; BJCP attribution |
| Hops | 113 | [kasperg3/HopDatabase](https://github.com/kasperg3/HopDatabase) | MIT |
| Malts | 38 | Compiled from published maltster spec sheets | Factual data |
| Yeasts | 33 | Compiled from published yeast lab spec sheets | Factual data |
| Adjuncts | 21 | Compiled from brewing literature | Factual data |
| Water profiles | 20 | Compiled from brewing literature | Factual data |
| Off-flavours | 25 | Compiled from brewing science literature | Factual data |
| Food pairings | 23 | Compiled from Cicerone curriculum and pairing guides | Factual data |

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features: brewing calculators, recipe intelligence, BeerXML/BeerJSON integration, and a brewing journal.

## Contributing

Contributions are welcome — especially data contributions. More hop varieties, yeast strains, regional water profiles, and food pairings make the server more useful for everyone.

```bash
git clone https://github.com/gregario/brewers-almanack.git
cd brewers-almanack
npm install
npm run build
npm test        # 73 tests
```

### Running locally

```bash
claude mcp add brewers-almanack-dev -- node /path/to/brewers-almanack/dist/index.js
```

See [ROADMAP.md](ROADMAP.md) for areas where contributions are most needed.

## Licence

[MIT](LICENSE)