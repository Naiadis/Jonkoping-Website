document.addEventListener("DOMContentLoaded", function () {

  // Scroll wheel animation
  const scrollWheel = document.querySelector(".scroll-wheel");

  // Scroll to shops section when scroll wheel is clicked
  scrollWheel.addEventListener("click", function () {
    const shopsSection = document.querySelector(".shops-section");
    if (shopsSection) {
      shopsSection.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Back to top button
  const backToTop = document.querySelector(".back-to-top");
  backToTop.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Rotate the wheel text
  function rotateWheelText() {
    scrollWheel.querySelector("svg").style.transform = `rotate(${
      (Date.now() / 50) % 360
    }deg)`;
    requestAnimationFrame(rotateWheelText);
  }
  rotateWheelText();

  // Shop categories
  const categoryLinks = document.querySelectorAll(".category-nav a");
  categoryLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all links
      categoryLinks.forEach((l) => l.classList.remove("active"));

      // Add active class to clicked link
      this.classList.add("active");
    });
  });

  // Carousel functionality
  const slides = document.querySelectorAll(".carousel-slide");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  let currentSlide = 0;

  function showSlide(index) {
    // Remove all classes
    slides.forEach((slide) => {
      slide.classList.remove("active", "prev");
    });

    dots.forEach((dot) => {
      dot.classList.remove("active");
    });

    // Add active class to current slide
    slides[index].classList.add("active");
    dots[index].classList.add("active");

    // Add prev class to previous slide for animation
    const prevIndex = (index - 1 + slides.length) % slides.length;
    slides[prevIndex].classList.add("prev");

    currentSlide = index;
  }

  // Initialize first slide
  showSlide(0);

  // Next button
  nextBtn.addEventListener("click", function () {
    const nextSlide = (currentSlide + 1) % slides.length;
    showSlide(nextSlide);
  });

  // Previous button
  prevBtn.addEventListener("click", function () {
    const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prevSlide);
  });

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  // Animate sections on scroll
  function animateSections() {
    const sections = [
      document.querySelector(".shops-section"),
      document.querySelector(".footer"),
    ];

    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (sectionTop < windowHeight * 0.75) {
        section.classList.add("visible");
      }
    });

    updateScrollWheelColor();
  }

  // Add language toggle functionality
  const languageButtons = document.querySelectorAll(".language-options button");
  const languageBtn = document.querySelector(".language-btn");

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      languageButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      languageBtn.textContent = button.textContent;
    });
  });

  // Event listeners
  window.addEventListener("scroll", () => {
    animateSections();
    updateScrollWheelColor();
  });

  // Initial calls
  animateSections();
  updateScrollWheelColor();

  function animate() {
    // updateWheelTextColor();
    requestAnimationFrame(animate);
  }
  animate();


  // Update on scroll with throttling
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateTextColor();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Add scroll listener for sections
  window.addEventListener("scroll", animateSections);
});
