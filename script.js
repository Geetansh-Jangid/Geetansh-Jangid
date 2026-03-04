const fileMap = {
  work: [
    "data/work/ai-productivity-assistant.txt",
    "data/work/creative-studio-landing.txt",
    "data/work/automation-toolkit.txt"
  ],
  education: [
    "data/education/bachelors.txt",
    "data/education/senior-secondary.txt"
  ],
  achievements: [
    "data/achievements/hackathon-finalist.txt",
    "data/achievements/open-source-contributor.txt",
    "data/achievements/web-development-certification.txt"
  ]
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

async function loadSection(files) {
  const items = await Promise.all(
    files.map(async (path) => {
      const response = await fetch(path);
      const text = await response.text();
      return parseDataFile(text);
    })
  );

  return items;
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

function runTerminalIntro() {
  const output = document.getElementById("terminal-output");
  const lines = [
    "> loading text data modules...",
    "> mode: minimal grayscale",
    "> shape profile: boxy",
    "> status: ready"
  ];

  let index = 0;
  output.textContent = "";

  const interval = setInterval(() => {
    if (index >= lines.length) {
      clearInterval(interval);
      return;
    }

    output.textContent += `${lines[index]}\n`;
    index += 1;
  }, 420);
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

async function init() {
  const [workItems, educationItems, achievementItems] = await Promise.all([
    loadSection(fileMap.work),
    loadSection(fileMap.education),
    loadSection(fileMap.achievements)
  ]);

  renderWork(workItems);
  renderEducation(educationItems);
  renderAchievements(achievementItems);
  runTerminalIntro();
  setupThemeToggle();
  setYear();
}

init();
