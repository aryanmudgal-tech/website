// Reads token values from the first :root block of global.css, so generated colours follow the CSS.
export function readTokens(css) {
  const block = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (!block) throw new Error("no :root block in global.css");
  const tokens = {};
  for (const [, name, value] of block[1].matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) tokens[name] = value.trim();
  return tokens;
}
