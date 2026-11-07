const sectionConfig = {
  skills: {
    path: "data/skills/",
    requiredKeys: ["name", "target", "meta", "description", "tags"]
  },
  work: {
    path: "data/work/",
    requiredKeys: ["title", "role", "timeline", "summary"]
  },
  experience: {
    path: "data/experience/",
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

const MANIFEST_PATH = "/data/files.json";
const INFO_PATH = "/data/info.txt";
const DEFAULT_SOURCE = "https://github.com/Geetansh-Jangid/Geetansh-Jangid";

const KNOWN_KEYS = new Set([
  "title", "role", "timeline", "summary", "links",
  "institution", "location", "details",
  "meta", "status", "month", "description",
  "type", "value", "label", "icon",
  "name", "target", "tags", "more_info",
  "source", "tagline"
]);

let sourceUrl = DEFAULT_SOURCE;

function parseDataFile(text) {
  const record = {};
  const lines = text.split("\n");
  let activeListKey = null;

  lines.forEach((lineRaw) => {
    const isIndented = /^\s+/.test(lineRaw);
    const line = lineRaw.trim();
    if (!line) return;

    if (line.startsWith("- ")) {
      if (activeListKey) {
        record[activeListKey].push(line.slice(2).trim());
      }
      return;
    }

    if (isIndented && activeListKey) {
      record[activeListKey].push(line);
      return;
    }

    const firstColonIndex = line.indexOf(":");
    const potentialKey = firstColonIndex !== -1 ? line.slice(0, firstColonIndex).trim().toLowerCase() : null;
    const isNewKey = potentialKey && KNOWN_KEYS.has(potentialKey);

    if (activeListKey && !isNewKey) {
      record[activeListKey].push(line);
      return;
    }

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

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeUrl(href) {
  return /^(https?:\/\/|mailto:)/i.test(href);
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

function lowercase(value) {
  return (value || "").toLowerCase();
}

function parseTimelineYear(timeline) {
  if (!timeline) return 0;
  const match = timeline.match(/(\d{4})\s*-\s*(\d{2,4})/);
  if (!match) return 0;
  let endYear = parseInt(match[2]);
  if (endYear < 100) endYear += 2000;
  return endYear;
}

function parseMetaYear(meta) {
  if (!meta) return 0;
  const match = meta.match(/(\d{4})/);
  return match ? parseInt(match[1]) : 0;
}

async function readManifest() {
  try {
    const response = await fetch(MANIFEST_PATH);
    return response.ok ? await response.json() : null;
  } catch (err) {
    return null;
  }
}

async function loadInfo() {
  try {
    const response = await fetch(INFO_PATH);
    if (!response.ok) return null;
    return parseDataFile(await response.text());
  } catch (err) {
    return null;
  }
}

function applySiteMeta(record) {
  if (!record) return;

  if (record.tagline) {
    const lede = document.getElementById("hero-lede");
    if (lede) lede.textContent = record.tagline;
  }

  if (record.source && isSafeUrl(record.source)) {
    sourceUrl = record.source;
  }
}

async function getSectionFiles(sectionName, manifest) {
  if (manifest && Array.isArray(manifest[sectionName]) && manifest[sectionName].length > 0) {
    return manifest[sectionName];
  }
  return [];
}

async function loadSection(sectionName, files) {
  const config = sectionConfig[sectionName];
  const items = await Promise.all(
    files.map(async (path) => {
      try {
        const response = await fetch(path.startsWith("/") ? path : `/${path}`);
        if (!response.ok) return null;
        const record = parseDataFile(await response.text());
        record._path = path;
        return hasTemplateShape(record, config.requiredKeys) ? record : null;
      } catch (err) {
        return null;
      }
    })
  );
  return items.filter(Boolean);
}

function parseLinkEntries(links) {
  return asArray(links)
    .map((entry) => {
      const separator = entry.indexOf(":");
      if (separator === -1) return null;
      const label = entry.slice(0, separator).trim();
      const url = entry.slice(separator + 1).trim();
      if (!label || !isSafeUrl(url)) return null;
      return { label, url };
    })
    .filter(Boolean);
}

const PRODUCT_LINK_LABELS = new Set([
  "website", "live", "demo", "product", "app", "site", "preview", "web"
]);

function productHref(links) {
  const entries = parseLinkEntries(links);
  const product = entries.find((entry) => PRODUCT_LINK_LABELS.has(entry.label.toLowerCase()));
  return product ? product.url : "";
}

function renderLinks(links, excludeUrl = "") {
  let entries = parseLinkEntries(links);
  if (excludeUrl) {
    const remaining = entries.filter((entry) => entry.url !== excludeUrl);
    if (remaining.length > 0) {
      entries = remaining;
    }
  }
  if (entries.length === 0) return "";

  return entries
    .map((entry) => {
      const href = escapeHtml(entry.url);
      const external = /^https?:\/\//i.test(entry.url);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${href}"${attrs}>${escapeHtml(entry.label.toLowerCase())} <span class="arrow" aria-hidden="true">↗</span></a>`;
    })
    .join('<span class="sep" aria-hidden="true">·</span>');
}

function renderMoreInfo(info) {
  const entries = asArray(info);
  if (entries.length === 0) return "";

  return `
    <details class="entry-more">
      <summary>more</summary>
      <div class="entry-more-body">
        ${entries.map((entry) => `<p>${escapeHtml(entry)}</p>`).join("")}
      </div>
    </details>`;
}

function renderEntryFoot(links, moreInfo, excludeUrl = "") {
  const linksHtml = renderLinks(links, excludeUrl);
  const moreHtml = renderMoreInfo(moreInfo);
  if (!linksHtml && !moreHtml) return "";

  return `<div class="entry-foot">
    ${linksHtml ? `<div class="entry-links">${linksHtml}</div>` : ""}
    ${moreHtml}
  </div>`;
}

function renderWork(items, targetId, { withRole = false } = {}) {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = items
    .map((item) => {
      const href = productHref(item.links);
      const title = escapeHtml(item.title);
      const titleHtml = href
        ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${title}</a>`
        : title;
      const metaParts = withRole
        ? [lowercase(item.role), lowercase(item.timeline)]
        : [lowercase(item.timeline)];
      const meta = metaParts.filter(Boolean).join(" · ");
      const summary = asArray(item.summary).join(" ");

      return `
        <article class="entry">
          <div class="entry-row">
            <h3 class="entry-title">${titleHtml}</h3>
            ${meta ? `<span class="entry-meta">${escapeHtml(meta)}</span>` : ""}
          </div>
          ${summary ? `<p class="entry-summary">${escapeHtml(summary)}</p>` : ""}
          ${renderEntryFoot(item.links, item.more_info, href)}
        </article>`;
    })
    .join("");
}

function getStatusClass(status) {
  const value = lowercase(status);
  if (value.includes("progress")) return "status-progress";
  if (value.includes("done") || value.includes("complete")) return "status-done";
  if (value.includes("not started") || value.includes("pending")) return "status-pending";
  return "";
}

function renderGoals(items) {
  const target = document.getElementById("goals-list");
  if (!target) return;

  target.innerHTML = items
    .map((item) => {
      const status = lowercase(item.status);
      const statusClass = getStatusClass(item.status);
      const meta = [
        lowercase(item.month),
        status ? `<span class="${statusClass}">${escapeHtml(status)}</span>` : ""
      ].filter(Boolean).join(" · ");

      return `
        <article class="entry">
          <div class="entry-row">
            <h3 class="entry-title">${escapeHtml(item.title)}</h3>
            ${meta ? `<span class="entry-meta">${meta}</span>` : ""}
          </div>
          <p class="entry-summary">${escapeHtml(item.description)}</p>
          ${renderEntryFoot(null, item.more_info)}
        </article>`;
    })
    .join("");
}

function renderEducation(items) {
  const target = document.getElementById("education-list");
  if (!target) return;

  target.innerHTML = items
    .map((item) => {
      const meta = [lowercase(item.location), lowercase(item.timeline)]
        .filter(Boolean)
        .join(" · ");

      return `
        <article class="entry">
          <div class="entry-row">
            <h3 class="entry-title">${escapeHtml(item.institution)}</h3>
            ${meta ? `<span class="entry-meta">${escapeHtml(meta)}</span>` : ""}
          </div>
          <p class="entry-summary">${escapeHtml(item.details)}</p>
          ${renderEntryFoot(item.links, item.more_info)}
        </article>`;
    })
    .join("");
}

function renderAchievements(items) {
  const target = document.getElementById("achievements-list");
  if (!target) return;

  target.innerHTML = items
    .map((item) => `
      <article class="entry">
        <div class="entry-row">
          <h3 class="entry-title">${escapeHtml(item.title)}</h3>
          <span class="entry-meta">${escapeHtml(lowercase(item.meta))}</span>
        </div>
        <p class="entry-summary">${escapeHtml(item.description)}</p>
        ${renderEntryFoot(item.links, item.more_info)}
      </article>`)
    .join("");
}

function buildSkills(records) {
  return records.map((record) => ({
    key: record._path.split("/").pop().replace(/\.txt$/, "").toLowerCase(),
    name: lowercase(record.name),
    description: record.description,
    tags: asArray(record.tags)
  }));
}

function setupSkills(records) {
  const nav = document.getElementById("skills-nav");
  const panel = document.getElementById("skill-panel");
  const desc = document.getElementById("skill-desc");
  const tags = document.getElementById("skill-tags");
  if (!nav || !panel || !desc || !tags) return;

  const skills = buildSkills(records);
  if (skills.length === 0) return;

  nav.innerHTML = skills
    .map((skill, index) => `
      <button
        type="button"
        role="tab"
        id="skill-tab-${index}"
        class="skill-tab"
        data-index="${index}"
        aria-selected="false"
        tabindex="-1"
      >${escapeHtml(skill.name)}</button>`)
    .join("");

  const tabs = Array.from(nav.querySelectorAll(".skill-tab"));

  function selectSkill(index, { focus = false } = {}) {
    const skill = skills[index];
    if (!skill) return;

    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.setAttribute("tabindex", active ? "0" : "-1");
    });

    panel.setAttribute("aria-labelledby", `skill-tab-${index}`);
    desc.textContent = skill.description;
    tags.textContent = skill.tags.join(" · ");

    if (focus) tabs[index].focus();
  }

  tabs.forEach((tab) => {
    const index = Number(tab.dataset.index);

    tab.addEventListener("click", () => selectSkill(index));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        selectSkill(nextIndex, { focus: true });
      }
    });
  });

  selectSkill(0);
}

function renderFooter(contactItems) {
  const nav = document.getElementById("footer-links");
  if (!nav) return;

  const links = contactItems
    .map((item) => {
      const type = lowercase(item.type);
      const isEmail = type.includes("email");
      const href = isEmail ? `mailto:${item.value}` : item.value;
      if (!isSafeUrl(href)) return "";

      const attrs = isEmail ? "" : ' target="_blank" rel="noopener noreferrer"';
      const label = type || lowercase(item.label) || "contact";
      return `<a href="${escapeHtml(href)}"${attrs}>${escapeHtml(label)}</a>`;
    })
    .filter(Boolean);

  links.push(`<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">source</a>`);

  nav.innerHTML = links.join("");
}

function setupThemeToggle() {
  const button = document.getElementById("theme-toggle");
  const favicon = document.getElementById("site-favicon");

  function applyTheme(theme, persist = false) {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.dataset.theme = theme;

    if (button) {
      button.setAttribute(
        "aria-label",
        theme === "dark" ? "switch to light theme" : "switch to dark theme"
      );
    }

    if (favicon) {
      favicon.href = theme === "light" ? "/logo-light.svg" : "/logo-dark.svg";
    }

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute("content", theme === "light" ? "#F7F7F4" : "#14120B");
    }

    if (persist) {
      try {
        localStorage.setItem("theme", theme);
      } catch (err) {
        /* storage unavailable */
      }
    }
  }

  applyTheme(document.documentElement.classList.contains("light") ? "light" : "dark");

  if (button) {
    button.addEventListener("click", () => {
      const current = document.documentElement.classList.contains("light") ? "light" : "dark";
      applyTheme(current === "dark" ? "light" : "dark", true);
    });
  }
}

function revealSection(id) {
  const section = document.getElementById(id);
  if (section) section.hidden = false;
}

function setupSubtitleAnimation() {
  const container = document.getElementById("site-subtitle");
  if (!container) return;

  const slot = container.querySelector(".subtitle-slot") || container;
  const words = [
    "developer",
    "hacker",
    "engineer",
    "ai geek",
    "researcher",
    "builder"
  ];

  let currentIndex = 0;
  let isAnimating = false;
  let intervalId = null;

  let currentSpan = slot.querySelector(".subtitle-word");
  if (!currentSpan) {
    currentSpan = document.createElement("span");
    currentSpan.className = "subtitle-word";
    currentSpan.textContent = words[0];
    slot.appendChild(currentSpan);
  }

  function cycleNext() {
    if (isAnimating) return;
    if (document.hidden) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      currentIndex = (currentIndex + 1) % words.length;
      const word = words[currentIndex];
      currentSpan.textContent = word;
      container.setAttribute("aria-label", `${word}, enthusiast`);
      return;
    }

    isAnimating = true;
    currentIndex = (currentIndex + 1) % words.length;
    const nextWord = words[currentIndex];

    const prevWidth = currentSpan.offsetWidth;
    slot.style.width = `${prevWidth}px`;

    const nextSpan = document.createElement("span");
    nextSpan.className = "subtitle-word subtitle-incoming";
    nextSpan.textContent = nextWord;
    slot.appendChild(nextSpan);

    const nextWidth = nextSpan.offsetWidth;

    requestAnimationFrame(() => {
      slot.style.width = `${nextWidth}px`;
      currentSpan.style.opacity = "0";
      nextSpan.style.opacity = "1";
    });

    container.setAttribute("aria-label", `${nextWord}, enthusiast`);

    setTimeout(() => {
      currentSpan.remove();
      nextSpan.classList.remove("subtitle-incoming");
      nextSpan.style.position = "";
      nextSpan.style.top = "";
      nextSpan.style.left = "";
      nextSpan.style.opacity = "";
      slot.style.width = "auto";
      currentSpan = nextSpan;
      isAnimating = false;
    }, 420);
  }

  function start() {
    stop();
    intervalId = setInterval(cycleNext, 3800);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  start();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });
}

async function init() {
  setupThemeToggle();
  setupSubtitleAnimation();

  const info = await loadInfo();
  applySiteMeta(info);

  try {
    const sections = ["skills", "work", "experience", "goals", "education", "achievements", "contact"];
    const manifest = await readManifest();
    const fileLists = await Promise.all(sections.map((section) => getSectionFiles(section, manifest)));
    const data = await Promise.all(sections.map((section, index) => loadSection(section, fileLists[index])));

    const [skills, work, experience, goals, education, achievements, contact] = data;

    setupSkills(skills);
    renderWork(
      [...work].sort((a, b) => parseTimelineYear(b.timeline) - parseTimelineYear(a.timeline)),
      "work-list"
    );
    renderWork(
      [...experience].sort((a, b) => parseTimelineYear(b.timeline) - parseTimelineYear(a.timeline)),
      "experience-list",
      { withRole: true }
    );
    renderGoals(goals);
    renderEducation(
      [...education].sort((a, b) => parseTimelineYear(b.timeline) - parseTimelineYear(a.timeline))
    );
    renderAchievements(
      [...achievements].sort((a, b) => parseMetaYear(b.meta) - parseMetaYear(a.meta))
    );
    renderFooter(contact);

    if (work.length > 0) revealSection("work");
    if (skills.length > 0) revealSection("skills");
    if (experience.length > 0) revealSection("experience");
    if (goals.length > 0) revealSection("goals");
    if (education.length > 0) revealSection("education");
    if (achievements.length > 0) revealSection("achievements");
  } catch (err) {
    const message = document.createElement("p");
    message.className = "lede";
    message.textContent = `could not load content: ${err.message}`;
    document.getElementById("main")?.appendChild(message);
  }
}

init();
