/* -- Glow effect -- */
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

/* -- Text effect -- */
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

/* -- Terminal dragging -- */
$(document).ready(function() {
    if ($("#terminal").length) {
        $("#terminal").draggable({
            handle: ".terminal-header",
            // containment: "window" // Optional
        });
    }
});

/* -- Typing animation -- */
const commandElement = document.getElementById("command");
const outputElement = document.getElementById("output");
if (commandElement && outputElement) {
    const commandText = "whoami"; // Renamed to avoid conflict
    const outputText = "Geetansh Jangid";  // Renamed to avoid conflict

    function typeWriter(text, element, speed, callback) {
        let i = 0;
        element.innerHTML = ''; // Clear the element before typing
        function type() {
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

    function loopTerminalAnimation() {
        typeWriter(commandText, commandElement, 200, function() {
            setTimeout(() => {
                outputElement.innerHTML = outputText;
                setTimeout(() => {
                    outputElement.innerHTML = '';
                    commandElement.innerHTML = ''; // Also clear command for clean loop
                    setTimeout(loopTerminalAnimation, 500);
                }, 2000);
            }, 500);
        });
    }
    loopTerminalAnimation();
}

/* -- Smooth scrolling -- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
        // If it's a nav link, it might also close the menu (handled in menu logic)
    });
});


/* -- Menu Logic (Hero Button & Original Hamburger) -- */
document.addEventListener('DOMContentLoaded', function() {
    const heroMenuButton = document.getElementById('hero-menu-button');
    const mainNavbar = document.getElementById('navbar');
    const mainNavUl = document.querySelector('#navbar ul');
    const originalHamburger = document.querySelector('#navbar .hamburger');
    const bodyElement = document.body;

    // Function to toggle the menu
    function toggleMenu(isHeroTriggerStyle = false) { // Renamed param for clarity
        if (!mainNavUl) return; // Safety check

        const isOpen = mainNavUl.classList.contains('show');

        if (isOpen) {
            // Closing the menu
            mainNavUl.classList.remove('show');
            mainNavUl.classList.remove('hero-menu-active'); // Always remove hero style on close
            bodyElement.classList.remove('body-no-scroll');
            if (heroMenuButton) heroMenuButton.classList.remove('active');
            if (originalHamburger) originalHamburger.classList.remove('active');
        } else {
            // Opening the menu
            mainNavUl.classList.add('show');
            if (isHeroTriggerStyle) { // Apply fullscreen hero style
                mainNavUl.classList.add('hero-menu-active');
                if (heroMenuButton) heroMenuButton.classList.add('active');
                if (originalHamburger) originalHamburger.classList.remove('active');
            } else if (originalHamburger) { // Implies OG hamburger clicked, use its default style
                 // mainNavUl.classList.remove('hero-menu-active'); // Ensure hero style is off
                originalHamburger.classList.add('active');
                if (heroMenuButton) heroMenuButton.classList.remove('active');
            }
            bodyElement.classList.add('body-no-scroll');
        }
    }

    // Event Listener for Hero Menu Button
    if (heroMenuButton) {
        heroMenuButton.addEventListener('click', function() {
            toggleMenu(true); // True: use hero fullscreen style
        });
    }

    // Event Listener for Original Navbar Hamburger
    if (originalHamburger) {
        originalHamburger.addEventListener('click', function() {
            // DECIDE: true for fullscreen, false for OG hamburger's own mobile menu style
            toggleMenu(true); // Currently, OG hamburger also opens fullscreen
        });
    }

    // Close menu when a link inside is clicked
    if (mainNavUl) {
        mainNavUl.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNavUl.classList.contains('show')) {
                    toggleMenu(); // Call to close
                }
                // Smooth scroll is handled by the separate smooth scroll listener
            });
        });
    }

    // Navbar visibility on scroll
    const introductionSection = document.getElementById('introduction');
    if (mainNavbar && introductionSection) {
        window.addEventListener('scroll', () => {
            const introductionRect = introductionSection.getBoundingClientRect();
            if (introductionRect.top <= 0) {
                mainNavbar.classList.add('visible');
            } else {
                mainNavbar.classList.remove('visible');
                // Optional: If menu was opened by originalHamburger and navbar hides, close menu
                // if (originalHamburger && originalHamburger.classList.contains('active') && mainNavUl.classList.contains('show')) {
                //    toggleMenu(false);
                // }
            }
        });
    }
});


/* -- Certificates Page Slider -- */
// This was from your original script, make sure #certificates elements exist if using
document.addEventListener('DOMContentLoaded', function() {
    const slidesCertificates = document.querySelectorAll('#certificates .slider img');
    if (slidesCertificates.length > 0) {
        let currentSlideCertificates = 0;
        const totalSlidesCertificates = slidesCertificates.length;
        const sliderCertificatesContainer = document.querySelector('#certificates .slider');

        document.querySelectorAll('#certificates .slider-prev, #certificates .slider-next').forEach(button => {
            button.addEventListener('click', function() {
                if (this.classList.contains('slider-next')) {
                    currentSlideCertificates = (currentSlideCertificates + 1) % totalSlidesCertificates;
                } else {
                    currentSlideCertificates = (currentSlideCertificates - 1 + totalSlidesCertificates) % totalSlidesCertificates;
                }
                updateSliderCertificates();
            });
        });

        function updateSliderCertificates() {
            if (sliderCertificatesContainer) {
                sliderCertificatesContainer.style.transform = `translateX(-${currentSlideCertificates * 100}%)`;
            }
        }
    }
});


/* -- Unused jQuery skill level code (can be removed if not used) -- */
// $(document).ready(function() {
//   $(".skill-level").each(function() {
//     var level = $(this).data('level');
//     $(this).css('width', level + '%');
//   });
// });


/* -- Footer Falling Letters -- */
document.addEventListener('DOMContentLoaded', function() {
    const fallingLettersContainer = document.querySelector('.falling-letters-container');
    const footerElement = document.getElementById('footer'); // Renamed for clarity

    if (fallingLettersContainer && footerElement) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,./<>?';

        function createLetter() {
            if (!document.contains(fallingLettersContainer)) return; // Stop if container removed

            const letter = document.createElement('div');
            letter.className = 'letter';
            letter.style.left = `${Math.random() * 100}%`;
            letter.style.top = '-20px'; // Start above the container
            letter.textContent = letters[Math.floor(Math.random() * letters.length)];
            fallingLettersContainer.appendChild(letter);

            const duration = 5 + Math.random() * 5; // 5-10 seconds
            const fallDistance = fallingLettersContainer.offsetHeight + 40; // Ensure it falls past the bottom

            const animation = letter.animate([
                { transform: 'translateY(0)' },
                { transform: `translateY(${fallDistance}px)` }
            ], {
                duration: duration * 1000,
                easing: 'linear'
            });

            animation.onfinish = () => {
                if (document.contains(letter)) { // Check if still in DOM
                    letter.remove();
                }
                // Only create a new letter if the container still exists
                if (document.contains(fallingLettersContainer)) {
                     setTimeout(createLetter, Math.random() * 100); // Stagger new letters slightly
                }
            };
        }

        // Create initial set of letters
        // Adjust density based on container width
        let letterCount = 0;
        if (fallingLettersContainer.offsetWidth > 0) { // Check if container has width
             letterCount = Math.floor(fallingLettersContainer.offsetWidth / 25); // Density control
        } else { // Fallback if offsetWidth is 0 on load (e.g. display:none)
            letterCount = 20;
        }


        for (let i = 0; i < letterCount; i++) {
            setTimeout(createLetter, Math.random() * 500); // Stagger initial creation
        }

        // Optional: Add more letters over time if needed, or adjust based on resizing
        // window.addEventListener('resize', () => { /* Logic to adjust letter count */ });
    }
});


/* -- PDF Download -- */
function downloadPDF() {
    const link = document.createElement('a');
    link.href = '/img/assets/resume.pdf'; // Ensure this path is correct
    link.download = 'Geetansh_Jangid_Resume.pdf'; // Sensible default download name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
