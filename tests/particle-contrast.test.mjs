import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => readFileSync(join(root, relative), "utf8");

test("reading surfaces prioritize text over the particle field", () => {
  const tokens = read("src/styles/tokens.css");
  const layout = read("src/styles/layout.css");

  assert.match(tokens, /--reading-surface:\s*rgb\(0 0 0 \/ 0\.9\)/);
  assert.match(tokens, /--reading-surface-strong:\s*rgb\(0 0 0 \/ 0\.96\)/);
  assert.match(
    layout,
    /\.section-heading,[\s\S]*?background:\s*var\(--reading-surface\)/,
  );
  assert.match(
    layout,
    /\.experience__outcome\s*>\s*p[\s\S]*?color:\s*var\(--text-secondary\)/,
  );
  assert.doesNotMatch(layout, /backdrop-filter|(?:linear|radial|conic)-gradient/i);
});
