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
  const { identity, ledger, titleBlock } = portfolio;
  const joined = (name) => elements(html, (tag) => tag.includes(`class="${name}"`)).map(textOf).join(" ");
  assert.equal(joined("tb__long"), identity.fixationLine);
  assert.equal(joined("tb__short"), identity.fixationLineShort);
  assert.deepEqual(elements(html, (tag, name) => name === "dt").map(textOf), ["Study", "Work", "Next"]);
  const next = titleBlock.find((row) => row.label === "Next");
  assert.deepEqual(elements(html, (tag) => /class="[^"]*\bhl--sky\b/.test(tag)).map(textOf), [next.long[0], next.short[0]]);
  for (const row of ledger) {
    assert.ok(html.includes(row.fraction), `ledger fraction ${row.fraction} missing`);
  }
  assert.equal(elements(html, (tag) => /class="fig fig--tape"/.test(tag)).map(textOf).join(), ledger.find((row) => row.bold).fraction);
  assert.match(html, /Email Aryan/);
  assert.match(html, /Resume \(PDF\)/);
  assert.match(html, /href="[^"]*resume\.pdf"/);
});

test("text tapes are never hidden or decorative", () => {
  const html = read(client("index.html"));
  const tapes = elements(html, (tag) => /class="[^"]*\bhl--(?:sky|marigold)\b/.test(tag));
  assert.ok(tapes.length >= 2);
  for (const tape of tapes) {
    const open = tape.slice(0, tape.indexOf(">") + 1);
    assert.doesNotMatch(open, /aria-hidden|class="[^"]*\btape\b/, `text tape is hidden: ${open}`);
  }
});

test("the hero states its facts before its art", () => {
  const html = read(client("index.html"));
  const hero = elements(html, (tag, name) => name === "section" && tag.includes('class="hero"'))[0];
  const art = hero.indexOf('class="hero-art"');
  assert.ok(art > 0);
  assert.ok(hero.indexOf('class="ledger"') < art, "the ledger comes before the art");
  assert.ok(hero.indexOf("Resume (PDF)") < art, "the actions come before the art");
  assert.ok(hero.indexOf('<figure class="print') > art && hero.indexOf('<figure class="print') < hero.indexOf('class="collage"'), "the print comes before the collage");
});

test("inline SVG stays small and silent, and the built CSS keeps Safari's prefixes", () => {
  const html = read(client("index.html"));
  const svgs = html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? [];
  assert.ok(svgs.join("").length <= 1024, `inline SVG is ${svgs.join("").length} bytes`);
  for (const svg of svgs) {
    assert.match(svg, /^<svg\b[^>]*aria-hidden="true"/);
    assert.match(svg, /^<svg\b[^>]*focusable="false"/);
    assert.doesNotMatch(svg, /<text\b/);
  }
  const builtCss = readdirSync(join(root, "dist", "client", "_astro")).filter((name) => name.endsWith(".css")).map((name) => read(client(`_astro/${name}`))).join("\n");
  assert.match(builtCss, /-webkit-box-decoration-break:clone/);
  assert.match(builtCss, /-webkit-mask-image/);
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
  assert.equal(images.length, 39, "13 prints, 12 popover photos, 8 popover extras, 4 YouTube posters, 2 plate duotones");
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
    for (const image of hidden.match(/<img\b[^>]*>/g) ?? []) assert.match(image, /\salt(?:=""|[\s/>])/, "hidden images have empty alt");
  }
});

test("built HTML stays small and the deploy folder has no server leftovers", () => {
  const html = read(client("index.html"));
  const gzipped = gzipSync(Buffer.from(html)).length;
  assert.ok(gzipped <= 20 * 1024, `index.html is ${gzipped} bytes gzipped; budget is 20 KB`);
  const cssFiles = readdirSync(join(root, "dist", "client", "_astro")).filter((name) => name.endsWith(".css"));
  const cssGzip = gzipSync(Buffer.from(cssFiles.map((name) => read(client(`_astro/${name}`))).join("\n"))).length;
  assert.ok(cssGzip <= 20 * 1024, `built CSS is ${cssGzip} bytes gzipped; budget is 20 KB (spec 9)`);
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

test("every card states its claim before its print", () => {
  const html = read(client("index.html"));
  for (const article of elements(html, (tag, name) => name === "article")) {
    const print = article.indexOf('<figure class="print');
    if (print === -1) continue;
    const heading = article.search(/<h3\b/);
    assert.ok(heading !== -1 && heading < print, `an article shows a print before its h3: ${article.slice(0, 120)}`);
  }
});

test("exceptions render nothing in place of a receipt", () => {
  const html = read(client("index.html"));
  const one = (id) => elements(html, withId(id))[0];
  assert.doesNotMatch(one("leadership-men-in-green"), /class="stubs"/);
  for (const [id, count] of [["project-armie", 2], ["project-safeline", 1]]) {
    const stubs = elements(one(id), (tag) => tag.includes('class="stubs"'));
    assert.equal(stubs.length, 1, `${id} has one stub row`);
    assert.equal(elements(stubs[0], (tag, name) => name === "a" && /class="stub"/.test(tag)).length, count, `${id} stubs`);
  }
});

test("every fact survives with the decoration, prints, popovers and videos removed", () => {
  const html = read(client("index.html"));
  let rest = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "");
  const strip = (test) => { for (const element of elements(rest, test)) rest = rest.replace(element, " "); };
  strip((tag) => /aria-hidden="true"/.test(tag));
  strip((tag, name) => name === "figure" && /class="(?:print|video)\b/.test(tag));
  strip((tag) => /\spopover(?:=""|\s|>)/.test(tag));
  const text = textOf(rest);
  const has = (value, where) => assert.ok(text.includes(value), `${where}: "${value}" is missing once decoration is removed`);
  const { experiences, projects, route, research, leadership, recognitions, about, ledger, titleBlock } = portfolio;
  for (const job of experiences) for (const key of ["company", "role", "place", "period", "outcome", "detail", "myPart"]) has(job[key], `experience ${key}`);
  for (const project of projects) {
    for (const key of ["name", "event", "date", "result", "pool", "built", "myPart", "aside"]) if (project[key]) has(project[key], `project ${key}`);
    for (const name of project.team) has(name, "team");
  }
  for (const event of route) { has(event.period, "route"); has(event.title, "route"); }
  for (const item of research) for (const key of ["title", "role", "period", "summary", "detail"]) has(item[key], `research ${key}`);
  for (const item of leadership) for (const key of ["title", "role", "period", "summary"]) has(item[key], `leadership ${key}`);
  for (const award of recognitions) for (const key of ["title", "fraction", "denominator", "context", "date"]) has(award[key], `recognition ${key}`);
  for (const line of about) has(line.text, "about");
  for (const row of ledger) { has(row.fraction, "ledger"); has(row.text, "ledger"); }
  for (const row of titleBlock) {
    has(row.label, "title block");
    for (const sentence of [...row.long, ...row.short]) has(sentence, "title block");
  }
  const hrefs = new Set([...rest.matchAll(/href="([^"]*)"/g)].map((match) => match[1].replace(/&amp;/g, "&")));
  const linked = (href, where) => assert.ok(hrefs.has(href) || hrefs.has(`/website/${href}`) || hrefs.has(`/${href}`), `${where}: ${href} is not linked once decoration is removed`);
  for (const item of [...experiences, ...projects, ...research, ...leadership, ...recognitions]) for (const receipt of item.receipts) linked(receipt.href, "receipt");
  for (const row of ledger) linked(row.receipt.href, "ledger");
  for (const event of route) linked(event.href, "route");
  for (const line of about) if (line.href) linked(line.href, "about");
});

test("no hidden subtree or decorative tape carries a result or a title-block sentence", () => {
  const html = read(client("index.html"));
  const facts = [...portfolio.projects.map((project) => project.result), ...portfolio.titleBlock.flatMap((row) => [...row.long, ...row.short])];
  for (const hidden of elements(html, (tag) => /aria-hidden="true"/.test(tag) || /class="(?:[^"]*\s)?tape(?:\s|")/.test(tag))) {
    const text = textOf(hidden);
    for (const fact of facts) assert.ok(!text.includes(fact), `hidden or taped element holds "${fact}"`);
  }
});

test("seven plates open the sections, each hidden and holding one subject", () => {
  const html = read(client("index.html"));
  const plates = elements(html, (tag, name) => name === "div" && /class="plate plate--/.test(tag));
  assert.deepEqual(plates.map((plate) => plate.match(/class="plate (plate--[a-z]+)"/)[1]), ["plate--work", "plate--projects", "plate--route", "plate--research", "plate--leadership", "plate--recognition", "plate--about"]);
  for (const plate of plates) {
    assert.match(plate.slice(0, plate.indexOf(">")), /aria-hidden="true"/);
    const subjects = elements(plate, (tag) => /class="[^"]*\b(?:piece|plate__art)\b/.test(tag));
    assert.ok(subjects.length >= 1 && subjects.length <= 2, `${plate.slice(0, 60)} holds ${subjects.length} subjects`);
    const text = textOf(plate);
    assert.ok(text === "" || (plate.includes("plate--research") && text === "An illustration, not study data. Drawn in code."), `plate text: ${text}`);
  }
});

test("nine sheets in page order, each boundary a runway named on both sides", () => {
  const html = read(client("index.html"));
  const sheets = [...html.matchAll(/<div class="sheet sheet--([a-z]+)( sheet--coloured)?"([^>]*)>/g)].map((m) => ({ page: m[1], coloured: Boolean(m[2]), attrs: m[3], at: m.index }));
  assert.deepEqual(sheets.filter((s) => s.coloured).map((s) => s.page), ["marigold", "sky", "mint", "coral", "rose", "lilac", "sky"]);
  assert.deepEqual(sheets.map((s) => s.page), ["paper", "marigold", "sky", "mint", "coral", "rose", "lilac", "sky", "slab"]);
  const attr = (s, name) => s.attrs.match(new RegExp(`${name}="([^"]*)"`))?.[1];
  const runways = [...html.matchAll(/<div class="runway" id="(r\d)"[^>]*>/g)].map((m) => m[1]);
  assert.deepEqual(runways, ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"]);
  sheets.forEach((sheet, i) => {
    const out = attr(sheet, "data-out");
    if (i === sheets.length - 1) { assert.equal(out, undefined, "the footer sheet has no runway"); return; }
    assert.equal(out, `r${i + 1}`);
    const own = elements(html.slice(sheet.at), (tag) => tag.startsWith('<div class="sheet'))[0];
    assert.match(html.slice(sheet.at + own.length).trimStart(), new RegExp(`^<div class="runway" id="${out}"`), `runway ${out} follows its sheet`);
    assert.equal(attr(sheets[i + 1], "data-in"), out, `the next sheet arrives on ${out}`);
  });
  for (const part of elements(html, (tag) => /class="(?:fx|runway)"/.test(tag))) {
    assert.match(part, /^<div[^>]*aria-hidden="true"/);
    assert.equal(textOf(part), "");
    assert.doesNotMatch(part, /<a\b|<button\b|tabindex/);
  }
  const inSheets = elements(html, (tag) => tag.startsWith('<div class="sheet')).join("");
  for (const { href } of portfolio.navItems) assert.ok(inSheets.includes(`id="${href.slice(1)}"`), `${href} sits inside a sheet`);
});
