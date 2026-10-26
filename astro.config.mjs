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
  vite: {
    build: {
      // Small SVGs inline into the CSS; undefined leaves every other file, including Astro's
      // processed <script> blocks, on the 4,096 B default, so both component scripts stay inline.
      assetsInlineLimit: (file, content) => (file.endsWith(".svg") ? content.length < 1024 : undefined),
      // Keep the prefixes Safari still needs (-webkit-box-decoration-break, -webkit-mask-*).
      cssTarget: ["chrome111", "edge111", "firefox114", "safari16.4", "ios16.4"],
    },
  },
});
