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

        appendToTerminal("Welcome to Geetansh's Interactive Portfolio Terminal!");
        appendToTerminal("Type 'help' or click commands for navigation."); // Updated welcome
        appendToTerminal(" ");

        terminalInput.addEventListener('keydown', function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const commandToProcess = terminalInput.textContent.trim();
                terminalInput.textContent = "";

                if (commandToProcess) {
                    processCommand(commandToProcess);
                } else {
                    appendToTerminal("", true); // Echo prompt for empty enter
                }
            }
        });

        if (terminalElement) {
            terminalElement.addEventListener('click', (e) => {
                if (!e.target.closest('button') && !e.target.closest('.terminal-header') && !e.target.classList.contains('terminal-link')) {
                     terminalInput.focus();
                }
            });
        }

        // Event listener for clickable terminal links
        actualOutputDisplay.addEventListener('click', function(event) {
            const target = event.target;
            if (target.classList.contains('terminal-link')) {
                event.preventDefault();
                const commandToRun = target.dataset.command;
                if (commandToRun) {
                    // No need to echo command here, processCommand will do it.
                    processCommand(commandToRun);
                    terminalInput.textContent = ""; // Ensure input is cleared
                    terminalInput.focus();
                }
            }
        });
    }

    function appendToTerminal(htmlContent, isCommandEcho = false, commandText = "") {
        const newLine = document.createElement('p');
        if (isCommandEcho) {
            const promptSpan = document.createElement('span');
            promptSpan.className = 'prompt';
            promptSpan.textContent = '$ ';
            newLine.appendChild(promptSpan);
            newLine.appendChild(document.createTextNode(commandText)); // Use commandText for echo
        } else {
            newLine.innerHTML = htmlContent; // Allow HTML for links etc.
        }
        actualOutputDisplay.appendChild(newLine);
        if (terminalOutputContainer) { // Check if container exists
           terminalOutputContainer.scrollTop = terminalOutputContainer.scrollHeight;
        }
    }

    function processCommand(commandStr) {
        // Echo the command with prompt, only if it's not an internal call from a link
        // For simplicity, we'll always echo. Clicks will look like typed commands.
        appendToTerminal(commandStr, true, commandStr);


        const parts = commandStr.trim().toLowerCase().split(" ");
        const command = parts[0];
        const args = parts.slice(1);

        switch (command) {
            case "cd":
                if (args.length > 0) {
                    navigateToSection(args[0]);
                } else {
                    let cdHelp = "Usage: cd <section_name><br>Available sections:<br>";
                    const sectionsForCd = ["home", "introduction", "skills", "work", "certificates"];
                    sectionsForCd.forEach(sec => {
                        cdHelp += `  <a href="#" class="terminal-link" data-command="cd ${sec}">${sec}</a><br>`;
                    });
                    appendToTerminal(cdHelp);
                }
                break;
            case "ls":
            case "dir":
                const sections = ["home", "introduction", "skills", "work", "certificates"];
                let sectionLinksHTML = "Available sections:<br>";
                sections.forEach(section => {
                    sectionLinksHTML += `  <a href="#" class="terminal-link" data-command="cd ${section}">${section}</a><br>`;
                });
                appendToTerminal(sectionLinksHTML);
                break;
            case "help":
                let helpHTML = "Available commands (click or type):<br>";
                const commandsHelp = [
                    { cmdText: "cd <section>", desc: "Navigate to a section", clickCmd: "cd introduction" },
                    { cmdText: "ls", desc: "List available sections", clickCmd: "ls" },
                    { cmdText: "dir", desc: "List available sections (alias for ls)", clickCmd: "dir" },
                    { cmdText: "whoami", desc: "Display user info", clickCmd: "whoami" },
                    { cmdText: "clear", desc: "Clear the terminal", clickCmd: "clear" },
                    { cmdText: "cls", desc: "Clear the terminal (alias for clear)", clickCmd: "cls" },
                    { cmdText: "help", desc: "Show this help message", clickCmd: "help" }
                ];
                commandsHelp.forEach(item => {
                    helpHTML += `  <a href="#" class="terminal-link" data-command="${item.clickCmd}">${item.cmdText}</a> - ${item.desc}<br>`;
                });
                appendToTerminal(helpHTML);
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

    window.navigateToSection = function(sectionNameInput) {
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

            if (!anyPageVisible && targetId === "#home") {
                 document.querySelector("#home").style.display = 'flex';
            }

            const currentPath = window.location.pathname.substring(1).toLowerCase().replace(/index\.html\/?$/, '');
            const newPath = (sectionName === "home" || sectionName === "") ? "" : sectionName;

            if (currentPath !== newPath) {
                 history.pushState({ section: sectionName }, `Geetansh - ${sectionName}`, `/${newPath}`);
            } else if (currentPath === "" && newPath === "" && window.location.pathname !== "/") {
                // Handles case where initial load is root but pushState might try to push "/" again
                 history.replaceState({ section: sectionName }, `Geetansh - ${sectionName}`, `/`);
            }


            updateNavbarVisibility();
            // Feedback in terminal is now handled by processCommand echoing 'cd <section>'
            // appendToTerminal(`Navigated to ${sectionName}.`); // Remove this duplicate feedback

        } else {
            appendToTerminal(`Error: Section '${sectionNameInput}' not found.`);
        }
    }

    function handleInitialLoad() {
        let path = window.location.pathname.substring(1).toLowerCase();
        // Remove trailing slash or index.html for cleaner matching
        path = path.replace(/\/$/, "").replace(/index\.html$/, "");

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
        updateNavbarVisibility();
    }

    document.querySelectorAll('#navbar a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            if (["home", "introduction", "skills", "work", "certificates"].includes(targetId)) {
                navigateToSection(targetId);
                if (navLinks && navLinks.classList.contains('show')) {
                    navLinks.classList.remove('show');
                    if(hamburger) hamburger.classList.remove('active');
                }
            } else {
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

    handleInitialLoad();

});
