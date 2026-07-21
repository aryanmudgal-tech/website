import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

test("GitHub Pages deploys Astro's compiled static output", () => {
  const workflowPath = join(root, ".github/workflows/deploy-pages.yml");

  assert.equal(existsSync(workflowPath), true, "the repository needs a GitHub Pages workflow");

  const workflow = read(".github/workflows/deploy-pages.yml");
  const astroConfig = read("astro.config.mjs");

  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /id:\s*pages/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /BASE_URL:\s*\$\{\{\s*steps\.pages\.outputs\.base_path\s*\}\}/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /path:\s*\.\/dist\/client/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(astroConfig, /base:\s*process\.env\.BASE_URL\s*\|\|\s*"\/"/);
});

test("GitHub Pages build prefixes every public image with the repository base path", () => {
  execFileSync("npm", ["run", "build"], {
    cwd: root,
    env: { ...process.env, BASE_URL: "/website" },
    stdio: "pipe",
  });

  const index = read("dist/client/index.html");
  const page404 = read("dist/client/404.html");

  assert.doesNotMatch(index, /(?:src|href)="\/assets\//);
  assert.match(index, /src="\/website\/assets\/award-leader\.jpg"/);
  assert.match(index, /src="\/website\/assets\/hack-dots\.jpg"/);
  assert.match(page404, /href="\/website\/favicon\.svg"/);
});
