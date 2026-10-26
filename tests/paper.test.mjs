import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { paperAssets } from "../src/data/paper.ts";
import { codeJobs } from "../scripts/paper/jobs.mjs";
import { readTokens } from "../scripts/paper/tokens.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(root, "src", "assets", "paper");
const at = (asset) => (asset.file.startsWith("public/") ? join(root, asset.file) : join(DIR, asset.file));
const tokens = readTokens(readFileSync(join(root, "src", "styles", "global.css"), "utf8"));
const inFolder = paperAssets.filter((asset) => !asset.file.startsWith("public/"));

test("the manifest lists exactly the files in src/assets/paper and how each was made", () => {
  assert.deepEqual(readdirSync(DIR).sort(), inFolder.map((asset) => asset.file).sort());
  assert.ok(paperAssets.some((asset) => asset.file === "public/og.jpg"));
  for (const asset of paperAssets) {
    assert.ok(asset.generator, `${asset.file} names a generator`);
    if (asset.source === "code") assert.equal(typeof asset.seed, "number", `${asset.file} has a seed`);
    if (asset.source === "aryan") assert.ok(asset.from?.path.startsWith("Pictures/"), `${asset.file} comes from Pictures/`);
    if (asset.kind === "colour") assert.ok(Array.isArray(asset.tokens) && (asset.tokens.length > 0 || asset.file === "grain.svg"), `${asset.file} lists its tokens`);
  }
});

test("every code-drawn file regenerates byte for byte", () => {
  for (const asset of paperAssets.filter((a) => a.source === "code" && a.kind !== "rendered")) {
    const job = codeJobs[asset.file];
    assert.ok(job, `no recipe for ${asset.file}`);
    assert.equal(readFileSync(at(asset), "utf8"), job(asset, tokens), `${asset.file} is stale or hand-edited; run npm run paper`);
  }
});

test("paper stays inside its budgets", () => {
  let all = 0, masks = 0, lines = 0;
  for (const asset of paperAssets) {
    const size = statSync(at(asset)).size;
    assert.ok(size <= asset.budget, `${asset.file} is ${size} B; budget ${asset.budget}`);
    if (asset.budget <= 1000) assert.ok(size < 1024, `${asset.file} must inline`);
    if (asset.file.startsWith("public/")) continue;
    all += size;
    if (asset.kind === "mask") masks += size;
    if (asset.kind === "pencil" || asset.kind === "line") lines += size;
  }
  assert.ok(all <= 240 * 1024, `src/assets/paper is ${all} B`);
  assert.ok(masks <= 60 * 1024, `masks total ${masks} B`);
  assert.ok(lines <= 90 * 1024, `pencil and line files total ${lines} B`);
});

test("paper SVGs are inert decoration, and colour comes only from tokens", () => {
  for (const asset of inFolder.filter((a) => a.file.endsWith(".svg"))) {
    const svg = readFileSync(at(asset), "utf8");
    assert.doesNotMatch(svg, /<text|<a[\s>]|<script|<foreignObject|href="http|\son[a-z]+=/i, `${asset.file} holds active content`);
    assert.doesNotMatch(svg, /rgba\(/, `${asset.file} uses rgba`);
    const literals = [...svg.matchAll(/(?:fill|stroke|stop-color|color)="([^"]+)"/g)].map((m) => m[1]);
    const hexes = [...svg.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
    if (["mask", "pencil", "line"].includes(asset.kind)) {
      for (const value of literals) assert.ok(["#000", "black", "none"].includes(value), `${asset.file} colours ${value}`);
      for (const hex of hexes) assert.equal(hex, "#000", `${asset.file} colours ${hex}`);
    }
    if (asset.kind === "colour") {
      const allowed = (asset.tokens ?? []).map((name) => tokens[name].toUpperCase());
      for (const hex of hexes) {
        assert.match(hex, /^#[0-9a-fA-F]{6}$/, `${asset.file}: ${hex} is not 6-digit`);
        assert.ok(allowed.includes(hex.toUpperCase()), `${asset.file}: ${hex} is not one of ${asset.tokens}`);
      }
    }
  }
});
