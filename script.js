/* ===== Global Helper Functions (Optional but good practice) ===== */
function elementExists(selector) {
    return document.querySelector(selector) !== null;
}

/* ===== Hero Section Effects ===== */

// -- Glow effect --
const blob = document.getElementById("blob");
if (blob) {
    window.onpointermove = event => {
        const { clientX, clientY } = event;
        blob.animate({
            left: `${clientX}px`,
            top: `${clientY}px`
        }, { duration: 3000, fill: "forwards" });
    };
}

// -- Text effect --
const changingTextElement = document.getElementById("changing-text");
if (changingTextElement) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const words = ["PROGRAMMER", "CREATOR", "LEARNER", "AI GEEK"];
    let wordIndex = 0;
    let textAnimationInterval;

    function startTextAnimation() {
        let iteration = 0;
        clearInterval(textAnimationInterval);

        textAnimationInterval = setInterval(() => {
            if (!document.contains(changingTextElement)) { // Stop if element is removed
                clearInterval(textAnimationInterval);
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
                clearInterval(textAnimationInterval);
                setTimeout(() => {
                    wordIndex = (wordIndex + 1) % words.length;
                    startTextAnimation();
                }, 2000);
            }
            iteration += 1;
        }, 90);
    }
    startTextAnimation();
}

// -- Hero Terminal dragging --
if (typeof $ !== 'undefined' && $.ui) { // Check if jQuery and jQuery UI are loaded
    $(document).ready(function() {
        if ($("#terminal").length) {
            $("#terminal").draggable({
                handle: ".terminal-header",
                containment: "window" // Makes it stay within viewport
            });
        }
    });
} else {
    console.warn("jQuery or jQuery UI not loaded. Terminal dragging disabled.");
}


// -- Hero Terminal Typing animation --
const heroCommandElement = document.getElementById("command");
const heroOutputElement = document.getElementById("output");
if (heroCommandElement && heroOutputElement) {
    const heroCommandText = "whoami";
    const heroOutputText = "Geetansh Jangid";

    function typeHeroTerminal(text, element, speed, callback) {
        let i = 0;
        element.innerHTML = '';
        function type() {
            if (!document.contains(element)) return; // Stop if element removed
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else if (callback) {
                setTimeout(callback, 500);
            }
        }
        type();
    }

    function loopHeroTerminalAnimation() {
        if (!document.contains(heroCommandElement) || !document.contains(heroOutputElement)) return;
        typeHeroTerminal(heroCommandText, heroCommandElement, 200, function() {
            setTimeout(() => {
                heroOutputElement.innerHTML = heroOutputText;
                setTimeout(() => {
                    heroOutputElement.innerHTML = '';
                    heroCommandElement.innerHTML = '';
                    setTimeout(loopHeroTerminalAnimation, 500);
                }, 2000);
            }, 500);
        });
    }
    loopHeroTerminalAnimation();
}

/* ===== Smooth Scrolling ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        try {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        } catch (error) {
            console.warn("Smooth scroll target not found or invalid selector:", targetId);
        }
    });
});

/* ===== Menu Logic (Hero Button & Original Hamburger) ===== */
document.addEventListener('DOMContentLoaded', function() {
    const heroMenuButton = document.getElementById('hero-menu-button');
    const mainNavbar = document.getElementById('navbar');
    const mainNavUl = document.querySelector('#navbar ul');
    const originalHamburger = document.querySelector('#navbar .hamburger');
    const bodyElement = document.body;

    function toggleMenu(isHeroStyleTrigger = false) {
        if (!mainNavUl) return;

        const isOpen = mainNavUl.classList.contains('show');

        if (isOpen) {
            mainNavUl.classList.remove('show');
            mainNavUl.classList.remove('hero-menu-active');
            bodyElement.classList.remove('body-no-scroll');
            if (heroMenuButton) heroMenuButton.classList.remove('active');
            if (originalHamburger) originalHamburger.classList.remove('active');
        } else {
            mainNavUl.classList.add('show');
            if (isHeroStyleTrigger) { // Apply fullscreen hero style
                mainNavUl.classList.add('hero-menu-active');
            } else {
                mainNavUl.classList.remove('hero-menu-active'); // Ensure fullscreen style is off for OG menu if different
            }

            // Manage active state of buttons
            if (isHeroStyleTrigger && heroMenuButton) {
                heroMenuButton.classList.add('active');
                if (originalHamburger) originalHamburger.classList.remove('active');
            } else if (!isHeroStyleTrigger && originalHamburger) {
                originalHamburger.classList.add('active');
                if (heroMenuButton) heroMenuButton.classList.remove('active');
            }
            bodyElement.classList.add('body-no-scroll');
        }
    }

    if (heroMenuButton) {
        heroMenuButton.addEventListener('click', function() {
            toggleMenu(true); // True: use hero fullscreen style
        });
    }

    if (originalHamburger) {
        originalHamburger.addEventListener('click', function() {
            // Both hero button and OG hamburger trigger the same fullscreen style
            toggleMenu(true);
        });
    }

    if (mainNavUl) {
        mainNavUl.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNavUl.classList.contains('show')) {
                    toggleMenu(); // Call to close
                }
                // Smooth scroll is handled by the separate global smooth scroll listener
            });
        });
    }

    // Navbar visibility on scroll
    const introductionSectionForNav = document.getElementById('introduction'); // Use a more specific var name
    if (mainNavbar && introductionSectionForNav) {
        window.addEventListener('scroll', () => {
            const introRect = introductionSectionForNav.getBoundingClientRect();
            if (introRect.top <= mainNavbar.offsetHeight) { // Show when top of intro is near/past navbar
                mainNavbar.classList.add('visible');
            } else {
                mainNavbar.classList.remove('visible');
                // Optionally close menu if it was opened by originalHamburger and navbar hides
                // This logic can be complex with hero-menu also controlling it.
                // For now, let manual close be the primary way.
            }
        });
    }
});

/* ===== Introduction Page Terminal Animation ===== */
document.addEventListener('DOMContentLoaded', function() {
    const introTerminalContent = document.getElementById('intro-terminal-content');
    let currentIntroLineElement = null;

    function addIntroTerminalLine(text, type = 'output', className = '') {
        if (!introTerminalContent) return null;
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        if (type === 'prompt') {
            line.innerHTML = `<span class="terminal-prompt">geetansh@portfolio:~$</span> <span class="terminal-command">${text}</span>`;
        } else if (type === 'input') {
            line.innerHTML = `<span class="terminal-prompt">geetansh@portfolio:~$</span> <span class="terminal-command terminal-input-line" id="current-command-input"></span>`;
            currentIntroLineElement = line.querySelector('#current-command-input');
        } else if (type === 'ascii') {
            line.innerHTML = `<pre class="ascii-art">${text}</pre>`;
        } else {
            line.innerHTML = text;
        }
        introTerminalContent.appendChild(line);
        introTerminalContent.scrollTop = introTerminalContent.scrollHeight;
        return line;
    }

    function typeIntroText(element, text, speed, callback) {
        if(!element) { if(callback) callback(); return; } // Safety check
        let i = 0;
        function type() {
            if (!document.contains(element)) { if(callback) callback(); return;} // Stop if element removed

            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                if (introTerminalContent) introTerminalContent.scrollTop = introTerminalContent.scrollHeight;
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }
        type();
    }

    const myData = {
        name: "Geetansh Jangid",
        title: "Programmer, Developer, Lifelong Learner",
        location: "Jaipur, India", // Example
        email: "jangidgeetansh22@gmail.com",
        website: "portfolio.example.com", // Example
        skills: ["Web Development", "Python", "JavaScript", "AI Research", "Sketching"],
        bio: [
            "Welcome to my digital chronicle!",
            "Driven by a passion for elegant code and innovative tech.",
            "Exploring new challenges and crafting impactful solutions."
        ],
        ascii_logo:
` ██████╗ ███████╗███████╗████████╗ █████╗ ███████╗██╗  ██╗
██╔════╝ ██╔════╝██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║  ██║
██║  ███╗█████╗  █████╗     ██║   ███████║███████╗███████║
██║   ██║██╔══╝  ██╔══╝     ██║   ██╔══██║╚════██║██╔══██║
╚██████╔╝███████╗███████╗   ██║   ██║  ██║███████║██║  ██║
 ╚═════╝ ╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
`
    };

    const introSequence = [
        { delay: 300, type: 'output', text: 'Booting GeetanshOS v2.0.24...' },
        { delay: 800, type: 'output', text: 'Kernel integrity check: <span class="terminal-output-line success">PASSED</span>' },
        { delay: 500, type: 'output', text: 'Initializing core modules...' },
        { delay: 600, type: 'output', text: '[INFO] Network interface initialized.'},
        { delay: 400, type: 'output', text: '[INFO] Filesystems mounted.'},
        { delay: 1000, type: 'output', text: 'Authentication successful. Welcome, guest!' },
        { delay: 1200, type: 'prompt', command: 'fetch --user-profile', speed: 90 },
        { delay: 200, isOutput: true, lines: [
            { type: 'ascii', text: myData.ascii_logo },
            { text: `\n<span class="terminal-output-line info">User:</span>          ${myData.name}` },
            { text: `<span class="terminal-output-line info">Title:</span>         ${myData.title}` },
            { text: `<span class="terminal-output-line info">Location:</span>      ${myData.location}` },
            { text: `<span class="terminal-output-line info">Shell:</span>         gsh (Geetansh Shell)` },
            { text: `<span class="terminal-output-line info">OS Version:</span>    2.0.24 (Voyager)` },
        ]},
        { delay: 1800, type: 'prompt', command: 'cat /etc/motd', speed: 100 },
        { delay: 300, isOutput: true, lines: [
            { text: `\n<span class="terminal-output-line" style="color: #FFD700;">--- Message of the Day ---</span>`},
            ...myData.bio.map(line => ({ text: `  ${line}` })),
        ]},
        { delay: 1500, type: 'prompt', command: 'ls -l /skills', speed: 80 },
        { delay: 300, isOutput: true, lines: [
            { text: `drwxr-xr-x  1 geetansh users  4096 Jan 01 00:00 <span class="terminal-output-line info">WebDev</span>`},
            { text: `drwxr-xr-x  1 geetansh users  4096 Jan 01 00:00 <span class="terminal-output-line info">Python</span>`},
            { text: `drwxr-xr-x  1 geetansh users  4096 Jan 01 00:00 <span class="terminal-output-line info">JavaScript</span>`},
            { text: `drwxr-xr-x  1 geetansh users  4096 Jan 01 00:00 <span class="terminal-output-line info">AI_Research</span>`},
            { text: `drwxr-xr-x  1 geetansh users  4096 Jan 01 00:00 <span class="terminal-output-line info">Sketching</span>`},
            { text: `<span class="terminal-output-line success">...and more under development!</span>`},
        ]},
        { delay: 1500, type: 'output', text: `\nSession active. Use <a href="#skills" class="terminal-link">navigation</a> or scroll to explore further.`},
        { delay: 500, type: 'input' }
    ];

    let introSequenceIndex = 0;
    let introLastLineElement = null;

    function processIntroSequence() {
        if (introSequenceIndex >= introSequence.length || !introTerminalContent) {
            if (currentIntroLineElement === null && introTerminalContent) { // Check introTerminalContent again
                 addIntroTerminalLine('', 'input');
            }
            return;
        }

        const item = introSequence[introSequenceIndex];

        if (item.type === 'prompt') {
            const lineEl = addIntroTerminalLine('', 'prompt');
            const commandSpan = lineEl ? lineEl.querySelector('.terminal-command') : null;
            if (commandSpan) {
                typeIntroText(commandSpan, item.command, item.speed || 100, () => {
                    introSequenceIndex++;
                    setTimeout(processIntroSequence, item.delayAfter || 200);
                });
            } else { // Safety if lineEl is null
                introSequenceIndex++;
                setTimeout(processIntroSequence, item.delayAfter || 200);
            }
        } else if (item.isOutput) {
            if (item.action === 'replaceLast' && introLastLineElement) {
                introLastLineElement.innerHTML = ''; // Clear previous content
                item.lines.forEach(lineData => {
                    const subLine = document.createElement('div');
                    if (lineData.type === 'ascii') {
                         subLine.innerHTML = `<pre class="ascii-art">${lineData.text}</pre>`;
                    } else {
                        subLine.innerHTML = lineData.text;
                    }
                    subLine.className = lineData.className || 'terminal-output-line';
                    introLastLineElement.appendChild(subLine);
                });
            } else {
                item.lines.forEach(lineData => {
                    introLastLineElement = addIntroTerminalLine(lineData.text, lineData.type || 'output', lineData.className || 'terminal-output-line');
                });
            }
            introSequenceIndex++;
            setTimeout(processIntroSequence, item.delay || 500);
        } else if (item.type === 'input') {
            addIntroTerminalLine('', 'input');
            introSequenceIndex++;
        } else {
            introLastLineElement = addIntroTerminalLine(item.text, 'output', item.className || 'terminal-output-line');
            introSequenceIndex++;
            setTimeout(processIntroSequence, item.delay || 500);
        }
    }

    // TODO: Use Intersection Observer to start animation when #introduction is visible
    // For now, start if the element exists (primarily for single-page testing)
    if (introTerminalContent) {
       setTimeout(processIntroSequence, 1000); // Start after a slight delay
    }
});


/* ===== Certificates Page Slider ===== */
document.addEventListener('DOMContentLoaded', function() {
    if (elementExists('#certificates .slider')) {
        const slidesCertificates = document.querySelectorAll('#certificates .slider img');
        if (slidesCertificates.length > 0) {
            let currentSlideCertificates = 0;
            const totalSlidesCertificates = slidesCertificates.length;
            const sliderCertificatesContainer = document.querySelector('#certificates .slider');

            const prevButton = document.querySelector('#certificates .slider-prev');
            const nextButton = document.querySelector('#certificates .slider-next');

            if (prevButton && nextButton && sliderCertificatesContainer) {
                prevButton.addEventListener('click', function() {
                    currentSlideCertificates = (currentSlideCertificates - 1 + totalSlidesCertificates) % totalSlidesCertificates;
                    updateSliderCertificates();
                });
                nextButton.addEventListener('click', function() {
                    currentSlideCertificates = (currentSlideCertificates + 1) % totalSlidesCertificates;
                    updateSliderCertificates();
                });

                function updateSliderCertificates() {
                    sliderCertificatesContainer.style.transform = `translateX(-${currentSlideCertificates * 100}%)`;
                }
            }
        }
    }
});


/* ===== Footer Falling Letters ===== */
document.addEventListener('DOMContentLoaded', function() {
    const fallingLettersContainer = document.querySelector('.falling-letters-container');
    const footerElement = document.getElementById('footer');

    if (fallingLettersContainer && footerElement) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&()_+-=[]{}|;:,./<>?';
        let letterCreationInterval; // To control creation

        function createLetter() {
            if (!document.body.contains(fallingLettersContainer)) { // Check if container is still in DOM
                if(letterCreationInterval) clearInterval(letterCreationInterval); // Stop creating if detached
                return;
            }

            const letter = document.createElement('div');
            letter.className = 'letter';
            letter.style.left = `${Math.random() * 100}%`;
            letter.style.top = '-20px';
            letter.textContent = letters[Math.floor(Math.random() * letters.length)];
            fallingLettersContainer.appendChild(letter);

            const duration = 5 + Math.random() * 5;
            const fallDistance = fallingLettersContainer.offsetHeight + 40;

            const animation = letter.animate([
                { transform: 'translateY(0)' },
                { transform: `translateY(${fallDistance}px)` }
            ], {
                duration: duration * 1000,
                easing: 'linear'
            });

            animation.onfinish = () => {
                if(document.body.contains(letter)) letter.remove(); // Remove if still in DOM
                // Don't auto-recreate here, let interval handle it
            };
        }

        function startLetterFall() {
            let letterCount = 0;
            if (fallingLettersContainer.offsetWidth > 0) {
                letterCount = Math.max(10, Math.floor(fallingLettersContainer.offsetWidth / 35)); // Ensure at least some letters
            } else {
                letterCount = 15; // Fallback
            }

            // Clear existing letters if any (e.g., on resize if re-triggering)
            // while (fallingLettersContainer.firstChild) {
            //    fallingLettersContainer.removeChild(fallingLettersContainer.firstChild);
            // }

            for (let i = 0; i < letterCount; i++) {
                setTimeout(createLetter, Math.random() * 2000); // Stagger initial creation more
            }

            // Continuously create new letters at a slower pace
            if(letterCreationInterval) clearInterval(letterCreationInterval);
            letterCreationInterval = setInterval(createLetter, 1000); // Add a new letter every second
        }

        // Use Intersection Observer for footer to start/stop letter falling
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (fallingLettersContainer.children.length === 0) { // Only start if empty or first time
                        startLetterFall();
                    } else if (!letterCreationInterval) { // Resume if interval was cleared
                         letterCreationInterval = setInterval(createLetter, 1000);
                    }
                } else {
                    if(letterCreationInterval) clearInterval(letterCreationInterval); // Pause when not visible
                    letterCreationInterval = null;
                }
            });
        }, { threshold: 0.01 }); // Trigger when 1% is visible

        observer.observe(footerElement);
    }
});

/* ===== PDF Download ===== */
function downloadPDF() {
    const link = document.createElement('a');
    // For local testing, relative path is often better: 'img/assets/resume.pdf'
    // For deployed site, '/img/assets/resume.pdf' might be needed if 'img' is at the root.
    link.href = 'img/assets/resume.pdf'; // Assuming 'img' folder is at the same level as index.html
    link.download = 'Geetansh_Jangid_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
