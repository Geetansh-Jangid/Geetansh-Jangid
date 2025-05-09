$(document).ready(function() {
    // --- Global Variables & Elements ---
    const blob = document.getElementById("blob");
    const changingTextElement = document.getElementById("changing-text");
    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('#navbar ul');
    const allPages = document.querySelectorAll('.page');

    // --- Initial Page Setup ---
    // Handled by handleInitialLoad later

    // --- Hero Section Animations ---
    if (document.getElementById('home')) { // Only run if home section exists
        if (blob) {
            window.onpointermove = event => {
                const { clientX, clientY } = event;
                blob.animate({
                    left: `${clientX}px`,
                    top: `${clientY}px`
                }, { duration: 3000, fill: "forwards" });
            };
        }

        if (changingTextElement) {
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const words = ["PROGRAMMER", "DEVELOPER", "CREATOR", "LEARNER", "AI GEEK"];
            let wordIndex = 0;
            let intervalTextEffect;

            function startTextAnimation() {
                let iteration = 0;
                clearInterval(intervalTextEffect);
                if (!words[wordIndex]) return;

                intervalTextEffect = setInterval(() => {
                    if (!changingTextElement) {
                        clearInterval(intervalTextEffect);
                        return;
                    }
                    changingTextElement.innerText = words[wordIndex]
                        .split("")
                        .map((letter, index) => {
                            if (index < iteration) {
                                return words[wordIndex][index];
                            }
                            return letters[Math.floor(Math.random() * 26)];
                        })
                        .join("");

                    if (iteration >= words[wordIndex].length) {
                        clearInterval(intervalTextEffect);
                        setTimeout(() => {
                            wordIndex = (wordIndex + 1) % words.length;
                            startTextAnimation();
                        }, 2000);
                    }
                    iteration += 1 / 1.5;
                }, 60);
            }
            startTextAnimation();
        }
    }


    // --- IDE Theme Specific Functions ---
    function generateLineNumbers(ideSection) {
        const codeArea = ideSection.querySelector('.ide-code-area code');
        const lineNumbersDiv = ideSection.querySelector('.line-numbers');

        if (codeArea && lineNumbersDiv) {
            // Get the raw text content to count lines accurately
            const rawText = codeArea.textContent || codeArea.innerText;
            const lines = rawText.split('\n');
            // Ensure the last line is counted if it's not empty,
            // or if the content is a single line without a newline
            const lineCount = (lines.length === 1 && lines[0] === "") ? 0 : lines.length;


            lineNumbersDiv.innerHTML = ''; // Clear existing numbers
            for (let i = 1; i <= lineCount; i++) {
                const span = document.createElement('span');
                span.textContent = i;
                lineNumbersDiv.appendChild(span);
            }
        }
    }

    function updateActiveTab(ideSection, sectionId) {
        const fileHeader = ideSection.querySelector('.ide-file-header');
        if (!fileHeader) return;

        const tabs = fileHeader.querySelectorAll('.ide-tab');
        tabs.forEach(tab => tab.classList.remove('active'));

        // Derive tab text from sectionId or a mapping
        let tabText = "";
        switch (sectionId) {
            case "introduction": tabText = "about_me.md"; break;
            case "skills": tabText = "skills_config.json"; break;
            case "work": tabText = "projects_gallery.jsx"; break;
            case "certificates": tabText = "credentials.env"; break;
            default: tabText = "untitled";
        }

        let activeTab = fileHeader.querySelector(`.ide-tab[data-tab-id="${sectionId}"]`);
        // If no specific tab with data-tab-id, find the first one and update its text
        if (!activeTab) {
            activeTab = fileHeader.querySelector('.ide-tab');
            if (activeTab) {
                activeTab.textContent = tabText;
            }
        }
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    function updateStatusBar(ideSection, lines = 1, cols = 1) {
        const statusBar = ideSection.querySelector('.ide-status-bar .ide-line-col');
        if (statusBar) {
            const lineCount = ideSection.querySelector('.line-numbers')?.children.length || lines;
            statusBar.textContent = `Ln ${lineCount}, Col ${cols}`; // Simple mock
        }
    }


    // --- Page Navigation Logic ---
    window.navigateToSection = function(sectionId) {
        allPages.forEach(page => {
            if (page.id === sectionId) {
                page.style.display = 'flex'; // Or 'block' if that's your layout for .page
                if (page.classList.contains('ide-section')) {
                    generateLineNumbers(page);
                    updateActiveTab(page, sectionId);
                    updateStatusBar(page);
                }
            } else {
                page.style.display = 'none';
            }
        });

        const currentPath = window.location.pathname.substring(1).toLowerCase().replace(/\/$/, "").replace(/index\.html$/, "");
        const newPath = (sectionId === "home" || sectionId === "") ? "" : sectionId;

        if (currentPath !== newPath) {
            history.pushState({ section: sectionId }, `Geetansh - ${sectionId}`, `/${newPath}`);
        } else if (currentPath === "" && newPath === "" && (window.location.pathname !== "/" && window.location.pathname !== "/index.html")) {
             history.replaceState({ section: sectionId }, `Geetansh - ${sectionId}`, `/`);
        }

        updateNavbarVisibility();
        window.scrollTo(0, 0); // Scroll to top of new page
    }

    function handleInitialLoad() {
        let path = window.location.pathname.substring(1).toLowerCase();
        path = path.replace(/\/$/, "").replace(/index\.html$/, ""); // Clean path

        if (path && path !== "index.html") {
            navigateToSection(path);
        } else {
            navigateToSection("home");
        }
    }

    window.onpopstate = function(event) {
        if (event.state && event.state.section) {
            navigateToSection(event.state.section);
        } else {
            let path = window.location.pathname.substring(1).toLowerCase();
            path = path.replace(/\/$/, "").replace(/index\.html$/, "");
            if (path && path !== "index.html") {
                navigateToSection(path);
            } else {
                navigateToSection("home");
            }
        }
    };

    // --- Navbar Logic ---
    function updateNavbarVisibility() {
        if (!navbar) return;
        const homePage = document.getElementById('home');
        // Ensure homePage exists and check its computed style for visibility
        const isHomeVisible = homePage && getComputedStyle(homePage).display !== 'none';

        if (window.scrollY > 10 || !isHomeVisible) {
            navbar.classList.add('visible');
        } else {
            navbar.classList.remove('visible');
        }
    }

    if (navbar) {
        window.addEventListener('scroll', updateNavbarVisibility);
        updateNavbarVisibility(); // Initial check
    }

    document.querySelectorAll('#navbar a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            navigateToSection(targetId);

            if (navLinks && navLinks.classList.contains('show')) {
                navLinks.classList.remove('show');
                if (hamburger) hamburger.classList.remove('active');
            }
        });
    });

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            hamburger.classList.toggle('active');
        });
    }

    // --- Resume Download ---
    window.downloadPDF = function() { // Make it globally accessible
        const link = document.createElement('a');
        link.href = './resume.pdf'; // **UPDATE THIS PATH if your resume is elsewhere**
        link.download = 'Geetansh_Jangid_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- Initialize ---
    handleInitialLoad();

    // Generate line numbers for any initially visible IDE section (if not home)
    allPages.forEach(page => {
        if (getComputedStyle(page).display !== 'none' && page.classList.contains('ide-section')) {
            generateLineNumbers(page);
            updateActiveTab(page, page.id);
            updateStatusBar(page);
        }
    });

}); // End of $(document).ready
