import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "SKILL.md",
  "agents/openai.yaml",
  "package.json",
  "scripts/run_mvp.js",
  "scripts/search_apify.js",
  "references/data-contracts.md",
  "references/scoring.md",
  "references/apify-actors.md",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing ${file}`);
}

const skill = fs.readFileSync(path.join(root, "SKILL.md"), "utf8");
assert(skill.startsWith("---\n"), "SKILL.md must start with YAML frontmatter");
assert(/name:\s*car-deal-finder/.test(skill), "SKILL.md frontmatter needs name: car-deal-finder");
assert(/description:\s*\S/.test(skill), "SKILL.md frontmatter needs a non-empty description");

const metadata = fs.readFileSync(path.join(root, "agents/openai.yaml"), "utf8");
assert(metadata.includes("display_name: \"Car Deal Finder\""), "openai.yaml needs display_name");
assert(metadata.includes("Use $car-deal-finder"), "default_prompt must mention $car-deal-finder");

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
assert(packageJson.type === "module", "package.json must set type module");
assert(packageJson.scripts?.test, "package.json must define test script");

process.stdout.write("Skill structure validation passed\n");

