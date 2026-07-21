import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const client = (relativePath) => `dist/client/${relativePath}`;

test("built homepage exposes semantic recruiter content", () => {
  const html = read(client("index.html"));

  assert.match(html, /<title>Aryan Mudgal \| Engineer and researcher<\/title>/);
  assert.match(html, /<meta name="description"/);
  assert.match(html, /<meta property="og:title"/);
  assert.match(html, /<meta name="twitter:card" content="summary"/);
  assert.doesNotMatch(html, /http:\/\/localhost/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /class="skip-link" href="#main-content"/);
  assert.match(html, /<header[^>]*>/);
  assert.match(html, /<nav[^>]*aria-label="Primary"/);
  assert.match(html, /<main id="main-content"/);
  assert.match(html, /<footer[^>]*id="contact"/);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);

  for (const id of ["work", "projects", "trajectory", "research", "leadership", "recognition", "about", "contact"]) {
    assert.ok(html.includes(`id="${id}"`), `built page is missing #${id}`);
  }
});

test("built homepage keeps proof visible and links actionable", () => {
  const html = read(client("index.html"));

  for (const fact of [
    "Linde",
    "MIDL-accepted",
    "Dots",
    "ARMIE",
    "StreamFair",
    "W.O.D.",
    "$500K+",
    "30,000+",
    "Award for Innovative Student Leadership",
    "SUNY Chancellor's Award for Student Excellence",
  ]) {
    assert.ok(html.includes(fact), `built page is missing ${fact}`);
  }

  for (const stale of ["C.O.R.E. / W.O.D.", "University and SUNY honors", "PPG signal accuracy", "Building Litos"]) {
    assert.equal(html.includes(stale), false, `built page still contains stale content: ${stale}`);
  }

  assert.doesNotMatch(html, /href=(?:""|'')/);
  assert.doesNotMatch(html, /href=(?:"#"|'#')/);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<(?:canvas|audio)\b/i);

  const externalLinks = html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? [];
  assert.ok(externalLinks.length >= 5);
  for (const link of externalLinks) {
    assert.match(link, /rel="noopener noreferrer"/);
  }
  assert.ok((html.match(/opens in a new tab/g) ?? []).length >= externalLinks.length);
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
  assert.match(html, /src="(?:\/website)?\/assets\/award-leader\.jpg"[^>]*fetchpriority="high"/);
});

test("built trajectory has one initial selection and complete fallback labels", () => {
  const html = read(client("index.html"));
  const tabs = html.match(/<button\b[^>]*role="tab"[^>]*>/g) ?? [];
  const axis = html.match(/<div class="trajectory-axis"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? "";
  const columns = [...axis.matchAll(/<span>(.*?)<\/span>/g)].map((match) => match[1]);

  assert.equal(tabs.length, 12);
  assert.equal(tabs.filter((tab) => tab.includes('aria-selected="true"')).length, 1);
  assert.ok((html.match(/class="trajectory-event__outcome"/g) ?? []).length >= tabs.length);
  assert.deepEqual(columns, ["", "2023", "2024", "2025", "2026"]);
  for (const period of ["2022-2025", "2023", "2024", "2025", "2026"]) {
    assert.ok(html.includes(period), `built trajectory is missing ${period}`);
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
