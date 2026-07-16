# Scoring

## Labels

- `great_deal`: asking price is at least 12 percent or 1500 USD below estimated fair market value, with no major title warning.
- `good_deal`: asking price is at least 6 percent or 750 USD below estimated fair market value.
- `fair_price`: asking price is within roughly 6 percent of fair market value.
- `overpriced`: asking price is above fair market value by more than 6 percent.
- `needs_review`: missing valuation, missing price, missing mileage, branded-title language, or incomplete listing data.

## Risk Flags

Flag listings that contain any of these title/text fragments:

- salvage
- rebuilt
- flood
- lemon
- parts
- no title
- mechanics special
- not running

## Ranking

Rank by score descending. Major warning flags cap the score at 54. Missing valuation caps the score at 40. Prefer complete listings with price, mileage, year, source URL, and nearby location.
