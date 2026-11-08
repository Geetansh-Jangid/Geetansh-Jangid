import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const base = process.env.PUBLIC_BASE_PATH || "/";
const site = process.env.SITE_URL || "https://geetansh.tech";

export default defineConfig({
  site,
  base,
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    syntaxHighlight: "shiki",
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
      wrap: false,
    },
  },
  build: {
    format: "directory",
  },
});
