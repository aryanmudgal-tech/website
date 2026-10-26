// Generates the paper assets listed in src/data/paper.ts (spec 6.2). It writes only listed files.
//   node scripts/paper.mjs              every job but the crumple's; aryan jobs need Pictures/ (Aryan's machine)
//   node scripts/paper.mjs --code-only  code-drawn files only
//   node scripts/paper.mjs --check      regenerate code-drawn files in memory and fail on any difference
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { paperAssets } from "../src/data/paper.ts";
import { aryanJobs, codeJobs } from "./paper/jobs.mjs";
import { readTokens } from "./paper/tokens.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(root, "src", "assets", "paper");
const codeOnly = process.argv.includes("--code-only");
const check = process.argv.includes("--check");
const tokens = readTokens(readFileSync(join(root, "src", "styles", "global.css"), "utf8"));
const target = (asset) => (asset.file.startsWith("public/") ? join(root, asset.file) : join(DIR, asset.file));
mkdirSync(DIR, { recursive: true });

let stale = 0;
for (const asset of paperAssets) {
  if (asset.kind === "rendered") continue; // the crumple strips come from npm run crumple
  if (asset.source === "code") {
    const job = codeJobs[asset.file];
    if (!job) throw new Error(`no recipe for ${asset.file}`);
    const text = job(asset, tokens);
    if (check) {
      if (!existsSync(target(asset)) || readFileSync(target(asset), "utf8") !== text) { console.log(`stale ${asset.file}`); stale++; }
    } else {
      writeFileSync(target(asset), text);
      console.log(`wrote ${asset.file} (${Buffer.byteLength(text)} B)`);
    }
  } else if (!codeOnly && !check) {
    const job = aryanJobs[asset.file];
    if (!job) throw new Error(`no recipe for ${asset.file}`);
    if (!existsSync(join(root, asset.from.path))) throw new Error(`${asset.from.path} is missing; aryan jobs run on Aryan's machine`);
    const buffer = await job(asset, root);
    writeFileSync(target(asset), buffer);
    console.log(`wrote ${asset.file} (${buffer.length} B)`);
  }
}
if (check && stale) { console.error(`${stale} stale file(s); run npm run paper`); process.exit(1); }
