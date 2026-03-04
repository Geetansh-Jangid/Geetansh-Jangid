const portfolioData = {
  work: [
    {
      title: "AI Productivity Assistant",
      role: "Full-Stack Developer",
      timeline: "2025 • Personal Build",
      points: [
        "Designed a conversational workflow for task planning and note synthesis.",
        "Integrated LLM-based summarization with context-aware prompting.",
        "Built modular UI widgets to speed up experimentation with features."
      ]
    },
    {
      title: "Creative Studio Landing Experience",
      role: "Frontend Engineer",
      timeline: "2024 • Freelance",
      points: [
        "Crafted a motion-rich responsive interface with accessibility-first structure.",
        "Used componentized data patterns so content updates do not require layout rewrites.",
        "Improved Lighthouse performance through optimized assets and CSS strategy."
      ]
    },
    {
      title: "Automation Toolkit",
      role: "Scripting & Automation",
      timeline: "2024 • Developer Toolkit",
      points: [
        "Built reusable scripts for repetitive dev workflows and reporting.",
        "Reduced manual QA time by standardizing checks and project conventions.",
        "Maintained clear docs so teammates can extend the toolkit quickly."
      ]
    }
  ],
  education: [
    {
      institution: "Bachelor's in Computer Science",
      place: "Jaipur, India",
      timeline: "2022 – 2026",
      details: "Focused on software engineering, intelligent systems, and human-centric product development."
    },
    {
      institution: "Senior Secondary (Science)",
      place: "Rajasthan",
      timeline: "2020 – 2022",
      details: "Built a strong base in mathematics, logic, and computational thinking."
    }
  ],
  achievements: [
    {
      title: "Hackathon Finalist",
      meta: "National Innovation Sprint • 2025",
      description: "Developed an AI-first solution shortlisted among top teams for usability and implementation quality."
    },
    {
      title: "Open Source Contributor",
      meta: "Community Projects • Ongoing",
      description: "Contributed fixes and enhancements across tooling and frontend repositories."
    },
    {
      title: "Certified in Modern Web Development",
      meta: "Professional Learning Track",
      description: "Completed advanced coursework in JavaScript architecture, APIs, and performance optimization."
    }
  ]
};

function createWorkCard(item) {
  const listItems = item.points.map((point) => `<li>${point}</li>`).join("");
  return `
    <article class="card glass">
      <h3>${item.title}</h3>
      <p class="meta">${item.role} • ${item.timeline}</p>
      <ul>${listItems}</ul>
    </article>
  `;
}

function createAchievementCard(item) {
  return `
    <article class="card glass">
      <h3>${item.title}</h3>
      <p class="meta">${item.meta}</p>
      <p>${item.description}</p>
    </article>
  `;
}

function createEducationItem(item) {
  return `
    <article class="timeline-item glass">
      <h3>${item.institution}</h3>
      <p class="meta">${item.place} • ${item.timeline}</p>
      <p>${item.details}</p>
    </article>
  `;
}

function renderPortfolioSections() {
  const workGrid = document.getElementById("work-grid");
  const achievementGrid = document.getElementById("achievement-grid");
  const educationTimeline = document.getElementById("education-timeline");

  workGrid.innerHTML = portfolioData.work.map(createWorkCard).join("");
  achievementGrid.innerHTML = portfolioData.achievements.map(createAchievementCard).join("");
  educationTimeline.innerHTML = portfolioData.education.map(createEducationItem).join("");
}

function runTerminalIntro() {
  const output = document.getElementById("terminal-output");
  const lines = [
    "> booting personal brand engine...",
    "> loading modules: work.js, education.js, achievements.js",
    "> theme: amoled-black + glassmorphism + grain",
    "> status: ready for meaningful collaborations ✨"
  ];

  let lineIndex = 0;
  output.innerHTML = "";

  const interval = setInterval(() => {
    if (lineIndex >= lines.length) {
      clearInterval(interval);
      return;
    }

    output.innerHTML += `${lines[lineIndex]}<br/>`;
    lineIndex += 1;
  }, 650);
}

function setYear() {
  const year = document.getElementById("year");
  year.textContent = new Date().getFullYear();
}

renderPortfolioSections();
runTerminalIntro();
setYear();
