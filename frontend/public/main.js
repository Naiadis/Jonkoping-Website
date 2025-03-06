import { checkLoginStatus, handleLogin, handleLogout } from "./auth.js";
import {
	fetchStores,
	addNewStore,
	updateCarouselWithCategory,
	saveCurrentSlideIndex,
	getStoredSlideIndex,
} from "./storeManager.js";

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
		try {
			const data = await handleLogin(
				document.getElementById("username").value,
				document.getElementById("password").value
			);
			if (data.user.role === "admin") {
				document.getElementById("adminControls").style.display = "block";
				document.getElementById("loginDropdown").style.display = "none";
				document.getElementById("logoutButton").style.display = "block";
				updateCarouselWithCategory(
					document.querySelector(".category-nav a.active").getAttribute("href")
				);
				alert("Admin login successful!");
			}
		} catch (error) {
			alert("Login failed. Please check your credentials.");
		}
	});

	// Handle logout
	document
		.getElementById("logoutButton")
		?.addEventListener("click", async () => {
			try {
				await handleLogout();
				document.getElementById("adminControls").style.display = "none";
				document.getElementById("loginDropdown").style.display = "block";
				document.getElementById("logoutButton").style.display = "none";
				updateCarouselWithCategory(
					document.querySelector(".category-nav a.active").getAttribute("href")
				);
				alert("Logged out successfully!");
			} catch (error) {
				alert("Logout failed. Please try again.");
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
			try {
				await addNewStore(newStore);
				// Clear form
				e.target.reset();
				alert("Store added successfully");
				updateCarouselWithCategory(
					document.querySelector(".category-nav a.active").getAttribute("href")
				);
			} catch (error) {
				alert("Failed to add store: " + error.message);
			}
		});

	// If not already logged in, load initial category
	if (!isLoggedIn) {
		updateCarouselWithCategory("#clothing");
	}
});
