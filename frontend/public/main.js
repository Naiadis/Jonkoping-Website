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

document.addEventListener("DOMContentLoaded", () => {
	const loginForm = document.getElementById("loginForm");
	const adminControls = document.getElementById("adminControls");

	// Handle login
	loginForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		const username = document.getElementById("username").value;
		const password = document.getElementById("password").value;

		try {
			const response = await fetch("/api/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
				credentials: "include",
			});

			if (response.ok) {
				adminControls.style.display = "block";
				loginForm.style.display = "none"; // Hide login form
				document.getElementById("logoutButton").style.display = "block"; // Show logout button
				alert("Login successful!");
			} else {
				alert("Login failed");
			}
		} catch (error) {
			console.error("Login error:", error);
			alert("Login error");
		}
	});

	// Handle logout
	document
		.getElementById("logoutButton")
		?.addEventListener("click", async () => {
			try {
				const response = await fetch("/api/logout", {
					method: "POST",
					credentials: "include",
				});

				if (response.ok) {
					adminControls.style.display = "none";
					loginForm.style.display = "block"; // Show login form again
					document.getElementById("logoutButton").style.display = "none"; // Hide logout button
					// Clear any input fields
					document.getElementById("username").value = "";
					document.getElementById("password").value = "";
					alert("Logged out successfully!");
				} else {
					alert("Logout failed");
				}
			} catch (error) {
				console.error("Logout error:", error);
				alert("Logout error");
			}
		});

	// Handle add store
	document
		.getElementById("addStoreForm")
		.addEventListener("submit", async (e) => {
			e.preventDefault();
			const store = {
				name: document.getElementById("storeName").value,
				url: document.getElementById("storeUrl").value,
				district: document.getElementById("storeDistrict").value,
				category: document.getElementById("storeCategory").value,
			};

			try {
				const response = await fetch("/api/admin/stores", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${getCookie("auth_token")}`,
					},
					body: JSON.stringify(store),
				});

				if (response.ok) {
					alert("Store added successfully");
					location.reload(); // Refresh to show new store
				} else {
					alert("Failed to add store");
				}
			} catch (error) {
				console.error("Add store error:", error);
				alert("Error adding store");
			}
		});

	// Handle update store
	document
		.getElementById("updateStoreForm")
		.addEventListener("submit", async (e) => {
			e.preventDefault();
			const storeId = document.getElementById("updateStoreId").value;
			const store = {
				name: document.getElementById("updateStoreName").value,
				url: document.getElementById("updateStoreUrl").value,
				district: document.getElementById("updateStoreDistrict").value,
				category: document.getElementById("updateStoreCategory").value,
			};

			try {
				const response = await fetch(`/api/admin/stores/${storeId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${getCookie("auth_token")}`,
					},
					body: JSON.stringify(store),
				});

				if (response.ok) {
					alert("Store updated successfully");
					location.reload();
				} else {
					alert("Failed to update store");
				}
			} catch (error) {
				console.error("Update store error:", error);
				alert("Error updating store");
			}
		});

	// Handle delete store
	document
		.getElementById("deleteStoreForm")
		.addEventListener("submit", async (e) => {
			e.preventDefault();
			const storeId = document.getElementById("deleteStoreId").value;

			try {
				const response = await fetch(`/api/admin/stores/${storeId}`, {
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${getCookie("auth_token")}`,
					},
				});

				if (response.ok) {
					alert("Store deleted successfully");
					location.reload();
				} else {
					alert("Failed to delete store");
				}
			} catch (error) {
				console.error("Delete store error:", error);
				alert("Error deleting store");
			}
		});
});

// Helper function to get cookies
function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(";").shift();
}

async function createAdminUser() {
	try {
		const adminExists = await model.query(
			"SELECT * FROM users WHERE username = $1",
			["admin"]
		);

		if (adminExists.rows.length === 0) {
			const passwordHash = await hashPassword("admin123");
			await model.query(
				"INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)",
				["admin", passwordHash, "admin"]
			);
			console.log("Admin user created");
		} else {
			console.log("Admin user already exists");
		}
	} catch (err) {
		console.error("Error creating admin user:", err);
	}
}

function getStoresByCategory(stores, category) {
	// Map frontend category links to store.json category values
	const categoryMap = {
		"#clothing": "Clothing & Fashion",
		"#food": "Food & Drinks",
		"#health": "Health & Beauty",
		"#home": "Home & Lifestyle",
		"#services": "Services",
		"#specialty": "Specialty & Hobby",
		"#others": "Others",
	};

	// Return all stores if no category selected
	if (!category) return stores;

	// Filter stores by the selected category
	return stores.filter((store) => store.category === categoryMap[category]);
}

// Update the carousel with stores from the selected category
async function updateCarouselWithCategory(category) {
	const stores = await fetchStores();
	const categoryStores = getStoresByCategory(stores, category);
	const slides = categoryStores.map((store) => createCarouselSlide(store));

	// Handle case with no stores in category
	if (slides.length === 0) {
		const emptySlide = document.createElement("div");
		emptySlide.classList.add("carousel-slide");
		emptySlide.innerHTML = `
		<div class="shop-content">
		  <h2>No stores found</h2>
		  <p>There are no stores in this category at the moment.</p>
		</div>
	  `;
		slides.push(emptySlide);
	}

	initializeCarousel(slides);
	initializeCarouselNavigation();
}

// Initialize category navigation
function initializeCategoryNavigation() {
	const categoryLinks = document.querySelectorAll(".category-nav a");

	categoryLinks.forEach((link) => {
		link.addEventListener("click", function (e) {
			e.preventDefault();

			// Remove active class from all links
			categoryLinks.forEach((l) => l.classList.remove("active"));

			// Add active class to clicked link
			this.classList.add("active");

			// Get the href attribute (category)
			const category = this.getAttribute("href");

			// Update carousel with stores from the selected category
			updateCarouselWithCategory(category);
		});
	});
}

// Update the existing document ready function
document.addEventListener("DOMContentLoaded", async () => {
	try {
		// Initial load with all stores
		const stores = await fetchStores();
		const slides = stores.map((store) => createCarouselSlide(store));
		initializeCarousel(slides);
		initializeCarouselNavigation();

		// Initialize category navigation
		initializeCategoryNavigation();
	} catch (error) {
		console.error("Error initializing carousel:", error);
	}
});
