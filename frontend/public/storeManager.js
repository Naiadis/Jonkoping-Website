import { isAdmin, checkLoginStatus } from "./auth.js";

export async function fetchStores() {
	try {
		const response = await fetch("/api/stores");
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const stores = await response.json();
		stores.sort((a, b) => a.name.localeCompare(b.name));
		return stores;
	} catch (error) {
		console.error("Error fetching stores:", error);
		return [];
	}
}

export async function addNewStore(store) {
	try {
		const response = await fetch("/api/admin/stores", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(store),
			credentials: "include",
		});

		if (response.status === 401 || response.status === 403) {
			alert("Authentication required. Please log in again.");
			await checkLoginStatus();
			return;
		}

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Error adding store: ${response.status} ${response.statusText}`
			);
		}

		return await response.json();
	} catch (error) {
		console.error("Add store error:", error);
		throw error;
	}
}

export async function updateStore(store) {
	try {
		const response = await fetch(`/api/admin/stores/${store.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(store),
			credentials: "include",
		});

		if (response.status === 401 || response.status === 403) {
			alert("Your session has expired. Please log in again.");
			await checkLoginStatus();
			return;
		}

		if (!response.ok) {
			throw new Error("Failed to update store");
		}

		return await response.json();
	} catch (error) {
		console.error("Update store error:", error);
		throw error;
	}
}

export async function deleteStore(storeId) {
	try {
		const response = await fetch(`/api/admin/stores/${storeId}`, {
			method: "DELETE",
			credentials: "include",
		});

		if (response.status === 401 || response.status === 403) {
			alert("Your session has expired. Please log in again.");
			await checkLoginStatus();
			return;
		}

		if (!response.ok) {
			throw new Error("Failed to delete store");
		}

		return await response.json();
	} catch (error) {
		console.error("Delete store error:", error);
		throw error;
	}
}

// Carousel-related functions
export function saveCurrentSlideIndex(categoryId, index) {
	localStorage.setItem(`currentSlide_${categoryId}`, index);
}

export function getStoredSlideIndex(categoryId) {
	const stored = localStorage.getItem(`currentSlide_${categoryId}`);
	return stored ? parseInt(stored, 10) : 0;
}

// Export other carousel-related functions
export {
	createCarouselSlide,
	initializeCarousel,
	initializeCarouselNavigation,
	getStoresByCategory,
};
