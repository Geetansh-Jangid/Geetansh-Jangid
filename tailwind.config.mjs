/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Uncut Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'JetBrains Mono NF'", "'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
          dim: "var(--accent-dim)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          subtle: "var(--surface-2)",
          muted: "var(--surface-2)",
        },
        content: {
          DEFAULT: "var(--text)",
          secondary: "var(--text-2)",
          muted: "var(--text-3)",
          body: "var(--text)",
        },
        line: {
          DEFAULT: "var(--line)",
          soft: "var(--line-soft)",
        },
      },
    },
  },
};
