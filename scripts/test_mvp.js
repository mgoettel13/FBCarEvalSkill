import fs from "node:fs";
import { execFileSync } from "node:child_process";

const outputPath = "examples/mvp-results.json";

execFileSync("node", [
  "scripts/run_mvp.js",
  "--criteria",
  "examples/camry-hybrid-zip.json",
  "--listings",
  "examples/facebook-marketplace-sample.json",
  "--values",
  "examples/kbb-values-sample.json",
  "--out",
  outputPath,
], { stdio: "pipe" });

const output = JSON.parse(fs.readFileSync(outputPath, "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(output.totalInputListings === 5, "expected five input listings");
assert(output.totalMatchedListings === 3, "expected three matched Camry Hybrid listings");
assert(output.results[0].listing.id === "fb-1001", "expected fb-1001 as top result");
assert(output.results[0].label === "great_deal", "expected top result to be a great deal");
assert(output.results[0].spread === 2900, "expected top result spread to be 2900");
assert(output.results.some((item) => item.listing.id === "fb-1002" && item.label === "needs_review"), "expected rebuilt title listing to need review");

process.stdout.write("MVP fixture test passed\n");

