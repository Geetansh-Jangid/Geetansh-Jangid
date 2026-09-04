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

const MANIFEST_PATH = "data/files.json";

const KNOWN_KEYS = new Set([
  "title", "role", "timeline", "summary", "links",
  "institution", "location", "details",
  "meta", "status", "month", "description",
  "type", "value", "label", "icon",
  "name", "target", "tags", "more_info"
]);

function parseDataFile(text) {
  const record = {};
  const lines = text.split("\n");
  let activeListKey = null;

  lines.forEach((lineRaw) => {
    const line = lineRaw.trim();
    if (!line) return;

    const firstColonIndex = line.indexOf(":");
    const isNewKey = firstColonIndex !== -1 && KNOWN_KEYS.has(line.slice(0, firstColonIndex).trim().toLowerCase());

    if (activeListKey && !isNewKey) {
      const item = line.startsWith("- ") ? line.slice(2).trim() : line;
      record[activeListKey].push(item);
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
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function isSafeUrl(href) {
  return /^(https?:\/\/|mailto:)/i.test(href);
}

const moreInfoRegistry = {};
let moreInfoCounter = 0;

function renderMoreInfoTrigger(title, info) {
  const list = Array.isArray(info) ? info.filter(Boolean) : [info].filter(Boolean);
  if (list.length === 0) return null;
  const id = `mi-${moreInfoCounter++}`;
  moreInfoRegistry[id] = { title: title || "", info: list };
  return `<button type="button" class="more-link" data-more-id="${id}">More</button>`;
}

function setupMoreInfoModal() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-card">
      <button type="button" class="modal-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      <h3 id="modal-title"></h3>
      <div id="modal-body"></div>
    </div>`;
  document.body.appendChild(overlay);

  const titleEl = overlay.querySelector("#modal-title");
  const bodyEl = overlay.querySelector("#modal-body");

  function openModal(title, info) {
    titleEl.textContent = title;
    bodyEl.innerHTML = info.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
    overlay.classList.add("open");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    overlay.classList.remove("open");
    document.body.classList.remove("modal-open");
  }

  overlay.querySelector(".modal-close").addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".more-link");
    if (!btn) return;
    const data = moreInfoRegistry[btn.dataset.moreId];
    if (data) openModal(data.title, data.info);
  });
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

function renderLinksRow(links, moreTrigger) {
  const linkEntries = Array.isArray(links) ? links : [];
  const parsed = linkEntries.map((entry) => {
    const idx = entry.indexOf(":");
    if (idx === -1) return null;
    const label = entry.slice(0, idx).trim();
    const url = entry.slice(idx + 1).trim();
    const href = isSafeUrl(url) ? url : "#";
    return { isGithub: label.toLowerCase().includes("github"), html: `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>` };
  }).filter(Boolean);

  if (moreTrigger) {
    const githubIdx = parsed.findIndex((p) => p.isGithub);
    const insertAt = githubIdx === -1 ? parsed.length : githubIdx;
    parsed.splice(insertAt, 0, { isGithub: false, html: moreTrigger });
  }

  if (parsed.length === 0) return "";
  return `<p class="links">${parsed.map((p) => p.html).join(' <span class="sep">|</span> ')}</p>`;
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
          ${renderLinksRow(item.links, renderMoreInfoTrigger(item.title, item.more_info))}
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
        ${renderLinksRow(item.links, renderMoreInfoTrigger(item.institution, item.more_info))}
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
        ${renderLinksRow(item.links, renderMoreInfoTrigger(item.title, item.more_info))}
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
          ${renderLinksRow(null, renderMoreInfoTrigger(label, item.more_info))}
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
          ${renderLinksRow(null, renderMoreInfoTrigger(item.title, item.more_info))}
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
  const isLight = document.documentElement.classList.contains("light");
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

  navLinks.querySelectorAll("a").forEach((a) => a.setAttribute("data-text", a.textContent));

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
    if (window.innerWidth > 1045) setOpen(false);
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
  const title = document.getElementById("site-title");
  if (!header || !title) return;

  let currentText = title.textContent;
  const fullName = title.textContent;
  const shortName = "</>";

  const morphText = (target) => {
    if (currentText === target) return;
    currentText = target;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      title.textContent = target;
      return;
    }

    const minSteps = 18;
    const steps = Math.max(minSteps, Math.floor(target.length * 1.5));
    let step = 0;

    const interval = setInterval(() => {
      if (step >= steps) {
        clearInterval(interval);
        title.textContent = target;
        return;
      }

      const progress = step / steps;
      const chars = "!<>-_\\/[]{}—=+*^?#";

      title.textContent = target
        .split("")
        .map((char, i) => {
          if (i < progress * target.length) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");

      step++;
    }, 25);
  };

  const onScroll = () => {
    const scrolled = window.scrollY > 40;
    header.classList.toggle("scrolled", scrolled);
    morphText(scrolled ? shortName : fullName);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function setupNavHighlight() {
  document.querySelectorAll('.nav-links a[href^="#"], .heading-link[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      if (!section) return;

      const heading = section.querySelector('h2');
      if (heading) {
        const headingLink = heading.querySelector('.heading-link');
        const targetEl = headingLink || heading;
        const originalText = targetEl.textContent;
        scrambleText(targetEl, originalText, 650);
      }

      section.classList.remove('section-highlight');
      void section.offsetWidth;
      section.classList.add('section-highlight');
      section.addEventListener('animationend', () => {
        section.classList.remove('section-highlight');
      }, { once: true });
    });
  });
}

function buildSkillsDataset(records) {
  const map = {};
  const order = [];

  records.forEach((r) => {
    const slug = r._path.split("/").pop().replace(/\.txt$/, "").toLowerCase();
    map[slug] = {
      name: r.name,
      target: r.target,
      meta: r.meta,
      desc: r.description,
      tags: Array.isArray(r.tags) ? r.tags : [r.tags].filter(Boolean)
    };
    order.push(slug);
  });

  const chipOrder = order.filter((k) => k !== "all");
  return { map, chipOrder };
}

function scrambleText(element, finalString, duration = 280) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    element.textContent = finalString;
    return;
  }
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  const length = finalString.length;
  let iteration = 0;
  const totalIterations = Math.max(6, Math.floor(duration / 25));
  clearInterval(element._scrambleTimer);

  element._scrambleTimer = setInterval(() => {
    element.textContent = finalString
      .split("")
      .map((char, index) => {
        if (index < (iteration / totalIterations) * length) {
          return char;
        }
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");

    iteration++;
    if (iteration > totalIterations) {
      clearInterval(element._scrambleTimer);
      element.textContent = finalString;
    }
  }, 25);
}

function setupSkillsDeck(skillsData) {
  const deck = document.getElementById("skills");
  const chipsRow = document.getElementById("skills-chips-row");
  if (!deck || !chipsRow || !skillsData) return;

  const { map, chipOrder } = skillsData;
  const targetEl = document.getElementById("inspector-target");
  const descEl = document.getElementById("inspector-desc");
  const tagsEl = document.getElementById("inspector-tags");

  chipsRow.innerHTML = chipOrder.map((key) => {
    return `<button type="button" class="skill-chip mono" data-skill="${escapeHtml(key)}" data-name="${escapeHtml(map[key].name)}">${escapeHtml(map[key].name)}</button>`;
  }).join("");

  const chips = chipsRow.querySelectorAll(".skill-chip");

  function selectSkill(key, chipEl, opts = {}) {
    const data = map[key];
    if (!data) return;

    chips.forEach((c) => c.classList.remove("active"));
    if (chipEl) chipEl.classList.add("active");

    if (targetEl) {
      if (opts.silent) targetEl.textContent = data.target;
      else scrambleText(targetEl, data.target, 220);
    }
    if (descEl) {
      if (opts.silent) {
        descEl.textContent = data.desc;
      } else {
        descEl.style.opacity = "0";
        setTimeout(() => {
          descEl.textContent = data.desc;
          descEl.style.opacity = "1";
        }, 150);
      }
    }
    if (tagsEl) {
      tagsEl.innerHTML = data.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
    }
  }

  chips.forEach((chip) => {
    const skillKey = chip.dataset.skill;
    const name = chip.dataset.name || chip.textContent;

    chip.addEventListener("mouseenter", () => {
      if (!chip.classList.contains("active")) scrambleText(chip, name, 180);
    });

    chip.addEventListener("click", () => selectSkill(skillKey, chip));
  });

  selectSkill(chipOrder[0], chips[0], { silent: true });
}

async function init() {
  setupThemeToggle();
  setupMobileMenu();
  setupHeaderHeightVar();
  setupScrollHeader();
  setupNavHighlight();
  setupMoreInfoModal();
  try {
    const sections = ["skills", "work", "experience", "goals", "education", "achievements", "contact"];
    const manifest = await readManifest();
    const fileLists = await Promise.all(sections.map(s => getSectionFiles(s, manifest)));
    const data = await Promise.all(sections.map((s, i) => loadSection(s, fileLists[i])));

    requestAnimationFrame(() => {
      setupSkillsDeck(buildSkillsDataset(data[0]));
      renderCardList("work-grid", data[1].sort((a, b) => parseTimelineYear(b.timeline) - parseTimelineYear(a.timeline)));
      renderCardList("experience-grid", data[2].sort((a, b) => parseTimelineYear(b.timeline) - parseTimelineYear(a.timeline)));
      renderGoals(data[3]);
      renderEducation(data[4].sort((a, b) => parseTimelineYear(b.timeline) - parseTimelineYear(a.timeline)));
      renderAchievements(data[5].sort((a, b) => parseMetaYear(b.meta) - parseMetaYear(a.meta)));
      renderContact(data[6]);
    });
  } catch (err) {
    const errBox = document.createElement("section");
    errBox.className = "section-block";
    errBox.innerHTML = `<h2>Error</h2><p class="meta">${escapeHtml(err.message)}</p>`;
    document.querySelector("main").prepend(errBox);
  }
}

init();
