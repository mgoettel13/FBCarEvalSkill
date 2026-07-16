---
name: car-deal-finder
description: Find, normalize, value, and rank used-car listings by deal quality. Use when Codex or OpenClaw needs to search vehicle marketplaces such as Facebook Marketplace through Apify or fixture data, compare asking prices against KBB-style valuation data, score used-car opportunities, or produce a ranked shortlist from criteria such as make, model, hybrid, ZIP, radius, max price, year, and mileage.
---

# Car Deal Finder

Use this skill to turn car-search criteria into a ranked deal shortlist.

## Required Inputs

Ask for missing search criteria before live runs:

- Vehicle query: make, model, fuel/trim keywords such as `hybrid`
- Location: ZIP code and radius
- Budget: max price
- Optional filters: min year, max mileage, source, max results

For local tests or demos, use fixture files in `examples/`.

## Environment Variables

Live Apify runs use environment variables only. Never ask the user to paste secrets into files.

- `APIFY_TOKEN`: required for live Apify actor calls
- `APIFY_MARKETPLACE_ACTOR_ID`: actor id for marketplace listing search
- `APIFY_KBB_ACTOR_ID`: optional valuation actor id, defaults to `parseforge~kelley-blue-book-scraper`

## MVP Workflow

1. Create or select a criteria JSON file matching `references/data-contracts.md`.
2. Run `scripts/run_mvp.js` with fixture data for deterministic validation, or with live source scripts when configured.
3. Review the ranked output. Treat listings with title issues, missing valuation, suspicious title language, or incomplete mileage as human-review items.
4. Summarize the top deals with price, estimated value, spread, confidence, warnings, and source URL.

## Commands

Fixture-based MVP:

```bash
node scripts/run_mvp.js --criteria examples/camry-hybrid-zip.json --listings examples/facebook-marketplace-sample.json --values examples/kbb-values-sample.json --out examples/mvp-results.json
```

Live Apify listing pull, when an actor is configured:

```bash
node scripts/search_apify.js --criteria examples/camry-hybrid-zip.json --out tmp/listings.json
```

Then run the MVP scorer using `tmp/listings.json`.

## Scoring

Use `references/scoring.md` for thresholds and risk flags. The score is a shortlist aid, not a purchase recommendation. Always preserve source links and explain why each deal ranked where it did.

## References

- Read `references/data-contracts.md` when creating or debugging criteria, listing, valuation, or result JSON.
- Read `references/scoring.md` when changing scoring thresholds or explaining deal labels.
- Read `references/apify-actors.md` when configuring live Apify actors.
