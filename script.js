const sectionConfig = {
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

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function isSafeUrl(href) {
  return /^(https?:\/\/|mailto:)/i.test(href);
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

function resolveRelativePath(basePath, href) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    const url = new URL(href);
    return `${url.pathname}${url.search}`.replace(/^\//, "");
  }
  if (href.startsWith("/")) {
    return href.replace(/^\//, "");
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
      .filter((href) => href && href.endsWith(".txt") && !href.endsWith("template.txt"))
      .map((href) => resolveRelativePath(basePath, href));
    return [...new Set(files)].sort((a, b) => a.localeCompare(b));
  } catch (err) {
    return [];
  }
}

async function getSectionFiles(sectionName, manifest) {
  const discovered = await discoverSectionFilesFromDirectory(sectionConfig[sectionName].path);
  if (discovered.length > 0) return discovered;
  if (manifest && manifest[sectionName] && manifest[sectionName].length > 0) {
    return manifest[sectionName];
  }
  return [];
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

function getStatusClass(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("progress")) return "status-progress";
  if (s.includes("done") || s.includes("complete")) return "status-done";
  if (s.includes("not started") || s.includes("pending")) return "status-pending";
  return "";
}

function getGridClass(count) {
  if (count <= 1) return "grid-1";
  if (count === 2) return "grid-2";
  return "grid-3";
}

function renderCardList(targetId, items) {
  const target = document.getElementById(targetId);
  target.className = "grid";
  target.innerHTML = items.map((item) => {
    const summary = Array.isArray(item.summary) ? item.summary : [item.summary];
    return `
      <article class="card">
        <p class="meta"><span class="meta-cat">${escapeHtml(item.role)}</span><span class="meta-date">${escapeHtml(item.timeline)}</span></p>
        <div class="content-col">
          <h3>${escapeHtml(item.title)}</h3>
          <ul>${summary.map(pt => `<li>${escapeHtml(pt)}</li>`).join("")}</ul>
        </div>
      </article>`;
  }).join("");
}

function renderEducation(items) {
  const target = document.getElementById("education-timeline");
  target.className = "grid";
  target.innerHTML = items.map((item) => `
    <article class="card">
      <p class="meta"><span class="meta-cat">${escapeHtml(item.location)}</span><span class="meta-date">${escapeHtml(item.timeline)}</span></p>
      <div class="content-col">
        <h3>${escapeHtml(item.institution)}</h3>
        <p>${escapeHtml(item.details)}</p>
      </div>
    </article>`).join("");
}

function renderAchievements(items) {
  const target = document.getElementById("achievement-grid");
  target.className = "grid";
  target.innerHTML = items.map((item) => `
    <article class="card">
      <p class="meta"><span class="meta-cat">${escapeHtml(item.meta)}</span></p>
      <div class="content-col">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
      </div>
    </article>`).join("");
}

function getIconClass(iconStr) {
  if (!iconStr) {
    return { iconHtml: '', iconType: 'none' };
  }
  
  const iconId = iconStr.trim();
  const brands = ['fa-github', 'fa-github-alt', 'fa-github-square', 'fa-twitter', 'fa-twitter-square', 'fa-linkedin', 'fa-linkedin-in', 'fa-instagram', 'fa-discord', 'fa-youtube', 'fa-youtube-square', 'fa-tiktok', 'fa-snapchat', 'fa-reddit', 'fa-reddit-alien', 'fa-stack-overflow', 'fa-codepen', 'fa-gitlab', 'fa-bitbucket', 'fa-bitbucket-square', 'fa-npm', 'fa-docker', 'fa-aws', 'fa-google', 'fa-facebook', 'fa-facebook-f', 'fa-mastodon', 'fa-mysql', 'fa-postgres', 'fa-linux', 'fa-windows', 'fa-apple', 'fa-android'];
  const regulars = ['fa-envelope', 'fa-envelope-open', 'fa-file', 'fa-folder', 'fa-folder-open', 'fa-image', 'fa-user', 'fa-user-circle', 'fa-calendar', 'fa-clock', 'fa-bookmark', 'fa-star', 'fa-heart', 'fa-comment', 'fa-share-square', 'fa-book', 'fa-newspaper', 'fa-clipboard', 'fa-chart-bar', 'fa-chart-line', 'fa-map', 'fa-flag', 'fa-bell', 'fa-building', 'fa-money-bill', 'fa-credit-card', 'fa-phone', 'fa-phone-square'];
  
  if (!brands.includes(iconId) && !regulars.includes(iconId)) {
    return { iconHtml: '', iconType: 'none' };
  }
  
  const prefix = brands.includes(iconId) ? 'fa-brands' : 'fa-regular';
  const iconClass = `${prefix} ${iconId}`;
  return { iconHtml: `<i class="${iconClass}"></i>`, iconType: 'icon' };
}

function renderContact(items) {
  const target = document.getElementById("contact-grid");
  target.className = "grid";
  target.innerHTML = items.map((item) => {
    const typeLabel = item.type || '';
    const { iconHtml, iconType } = getIconClass(item.icon);
    const label = item.label || typeLabel;
    const isEmail = (typeLabel || '').toLowerCase().includes('email');
    const rawHref = isEmail ? `mailto:${item.value}` : item.value;
    const href = isSafeUrl(rawHref) ? rawHref : '#';

    return `
      <article class="card contact-card">
        <p class="meta">${iconType === 'icon' ? iconHtml : ''}${escapeHtml(typeLabel)}</p>
        <div class="content-col">
          <a href="${escapeHtml(href)}" ${isEmail ? '' : 'target="_blank" rel="noopener"'}>${escapeHtml(label)}</a>
        </div>
      </article>`;
  }).join("");
}

function renderGoals(items) {
  const target = document.getElementById("goals-container");
  target.className = "grid";
  target.innerHTML = items.length > 0
    ? items.map(item => `
      <article class="card">
        <p class="meta"><span class="badge ${getStatusClass(item.status)}">${escapeHtml(item.status)}</span></p>
        <div class="content-col">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </div>
      </article>`).join("")
    : `<p class="meta" style="padding: 1rem 0;">No goals set.</p>`;
}

function setupThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  const favicon = document.getElementById("site-favicon");
  const updateFavicon = (isLight) => {
    if (favicon) {
      favicon.href = isLight ? "./logo-light.svg" : "./logo-dark.svg";
    }
  };
  const isLight = localStorage.getItem("theme") === "light";
  if (isLight) {
    document.documentElement.classList.add("light");
  }
  btn.textContent = isLight ? "DARK" : "LIGHT";
  btn.setAttribute("aria-pressed", isLight);
  updateFavicon(isLight);
  btn.onclick = () => {
    const nowLight = document.documentElement.classList.toggle("light");
    btn.textContent = nowLight ? "DARK" : "LIGHT";
    btn.setAttribute("aria-pressed", nowLight);
    localStorage.setItem("theme", nowLight ? "light" : "dark");
    updateFavicon(nowLight);
  };
}

function setupMobileMenu() {
  const menuBtn = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const header = document.querySelector("header");
  if (!menuBtn || !navLinks || !header) return;

  const positionPanel = () => {
    navLinks.style.top = `${header.getBoundingClientRect().bottom}px`;
  };

  const setOpen = (open) => {
    if (open) positionPanel();
    navLinks.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  };

  menuBtn.addEventListener("click", () => {
    setOpen(!navLinks.classList.contains("open"));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) setOpen(false);
    else if (navLinks.classList.contains("open")) positionPanel();
  });
}

function setupHeaderHeightVar() {
  const header = document.querySelector("header");
  if (!header) return;
  const set = () => {
    document.documentElement.style.setProperty("--header-h", `${Math.ceil(header.getBoundingClientRect().height)}px`);
  };
  set();
  window.addEventListener("resize", set);
  window.addEventListener("load", set);
  if (window.ResizeObserver) {
    new ResizeObserver(set).observe(header);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(set);
  }
}

function setupScrollHeader() {
  const header = document.querySelector("header");
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function setupNavHighlight() {
  document.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      if (!section) return;
      section.classList.remove('section-highlight');
      void section.offsetWidth;
      section.classList.add('section-highlight');
      section.addEventListener('animationend', () => {
        section.classList.remove('section-highlight');
      }, { once: true });
    });
  });
}

async function init() {
  setupThemeToggle();
  setupMobileMenu();
  setupHeaderHeightVar();
  setupScrollHeader();
  setupNavHighlight();
  try {
    const sections = ["work", "experience", "goals", "education", "achievements", "contact"];
    const manifest = await readManifest();
    const fileLists = await Promise.all(sections.map(s => getSectionFiles(s, manifest)));
    const data = await Promise.all(sections.map((s, i) => loadSection(s, fileLists[i])));
    
    requestAnimationFrame(() => {
      renderCardList("work-grid", data[0].sort((a, b) => parseTimelineYear(b.timeline) - parseTimelineYear(a.timeline)));
      renderCardList("experience-grid", data[1].sort((a, b) => parseTimelineYear(b.timeline) - parseTimelineYear(a.timeline)));
      renderGoals(data[2]);
      renderEducation(data[3].sort((a, b) => parseTimelineYear(b.timeline) - parseTimelineYear(a.timeline)));
      renderAchievements(data[4].sort((a, b) => parseMetaYear(b.meta) - parseMetaYear(a.meta)));
      renderContact(data[5]);
    });
  } catch (err) {
    const errBox = document.createElement("section");
    errBox.className = "section-block";
    errBox.innerHTML = `<h2>Error</h2><p class="meta">${escapeHtml(err.message)}</p>`;
    document.querySelector("main").prepend(errBox);
  }
}

init();
