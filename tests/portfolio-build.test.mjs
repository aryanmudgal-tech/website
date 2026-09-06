import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const client = (relativePath) => `dist/client/${relativePath}`;
const portfolio = await import(new URL("../src/data/portfolio.ts", import.meta.url).href);
const { rooms } = await import(new URL("../src/data/rooms.ts", import.meta.url).href);

test("built homepage exposes semantic recruiter content and social metadata", () => {
  const html = read(client("index.html"));
  assert.match(html, /<title>Aryan Mudgal[^<]*<\/title>/);
  assert.match(html, /<meta name="description"/);
  assert.match(html, /<meta property="og:image" content="https:\/\/aryanmudgal-tech\.github\.io\/[^"]*og\.jpg"/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
  assert.doesNotMatch(html, /http:\/\/localhost/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"alumniOf"/);
  assert.match(html, /class="skip-link" href="#main-content"/);
  assert.match(html, /<nav[^>]*aria-label="Primary"/);
  assert.match(html, /<main id="main-content"/);
  assert.match(html, /<footer[^>]*id="contact"/);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
  for (const id of ["work", "projects", "trajectory", "research", "leadership", "recognition", "about", "contact"]) {
    assert.ok(html.includes(`id="${id}"`), `built page is missing #${id}`);
  }
});

test("built first screen carries the fixation lines, the ledger, and both actions", () => {
  const html = read(client("index.html"));
  const { identity, ledger } = portfolio;
  assert.ok(html.includes(identity.fixationLine), "long fixation line missing");
  assert.ok(html.includes(identity.fixationLineShort), "short fixation line missing");
  for (const row of ledger) {
    assert.ok(html.includes(row.fraction), `ledger fraction ${row.fraction} missing`);
  }
  assert.match(html, /Email Aryan/);
  assert.match(html, /Resume \(PDF\)/);
  assert.match(html, /href="[^"]*resume\.pdf"/);
});

test("built links are actionable and external links are safe", () => {
  const html = read(client("index.html"));
  assert.doesNotMatch(html, /href=(?:""|'')/);
  assert.doesNotMatch(html, /href=(?:"#"|'#')/);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<(?:canvas|iframe)\b/i);
  const externalLinks = html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? [];
  assert.ok(externalLinks.length >= 12, `expected at least 12 external receipts, found ${externalLinks.length}`);
  for (const link of externalLinks) {
    assert.match(link, /rel="noopener noreferrer"/);
  }
  assert.ok((html.match(/opens in a new tab/g) ?? []).length >= externalLinks.length);
});

test("built images reserve space, describe themselves, and load in the right order", () => {
  const html = read(client("index.html"));
  const images = html.match(/<img\b[^>]*>/g) ?? [];
  assert.ok(images.length >= 22, `expected the rooms twice plus popovers, found ${images.length} images`);
  for (const image of images) {
    assert.match(image, /\bwidth="\d+"/);
    assert.match(image, /\bheight="\d+"/);
    assert.match(image, /\balt(?:="|[\s/>])/, `image without alt: ${image.slice(0, 120)}`);
  }
  assert.equal((html.match(/fetchpriority="high"/g) ?? []).length, 1, "exactly one image is high priority");
  const lazy = images.filter((image) => /loading="lazy"/.test(image)).length;
  assert.equal(lazy, images.length - 11, "every image outside the eleven frame rooms is lazy");
  assert.equal((html.match(/loading="eager"/g) ?? []).length, 11, "the eleven frame rooms load eagerly so they are painted before they fade in");
  assert.ok((html.match(/<picture\b/g) ?? []).length >= 22);
  assert.match(html, /type="image\/avif"/);
});

test("built page states each award once in full and never repeats retired figures", () => {
  const html = read(client("index.html"));
  for (const fraction of ["1 of 2", "1 of 15"]) {
    const count = (html.match(new RegExp(fraction.replace(/ /g, "\\s"), "g")) ?? []).length;
    assert.ok(count <= 2, `${fraction} appears ${count} times; hero pointer plus Recognition only`);
  }
  for (const retired of ["$500K", "300 teams", "XR Hacks", "1,500+", "100,000+", "New Delhi", "PPG", "MIDL-accepted", "Hackathon recognitions"]) {
    assert.equal(html.includes(retired), false, `built page still contains ${retired}`);
  }
});

test("built frame has eleven rooms, popovers, and no hidden focusable content", () => {
  const html = read(client("index.html"));
  const frame = html.match(/<div class="frame"[\s\S]*?<\/aside>/)?.[0] ?? "";
  assert.ok(frame.length > 0, "frame markup missing");
  assert.equal((frame.match(/data-room="/g) ?? []).length, 11);
  for (const room of rooms) {
    const count = (html.match(new RegExp(`data-room="${room.id}"`, "g")) ?? []).length;
    assert.ok(count >= 2, `room ${room.id} must appear in the frame and on its chapter (found ${count})`);
  }
  assert.ok((html.match(/\spopover(?:=""|\s|>)/g) ?? []).length >= 12, "one popover per room plus the phone menu");
  assert.ok((html.match(/popovertarget="/g) ?? []).length >= 12);
  assert.doesNotMatch(frame, /aria-hidden="true"/, "the frame must not hide its buttons from assistive technology");
  const cssFiles = readdirSync(join(root, "dist", "client", "_astro")).filter((name) => name.endsWith(".css"));
  const builtCss = cssFiles.map((name) => read(client(`_astro/${name}`))).join("\n");
  assert.match(builtCss, /timeline-scope/);
  assert.match(builtCss, /animation-timeline/);
});

test("built HTML stays small and the deploy folder has no server leftovers", () => {
  const html = read(client("index.html"));
  const gzipped = gzipSync(Buffer.from(html)).length;
  assert.ok(gzipped <= 20 * 1024, `index.html is ${gzipped} bytes gzipped; budget is 20 KB`);
  assert.equal(existsSync(join(root, "dist", "server")), false);
  assert.equal(existsSync(join(root, "dist", "client", "_headers")), false);
  assert.equal(existsSync(join(root, "dist", "client", "og.jpg")), true);
  assert.equal(existsSync(join(root, "dist", "client", "resume.pdf")), true);
});

test("built 404 page offers a route home", () => {
  const html = read(client("404.html"));
  assert.match(html, /Page not found/);
  assert.match(html, /href="(?:\/website)?\/"/);
  assert.match(html, /Return home/);
});
