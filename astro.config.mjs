import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://aryanmudgal-tech.github.io",
  output: "static",
  base: process.env.BASE_URL || "/",
  outDir: "./dist/client",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  compressHTML: true,
});
