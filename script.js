/* -- Glow effect -- */

const blob = document.getElementById("blob");

window.onpointermove = event => { 
  const { clientX, clientY } = event;
  
  blob.animate({
    left: `${clientX}px`,
    top: `${clientY}px`
  }, { duration: 3000, fill: "forwards" });
}

/* -- Text effect -- */

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const words = ["PROGRAMMER", "CREATOR", "LEARNER", "AI GEEK"];
let wordIndex = 0;
let interval;

function startTextAnimation() {
  const element = document.getElementById("changing-text");
  let iteration = 0;
  
  clearInterval(interval);
  
  interval = setInterval(() => {
    element.innerText = words[wordIndex]
      .split("")
      .map((letter, index) => {
        if(index < iteration) {
          return words[wordIndex][index];
        }
      
        return letters[Math.floor(Math.random() * 26)]
      })
      .join("");
    
    if(iteration >= words[wordIndex].length){ 
      clearInterval(interval);
      setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        startTextAnimation();
      }, 2000);
    }
    
    iteration += 1;
  }, 90);
}

startTextAnimation();

/* -- Terminal dragging -- */

$(document).ready(function() {
  $("#terminal").draggable({
    handle: ".terminal-header",
    /*containment: "window"*/
  });
});

/* -- Typing animation -- */

const command = "whoami";
const output = "Geetansh Jangid";
const commandElement = document.getElementById("command");
const outputElement = document.getElementById("output");

function typeWriter(text, element, speed, callback) {
  let i = 0;
  element.innerHTML = '';  // Clear the element before typing
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
  typeWriter(command, commandElement, 200, function() {
    setTimeout(() => {
      outputElement.innerHTML = output;
      setTimeout(() => {
        outputElement.innerHTML = '';
        setTimeout(loopTerminalAnimation, 500);
      }, 2000);
    }, 500);
  });
}

loopTerminalAnimation();

/* -- Smooth scrolling -- */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

/* -- Navbar visibility -- */

const navbar = document.getElementById('navbar');
const introductionSection = document.getElementById('introduction');

window.addEventListener('scroll', () => {
  const introductionRect = introductionSection.getBoundingClientRect();
  if (introductionRect.top <= 0) {
    navbar.classList.add('visible');
  } else {
    navbar.classList.remove('visible');
  }
});

/* -- Hamburger menu -- */

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('#navbar ul');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('show');
  hamburger.classList.toggle('active');
});



/*fixing the issue*/
/*let currentSlide = 0;
const slides = document.querySelectorAll('.slider img');
const totalSlides = slides.length;

document.querySelectorAll('.slider-prev, .slider-next').forEach(button => {
  button.addEventListener('click', function() {
    if (this.classList.contains('slider-next')) {
      currentSlide = (currentSlide + 1) % totalSlides;
    } else {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    }
    updateSlider();
  });
});

function updateSlider() {
  const slider = document.querySelector('.slider');
  slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}*/

/* JavaScript for Work Page Slider
document.addEventListener('DOMContentLoaded', function() {
  let currentSlideWork = 0;
  const slidesWork = document.querySelectorAll('#work .slider img');
  const totalSlidesWork = slidesWork.length;

  document.querySelectorAll('#work .slider-prev, #work .slider-next').forEach(button => {
    button.addEventListener('click', function() {
      if (this.classList.contains('slider-next')) {
        currentSlideWork = (currentSlideWork + 1) % totalSlidesWork;
      } else {
        currentSlideWork = (currentSlideWork - 1 + totalSlidesWork) % totalSlidesWork;
      }
      updateSliderWork();
    });
  });

  function updateSliderWork() {
    const sliderWork = document.querySelector('#work .slider');
    sliderWork.style.transform = `translateX(-${currentSlideWork * 100}%)`;
  }
});*/

// JavaScript for Certificates Page Slider
document.addEventListener('DOMContentLoaded', function() {
  let currentSlideCertificates = 0;
  const slidesCertificates = document.querySelectorAll('#certificates .slider img');
  const totalSlidesCertificates = slidesCertificates.length;

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
    const sliderCertificates = document.querySelector('#certificates .slider');
    sliderCertificates.style.transform = `translateX(-${currentSlideCertificates * 100}%)`;
  }
});



$(document).ready(function() {
  $(".skill-level").each(function() {
    var level = $(this).data('level');
    $(this).css('width', level + '%');
  });
});



document.addEventListener('DOMContentLoaded', function() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,./<>?';
  const container = document.querySelector('.falling-letters-container');
  const footer = document.getElementById('footer');

  function createLetter() {
    const letter = document.createElement('div');
    letter.className = 'letter';
    letter.style.left = `${Math.random() * 100}%`;
    letter.style.top = '-20px';
    letter.textContent = letters[Math.floor(Math.random() * letters.length)];
    container.appendChild(letter);

    const duration = 5 + Math.random() * 5; // 5-10 seconds
    const animation = letter.animate([
      { transform: 'translateY(0)' },
      { transform: `translateY(${footer.offsetHeight + 20}px)` }
    ], {
      duration: duration * 1000,
      easing: 'linear'
    });

    animation.onfinish = () => {
      letter.remove();
      createLetter();
    };
  }

  // Create initial set of letters
  const letterCount = Math.floor(footer.offsetWidth / 10); // Adjust for density
  for (let i = 0; i < letterCount; i++) {
    setTimeout(createLetter, Math.random() * 500);
  }
});




function downloadPDF() {
            const link = document.createElement('a');
            link.href = '/img/assets/resume.pdf'; // Replace with the path to your PDF file
            link.download = 'resume.pdf'; // Replace with the desired file name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
}




// intro page terminal

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
