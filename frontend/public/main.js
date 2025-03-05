async function fetchStores() {
	try {
		const response = await fetch("/api/stores");
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const stores = await response.json();

		// Sort stores alphabetically by name
		stores.sort((a, b) => a.name.localeCompare(b.name));

		console.log("Stores (sorted):", stores);
		return stores;
	} catch (error) {
		console.error("Error fetching stores:", error);
		return [];
	}
}

function saveCurrentSlideIndex(categoryId, index) {
	localStorage.setItem(`currentSlide_${categoryId}`, index);
}

function getStoredSlideIndex(categoryId) {
	const stored = localStorage.getItem(`currentSlide_${categoryId}`);
	return stored ? parseInt(stored, 10) : 0;
}

// Check if user is admin
function isAdmin() {
	return document.getElementById("adminControls").style.display === "block";
}

function createCarouselSlide(store) {
	const slide = document.createElement("div");
	slide.classList.add("carousel-slide");
	slide.dataset.storeId = store.id; // Set store ID as data attribute

	const shopContent = document.createElement("div");
	shopContent.classList.add("shop-content");

	const shopName = document.createElement("h2");
	shopName.textContent = store.name;
	shopContent.appendChild(shopName);

	// Add ID display for debugging purposes
	if (isAdmin()) {
		const shopId = document.createElement("div");
		shopId.classList.add("shop-id");
		shopId.innerHTML = `<strong>ID:</strong> ${store.id || "N/A"}`;
		shopContent.appendChild(shopId);
	}

	const shopDescription = document.createElement("p");
	shopDescription.textContent = "Discover this amazing store in Jönköping!";
	shopContent.appendChild(shopDescription);

	const shopDistrict = document.createElement("div");
	shopDistrict.classList.add("shop-district");
	shopDistrict.innerHTML = `<strong>District:</strong> ${
		store.district || "Unknown"
	}`;
	shopContent.appendChild(shopDistrict);

	const shopCategory = document.createElement("div");
	shopCategory.classList.add("shop-category");
	shopCategory.innerHTML = `<strong>Category:</strong> ${
		store.category || "Uncategorized"
	}`;
	shopContent.appendChild(shopCategory);

	const visitButton = document.createElement("a");
	visitButton.href = store.url || "#";
	visitButton.classList.add("visit-btn");
	visitButton.textContent = "Visit Website";
	visitButton.target = "_blank";
	shopContent.appendChild(visitButton);

	// Admin controls for each store
	if (isAdmin()) {
		const adminButtons = document.createElement("div");
		adminButtons.classList.add("store-admin-controls");

		const editButton = document.createElement("button");
		editButton.textContent = "Edit";
		editButton.classList.add("edit-store-btn");
		editButton.addEventListener("click", () => toggleEditForm(store, slide));

		const deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";
		deleteButton.classList.add("delete-store-btn");
		deleteButton.addEventListener("click", () => deleteStore(store.id));

		adminButtons.appendChild(editButton);
		adminButtons.appendChild(deleteButton);
		shopContent.appendChild(adminButtons);
	}

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

function toggleEditForm(store, slideElement) {
	// Check if form already exists
	const existingForm = slideElement.querySelector(".edit-store-form");

	if (existingForm) {
		// If form exists, remove it
		existingForm.remove();
		return;
	}

	// Create edit form
	const editForm = document.createElement("form");
	editForm.classList.add("edit-store-form");

	editForm.innerHTML = `
  <h4>Edit Store</h4>
  <div class="form-field">
    <label>Store ID: ${store.id}</label>
    <input type="hidden" name="id" value="${store.id || ""}" />
  </div>
  <div class="form-field">
    <label>Name:</label>
    <input type="text" name="name" placeholder="Store Name" value="${
			store.name
		}" required />
  </div>
  <div class="form-field">
    <label>URL:</label>
    <input type="text" name="url" placeholder="Store URL" value="${
			store.url || ""
		}" />
  </div>
  <div class="form-field">
    <label>District:</label>
    <select name="district">
      <option value="">Select District</option>
      <option value="Öster" ${
				store.district === "Öster" ? "selected" : ""
			}>Öster</option>
      <option value="Väster" ${
				store.district === "Väster" ? "selected" : ""
			}>Väster</option>
      <option value="Atollen" ${
				store.district === "Atollen" ? "selected" : ""
			}>Atollen</option>
      <option value="Tändsticksområdet" ${
				store.district === "Tändsticksområdet" ? "selected" : ""
			}>Tändsticksområdet</option>
      <option value="Resecentrum" ${
				store.district === "Resecentrum" ? "selected" : ""
			}>Resecentrum</option>
			<option value="Centrum" ${
				store.district === "Centrum" ? "selected" : ""
			}>Centrum</option>
    </select>
  </div>
  <div class="form-field">
    <label>Category:</label>
    <select name="category" required>
      <option value="">Select Category</option>
      <option value="Clothing & Fashion" ${
				store.category === "Clothing & Fashion" ? "selected" : ""
			}>Clothing & Fashion</option>
      <option value="Food & Drinks" ${
				store.category === "Food & Drinks" ? "selected" : ""
			}>Food & Drinks</option>
      <option value="Health & Beauty" ${
				store.category === "Health & Beauty" ? "selected" : ""
			}>Health & Beauty</option>
      <option value="Home & Lifestyle" ${
				store.category === "Home & Lifestyle" ? "selected" : ""
			}>Home & Lifestyle</option>
      <option value="Services" ${
				store.category === "Services" ? "selected" : ""
			}>Services</option>
      <option value="Specialty & Hobby" ${
				store.category === "Specialty & Hobby" ? "selected" : ""
			}>Specialty & Hobby</option>
      <option value="Others" ${
				store.category === "Others" ? "selected" : ""
			}>Others</option>
    </select>
  </div>
  <div class="form-actions">
    <button type="submit">Save</button>
    <button type="button" class="cancel-btn">Cancel</button>
  </div>
`;

	// Add submit handler
	editForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		const formData = new FormData(editForm);
		const updatedStore = {
			id: formData.get("id"),
			name: formData.get("name"),
			url: formData.get("url"),
			district: formData.get("district"),
			category: formData.get("category"),
		};

		console.log("Submitting update for store:", updatedStore);
		await updateStore(updatedStore);
	});

	// Add cancel handler
	editForm.querySelector(".cancel-btn").addEventListener("click", () => {
		editForm.remove();
	});

	// Insert form after store content
	slideElement.querySelector(".shop-content").appendChild(editForm);
}

async function updateStore(store) {
	try {
		// Store the current category for refreshing the same view later
		const currentCategoryId = document
			.querySelector(".category-nav a.active")
			.getAttribute("href");

		console.log(`Sending update request for store ID: ${store.id}`);

		const response = await fetch(`/api/admin/stores/${store.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(store),
			credentials: "include",
		});

		// Check for authentication errors
		if (response.status === 401 || response.status === 403) {
			alert("Your session has expired. Please log in again.");
			await checkLoginStatus(); // Refresh login status
			return;
		}

		const responseText = await response.text();
		console.log(
			`Server response status: ${response.status}, text: ${responseText}`
		);

		let responseData;
		try {
			responseData = JSON.parse(responseText);
		} catch (e) {
			responseData = { message: responseText };
		}

		if (response.ok) {
			alert("Store updated successfully");
			// Refresh the same category view
			updateCarouselWithCategory(currentCategoryId);
		} else {
			const errorMessage =
				responseData.error || responseData.message || "Failed to update store";
			alert(`Error: ${errorMessage}`);
			console.error("Failed to update store:", responseData);
		}
	} catch (error) {
		console.error("Update store error:", error);
		alert(`Network error: ${error.message}`);
	}
}

async function deleteStore(storeId) {
	if (!confirm("Are you sure you want to delete this store?")) {
		return;
	}

	try {
		console.log(`Sending delete request for store ID: ${storeId}`);
		const response = await fetch(`/api/admin/stores/${storeId}`, {
			method: "DELETE",
			credentials: "include",
		});

		// Check for authentication errors
		if (response.status === 401 || response.status === 403) {
			alert("Your session has expired. Please log in again.");
			await checkLoginStatus(); // Refresh login status
			return;
		}

		const responseText = await response.text();
		console.log(
			`Server response status: ${response.status}, text: ${responseText}`
		);

		let responseData;
		try {
			responseData = JSON.parse(responseText);
		} catch (e) {
			responseData = { message: responseText };
		}

		if (response.ok) {
			alert("Store deleted successfully");
			// Refresh the current view
			updateCarouselWithCategory(
				document.querySelector(".category-nav a.active").getAttribute("href")
			);
		} else {
			const errorMessage =
				responseData.error || responseData.message || "Failed to delete store";
			alert(`Error: ${errorMessage}`);
			console.error("Failed to delete store:", responseData);
		}
	} catch (error) {
		console.error("Delete store error:", error);
		alert(`Network error: ${error.message}`);
	}
}

function initializeCarousel(slides, categoryId) {
	const carouselContainer = document.querySelector(".carousel-container");
	const dotsContainer = document.querySelector(".carousel-dots");

	// Clear existing content
	carouselContainer.innerHTML = "";
	dotsContainer.innerHTML = "";

	// Add slides
	slides.forEach((slide, index) => {
		carouselContainer.appendChild(slide);
	});

	// Create dots based on number of slides (up to 5)
	const dotsToShow = Math.min(slides.length, 5);
	for (let i = 0; i < dotsToShow; i++) {
		const dot = document.createElement("span");
		dot.classList.add("dot");
		dot.dataset.index = i;
		dotsContainer.appendChild(dot);
	}

	// Initialize with stored slide position or default to first slide
	if (slides.length > 0) {
		const initialIndex = getStoredSlideIndex(categoryId);
		const validIndex = initialIndex < slides.length ? initialIndex : 0;

		slides[validIndex].classList.add("active");

		const dotIndex = Math.min(validIndex, dotsToShow - 1);
		const targetDot = dotsContainer.querySelector(
			`.dot:nth-child(${dotIndex + 1})`
		);
		if (targetDot) targetDot.classList.add("active");
	}
}

function initializeCarouselNavigation(categoryId) {
	const slides = document.querySelectorAll(".carousel-slide");
	const dots = document.querySelectorAll(".dot");
	const prevBtn = document.querySelector(".prev-btn");
	const nextBtn = document.querySelector(".next-btn");

	if (slides.length > 0 && dots.length > 0) {
		let currentSlide = getStoredSlideIndex(categoryId);
		if (currentSlide >= slides.length) currentSlide = 0;

		function showSlide(index) {
			slides.forEach((slide) => {
				slide.classList.remove("active", "prev");
			});

			dots.forEach((dot) => {
				dot.classList.remove("active");
			});

			slides[index].classList.add("active");

			// Calculate which dot should be active
			const activeDotIndex = Math.min(index, dots.length - 1);
			dots[activeDotIndex].classList.add("active");

			// Add prev class to previous slide for animation
			const prevIndex = (index - 1 + slides.length) % slides.length;
			slides[prevIndex].classList.add("prev");

			currentSlide = index;
			saveCurrentSlideIndex(categoryId, index);
		}

		// Initialize with the stored or default position
		showSlide(currentSlide);

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
				const slideIndex = Math.min(index, slides.length - 1);
				showSlide(slideIndex);
			});
		});
	}
}

async function addNewStore(store) {
	try {
		// Store the current category for refreshing the same view later
		const currentCategoryId = document
			.querySelector(".category-nav a.active")
			.getAttribute("href");

		console.log("Sending add store request:", store);

		const response = await fetch("/api/admin/stores", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(store),
			credentials: "include",
		});

		// Log full response details for debugging
		console.log("Add store response status:", response.status);
		console.log(
			"Add store response headers:",
			Object.fromEntries(response.headers.entries())
		);

		// Check for specific error statuses
		if (response.status === 401 || response.status === 403) {
			alert("Your session has expired. Please log in again.");
			await checkLoginStatus(); // Refresh login status
			return;
		}

		// Read response text for more detailed error information
		const responseText = await response.text();
		console.log("Add store response text:", responseText);

		// Try to parse as JSON if possible
		let responseData;
		try {
			responseData = JSON.parse(responseText);
		} catch (e) {
			responseData = { message: responseText };
		}

		if (response.ok) {
			alert("Store added successfully");

			// Clear form
			document.getElementById("newStoreName").value = "";
			document.getElementById("newStoreUrl").value = "";
			document.getElementById("newStoreDistrict").value = "";
			document.getElementById("newStoreCategory").value = "";

			// Refresh the same category view
			updateCarouselWithCategory(currentCategoryId);
		} else {
			// More detailed error handling
			const errorMessage =
				responseData.error || responseData.message || "Failed to add store";
			alert(`Error: ${errorMessage}`);
			console.error("Failed to add store:", responseData);
		}
	} catch (error) {
		console.error("Add store error:", error);
		alert(`Network error: ${error.message}`);
	}
}
// Check login status on page load
async function checkLoginStatus() {
	try {
		const response = await fetch("/api/check-auth", {
			credentials: "include",
		});

		if (response.ok) {
			const data = await response.json();
			if (data.authenticated && data.role === "admin") {
				// Show admin controls
				document.getElementById("adminControls").style.display = "block";
				document.getElementById("logoutButton").style.display = "block";
				document.getElementById("loginDropdown").style.display = "none";

				// Refresh store display to add admin buttons
				updateCarouselWithCategory("#clothing");
				return true;
			}
		}
		return false;
	} catch (error) {
		console.error("Error checking auth status:", error);
		return false;
	}
}

async function updateCarouselWithCategory(categoryId) {
	try {
		const stores = await fetchStores();
		const categoryStores = getStoresByCategory(stores, categoryId);
		const slides = categoryStores.map((store) => createCarouselSlide(store));

		initializeCarousel(slides, categoryId);
		initializeCarouselNavigation(categoryId);
	} catch (error) {
		console.error("Error updating carousel:", error);
	}
}

function getStoresByCategory(stores, categoryId) {
	const categoryMap = {
		"#clothing": "Clothing & Fashion",
		"#food": "Food & Drinks",
		"#health": "Health & Beauty",
		"#home": "Home & Lifestyle",
		"#services": "Services",
		"#specialty": "Specialty & Hobby",
		"#others": "Others",
	};

	const targetCategory = categoryMap[categoryId];
	return stores.filter((store) => store.category === targetCategory);
}

// Document ready function
document.addEventListener("DOMContentLoaded", async () => {
	// Check login status
	const isLoggedIn = await checkLoginStatus();

	// Initialize categories and first category view
	const categoryLinks = document.querySelectorAll(".category-nav a");
	categoryLinks.forEach((link) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();
			categoryLinks.forEach((l) => l.classList.remove("active"));
			link.classList.add("active");
			updateCarouselWithCategory(link.getAttribute("href"));
		});
	});

	// Handle login form
	const loginForm = document.getElementById("loginForm");
	loginForm?.addEventListener("submit", async (e) => {
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
				const data = await response.json();
				if (data.user.role === "admin") {
					document.getElementById("adminControls").style.display = "block";
					document.getElementById("loginDropdown").style.display = "none";
					document.getElementById("logoutButton").style.display = "block";

					// Refresh the current view to add admin buttons
					updateCarouselWithCategory(
						document
							.querySelector(".category-nav a.active")
							.getAttribute("href")
					);

					alert("Admin login successful!");
				} else {
					alert("Welcome! You are logged in as a regular user.");
				}
			} else {
				alert("Login failed. Please check your credentials.");
			}
		} catch (error) {
			console.error("Login error:", error);
			alert("Login error. Please try again later.");
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
					document.getElementById("adminControls").style.display = "none";
					document.getElementById("loginDropdown").style.display = "block";
					document.getElementById("logoutButton").style.display = "none";

					// Refresh the current view to remove admin buttons
					updateCarouselWithCategory(
						document
							.querySelector(".category-nav a.active")
							.getAttribute("href")
					);

					alert("Logged out successfully!");
				} else {
					alert("Logout failed. Please try again.");
				}
			} catch (error) {
				console.error("Logout error:", error);
				alert("Logout error. Please try again later.");
			}
		});

	// Handle new store form
	document
		.getElementById("addStoreForm")
		?.addEventListener("submit", async (e) => {
			e.preventDefault();

			const newStore = {
				name: document.getElementById("newStoreName").value,
				url: document.getElementById("newStoreUrl").value,
				district: document.getElementById("newStoreDistrict").value,
				category: document.getElementById("newStoreCategory").value,
			};

			await addNewStore(newStore);
		});

	// If not already logged in, load initial category
	if (!isLoggedIn) {
		updateCarouselWithCategory("#clothing");
	}
});
