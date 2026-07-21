import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const clientDirectory = resolve(root, "dist", "client");
const serverDirectory = resolve(root, "dist", "server");

const worker = `const worker = {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const url = new URL(request.url);
    if (url.pathname === "/404.html") return response;

    const fallbackRequest = new Request(new URL("/404.html", request.url), {
      method: "GET",
      headers: request.headers,
    });
    const fallback = await env.ASSETS.fetch(fallbackRequest);
    if (fallback.status === 404) return response;

    return new Response(request.method === "HEAD" ? null : fallback.body, {
      status: 404,
      headers: fallback.headers,
    });
  },
};

export default worker;
`;

const wrangler = {
  topLevelName: "aryan-mudgal-portfolio",
  name: "aryan-mudgal-portfolio",
  compatibility_date: "2026-07-20",
  compatibility_flags: [],
  vars: {},
  main: "index.js",
  rules: [{ type: "ESModule", globs: ["**/*.js", "**/*.mjs"] }],
  no_bundle: true,
  assets: { directory: "../client" },
  observability: { enabled: true },
};

const headers = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: DENY

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;

await rm(serverDirectory, { recursive: true, force: true });
await mkdir(serverDirectory, { recursive: true });
await writeFile(resolve(serverDirectory, "index.js"), worker);
await writeFile(resolve(serverDirectory, "wrangler.json"), JSON.stringify(wrangler));
await writeFile(resolve(clientDirectory, "_headers"), headers);
await writeFile(resolve(clientDirectory, ".assetsignore"), "wrangler.json\n.dev.vars\n");
