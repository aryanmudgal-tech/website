import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { paperAssets } from "../src/data/paper.ts";
import { codeJobs } from "../scripts/paper/jobs.mjs";
import { readTokens } from "../scripts/paper/tokens.mjs";
import { crumpleCss } from "../scripts/crumple/css.mjs";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(root, "src", "assets", "paper");
const fromRoot = (asset) => /^(?:public|src)\//.test(asset.file);
const at = (asset) => (fromRoot(asset) ? join(root, asset.file) : join(DIR, asset.file));
const tokens = readTokens(readFileSync(join(root, "src", "styles", "global.css"), "utf8"));
const inFolder = paperAssets.filter((asset) => !fromRoot(asset));
const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

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
    if (fromRoot(asset) || asset.kind === "rendered") continue;
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

test("the crumple strips hold 25 frames each, and crumple.css comes from crumple.json", async () => {
  const data = JSON.parse(readFileSync(join(root, "src", "data", "crumple.json"), "utf8"));
  for (const [shape, file] of [["d", "crumple-d.avif"], ["m", "crumple-m.avif"]]) {
    const set = data[shape];
    assert.equal(set.crumple, 18);
    assert.equal(set.roll, 7);
    assert.equal(set.ts.length, 18);
    assert.equal(set.boxes.length, 25);
    const { width, height, hasAlpha } = await sharp(join(DIR, file)).metadata();
    assert.equal(width, 25 * set.frame[0], `${file} is ${width} wide`);
    assert.equal(height, set.frame[1]);
    assert.ok(hasAlpha, `${file} keeps its alpha`);
  }
  assert.equal(readFileSync(join(root, "src", "styles", "crumple.css"), "utf8"), crumpleCss(data), "src/styles/crumple.css is stale; run npm run crumple");
});

test("the social card is the hero's collage, with a photo where the face is", async () => {
  const file = join(root, "public", "og.jpg");
  const { width, height } = await sharp(file).metadata();
  assert.deepEqual([width, height], [1200, 630]);
  // spec 5.8: the face centre lands at about (612, 218); a patch there is photograph, not the ground
  const { data, info } = await sharp(file).extract({ left: 600, top: 206, width: 24, height: 24 }).raw().toBuffer({ resolveWithObject: true });
  const values = [...data];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const spread = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
  const ground = channels(tokens["--paper"]).reduce((a, b) => a + b, 0) / 3;
  assert.ok(Math.abs(mean - ground) > 40 || spread > 20, `the face patch looks like the ground (mean ${mean.toFixed(0)}, spread ${spread.toFixed(0)}, ${info.channels} channels)`);
});
