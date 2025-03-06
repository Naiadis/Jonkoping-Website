document.addEventListener("DOMContentLoaded", function () {
  // Scroll wheel animation
  const scrollWheel = document.querySelector(".scroll-wheel");

  // Scroll to shops section when scroll wheel is clicked
  scrollWheel.addEventListener("click", function () {
    const shopsSection = document.querySelector(".shops-section");
    if (shopsSection) {
      shopsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
  // Cursor circle functionality
  const cursorCircle = document.querySelector(".cursor-circle");

  // Define all clickable elements
  const clickableElements =
    'a, button, .visit-btn,.scroll-wheel, .back-to-top, .language-btn, .hamburger, input[type="submit"]';

  // Add hover effect
  document.querySelectorAll(clickableElements).forEach((element) => {
    element.addEventListener("mouseenter", () => {
      cursorCircle.classList.add("cursor-hover");
    });

    element.addEventListener("mouseleave", () => {
      cursorCircle.classList.remove("cursor-hover");
    });
  });

  // Ensure cursor follows mouse
  document.addEventListener("mousemove", (e) => {
    cursorCircle.style.left = `${e.clientX}px`;
    cursorCircle.style.top = `${e.clientY}px`;
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

  // // Carousel functionality
  // const slides = document.querySelectorAll(".carousel-slide");
  // const dots = document.querySelectorAll(".dot");
  // const prevBtn = document.querySelector(".prev-btn");
  // const nextBtn = document.querySelector(".next-btn");
  // let currentSlide = 0;

  // function showSlide(index) {
  //   // Remove all classes
  //   slides.forEach((slide) => {
  //     slide.classList.remove("active", "prev");
  //   });

  //   dots.forEach((dot) => {
  //     dot.classList.remove("active");
  //   });

  //   // Add active class to current slide
  //   slides[index].classList.add("active");
  //   dots[index].classList.add("active");

  //   // Add prev class to previous slide for animation
  //   const prevIndex = (index - 1 + slides.length) % slides.length;
  //   slides[prevIndex].classList.add("prev");

  //   currentSlide = index;
  // }

  // // Initialize first slide
  // showSlide(0);

  // // Next button
  // nextBtn.addEventListener("click", function () {
  //   const nextSlide = (currentSlide + 1) % slides.length;
  //   showSlide(nextSlide);
  // });

  // // Previous button
  // prevBtn.addEventListener("click", function () {
  //   const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
  //   showSlide(prevSlide);
  // });

  // // Dot navigation
  // dots.forEach((dot, index) => {
  //   dot.addEventListener("click", function () {
  //     showSlide(index);
  //   });
  // });

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
  });

  // Initial calls
  animateSections();

  function animate() {
    requestAnimationFrame(animate);
  }
  animate();

  // Update on scroll with throttling
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        // updateTextColor();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Add scroll listener for sections
  window.addEventListener("scroll", animateSections);

  let lastScrollPosition = 0;
  let isScrollingDown = false;
  const header = document.querySelector(".header");
  // const scrollThreshold = 50; // numărul de pixeli după care header-ul se ascunde

  function handleScroll() {
    const currentScrollPosition = window.pageYOffset;

    if (currentScrollPosition > lastScrollPosition && !isScrollingDown) {
      isScrollingDown = true;
      header.classList.add("hidden");
    } else if (currentScrollPosition < lastScrollPosition && isScrollingDown) {
      isScrollingDown = false;
      header.classList.remove("hidden");
    }

    lastScrollPosition = currentScrollPosition;
  }

  let scrollTimeout;
  window.addEventListener("scroll", () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }

    scrollTimeout = window.requestAnimationFrame(() => {
      handleScroll();
    });
  });

  // Hamburger menu functionality
  const hamburger = document.querySelector(".hamburger");
  const mainNav = document.querySelector(".main-nav");

  hamburger.addEventListener("click", () => {
    mainNav.classList.toggle("active"); // Toggle the menu
  });

  // Login dropdown functionality
  const loginDropdown = document.getElementById("loginDropdown");
  const loginBtn = document.querySelector(".login-btn");
  const dropdownContent = document.querySelector(".dropdown-content");

  loginBtn.addEventListener("click", () => {
    dropdownContent.style.display =
      dropdownContent.style.display === "block" ? "none" : "block";
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (!loginDropdown.contains(event.target)) {
      dropdownContent.style.display = "none"; // Hide dropdown if clicked outside
    }
  });
});
