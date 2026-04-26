# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.1.2

### Fixed
- `suggest_recipe`: corrected grain bill unit conversion — values are now produced in metric (kg) for metric batch sizes instead of mixing PPG (gravity points per pound per gallon) figures into metric outputs.
- Yeast data: fermentation temperature ranges now display in degrees Celsius rather than being mislabelled Fahrenheit values.
- `suggest_recipe`: malt-selection heuristic no longer pairs pale styles (e.g. American Pale Ale, Pilsner) with crystal/caramel malts that don't belong in the grain bill.

## 0.1.1

- Initial published release.
