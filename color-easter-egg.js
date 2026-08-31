// Hidden easter egg: spam-click the name/logo (5x within 1.2s) to shuffle palette
// No visible UI on purpose.

const EGG_PALETTES = [
  {
    name: "Cursor",
    dark: { "--bg": "#14120B", "--surface": "#1B1913", "--surface-2": "#26241E", "--text": "#F5F3EB", "--text-2": "#A9A69D", "--text-3": "#77746C", "--line": "#302E27", "--line-soft": "#25231D", "--accent": "#FF5A00", "--accent-dim": "#ff5a0066", "--accent-soft": "#ff7a33" },
    light: { "--bg": "#F7F7F4", "--surface": "#F2F1ED", "--surface-2": "#E6E5E0", "--text": "#171611", "--text-2": "#68665F", "--text-3": "#96938B", "--line": "#DAD9D4", "--line-soft": "#edece8", "--accent": "#FF5A00", "--accent-dim": "#ff5a0066", "--accent-soft": "#cc4800" }
  },
  {
    name: "Slate",
    dark: { "--bg": "#1a1a19", "--surface": "#232322", "--surface-2": "#2a2a29", "--text": "#d6d5d2", "--text-2": "#ffffff6e", "--text-3": "#ffffff40", "--line": "#ffffff14", "--line-soft": "#ffffff0a", "--accent": "#dc2626", "--accent-dim": "#dc262666", "--accent-soft": "#f2665a" },
    light: { "--bg": "#f7f6f5", "--surface": "#ffffff", "--surface-2": "#efeeea", "--text": "#000000", "--text-2": "#1919198f", "--text-3": "#19191945", "--line": "#0000000f", "--line-soft": "#00000008", "--accent": "#dc2626", "--accent-dim": "#dc262666", "--accent-soft": "#b91c1c" }
  },
  {
    name: "Void",
    dark: { "--bg": "#080808", "--surface": "#101010", "--surface-2": "#171717", "--text": "#e8e8e6", "--text-2": "#8f8f8a", "--text-3": "#64645e", "--line": "#1d1d1d", "--line-soft": "#141414", "--accent": "#0fa47a", "--accent-dim": "#0b7558", "--accent-soft": "#4eccb0" },
    light: { "--bg": "#f7f7f4", "--surface": "#f2f2ee", "--surface-2": "#e8e8e2", "--text": "#0f0f0f", "--text-2": "#5c5c54", "--text-3": "#8a8a81", "--line": "#d8d7d2", "--line-soft": "#ecebe7", "--accent": "#0d8060", "--accent-dim": "#0a6b50", "--accent-soft": "#0fa47a" }
  },
  {
    name: "Obsidian",
    dark: { "--bg": "#0a0a0a", "--surface": "#131313", "--surface-2": "#1b1b1b", "--text": "#e7e7e3", "--text-2": "#9a9a93", "--text-3": "#666662", "--line": "#202020", "--line-soft": "#161616", "--accent": "#5e7cff", "--accent-dim": "#445ad9", "--accent-soft": "#8ea1ff" },
    light: { "--bg": "#f7f6f3", "--surface": "#ffffff", "--surface-2": "#ece9e4", "--text": "#11100e", "--text-2": "#5e5b56", "--text-3": "#87837e", "--line": "#dfddd9", "--line-soft": "#efedeb", "--accent": "#3551ea", "--accent-dim": "#2a41c0", "--accent-soft": "#5e7cff" }
  },
  {
    name: "Ash",
    dark: { "--bg": "#12100f", "--surface": "#1a1816", "--surface-2": "#211e1c", "--text": "#eee8e0", "--text-2": "#a89f94", "--text-3": "#736e68", "--line": "#2a2725", "--line-soft": "#1f1d1b", "--accent": "#d6a243", "--accent-dim": "#b08636", "--accent-soft": "#e9c46a" },
    light: { "--bg": "#fbfaf8", "--surface": "#ffffff", "--surface-2": "#f0ece6", "--text": "#1a1512", "--text-2": "#665e57", "--text-3": "#928a82", "--line": "#e5ded5", "--line-soft": "#f1ece6", "--accent": "#b5881c", "--accent-dim": "#9a7620", "--accent-soft": "#d6a243" }
  },
  {
    name: "Charcoal",
    dark: { "--bg": "#101214", "--surface": "#171a1d", "--surface-2": "#1e2125", "--text": "#e8eaec", "--text-2": "#9ca0a6", "--text-3": "#676a6e", "--line": "#272a2e", "--line-soft": "#1c1e21", "--accent": "#4ecdc4", "--accent-dim": "#3baaa3", "--accent-soft": "#7de8e0" },
    light: { "--bg": "#f6f7f7", "--surface": "#ffffff", "--surface-2": "#eceeef", "--text": "#0f1417", "--text-2": "#596069", "--text-3": "#858d96", "--line": "#dde0e4", "--line-soft": "#edeff1", "--accent": "#2eb8ae", "--accent-dim": "#249a93", "--accent-soft": "#4ecdc4" }
  },
  {
    name: "Graphite",
    dark: { "--bg": "#0e0e10", "--surface": "#161618", "--surface-2": "#1d1d1f", "--text": "#ebeae8", "--text-2": "#9c9b98", "--text-3": "#666563", "--line": "#262628", "--line-soft": "#1b1b1d", "--accent": "#9d66ff", "--accent-dim": "#7a4ed6", "--accent-soft": "#bf99ff" },
    light: { "--bg": "#f7f7f6", "--surface": "#ffffff", "--surface-2": "#eceaea", "--text": "#131314", "--text-2": "#5e5d5c", "--text-3": "#8a8987", "--line": "#dddcdc", "--line-soft": "#ececec", "--accent": "#7c3bdb", "--accent-dim": "#6530b3", "--accent-soft": "#9d66ff" }
  },
  {
    name: "Sepia",
    dark: { "--bg": "#120f0b", "--surface": "#1a1611", "--surface-2": "#211d17", "--text": "#ede6db", "--text-2": "#a79e91", "--text-3": "#726c64", "--line": "#2a2520", "--line-soft": "#1e1c19", "--accent": "#2a9e66", "--accent-dim": "#1f7a4e", "--accent-soft": "#55c48a" },
    light: { "--bg": "#fbf8f2", "--surface": "#ffffff", "--surface-2": "#f3ece1", "--text": "#181209", "--text-2": "#645e53", "--text-3": "#938a7b", "--line": "#e4d9c7", "--line-soft": "#efe7da", "--accent": "#1d8050", "--accent-dim": "#15643c", "--accent-soft": "#2a9e66" }
  },
  {
    name: "Sable",
    dark: { "--bg": "#0f0d0c", "--surface": "#181512", "--surface-2": "#1f1c19", "--text": "#ece7e0", "--text-2": "#a8a39d", "--text-3": "#6f6b67", "--line": "#272422", "--line-soft": "#1d1b1a", "--accent": "#b5449c", "--accent-dim": "#8f317c", "--accent-soft": "#d470b8" },
    light: { "--bg": "#faf8f5", "--surface": "#ffffff", "--surface-2": "#f0eae3", "--text": "#171210", "--text-2": "#615c56", "--text-3": "#928b84", "--line": "#e2d9cf", "--line-soft": "#ece6de", "--accent": "#9a327f", "--accent-dim": "#7d2868", "--accent-soft": "#b5449c" }
  },
  {
    name: "Noir",
    dark: { "--bg": "#050505", "--surface": "#0d0d0d", "--surface-2": "#161616", "--text": "#ebebea", "--text-2": "#8a8a88", "--text-3": "#5a5a57", "--line": "#1a1a1a", "--line-soft": "#111111", "--accent": "#e6b540", "--accent-dim": "#c49a35", "--accent-soft": "#f0d26a" },
    light: { "--bg": "#f6f5f3", "--surface": "#ffffff", "--surface-2": "#edeceb", "--text": "#0a0a0a", "--text-2": "#555555", "--text-3": "#808080", "--line": "#d9d9d7", "--line-soft": "#ecebe9", "--accent": "#c49a2a", "--accent-dim": "#a3811f", "--accent-soft": "#e6b540" }
  }
];

let activeEgg = null;
let clickTimes = [];
const CLICK_THRESHOLD = 5;
const CLICK_WINDOW_MS = 1200;

function isLight() {
  return document.documentElement.classList.contains("light");
}

function applyActiveEgg() {
  if (!activeEgg) return;
  const root = document.documentElement.style;
  const vars = isLight() ? activeEgg.light : activeEgg.dark;
  Object.entries(vars).forEach(([key, val]) => root.setProperty(key, val));
}

function pulseFeedback() {
  const el = document.getElementById("site-title");
  if (!el) return;
  el.animate(
    [
      { filter: "brightness(1)" },
      { filter: "brightness(1.8)" },
      { filter: "brightness(1)" }
    ],
    { duration: 420, easing: "ease-out" }
  );
}

function triggerEgg() {
  const idx = EGG_PALETTES.indexOf(activeEgg);
  const choices = activeEgg ? EGG_PALETTES.filter((_, i) => i !== idx) : EGG_PALETTES;
  activeEgg = choices[Math.floor(Math.random() * choices.length)];
  applyActiveEgg();
  pulseFeedback();
  console.log(`%c✨ palette: ${activeEgg.name}`, "font-weight:bold;color:var(--accent);");
}

function initEasterEgg() {
  const trigger = document.getElementById("site-title");
  if (!trigger) return;

  trigger.style.cursor = "pointer";

  trigger.addEventListener("click", () => {
    const now = Date.now();
    clickTimes.push(now);
    clickTimes = clickTimes.filter((t) => now - t < CLICK_WINDOW_MS);
    if (clickTimes.length >= CLICK_THRESHOLD) {
      clickTimes = [];
      triggerEgg();
    }
  });

  new MutationObserver(applyActiveEgg).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"]
  });
}

initEasterEgg();
