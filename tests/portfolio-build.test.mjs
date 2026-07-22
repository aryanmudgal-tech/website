import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";
import * as portfolio from "../src/data/portfolio.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const client = (relativePath) => `dist/client/${relativePath}`;
const externalUrls = [
  "https://www.linkedin.com/in/aryan-mudgal",
  "https://github.com/aryanmudgal-tech",
  "https://devpost.com/software/dots-y5r21j",
  "https://devpost.com/software/armie",
  "https://drive.google.com/file/d/12grQ7uR837u36IkN1WaILOC0SHycm2rh/view?usp=sharing",
  "https://devpost.com/software/c-o-r-e",
];
const sceneOrder = ["hero", "work", "projects", "research", "leadership", "about"];
const trajectoryOrder = [
  "delegate",
  "senator",
  "hcl",
  "meta-layer",
  "core",
  "fmh",
  "armie",
  "streamfair",
  "dots",
  "innovative-student-leadership",
  "suny-chancellors-award",
  "linde",
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function anchorFor(html, url) {
  return html.match(new RegExp(`<a\\b(?=[^>]*\\bhref="${escapeRegExp(url)}")[^>]*>[\\s\\S]*?<\\/a>`))?.[0] ?? "";
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"');
}

function readableText(html) {
  return decodeHtml(html)
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectContentLeaves(value, counts = new Map(), key = "") {
  if (value === null || value === undefined || typeof value === "boolean") return counts;
  if ([
    "column",
    "featured",
    "href",
    "id",
    "image",
    "imageAlt",
    "imageHeight",
    "imageWidth",
    "lead",
    "scale",
  ].includes(key)) return counts;
  if (Array.isArray(value)) {
    for (const item of value) collectContentLeaves(item, counts, key);
    return counts;
  }
  if (typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(value)) {
      collectContentLeaves(childValue, counts, childKey);
    }
    return counts;
  }
  const leaf = String(value);
  counts.set(leaf, (counts.get(leaf) ?? 0) + 1);
  return counts;
}

test("built homepage exposes semantic recruiter content", () => {
  const html = read(client("index.html"));
  const canvases = html.match(/<canvas\b[^>]*>/g) ?? [];
  const scenes = [...html.matchAll(/\bdata-brain-scene="([^"]+)"/g)].map((match) => match[1]);
  const description = "Aryan Mudgal builds applied AI systems across industrial operations, human-AI interaction, and healthcare.";
  const themeColors = [...html.matchAll(/<meta name="theme-color" content="([^"]+)"[^>]*>/g)].map((match) => match[1]);
  const schemaText = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? "";

  assert.match(html, /<title>Aryan Mudgal \| Engineer and researcher<\/title>/);
  assert.ok(html.includes(`<meta name="description" content="${description}">`));
  assert.match(html, /<meta property="og:type" content="website"/);
  assert.match(html, /<meta property="og:title" content="Aryan Mudgal \| Engineer and researcher"/);
  assert.ok(html.includes(`<meta property="og:description" content="${description}">`));
  assert.match(html, /<meta name="twitter:card" content="summary"/);
  assert.match(html, /<meta name="twitter:title" content="Aryan Mudgal \| Engineer and researcher"/);
  assert.ok(html.includes(`<meta name="twitter:description" content="${description}">`));
  assert.ok(themeColors.length >= 1);
  assert.deepEqual([...new Set(themeColors)], ["#000000"]);
  assert.doesNotMatch(html, /http:\/\/localhost/);
  assert.match(html, /<link rel="icon" href="(?:\/website)?\/favicon\.svg" type="image\/svg\+xml"/);
  assert.notEqual(schemaText, "", "built page must expose Person JSON-LD");
  assert.deepEqual(JSON.parse(schemaText), {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Aryan Mudgal",
    email: "mailto:aryanmudgal4493@gmail.com",
    jobTitle: "Software engineer and researcher",
    sameAs: [
      "https://www.linkedin.com/in/aryan-mudgal",
      "https://github.com/aryanmudgal-tech",
    ],
    knowsAbout: [
      "Applied artificial intelligence",
      "Machine learning",
      "Human-AI interaction",
      "Medical AI",
    ],
  });
  assert.match(html, /class="skip-link" href="#main-content"/);
  assert.match(html, /<header[^>]*>/);
  assert.match(html, /<nav[^>]*aria-label="Primary"/);
  assert.match(html, /<main id="main-content"/);
  assert.match(html, /<footer[^>]*id="contact"/);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
  assert.equal(canvases.length, 1);
  assert.match(html, /<div\b(?=[^>]*class="particle-brain")(?=[^>]*aria-hidden="true")[^>]*>\s*<canvas\b/);
  assert.deepEqual(scenes, sceneOrder, "built page must expose exactly six ordered brain scenes");

  for (const id of ["work", "projects", "trajectory", "research", "leadership", "recognition", "about", "contact"]) {
    assert.ok(html.includes(`id="${id}"`), `built page is missing #${id}`);
  }
});

test("built homepage keeps proof visible and links actionable", () => {
  const html = read(client("index.html"));

  for (const fact of [
    "Linde",
    "Meta Layer Initiative",
    "HCLTech",
    "MIDL-accepted",
    "four hackathon recognitions",
    "Dots",
    "ARMIE",
    "StreamFair",
    "W.O.D.",
    "$500K+",
    "30,000+",
    "100,000+",
    "1,500+",
    "Award for Innovative Student Leadership",
    "SUNY Chancellor's Award for Student Excellence",
    "Phi Beta Kappa",
    "Gym",
    "Golf",
    "Badminton",
    "Acting and mimicry",
  ]) {
    assert.ok(html.includes(fact), `built page is missing ${fact}`);
  }

  for (const stale of ["C.O.R.E. / W.O.D.", "University and SUNY honors", "PPG signal accuracy", "Building Litos"]) {
    assert.equal(html.includes(stale), false, `built page still contains stale content: ${stale}`);
  }

  for (const url of [
    "mailto:aryanmudgal4493@gmail.com",
    ...externalUrls,
  ]) {
    assert.ok(html.includes(`href="${url}"`), `built page is missing exact public URL: ${url}`);
  }

  assert.doesNotMatch(html, /href=(?:""|'')/);
  assert.doesNotMatch(html, /href=(?:"#"|'#')/);
  assert.doesNotMatch(html, /<audio\b/i);

  const assetBase = html.match(/<link rel="icon" href="([^"?]*\/)favicon\.svg"/)?.[1] ?? "";
  const sourcedScripts = [...html.matchAll(/<script\b(?=[^>]*\bsrc=(["'])(.*?)\1)[^>]*>/gi)];
  assert.notEqual(assetBase, "", "built page must expose a base-path-safe favicon URL");
  assert.ok(sourcedScripts.length >= 1, "Astro must emit the bundled ParticleBrain module");
  for (const [tag, , src] of sourcedScripts) {
    assert.doesNotMatch(src, /^(?:https?:)?\/\//i, `script source must remain same-origin: ${src}`);
    assert.match(tag, /\btype=(["'])module\1/i, `compiled script must be a module: ${tag}`);
    assert.match(
      src,
      new RegExp(`^${escapeRegExp(assetBase)}_astro\/[A-Za-z0-9._-]+\\.js(?:[?#].*)?$`),
      `script source must stay inside the current base path's compiled Astro assets: ${src}`,
    );
  }

  const externalLinks = html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? [];
  assert.ok(externalLinks.length >= 5);
  for (const link of externalLinks) {
    assert.match(link, /rel="noopener noreferrer"/);
  }
  assert.ok((html.match(/opens in a new tab/g) ?? []).length >= externalLinks.length);

  for (const url of externalUrls) {
    const anchor = anchorFor(html, url);
    const openingTag = anchor.match(/^<a\b[^>]*>/)?.[0] ?? "";
    assert.notEqual(anchor, "", `missing exact external anchor: ${url}`);
    assert.match(openingTag, /\btarget="_blank"/);
    assert.match(openingTag, /\brel="noopener noreferrer"/);
    assert.match(anchor, /<span class="sr-only"> opens in a new tab<\/span>/);
  }
});

test("built homepage renders every canonical typed content leaf", () => {
  const text = readableText(read(client("index.html")));
  const {
    navItems: _navItems,
    trajectoryColumns: _trajectoryColumns,
    trajectoryLanes: _trajectoryLanes,
    links: _links,
    ...facts
  } = portfolio;
  const leaves = collectContentLeaves(facts);

  for (const [leaf, expectedCount] of leaves) {
    const actualCount = text.split(leaf).length - 1;
    assert.ok(
      actualCount >= expectedCount,
      `built page renders ${actualCount}/${expectedCount} occurrences of typed content leaf: ${leaf}`,
    );
  }
});

test("built images reserve space and contain meaningful alternatives", () => {
  const html = read(client("index.html"));
  const images = html.match(/<img\b[^>]*>/g) ?? [];

  assert.ok(images.length >= 7);
  for (const image of images) {
    assert.match(image, /\bwidth="\d+"/);
    assert.match(image, /\bheight="\d+"/);
    assert.match(image, /\balt="[^"]{12,}"/);
  }
  for (const asset of [
    "award-leader.jpg",
    "hack-dots.jpg",
    "hack-armie.jpg",
    "hack-streamfair.jpg",
    "hack-core.jpg",
    "award-chancellor.jpg",
    "award-pbk.jpg",
  ]) {
    assert.match(html, new RegExp(`src="(?:/website)?/assets/${asset.replace(".", "\\.")}"`));
  }
  assert.match(html, /src="(?:\/website)?\/assets\/award-leader\.jpg"[^>]*loading="lazy"/);
  assert.doesNotMatch(html, /src="(?:\/website)?\/assets\/award-leader\.jpg"[^>]*fetchpriority=/);
});

test("built trajectory keeps every chronological label in server-rendered HTML", () => {
  const html = decodeHtml(read(client("index.html")));
  const trajectorySection = html.match(/<section\b[^>]*id="trajectory"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? "";
  const chronology = trajectorySection.match(/<ol\b[^>]*>([\s\S]*?)<\/ol>/)?.[1] ?? "";

  assert.notEqual(trajectorySection, "", "built page must contain the #trajectory section");
  assert.notEqual(chronology, "", "#trajectory must contain the chronological list");
  const trajectoryNodes = [...chronology.matchAll(/<li\b[^>]*\bid="trajectory-([^"]+)"[^>]*>/g)]
    .map((match) => match[1]);
  assert.deepEqual(
    trajectoryNodes,
    trajectoryOrder,
    "built trajectory must expose exactly twelve ordered chronology nodes",
  );

  for (const label of [
    "SUNY Delegate",
    "Student Senator",
    "HCLTech",
    "Meta Layer Initiative",
    "W.O.D.",
    "Fetal-maternal hemorrhage detection",
    "ARMIE",
    "StreamFair",
    "Dots",
    "Award for Innovative Student Leadership",
    "SUNY Chancellor's Award for Student Excellence",
    "Linde",
  ]) {
    assert.ok(chronology.includes(label), `built trajectory list is missing ${label}`);
  }
  for (const period of ["2022-2025", "2023", "2024", "2025", "2026"]) {
    assert.ok(chronology.includes(period), `built trajectory list is missing ${period}`);
  }
});

test("built navigation contains current-section progressive enhancement", () => {
  const html = read(client("index.html"));

  assert.match(html, /IntersectionObserver/);
  assert.match(html, /aria-current/);
  assert.doesNotMatch(html, /addEventListener\(["']scroll["']/);
});

test("built 404 page offers a route home", () => {
  const html = read(client("404.html"));

  assert.match(html, /Page not found/);
  assert.match(html, /href="(?:\/website)?\/"/);
  assert.match(html, /Return home/);
});

test("Sites worker delegates requests to the static asset binding", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const requested = [];

  const response = await worker.fetch(new Request("https://portfolio.example/"), {
    ASSETS: {
      fetch: async (request) => {
        requested.push(request.url);
        return new Response("portfolio", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "portfolio");
  assert.deepEqual(requested, ["https://portfolio.example/"]);

  const wrangler = JSON.parse(read("dist/server/wrangler.json"));
  assert.equal(wrangler.main, "index.js");
  assert.equal(wrangler.assets.directory, "../client");
});

test("production package has no stale static files beside client and server", () => {
  assert.equal(existsSync(join(root, "dist", "index.html")), false);
  assert.equal(existsSync(join(root, "dist", "404.html")), false);
  assert.equal(existsSync(join(root, "dist", "assets")), false);
  assert.equal(existsSync(join(root, "dist", "_astro")), false);
});
