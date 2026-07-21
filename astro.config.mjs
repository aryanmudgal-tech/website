import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  base: process.env.BASE_URL || "/",
  outDir: "./dist/client",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  compressHTML: true,
});
