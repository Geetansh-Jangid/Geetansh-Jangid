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
