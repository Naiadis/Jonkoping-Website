document.addEventListener("DOMContentLoaded", function () {
  // Header animation
  const header = document.querySelector(".header");

  // Scroll wheel animation
  const scrollWheel = document.querySelector(".scroll-wheel");
  const wheelTextContainer = document.querySelector(".wheel-text-container");
  const wheelText = document.querySelector(".wheel-text text");
  const heroImage = document.querySelector(".hero-image");

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

  // Update scroll wheel color change logic
  function updateScrollWheelColor() {
    const scrollWheel = document.querySelector(".scroll-wheel");
    const wheelRect = scrollWheel.getBoundingClientRect();
    const imageBottom = heroImage.getBoundingClientRect().bottom;

    // Check if the wheel is overlapping the white space
    if (wheelRect.top > imageBottom - wheelRect.height / 2) {
      scrollWheel.classList.add("dark");
    } else {
      scrollWheel.classList.remove("dark");
    }
  }

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

  // Update text color continuously
  function updateWheelTextColor() {
    const textPosition = wheelTextContainer.getBoundingClientRect();
    const imageBottom = heroImage.getBoundingClientRect().bottom;
    const centerY = textPosition.top + textPosition.height / 2;

    // Calculate which portion of the text should be white or black
    const angle = (Date.now() / 50) % 360;
    const topHalf = angle > 180;

    if (centerY > imageBottom) {
      wheelText.style.fill = "#333333";
    } else {
      wheelText.style.fill = "#ffffff";
    }
  }

  function animate() {
    updateWheelTextColor();
    requestAnimationFrame(animate);
  }
  animate();

  function updateTextColor() {
    const wheelRect = scrollWheel.getBoundingClientRect();
    const wheelCenter = wheelRect.top + wheelRect.height / 2;
    const imageBottom = heroImage.getBoundingClientRect().bottom;

    // Change color based on position relative to the hero image
    if (wheelCenter < imageBottom) {
      wheelText.style.fill = "white";
    } else {
      wheelText.style.fill = "#333333";
    }
  }

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
