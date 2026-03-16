# MCP QA Report: brewers-almanack
**Date:** 2026-03-16
**Mode:** full
**Server version:** 0.1.0
**Health score:** 93/100 — Ship it

## Discovery
- **Tools:** 6 registered
- **Resources:** 0 registered
- **Prompts:** 0 registered

## Tool Execution Results
| Tool | Status | Response Size | Notes |
|------|--------|---------------|-------|
| search_styles | PASS | 3,094 bytes | Returns well-formatted BJCP style data for "IPA" |
| search_ingredients | PASS | 1,619 bytes | Returns hop data for "pale ale" query |
| diagnose_off_flavour | PASS | 1,813 bytes | Correctly identifies diacetyl from "butter" description |
| match_water_profile | PASS | 1,059 bytes | Returns Burton-on-Trent mineral profile for "IPA" |
| suggest_recipe | PASS | 792 bytes | Generates complete English IPA recipe |
| pairing_guide | PASS | 508 bytes | Returns food pairings for IPA |

All 6 tools called successfully. No errors, no timeouts, all responses well-sized.

## Best Practices Lint
| Check | Status | Severity |
|-------|--------|----------|
| No console.log in server code | PASS | CRITICAL |
| Shebang on entry point | PASS | HIGH |
| chmod in build script | PASS | MEDIUM |
| All imports have .js extensions | PASS | HIGH |
| No 0.0.0.0 binding | PASS (stdio only) | CRITICAL |
| No secrets in parameters | PASS | CRITICAL |
| No secrets in hardcoded strings | PASS | HIGH |
| Error cases use isError: true | PASS (suggest-recipe.ts:119) | HIGH |
| Graceful shutdown handlers | FAIL | LOW |
| Server name/version match package.json | FAIL (hardcoded) | LOW |

## Findings

### FINDING-001: No graceful shutdown handlers
**Severity:** low
**Category:** practices
**Details:** No SIGINT/SIGTERM handlers found in src/index.ts. The server will terminate abruptly on signal. Add `process.on("SIGINT", async () => { await server.close(); process.exit(0); })` for clean shutdown.

### FINDING-002: Server version hardcoded
**Severity:** low
**Category:** practices
**Details:** `src/server.ts:7` hardcodes `version: "0.1.0"` instead of reading from package.json. This means the MCP discovery response will report stale version info after version bumps. Read version from package.json dynamically or keep it in sync.

### FINDING-003: Version mismatch — status.json vs package.json
**Severity:** medium
**Category:** value
**Details:** `status.json` says version `1.0.0` but `package.json` says `0.1.0`. These should match. Either status.json is stale or the package was published at a different version than what's in the repo.

## Score Breakdown
| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Connectivity | 100 | 20% | 20.0 |
| Tool Quality | 100 | 25% | 25.0 |
| Tool Execution | 100 | 25% | 25.0 |
| Best Practices | 94 | 15% | 14.1 |
| Security | 100 | 10% | 10.0 |
| Value Delivery | 92 | 5% | 4.6 |
| **Total** | | | **93/100** |

### Best Practices: 100 - 3 (LOW: shutdown) - 3 (LOW: hardcoded version) = 94. Value: 100 - 8 (MEDIUM: version mismatch) = 92. Startup banner confirmed as console.error (not stdout) — no issue.
