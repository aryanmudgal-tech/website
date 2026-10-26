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
const { rooms, extras } = await import(new URL("../src/data/rooms.ts", import.meta.url).href);
const { textOf, elements } = await import(new URL("./lib/html.mjs", import.meta.url).href);
const withId = (value) => (tag) => tag.includes(` id="${value}"`);

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
  assert.doesNotMatch(html, /<iframe\b/i, "players are injected on scroll, never shipped in the HTML");
  assert.ok((html.match(/data-video="/g) ?? []).length >= 5, "the four demos and the ceremony video are present");
  assert.doesNotMatch(html, /<video\b[^>]*\bautoplay\b/i);
  assert.match(html, /<video\b[^>]*\bmuted\b[^>]*\bplaysinline\b/i);
  assert.match(html, /video\/safeline-demo\.mp4/);
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
  assert.equal(images.length, 37, "13 prints, 12 popover photos, 8 popover extras, 4 YouTube posters");
  for (const image of images) {
    assert.match(image, /\bwidth="\d+"/);
    assert.match(image, /\bheight="\d+"/);
    assert.match(image, /\balt(?:="|[\s/>])/, `image without alt: ${image.slice(0, 120)}`);
  }
  assert.equal((html.match(/fetchpriority="high"/g) ?? []).length, 1, "exactly one image is high priority");
  const eager = images.filter((image) => /loading="eager"/.test(image));
  assert.equal(eager.length, 1, "only the hero print loads eagerly");
  assert.ok(elements(html, (tag) => /class="[^"]*\bprint--hero\b/.test(tag))[0].includes('loading="eager"'));
  assert.equal(images.filter((image) => /loading="lazy"/.test(image)).length, images.length - 1);
  assert.equal((html.match(/<picture\b/g) ?? []).length, 33);
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

test("each room renders once beside its claim", () => {
  const html = read(client("index.html"));
  const owners = {
    pillar: (tag) => /class="[^"]*\bhero-art\b/.test(tag), hero: withId("project-dots"), dots: withId("project-dots"),
    armie: withId("project-armie"), streamfair: withId("project-streamfair"), wod: withId("project-wod"), safeline: withId("project-safeline"),
    research: withId("research"), cleancampus: withId("leadership-clean-campus"), chancellor: withId("recognition-chancellor"),
    pbk: withId("recognition-pbk"), contact: withId("contact"),
  };
  for (const room of rooms) {
    assert.equal((html.match(new RegExp(`data-room="${room.id}"`, "g")) ?? []).length, 1, `room ${room.id} renders once`);
    assert.ok(elements(html, owners[room.id]).some((element) => element.includes(`data-room="${room.id}"`)), `room ${room.id} sits inside its owner`);
    const popovers = elements(html, withId(`photo-${room.id}`));
    assert.equal(popovers.length, 1, `#photo-${room.id} renders once`);
    assert.match(popovers[0].slice(0, 300), /\spopover(?:=""|\s|>)/);
  }
  assert.equal(elements(html, (tag, name) => ["section", "article", "footer"].includes(name) && /data-room=/.test(tag)).length, 0, "data-room sits only on prints");
  assert.equal(elements(html, (tag) => /\spopover(?:=""|\s|>)/.test(tag) && /data-room=/.test(tag)).length, 0);
  for (const art of elements(html, (tag) => /class="[^"]*\bhero-art\b/.test(tag))) assert.doesNotMatch(art, /\spopover(?:=""|\s|>)/, "no popover inside the zoomed hero art");
  for (const extra of extras) assert.ok(textOf(elements(html, withId(`photo-${extra.room}`))[0]).includes(extra.caption), `${extra.id} caption is in its popover`);
  const pair = elements(html, (tag) => tag.includes('data-extra="pillar-pair"'));
  assert.equal(pair.length, 1);
  assert.ok(elements(html, withId("recognition-pillar"))[0].includes('data-extra="pillar-pair"'));
  assert.ok(textOf(pair[0]).includes("With Shaurya Jain, who received the Exemplary Student Leader Award the same evening."));
  assert.doesNotMatch(textOf(pair[0]), /Source:/);
  assert.ok((html.match(/popovertarget="/g) ?? []).length >= 13);
});

test("hidden subtrees hold nothing focusable or described", () => {
  const html = read(client("index.html"));
  for (const hidden of elements(html, (tag) => /aria-hidden="true"/.test(tag))) {
    assert.doesNotMatch(hidden, /<a\b|<button\b|tabindex=|<input\b|\spopover(?:=""|\s|>)/, `hidden subtree holds a control: ${hidden.slice(0, 120)}`);
    for (const image of hidden.match(/<img\b[^>]*>/g) ?? []) assert.match(image, /alt=""/);
  }
});

test("built HTML stays small and the deploy folder has no server leftovers", () => {
  const html = read(client("index.html"));
  const gzipped = gzipSync(Buffer.from(html)).length;
  assert.ok(gzipped <= 20 * 1024, `index.html is ${gzipped} bytes gzipped; budget is 20 KB`);
  const cssFiles = readdirSync(join(root, "dist", "client", "_astro")).filter((name) => name.endsWith(".css"));
  const cssGzip = gzipSync(Buffer.from(cssFiles.map((name) => read(client(`_astro/${name}`))).join("\n"))).length;
  assert.ok(cssGzip <= 18 * 1024, `built CSS is ${cssGzip} bytes gzipped; budget is 18 KB`);
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

test("no theme toggle ships", () => {
  assert.doesNotMatch(read(client("index.html")), /data-theme/);
});

test("both component scripts stay inline", () => {
  const html = read(client("index.html"));
  const inline = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  assert.ok(inline.some((body) => body.includes("site-menu")), "the nav script is inline");
  assert.ok(inline.some((body) => body.includes("youtube-nocookie.com")), "the video script is inline");
  const files = readdirSync(join(root, "dist", "client", "_astro"));
  assert.ok(!files.some((name) => /^(?:SiteNav|Video)\.astro.*\.js$/.test(name)), "no component script file");
});
