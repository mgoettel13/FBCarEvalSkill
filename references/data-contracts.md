# Data Contracts

## Criteria

```json
{
  "query": "Toyota Camry Hybrid",
  "make": "Toyota",
  "model": "Camry",
  "requiredKeywords": ["hybrid"],
  "zipCode": "90210",
  "radiusMiles": 75,
  "minYear": 2018,
  "maxPrice": 25000,
  "maxMileage": 100000,
  "maxResults": 10
}
```

## Listing

```json
{
  "id": "fb-1",
  "source": "facebook_marketplace",
  "title": "2020 Toyota Camry Hybrid LE",
  "price": 18900,
  "mileage": 64000,
  "year": 2020,
  "make": "Toyota",
  "model": "Camry",
  "trim": "Hybrid LE",
  "zipCode": "90024",
  "distanceMiles": 9,
  "url": "https://www.facebook.com/marketplace/item/example"
}
```

## Valuation

```json
{
  "year": 2020,
  "make": "Toyota",
  "model": "Camry",
  "trim": "Hybrid LE",
  "fairMarketPriceAverage": 21800,
  "fairMarketPriceLow": 20300,
  "fairMarketPriceHigh": 23200
}
```

## Result

```json
{
  "label": "great_deal",
  "score": 86,
  "spread": 2900,
  "spreadPercent": 13.3,
  "warnings": [],
  "listing": {},
  "valuation": {}
}
```
