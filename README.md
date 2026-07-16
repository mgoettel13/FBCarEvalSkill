# FBCarEvalSkill

Codex/OpenClaw skill for finding and ranking used-car listings by deal quality.

The MVP takes vehicle search criteria, marketplace listing data, and KBB-style valuation data, then returns a ranked shortlist with labels such as `great_deal`, `fair_price`, `overpriced`, and `needs_review`.

## What Is Included

- `SKILL.md`: Codex/OpenClaw skill instructions.
- `agents/openai.yaml`: UI metadata for skill-aware agents.
- `scripts/run_mvp.js`: Scores and ranks listings from JSON inputs.
- `scripts/search_apify.js`: Optional Apify marketplace search adapter.
- `scripts/test_mvp.js`: Fixture-based MVP test.
- `scripts/validate_skill.js`: Basic skill structure validation.
- `examples/`: Sample Toyota Camry Hybrid criteria, listings, values, and output.
- `references/`: Data contracts, scoring rules, and Apify notes.

## Requirements

- Node.js 20 or newer.
- npm, optional but convenient.
- Apify account and token only for live marketplace/search runs.

No package install is required for the fixture MVP. The scripts use Node built-ins.

## Clone

```powershell
git clone https://github.com/mgoettel13/FBCarEvalSkill.git
cd FBCarEvalSkill
```

If you are using the local working copy created by Codex:

```powershell
cd "C:\Users\maikg\OneDrive\Documents\Car Search AI\car-deal-finder"
```

## Validate The Skill

With npm:

```powershell
npm run validate
npm test
```

Without npm:

```powershell
node scripts\validate_skill.js
node scripts\test_mvp.js
```

Expected output:

```text
Skill structure validation passed
MVP fixture test passed
```

## Run The Fixture MVP

```powershell
node scripts\run_mvp.js `
  --criteria examples\camry-hybrid-zip.json `
  --listings examples\facebook-marketplace-sample.json `
  --values examples\kbb-values-sample.json `
  --out examples\mvp-results.json
```

The sample search ranks matching Toyota Camry Hybrid listings and flags risk terms such as rebuilt title language for human review.

## Environment Variables For Live Runs

Set secrets in the shell or user environment. Do not commit tokens or `.env` files.

Temporary PowerShell session:

```powershell
$env:APIFY_TOKEN="your_apify_token"
$env:APIFY_MARKETPLACE_ACTOR_ID="actorOwner~actorName"
$env:APIFY_KBB_ACTOR_ID="parseforge~kelley-blue-book-scraper"
```

Persistent Windows user variables:

```powershell
[Environment]::SetEnvironmentVariable("APIFY_TOKEN", "your_apify_token", "User")
[Environment]::SetEnvironmentVariable("APIFY_MARKETPLACE_ACTOR_ID", "actorOwner~actorName", "User")
[Environment]::SetEnvironmentVariable("APIFY_KBB_ACTOR_ID", "parseforge~kelley-blue-book-scraper", "User")
```

Open a new terminal after setting persistent variables.

## Live Apify Listing Pull

After configuring `APIFY_TOKEN` and `APIFY_MARKETPLACE_ACTOR_ID`:

```powershell
New-Item -ItemType Directory -Force tmp | Out-Null

node scripts\search_apify.js `
  --criteria examples\camry-hybrid-zip.json `
  --out tmp\listings.json
```

Then score the pulled listings with a valuation file:

```powershell
node scripts\run_mvp.js `
  --criteria examples\camry-hybrid-zip.json `
  --listings tmp\listings.json `
  --values examples\kbb-values-sample.json `
  --out tmp\ranked-results.json
```

Actor inputs vary by Apify actor. If needed, customize the `actorInput` object inside the criteria JSON.

## Use With OpenClaw

If OpenClaw supports Codex-style skills, point it at this repository or install the folder as a skill, then ask:

```text
Use $car-deal-finder to find Toyota Camry Hybrid deals near 90210 and rank them by value.
```

If OpenClaw does not automatically load `SKILL.md`, give it this instruction:

```text
Read SKILL.md, then use the scripts in this repo to run the fixture MVP or a live Apify search. Use environment variables for API keys and do not write secrets to files.
```

## Data Contracts

See `references/data-contracts.md` for expected JSON shapes:

- Criteria
- Listing
- Valuation
- Ranked result

## Scoring

See `references/scoring.md`.

Short version:

- `great_deal`: meaningfully below estimated fair market value.
- `good_deal`: moderately below estimated fair market value.
- `fair_price`: close to estimated fair market value.
- `overpriced`: above estimated fair market value.
- `needs_review`: missing data or title-risk language such as salvage, rebuilt, flood, no title, or not running.

The score is a shortlist aid, not a purchase recommendation. Keep a human review step before contacting sellers or buying a vehicle.

## Git Hygiene

Ignored local files:

- `tmp/`
- `node_modules/`
- `.env`
- `.env.*`

Commit source, examples, and references. Do not commit API keys, downloaded raw scrape dumps, or personal search results unless they are intentionally sanitized.
