$(document).ready(function() {
    // --- Global Variables & Elements ---
    const blob = document.getElementById("blob");
    const changingTextElement = document.getElementById("changing-text");
    const terminalElement = document.getElementById('terminal');
    const terminalInput = document.getElementById("command");
    const terminalOutputContainer = document.querySelector("#terminal .terminal-content"); // For scrolling
    const actualOutputDisplay = document.getElementById("output"); // Where text is appended
    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('#navbar ul');

    // --- Initial Page Setup ---
    document.querySelectorAll('.page:not(#home)').forEach(page => page.style.display = 'none');
    document.getElementById('home').style.display = 'flex';

    // --- Blob Animation ---
    if (blob) {
        window.onpointermove = event => {
            const { clientX, clientY } = event;
            blob.animate({
                left: `${clientX}px`,
                top: `${clientY}px`
            }, { duration: 3000, fill: "forwards" });
        };
    }

    // --- Changing Text Animation ---
    if (changingTextElement) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const words = ["PROGRAMMER", "DEVELOPER", "CREATOR", "LEARNER", "AI GEEK"];
        let wordIndex = 0;
        let intervalTextEffect;

        function startTextAnimation() {
            let iteration = 0;
            clearInterval(intervalTextEffect);
            if (!words[wordIndex]) return; // Safety check

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
                iteration += 1 / 1.5; // Adjust speed
            }, 60); // Adjust timing
        }
        startTextAnimation();
    }

    // --- Terminal Dragging ---
    if (terminalElement && $.fn.draggable) {
        $(terminalElement).draggable({
            handle: ".terminal-header",
            containment: "window"
        });
    }

    // --- Terminal Logic ---
    if (terminalInput && actualOutputDisplay && terminalOutputContainer) {
        terminalInput.contentEditable = true;
        terminalInput.spellcheck = false;

        // Initial welcome message
        appendToTerminal("Welcome to Geetansh's Interactive Portfolio Terminal!");
        appendToTerminal("Type 'help' for a list of commands.");
        appendToTerminal(" "); // Empty line

        terminalInput.addEventListener('keydown', function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const commandToProcess = terminalInput.textContent.trim();
                terminalInput.textContent = ""; // Clear input immediately

                if (commandToProcess) {
                    processCommand(commandToProcess);
                } else { // If user just presses enter on an empty line
                    appendToTerminal("", true); // Just show a new prompt
                }
            }
            // Add more key handling here (e.g., ArrowUp for history) if desired
        });

        if (terminalElement) {
            terminalElement.addEventListener('click', (e) => {
                // Only focus if the click is not on a button inside the terminal
                if (!e.target.closest('button') && !e.target.closest('.terminal-header')) {
                     terminalInput.focus();
                }
            });
        }
         // Auto-focus terminal input on load (optional)
        // terminalInput.focus();
    }

    function appendToTerminal(text, isCommandEcho = false) {
        const newLine = document.createElement('p');
        if (isCommandEcho) {
            // For command echoes, we create the prompt and then the command text
            const promptSpan = document.createElement('span');
            promptSpan.className = 'prompt';
            promptSpan.textContent = '$ '; // Ensure space after prompt
            newLine.appendChild(promptSpan);
            newLine.appendChild(document.createTextNode(text)); // Append command text after prompt
        } else {
            newLine.innerHTML = text; // For regular output, allow HTML
        }
        actualOutputDisplay.appendChild(newLine);
        terminalOutputContainer.scrollTop = terminalOutputContainer.scrollHeight; // Auto-scroll
    }

    function processCommand(commandStr) {
        appendToTerminal(commandStr, true); // Echo the command with prompt

        const parts = commandStr.trim().toLowerCase().split(" ");
        const command = parts[0];
        const args = parts.slice(1);

        switch (command) {
            case "cd":
                if (args.length > 0) {
                    navigateToSection(args[0]);
                } else {
                    appendToTerminal("Usage: cd <section_name><br>Sections: home, intro, skills, work, certificates");
                }
                break;
            case "ls":
            case "dir":
                appendToTerminal("home<br>introduction<br>skills<br>work<br>certificates");
                break;
            case "help":
                appendToTerminal(
                    "Available commands:<br>" +
                    "  cd <section>  - Navigate (e.g., cd intro)<br>" +
                    "  ls | dir         - List sections<br>" +
                    "  whoami           - Display user info<br>" +
                    "  clear | cls      - Clear terminal<br>" +
                    "  help             - Show this help"
                );
                break;
            case "whoami":
                appendToTerminal("Geetansh Jangid");
                break;
            case "clear":
            case "cls":
                actualOutputDisplay.innerHTML = "";
                break;
            default:
                if (commandStr.trim() !== "") {
                    appendToTerminal(`bash: command not found: ${command}`);
                }
        }
    }

    window.navigateToSection = function(sectionNameInput) { // Make it globally accessible for inline button onclicks
        const sectionName = sectionNameInput.toLowerCase();
        const validSections = {
            "home": "#home",
            "intro": "#introduction",
            "introduction": "#introduction",
            "skills": "#skills",
            "work": "#work",
            "certificates": "#certificates"
        };

        const targetId = validSections[sectionName];

        if (targetId) {
            let anyPageVisible = false;
            document.querySelectorAll('.page').forEach(page => {
                if (page.id === targetId.substring(1)) {
                    page.style.display = 'flex';
                    anyPageVisible = true;
                } else {
                    page.style.display = 'none';
                }
            });

            if (!anyPageVisible && targetId === "#home") { // Fallback for home if somehow no pages are visible
                 document.querySelector("#home").style.display = 'flex';
            }


            // Update URL only if it's different to avoid spamming history
            const currentPath = window.location.pathname.substring(1).toLowerCase();
            const newPath = (sectionName === "home" || sectionName === "") ? "" : sectionName;
            if (currentPath !== newPath) {
                 history.pushState({ section: sectionName }, `Geetansh - ${sectionName}`, `/${newPath}`);
            }

            // Navbar visibility update
            updateNavbarVisibility();

            if (terminalElement) appendToTerminal(`Navigated to ${sectionName}.`);

        } else {
            if (terminalElement) appendToTerminal(`Error: Section '${sectionNameInput}' not found.`);
        }
    }

    function handleInitialLoad() {
        const path = window.location.pathname.substring(1).toLowerCase();
        if (path && path !== "index.html") { // Ignore index.html if it appears
            navigateToSection(path);
        } else {
            navigateToSection("home"); // Default to home
        }
    }

    window.onpopstate = function(event) {
        if (event.state && event.state.section) {
            navigateToSection(event.state.section);
        } else {
            // If no state, it might be the initial page or a refresh on a path
            const path = window.location.pathname.substring(1).toLowerCase();
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
        const isHomeVisible = homePage && getComputedStyle(homePage).display !== 'none';

        if (window.scrollY > 10 || !isHomeVisible) {
            navbar.classList.add('visible');
        } else {
            navbar.classList.remove('visible');
        }
    }

    if (navbar) {
        window.addEventListener('scroll', updateNavbarVisibility);
        // Initial check in case page loads scrolled or on a non-home section
        updateNavbarVisibility();
    }

    // Smooth scrolling for NAV LINKS (primarily for #home or if user clicks them)
    document.querySelectorAll('#navbar a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1); // remove #
            // Use navigateToSection for consistency if it's a known section
            if (["home", "introduction", "skills", "work", "certificates"].includes(targetId)) {
                navigateToSection(targetId);
                // Close hamburger if open
                if (navLinks && navLinks.classList.contains('show')) {
                    navLinks.classList.remove('show');
                    if(hamburger) hamburger.classList.remove('active');
                }
            } else { // Fallback for other hrefs if any
                const targetElement = document.querySelector(this.getAttribute('href'));
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            hamburger.classList.toggle('active');
        });
    }

    // --- Initialize ---
    handleInitialLoad(); // Load appropriate section based on URL

}); // End of $(document).ready
