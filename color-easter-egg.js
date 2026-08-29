// Hidden easter egg: spam-click the name/logo (5x within 1.2s) to randomly
// re-skin the site's color palette. No visible UI on purpose.

const EGG_PALETTES = [
  {
    name: "Ant",
    dark: { "--bg": "#1a1a19", "--surface": "#232322", "--surface-2": "#2a2a29", "--text": "#d6d5d2", "--text-2": "#ffffff6e", "--text-3": "#ffffff40", "--line": "#ffffff14", "--line-soft": "#ffffff0a", "--accent": "#dc2626", "--accent-dim": "#dc262666", "--accent-soft": "#f2665a" },
    light: { "--bg": "#f7f6f5", "--surface": "#ffffff", "--surface-2": "#efeeea", "--text": "#000000", "--text-2": "#1919198f", "--text-3": "#19191945", "--line": "#0000000f", "--line-soft": "#00000008", "--accent": "#dc2626", "--accent-dim": "#dc262666", "--accent-soft": "#b91c1c" }
  },
  {
    name: "Brass",
    dark: { "--bg": "#0c0b0a", "--surface": "#141210", "--surface-2": "#191712", "--text": "#f0ece3", "--text-2": "#a8a196", "--text-3": "#706a5f", "--line": "#2a2723", "--line-soft": "#1c1a16", "--accent": "#cda863", "--accent-dim": "#7d6839", "--accent-soft": "#ddc088" },
    light: { "--bg": "#fdfcfa", "--surface": "#ffffff", "--surface-2": "#f4f1ea", "--text": "#16140f", "--text-2": "#5c5648", "--text-3": "#8f8875", "--line": "#ded6c2", "--line-soft": "#eae4d4", "--accent": "#8a6a1f", "--accent-dim": "#b8975a", "--accent-soft": "#6b5218" }
  },
  {
    name: "Indigo",
    dark: { "--bg": "#0a0b10", "--surface": "#111320", "--surface-2": "#161829", "--text": "#eef0f7", "--text-2": "#9599b0", "--text-3": "#5b5e77", "--line": "#212436", "--line-soft": "#171927", "--accent": "#7c9eff", "--accent-dim": "#45528f", "--accent-soft": "#aec0ff" },
    light: { "--bg": "#f7f8fb", "--surface": "#ffffff", "--surface-2": "#eef0f6", "--text": "#0f111a", "--text-2": "#575c72", "--text-3": "#8b8fa3", "--line": "#dde0ec", "--line-soft": "#eceef5", "--accent": "#3a54d8", "--accent-dim": "#7286e0", "--accent-soft": "#25348f" }
  },
  {
    name: "Teal",
    dark: { "--bg": "#08100f", "--surface": "#0e1716", "--surface-2": "#121c1b", "--text": "#e9f2f0", "--text-2": "#8fa5a1", "--text-3": "#556965", "--line": "#1c2b28", "--line-soft": "#131f1d", "--accent": "#2dd4bf", "--accent-dim": "#1c8577", "--accent-soft": "#7fe6d7" },
    light: { "--bg": "#f6faf9", "--surface": "#ffffff", "--surface-2": "#eaf3f1", "--text": "#0b1615", "--text-2": "#4d6360", "--text-3": "#84958f", "--line": "#d7e6e3", "--line-soft": "#e7f1ef", "--accent": "#0f8f7d", "--accent-dim": "#4cb3a4", "--accent-soft": "#0a6558" }
  },
  {
    name: "Terracotta",
    dark: { "--bg": "#0d0b0a", "--surface": "#151110", "--surface-2": "#1a1513", "--text": "#f2ece7", "--text-2": "#a89a90", "--text-3": "#6e6259", "--line": "#2a221c", "--line-soft": "#1c1613", "--accent": "#d97757", "--accent-dim": "#8f4b34", "--accent-soft": "#eda488" },
    light: { "--bg": "#fbf8f5", "--surface": "#ffffff", "--surface-2": "#f2eae3", "--text": "#18120e", "--text-2": "#63564b", "--text-3": "#948676", "--line": "#e3d5c5", "--line-soft": "#efe4d8", "--accent": "#b45332", "--accent-dim": "#cc8266", "--accent-soft": "#8a3e24" }
  },
  {
    name: "Violet",
    dark: { "--bg": "#0b0a12", "--surface": "#121019", "--surface-2": "#17141f", "--text": "#eeecf5", "--text-2": "#9b96ad", "--text-3": "#615c74", "--line": "#221f2e", "--line-soft": "#171522", "--accent": "#9b87f5", "--accent-dim": "#5c4d9e", "--accent-soft": "#c3b6fb" },
    light: { "--bg": "#f8f7fb", "--surface": "#ffffff", "--surface-2": "#efedf7", "--text": "#120f1c", "--text-2": "#5c5670", "--text-3": "#8f89a2", "--line": "#dfdaef", "--line-soft": "#ede9f7", "--accent": "#6247d8", "--accent-dim": "#8b7ae0", "--accent-soft": "#4a339c" }
  }
];

// Beyond the curated set above, every trigger also rolls a fresh, never-repeating
// hue so the palette pool is effectively unlimited.
function randomPalette() {
  const h = Math.floor(Math.random() * 360);
  return {
    name: `Random ${h}°`,
    dark: {
      "--bg": `hsl(${h} 15% 6%)`,
      "--surface": `hsl(${h} 14% 9%)`,
      "--surface-2": `hsl(${h} 13% 11%)`,
      "--text": `hsl(${h} 20% 92%)`,
      "--text-2": `hsla(${h}, 15%, 90%, 0.55)`,
      "--text-3": `hsla(${h}, 15%, 90%, 0.3)`,
      "--line": `hsla(${h}, 15%, 90%, 0.1)`,
      "--line-soft": `hsla(${h}, 15%, 90%, 0.05)`,
      "--accent": `hsl(${h} 75% 58%)`,
      "--accent-dim": `hsla(${h}, 75%, 45%, 0.55)`,
      "--accent-soft": `hsl(${h} 80% 70%)`
    },
    light: {
      "--bg": `hsl(${h} 30% 96%)`,
      "--surface": `hsl(0 0% 100%)`,
      "--surface-2": `hsl(${h} 25% 93%)`,
      "--text": `hsl(${h} 20% 8%)`,
      "--text-2": `hsla(${h}, 15%, 10%, 0.6)`,
      "--text-3": `hsla(${h}, 15%, 10%, 0.3)`,
      "--line": `hsla(${h}, 15%, 10%, 0.08)`,
      "--line-soft": `hsla(${h}, 15%, 10%, 0.04)`,
      "--accent": `hsl(${h} 75% 45%)`,
      "--accent-dim": `hsla(${h}, 75%, 45%, 0.5)`,
      "--accent-soft": `hsl(${h} 80% 35%)`
    }
  };
}

let activeEgg = null;
let clickTimes = [];
const CLICK_THRESHOLD = 3;
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
  // Mostly roll a brand new random hue (unlimited), occasionally surface one
  // of the curated named palettes (including the site's own default).
  const useCurated = Math.random() < 0.35;
  if (useCurated) {
    const choices = EGG_PALETTES.filter((p) => p !== activeEgg);
    activeEgg = choices[Math.floor(Math.random() * choices.length)];
  } else {
    activeEgg = randomPalette();
  }
  applyActiveEgg();
  pulseFeedback();
  console.log(`%c✨ palette shuffled: ${activeEgg.name}`, "color:#dc2626;font-weight:bold;");
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
