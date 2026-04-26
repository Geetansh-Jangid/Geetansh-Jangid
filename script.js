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
  },
  goals: {
    path: "data/goals/",
    requiredKeys: ["title", "status", "month", "description"]
  },
  contact: {
    path: "data/contact/",
    requiredKeys: ["type", "value"]
  }
};

const MANIFEST_PATH = "data/files.json";

function parseDataFile(text) {
  const record = {};
  const lines = text.split("\n");
  let activeListKey = null;

  lines.forEach((lineRaw) => {
    const line = lineRaw.trim();
    if (!line) return;

    if (line.startsWith("- ") && activeListKey) {
      record[activeListKey].push(line.replace("- ", ""));
      return;
    }

    const firstColonIndex = line.indexOf(":");
    if (firstColonIndex === -1) return;

    const key = line.slice(0, firstColonIndex).trim();
    const value = line.slice(firstColonIndex + 1).trim();

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
  if (href.startsWith("http://") || href.startsWith("https://")) {
    const url = new URL(href);
    return `${url.pathname}${url.search}`.replace(/^\//, "");
  }
  return `${basePath}${href.replace(/^\.?\/?/, "")}`;
}

async function readManifest() {
  try {
    const response = await fetch(MANIFEST_PATH, { cache: "no-store" });
    return response.ok ? await response.json() : null;
  } catch (err) {
    return null;
  }
}

async function discoverSectionFilesFromDirectory(basePath) {
  try {
    const response = await fetch(basePath);
    if (!response.ok) return [];
    const html = await response.text();
    const parser = new DOMParser();
    const directoryDocument = parser.parseFromString(html, "text/html");
    const files = Array.from(directoryDocument.querySelectorAll("a[href]"))
      .map((link) => link.getAttribute("href")?.trim() || "")
      .filter((href) => href && href.endsWith(".txt"))
      .map((href) => resolveRelativePath(basePath, href));
    return [...new Set(files)].sort((a, b) => a.localeCompare(b));
  } catch (err) {
    return [];
  }
}

async function getSectionFiles(sectionName, manifest) {
  if (manifest && manifest[sectionName] && manifest[sectionName].length > 0) {
    return manifest[sectionName];
  }
  return discoverSectionFilesFromDirectory(sectionConfig[sectionName].path);
}

async function loadSection(sectionName, files) {
  const config = sectionConfig[sectionName];
  const items = await Promise.all(
    files.map(async (path) => {
      try {
        const response = await fetch(path);
        if (!response.ok) return null;
        const text = await response.text();
        const record = parseDataFile(text);
        record._path = path;
        return hasTemplateShape(record, config.requiredKeys) ? record : null;
      } catch (err) {
        return null;
      }
    })
  );
  return items.filter(Boolean);
}

function getGridClass(count) {
  if (count <= 1) return "grid-1";
  if (count === 2) return "grid-2";
  return "grid-3";
}

function renderWork(items) {
  const target = document.getElementById("work-grid");
  target.className = `grid ${getGridClass(items.length)}`;
  target.innerHTML = items.map((item) => {
    const summary = Array.isArray(item.summary) ? item.summary : [item.summary];
    return `
      <article class="card">
        <h3>${item.title}</h3>
        <p class="meta">${item.role} | ${item.timeline}</p>
        <ul>${summary.map(pt => `<li>${pt}</li>`).join("")}</ul>
      </article>`;
  }).join("");
}

function renderEducation(items) {
  const target = document.getElementById("education-timeline");
  target.className = `grid ${getGridClass(items.length)}`;
  target.innerHTML = items.map((item) => `
    <article class="card">
      <h3>${item.institution}</h3>
      <p class="meta">${item.location} | ${item.timeline}</p>
      <p>${item.details}</p>
    </article>`).join("");
}

function renderAchievements(items) {
  const target = document.getElementById("achievement-grid");
  target.className = `grid ${getGridClass(items.length)}`;
  target.innerHTML = items.map((item) => `
    <article class="card">
      <h3>${item.title}</h3>
      <p class="meta">${item.meta}</p>
      <p>${item.description}</p>
    </article>`).join("");
}

function renderContact(items) {
  const target = document.getElementById("contact-grid");
  target.className = `grid ${getGridClass(items.length)}`;
  target.innerHTML = items.map((item) => {
    const label = item.label || item.type;
    const isLink = item.type.toLowerCase() !== 'email';
    const href = item.type.toLowerCase() === 'email' ? `mailto:${item.value}` : item.value;
    return `
      <article class="card contact-card">
        <p class="meta">${item.type}</p>
        ${isLink ? `<a href="${href}" target="_blank" rel="noopener">${label}</a>` : `<p>${label}</p>`}
      </article>`;
  }).join("");
}

let goalsState = { months: [], grouped: {}, currentIndex: 0 };

function renderGoals(items) {
  const target = document.getElementById("goals-container");
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();

  // Create a robust normalization function for "MMM YYYY"
  const normalize = (date) => date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  const todayKey = normalize(new Date(currentYear, currentMonthIdx, 1));

  const grouped = items.reduce((acc, item) => {
    let rawMonth = item.month || "";
    const filename = (item._path || "").split('/').pop();
    
    let monthName = "";
    let yearValue = currentYear;

    const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    const monthShorts = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

    if (filename.includes('-')) {
      const monthPart = filename.split('-')[0].toLowerCase();
      if (monthNames.includes(monthPart) || monthShorts.includes(monthPart)) monthName = monthPart;
    }

    if (rawMonth) {
      const mMatch = rawMonth.match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
      const yMatch = rawMonth.match(/\d{4}/);
      if (mMatch) monthName = mMatch[0].toLowerCase();
      if (yMatch) yearValue = parseInt(yMatch[0]);
    }

    let key = "Unknown";
    if (monthName) {
      const mIdx = monthNames.indexOf(monthName) !== -1 ? monthNames.indexOf(monthName) : monthShorts.indexOf(monthName);
      if (mIdx !== -1) {
        key = normalize(new Date(yearValue, mIdx, 1));
      }
    }
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // Ensure current month exists in the list for calendar feel
  if (!grouped[todayKey]) grouped[todayKey] = [];

  // Sort chronologically
  const sortedMonths = Object.keys(grouped)
    .filter(k => k !== "Unknown")
    .sort((a, b) => new Date(a) - new Date(b));
  
  if (grouped["Unknown"] && grouped["Unknown"].length > 0) sortedMonths.push("Unknown");

  const index = sortedMonths.indexOf(todayKey);
  
  goalsState = { months: sortedMonths, grouped, currentIndex: index !== -1 ? index : 0 };
  updateGoalsUI();
}

function updateGoalsUI() {
  const target = document.getElementById("goals-container");
  const { months, grouped, currentIndex } = goalsState;
  const currentMonth = months[currentIndex];
  const items = grouped[currentMonth] || [];
  
  const now = new Date();
  const todayKey = now.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  const isToday = currentMonth === todayKey;

  target.innerHTML = `
    <div class="goals-nav">
      <button class="nav-btn" onclick="switchGoalMonth(-1)" ${currentIndex === 0 ? 'disabled' : ''}>&lt;</button>
      <div class="current-month-display">
        <span class="label">${isToday ? 'CURRENT FOCUS' : 'GOAL TIMELINE'}</span>
        <span>${currentMonth}</span>
      </div>
      <button class="nav-btn" onclick="switchGoalMonth(1)" ${currentIndex === months.length - 1 ? 'disabled' : ''}>&gt;</button>
    </div>
    <div id="goals-slider" class="slider-container">
      ${items.length > 0 ? `
        <div class="grid ${getGridClass(items.length)}">
          ${items.map(item => `
            <article class="card">
              <h3>${item.title}</h3>
              <p class="meta">${item.status}</p>
              <p>${item.description}</p>
            </article>`).join("")}
        </div>
      ` : `<p class="meta" style="text-align: center; padding: 2rem;">No goals set for this month.</p>`}
    </div>`;
}

window.switchGoalMonth = (dir) => {
  const next = goalsState.currentIndex + dir;
  if (next >= 0 && next < goalsState.months.length) {
    const slider = document.getElementById("goals-slider");
    slider.classList.add("transitioning");
    setTimeout(() => {
      goalsState.currentIndex = next;
      updateGoalsUI();
      document.getElementById("goals-slider").classList.remove("transitioning");
    }, 200);
  }
};

function setupThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    btn.textContent = "DARK";
  }
  btn.onclick = () => {
    const isLight = document.body.classList.toggle("light");
    btn.textContent = isLight ? "DARK" : "LIGHT";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  };
}

async function init() {
  setupThemeToggle();
  document.getElementById("year").textContent = new Date().getFullYear();
  try {
    const manifest = await readManifest();
    const sections = ["work", "goals", "education", "achievements", "contact"];
    const fileLists = await Promise.all(sections.map(s => getSectionFiles(s, manifest)));
    const data = await Promise.all(sections.map((s, i) => loadSection(s, fileLists[i])));
    
    renderWork(data[0]);
    renderEducation(data[1]);
    renderAchievements(data[2]);
    renderContact(data[3]);
    renderGoals(data[4]);
  } catch (err) {
    const errBox = document.createElement("section");
    errBox.className = "section-block";
    errBox.innerHTML = `<h2>Error</h2><p class="meta">${err.message}</p>`;
    document.querySelector("main").prepend(errBox);
  }
}

init();
