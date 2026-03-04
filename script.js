const sectionConfig = {
  work: {
    path: "data/work/",
    requiredKeys: ["title", "role", "timeline", "summary"]
  },
  education: {
    path: "data/education/",
    requiredKeys: ["institution", "location", "timeline", "details"]
  },
  achievements: {
    path: "data/achievements/",
    requiredKeys: ["title", "meta", "description"]
  }
};

function parseDataFile(text) {
  const record = {};
  const lines = text.split("\n");
  let activeListKey = null;

  lines.forEach((lineRaw) => {
    const line = lineRaw.trim();
    if (!line) {
      return;
    }

    if (line.startsWith("- ") && activeListKey) {
      record[activeListKey].push(line.replace("- ", ""));
      return;
    }

    const [keyPart, ...valueParts] = line.split(":");
    const key = keyPart.trim();
    const value = valueParts.join(":").trim();

    if (!key) {
      return;
    }

    if (value) {
      record[key] = value;
      activeListKey = null;
    } else {
      record[key] = [];
      activeListKey = key;
    }
  });

  return record;
}

function hasTemplateShape(record, requiredKeys) {
  return requiredKeys.every((key) => key in record);
}

function resolveRelativePath(basePath, href) {
  const parsedHref = decodeURIComponent(href);

  if (parsedHref.startsWith("http://") || parsedHref.startsWith("https://")) {
    const url = new URL(parsedHref);
    return `${url.pathname}${url.search}`.replace(/^\//, "");
  }

  return `${basePath}${parsedHref.replace(/^\.?\/?/, "")}`;
}

async function discoverSectionFiles(basePath) {
  const response = await fetch(basePath);
  if (!response.ok) {
    throw new Error(`Failed to load section directory: ${basePath}`);
  }

  const html = await response.text();
  const parser = new DOMParser();
  const directoryDocument = parser.parseFromString(html, "text/html");

  const files = Array.from(directoryDocument.querySelectorAll("a[href]"))
    .map((link) => link.getAttribute("href")?.trim() || "")
    .filter((href) => href && href.endsWith(".txt"))
    .map((href) => resolveRelativePath(basePath, href));

  return [...new Set(files)].sort((a, b) => a.localeCompare(b));
}

async function loadSection(sectionName) {
  const config = sectionConfig[sectionName];
  const files = await discoverSectionFiles(config.path);

  const items = await Promise.all(
    files.map(async (path) => {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load: ${path}`);
      }

      const text = await response.text();
      const record = parseDataFile(text);
      return hasTemplateShape(record, config.requiredKeys) ? record : null;
    })
  );

  return items.filter(Boolean);
}

function renderWork(items) {
  const target = document.getElementById("work-grid");
  target.innerHTML = items
    .map((item) => {
      const summary = (item.summary || []).map((point) => `<li>${point}</li>`).join("");
      return `
        <article class="card">
          <h3>${item.title || "Untitled"}</h3>
          <p class="meta">${item.role || "Role"} | ${item.timeline || "Timeline"}</p>
          <ul>${summary}</ul>
        </article>
      `;
    })
    .join("");
}

function renderEducation(items) {
  const target = document.getElementById("education-timeline");
  target.innerHTML = items
    .map(
      (item) => `
      <article class="card">
        <h3>${item.institution || "Institution"}</h3>
        <p class="meta">${item.location || "Location"} | ${item.timeline || "Timeline"}</p>
        <p>${item.details || ""}</p>
      </article>
    `
    )
    .join("");
}

function renderAchievements(items) {
  const target = document.getElementById("achievement-grid");
  target.innerHTML = items
    .map(
      (item) => `
      <article class="card">
        <h3>${item.title || "Achievement"}</h3>
        <p class="meta">${item.meta || "Meta"}</p>
        <p>${item.description || ""}</p>
      </article>
    `
    )
    .join("");
}

function setupThemeToggle() {
  const button = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light");
    button.textContent = "DARK";
  }

  button.addEventListener("click", () => {
    const lightEnabled = document.body.classList.toggle("light");
    button.textContent = lightEnabled ? "DARK" : "LIGHT";
    localStorage.setItem("theme", lightEnabled ? "light" : "dark");
  });
}

function setYear() {
  document.getElementById("year").textContent = new Date().getFullYear();
}

function showLoadError(error) {
  const main = document.querySelector("main");
  const errorBox = document.createElement("section");
  errorBox.className = "section-block";
  errorBox.innerHTML = `<h2>Data Load Error</h2><p class="meta">${error.message}</p>`;
  main.prepend(errorBox);
}

async function init() {
  setupThemeToggle();
  setYear();

  try {
    const [workItems, educationItems, achievementItems] = await Promise.all([
      loadSection("work"),
      loadSection("education"),
      loadSection("achievements")
    ]);

    renderWork(workItems);
    renderEducation(educationItems);
    renderAchievements(achievementItems);
  } catch (error) {
    showLoadError(error);
  }
}

init();
