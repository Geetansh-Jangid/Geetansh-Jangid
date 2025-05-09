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

/* ===== Smooth Scrolling (will only work for #home currently) ===== */
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
                mainNavUl.classList.remove('hero-menu-active');
            }

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
            toggleMenu(true); // Both trigger fullscreen style
        });
    }

    if (mainNavUl) {
        mainNavUl.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNavUl.classList.contains('show')) {
                    toggleMenu();
                }
            });
        });
    }

    // Navbar visibility on scroll
    // const introductionSectionForNav = document.getElementById('introduction'); // This element is removed
    // For a hero-only page, this navbar might not become visible unless there's scrollable content.
    // You can adapt this if you add more sections later.
    /*
    if (mainNavbar && introductionSectionForNav) { // introductionSectionForNav will be null
        window.addEventListener('scroll', () => {
            const introRect = introductionSectionForNav.getBoundingClientRect();
            if (introRect.top <= mainNavbar.offsetHeight) {
                mainNavbar.classList.add('visible');
            } else {
                mainNavbar.classList.remove('visible');
            }
        });
    }
    */
    // A simple way to make navbar appear if scrolled at all (for testing, if page is > 100vh)
    if (mainNavbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { // Show after scrolling 50px
                 mainNavbar.classList.add('visible');
            } else {
                 mainNavbar.classList.remove('visible');
            }
        });
    }
});


/* ===== Introduction Page Terminal Animation - REMOVED ===== */
/* ===== Certificates Page Slider - REMOVED ===== */
/* ===== Footer Falling Letters - REMOVED ===== */

/* ===== PDF Download Function (Button calling it is removed for now) ===== */
function downloadPDF() {
    const link = document.createElement('a');
    link.href = 'img/assets/resume.pdf';
    link.download = 'Geetansh_Jangid_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
