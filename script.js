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
