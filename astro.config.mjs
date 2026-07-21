import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  outDir: "./dist/client",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  compressHTML: true,
});
