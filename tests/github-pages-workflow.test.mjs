import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

test("GitHub Pages workflow builds on pull requests, deploys only on main, and uses Node 24", () => {
  const workflowPath = join(root, ".github/workflows/deploy-pages.yml");
  assert.equal(existsSync(workflowPath), true, "the repository needs a GitHub Pages workflow");
  const workflow = read(".github/workflows/deploy-pages.yml");
  const astroConfig = read("astro.config.mjs");

  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /node-version:\s*24/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /id:\s*pages/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /npm run test:build/);
  assert.match(workflow, /BASE_URL:\s*\$\{\{\s*steps\.pages\.outputs\.base_path\s*\}\}/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /path:\s*\.\/dist\/client/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /if:\s*github\.event_name != 'pull_request'/);
  assert.match(astroConfig, /base:\s*process\.env\.BASE_URL\s*\|\|\s*"\/"/);
  assert.match(astroConfig, /site:\s*"https:\/\/aryanmudgal-tech\.github\.io"/);
});

test("GitHub Pages build prefixes every asset with the repository base path", () => {
  execFileSync("npm", ["run", "build"], {
    cwd: root,
    env: { ...process.env, BASE_URL: "/website" },
    stdio: "pipe",
  });
  const index = read("dist/client/index.html");
  const page404 = read("dist/client/404.html");

  assert.doesNotMatch(index, /(?:src|href)="\/(?!website\/)/, "an absolute path is missing the base");
  assert.doesNotMatch(index, /srcset="\/(?!website\/)/, "a srcset entry is missing the base");
  assert.match(index, /href="\/website\/resume\.pdf"/);
  assert.match(index, /content="https:\/\/aryanmudgal-tech\.github\.io\/website\/og\.jpg"/);
  assert.match(page404, /href="\/website\/favicon\.svg"/);
});
