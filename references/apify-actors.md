# Apify Actors

## Environment

Set secrets through environment variables:

- `APIFY_TOKEN`
- `APIFY_MARKETPLACE_ACTOR_ID`
- `APIFY_KBB_ACTOR_ID`

## Marketplace Search

`scripts/search_apify.js` expects a marketplace actor that accepts search criteria or actor-specific input derived from the criteria file. Because Apify actors vary, keep actor-specific request mapping in the criteria file under `actorInput` when needed.

If no actor id is configured, use fixture data and do not attempt a live scrape.

## Valuation

The default KBB-style actor id is `parseforge~kelley-blue-book-scraper`. Live valuation should be tested on a small number of listings first, with Apify charge caps where supported.

## Compliance

Marketplace scraping can be brittle and may be subject to source-platform restrictions. Preserve source URLs, avoid automated seller contact in this MVP, and keep a human review step before purchase decisions.
