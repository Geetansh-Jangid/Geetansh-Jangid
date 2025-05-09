/* -- Glow effect -- */
const blob = document.getElementById("blob");
if (blob) {
    window.onpointermove = event => { 
      const { clientX, clientY } = event;
      
      blob.animate({
        left: `${clientX}px`,
        top: `${clientY}px`
      }, { duration: 3000, fill: "forwards" });
    }
}

/* -- Text effect -- */
const changingTextElement = document.getElementById("changing-text");
if (changingTextElement) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const words = ["PROGRAMMER", "CREATOR", "LEARNER", "AI GEEK"];
    let wordIndex = 0;
    let intervalTextEffect;

    function startTextAnimation() {
      let iteration = 0;
      
      clearInterval(intervalTextEffect);
      
      intervalTextEffect = setInterval(() => {
        if (!changingTextElement) { // Defensive check
            clearInterval(intervalTextEffect);
            return;
        }
        changingTextElement.innerText = words[wordIndex]
          .split("")
          .map((letter, index) => {
            if(index < iteration) {
              return words[wordIndex][index];
            }
            return letters[Math.floor(Math.random() * 26)]
          })
          .join("");
        
        if(iteration >= words[wordIndex].length){ 
          clearInterval(intervalTextEffect);
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
      handle: ".terminal-header"
    });
  }
});

/* -- Typing animation -- */
const commandElement = document.getElementById("command");
const outputElement = document.getElementById("output");

if (commandElement && outputElement) {
    const commandText = "whoami";
    const outputText = "Geetansh Jangid";
    
    function typeWriter(text, element, speed, callback) {
      let i = 0;
      element.innerHTML = '';
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
            setTimeout(loopTerminalAnimation, 500);
          }, 2000);
        }, 500);
      });
    }
    loopTerminalAnimation();
}

/* -- Smooth scrolling -- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth'
        });
    }
  });
});

/* -- Navbar visibility -- */
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
      // Show navbar after scrolling more than 10 pixels down
      if (window.scrollY > 10) { 
        navbar.classList.add('visible');
      } else {
        navbar.classList.remove('visible');
      }
    });
}

/* -- Hamburger menu -- */
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('#navbar ul');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('show');
      hamburger.classList.toggle('active');
    });
}
