import fs from "node:fs";
import path from "node:path";

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

async function runActor(actorId, input, token, maxChargeUsd) {
  const query = new URLSearchParams({
    format: "json",
    timeout: "180",
  });
  if (maxChargeUsd) query.set("maxTotalChargeUsd", String(maxChargeUsd));

  const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?${query}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Apify actor failed: ${response.status} ${response.statusText}: ${body.slice(0, 500)}`);
  }

  return response.json();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.criteria) throw new Error("Missing --criteria");

  if (args.fixture) {
    const fixture = readJson(args.fixture);
    if (args.out) writeJson(args.out, fixture);
    process.stdout.write(`${JSON.stringify(fixture, null, 2)}\n`);
    return;
  }

  const token = process.env.APIFY_TOKEN;
  const actorId = process.env.APIFY_MARKETPLACE_ACTOR_ID;
  if (!token) throw new Error("APIFY_TOKEN is required for live Apify search");
  if (!actorId) throw new Error("APIFY_MARKETPLACE_ACTOR_ID is required for live Apify search");

  const criteria = readJson(args.criteria);
  const input = criteria.actorInput || criteria;
  const items = await runActor(actorId, input, token, criteria.maxChargeUsd);

  if (args.out) writeJson(args.out, items);
  process.stdout.write(`${JSON.stringify(items, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

