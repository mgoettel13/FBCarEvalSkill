import fs from "node:fs";
import path from "node:path";

const RISK_PATTERNS = [
  "salvage",
  "rebuilt",
  "flood",
  "lemon",
  "parts",
  "no title",
  "mechanics special",
  "not running",
];

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeMake(value) {
  const normalized = normalizeText(value);
  if (normalized === "chevy") return "chevrolet";
  if (normalized === "vw") return "volkswagen";
  if (normalized === "mercedes") return "mercedes-benz";
  return normalized;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(String(value).replace(/[$,\s]/g, ""));
  return Number.isFinite(number) ? number : null;
}

function titleHasKeywords(listing, keywords) {
  const haystack = normalizeText(`${listing.title || ""} ${listing.trim || ""}`);
  return keywords.every((keyword) => haystack.includes(normalizeText(keyword)));
}

function listingMatchesCriteria(listing, criteria) {
  const price = toNumber(listing.price);
  const mileage = toNumber(listing.mileage);
  const year = toNumber(listing.year);
  const distance = toNumber(listing.distanceMiles);

  if (criteria.make && normalizeMake(listing.make) !== normalizeMake(criteria.make)) return false;
  if (criteria.model && normalizeText(listing.model) !== normalizeText(criteria.model)) return false;
  if (criteria.requiredKeywords?.length && !titleHasKeywords(listing, criteria.requiredKeywords)) return false;
  if (criteria.minYear && year !== null && year < criteria.minYear) return false;
  if (criteria.maxPrice && price !== null && price > criteria.maxPrice) return false;
  if (criteria.maxMileage && mileage !== null && mileage > criteria.maxMileage) return false;
  if (criteria.radiusMiles && distance !== null && distance > criteria.radiusMiles) return false;

  return true;
}

function normalizeListing(listing) {
  return {
    id: String(listing.id || listing.url || listing.title || crypto.randomUUID()),
    source: listing.source || "unknown",
    title: String(listing.title || "").trim(),
    price: toNumber(listing.price),
    mileage: toNumber(listing.mileage),
    year: toNumber(listing.year),
    make: String(listing.make || "").trim(),
    model: String(listing.model || "").trim(),
    trim: String(listing.trim || "").trim(),
    zipCode: String(listing.zipCode || "").trim(),
    distanceMiles: toNumber(listing.distanceMiles),
    url: String(listing.url || "").trim(),
  };
}

function valuationKey(value, includeTrim = false) {
  const parts = [
    toNumber(value.year),
    normalizeMake(value.make),
    normalizeText(value.model),
  ];
  if (includeTrim) parts.push(normalizeText(value.trim));
  return parts.join("|");
}

function buildValuationIndex(values) {
  const exact = new Map();
  const broad = new Map();
  for (const value of values) {
    exact.set(valuationKey(value, true), value);
    if (!broad.has(valuationKey(value))) broad.set(valuationKey(value), value);
  }
  return { exact, broad };
}

function findValuation(listing, valuationIndex) {
  return valuationIndex.exact.get(valuationKey(listing, true))
    || valuationIndex.broad.get(valuationKey(listing))
    || null;
}

function findWarnings(listing) {
  const haystack = normalizeText(`${listing.title || ""} ${listing.description || ""}`);
  return RISK_PATTERNS.filter((pattern) => haystack.includes(pattern));
}

function scoreDeal(listing, valuation) {
  const warnings = findWarnings(listing);
  const price = toNumber(listing.price);
  const fairValue = toNumber(valuation?.fairMarketPriceAverage);

  if (!price || !fairValue) {
    return {
      label: "needs_review",
      score: 40,
      spread: null,
      spreadPercent: null,
      warnings: [...warnings, !price ? "missing price" : "missing valuation"],
    };
  }

  const spread = fairValue - price;
  const spreadPercent = (spread / fairValue) * 100;
  let score = Math.round(Math.max(1, Math.min(98, 60 + spreadPercent * 2)));
  let label = "fair_price";

  if (spreadPercent >= 12 || spread >= 1500) label = "great_deal";
  else if (spreadPercent >= 6 || spread >= 750) label = "good_deal";
  else if (spreadPercent < -6) label = "overpriced";

  if (warnings.length) {
    label = "needs_review";
    score = Math.min(score, 54);
  }

  return {
    label,
    score,
    spread: Math.round(spread),
    spreadPercent: Number(spreadPercent.toFixed(1)),
    warnings,
  };
}

function rankDeals(criteria, listings, values) {
  const valuationIndex = buildValuationIndex(values);
  const filtered = listings
    .map(normalizeListing)
    .filter((listing) => listingMatchesCriteria(listing, criteria));

  const ranked = filtered.map((listing) => {
    const valuation = findValuation(listing, valuationIndex);
    return {
      ...scoreDeal(listing, valuation),
      listing,
      valuation,
    };
  }).sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return (right.spread || -Infinity) - (left.spread || -Infinity);
  });

  return ranked.slice(0, criteria.maxResults || ranked.length);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  for (const required of ["criteria", "listings", "values"]) {
    if (!args[required]) {
      throw new Error(`Missing --${required}`);
    }
  }

  const criteria = readJson(args.criteria);
  const listings = readJson(args.listings);
  const values = readJson(args.values);
  const ranked = rankDeals(criteria, listings, values);
  const output = {
    generatedAt: new Date().toISOString(),
    criteria,
    totalInputListings: listings.length,
    totalMatchedListings: ranked.length,
    results: ranked,
  };

  if (args.out) writeJson(args.out, output);
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

