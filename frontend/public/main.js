async function fetchStores() {
	try {
		const response = await fetch("http://localhost:5000/api/stores");
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const stores = await response.json();
		console.log("Stores:", stores);
		return stores;
	} catch (error) {
		console.error("Error fetching stores:", error);
		return [];
	}
}

function createCarouselSlide(store) {
	const slide = document.createElement("div");
	slide.classList.add("carousel-slide");

	const shopContent = document.createElement("div");
	shopContent.classList.add("shop-content");

	const shopName = document.createElement("h2");
	shopName.textContent = store.name;
	shopContent.appendChild(shopName);

	const shopDescription = document.createElement("p");
	shopDescription.textContent = "Discover this amazing store in Jönköping!";
	shopContent.appendChild(shopDescription);

	const shopDistrict = document.createElement("div");
	shopDistrict.classList.add("shop-district");
	shopDistrict.innerHTML = `<strong>District:</strong> ${
		store.district || "Unknown"
	}`;
	shopContent.appendChild(shopDistrict);

	const visitButton = document.createElement("a");
	visitButton.href = store.url || "#";
	visitButton.classList.add("visit-btn");
	visitButton.textContent = "Visit Website";
	shopContent.appendChild(visitButton);

	const shopImages = document.createElement("div");
	shopImages.classList.add("shop-images");

	const mainImage = document.createElement("div");
	mainImage.classList.add("main-image");
	shopImages.appendChild(mainImage);

	const smallImages = document.createElement("div");
	smallImages.classList.add("small-images");

	const smallImage1 = document.createElement("div");
	smallImage1.classList.add("small-image");
	smallImages.appendChild(smallImage1);

	const smallImage2 = document.createElement("div");
	smallImage2.classList.add("small-image");
	smallImages.appendChild(smallImage2);

	shopImages.appendChild(smallImages);

	slide.appendChild(shopContent);
	slide.appendChild(shopImages);

	return slide;
}

function initializeCarousel(slides) {
	const carouselContainer = document.querySelector(".carousel-container");
	const dotsContainer = document.querySelector(".carousel-dots");

	// Clear existing content
	carouselContainer.innerHTML = "";
	dotsContainer.innerHTML = "";

	// Add slides
	slides.forEach((slide, index) => {
		carouselContainer.appendChild(slide);
	});

	// Always create 3 dots
	for (let i = 0; i < 3; i++) {
		const dot = document.createElement("span");
		dot.classList.add("dot");
		dot.dataset.index = i;
		dotsContainer.appendChild(dot);
	}

	// Initialize first slide and dot
	if (slides.length > 0) {
		slides[0].classList.add("active");
		dotsContainer.querySelector(".dot").classList.add("active");
	}
}

function initializeCarouselNavigation() {
	const slides = document.querySelectorAll(".carousel-slide");
	const dots = document.querySelectorAll(".dot");
	const prevBtn = document.querySelector(".prev-btn");
	const nextBtn = document.querySelector(".next-btn");

	if (slides.length > 0 && dots.length > 0) {
		let currentSlide = 0;

		function showSlide(index) {
			slides.forEach((slide) => {
				slide.classList.remove("active", "prev");
			});

			dots.forEach((dot) => {
				dot.classList.remove("active");
			});

			slides[index].classList.add("active");

			// Calculate which dot should be active
			const activeDotIndex = index % 3;
			dots[activeDotIndex].classList.add("active");

			// Add prev class to previous slide for animation
			const prevIndex = (index - 1 + slides.length) % slides.length;
			slides[prevIndex].classList.add("prev");

			currentSlide = index;
		}

		showSlide(0);

		nextBtn?.addEventListener("click", function () {
			const nextSlide = (currentSlide + 1) % slides.length;
			showSlide(nextSlide);
		});

		prevBtn?.addEventListener("click", function () {
			const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
			showSlide(prevSlide);
		});

		dots.forEach((dot, index) => {
			dot.addEventListener("click", function () {
				// Calculate which slide to show based on dot click
				const targetSlide = Math.floor(currentSlide / 3) * 3 + index;
				showSlide(targetSlide % slides.length);
			});
		});
	}
}

// export { fetchStores };

document.addEventListener("DOMContentLoaded", async () => {
	console.log("DOM loaded, fetching stores...");
	try {
		const stores = await fetchStores();
		console.log("Stores fetched:", stores.length);
		const slides = stores.map((store) => createCarouselSlide(store));
		initializeCarousel(slides);
		initializeCarouselNavigation();
	} catch (error) {
		console.error("Error initializing carousel:", error);
	}
});
