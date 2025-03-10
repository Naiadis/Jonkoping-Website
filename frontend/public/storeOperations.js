// Load stores from database
async function fetchStores() {
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

async function updateStore(store) {
	try {
		const response = await fetch(`/api/admin/stores/${store.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(store),
			credentials: "include",
		});

		const responseText = await response.text();
		return {
			ok: response.ok,
			status: response.status,
			data: responseText,
		};
	} catch (error) {
		console.error("Update store error:", error);
		return { ok: false, error: error.message };
	}
}

async function deleteStore(storeId) {
	try {
		// Ensure storeId is properly formatted
		const id = parseInt(storeId, 10);
		if (isNaN(id)) {
			return {
				ok: false,
				error: "Invalid store ID",
			};
		}

		const response = await fetch(`/api/admin/stores/${id}`, {
			method: "DELETE",
			credentials: "include",
		});

		// Handle 404 specifically
		if (response.status === 404) {
			return {
				ok: false,
				status: 404,
				error: "Store not found",
			};
		}

		const responseText = await response.text();
		let data;
		try {
			data = JSON.parse(responseText);
		} catch (e) {
			data = responseText;
		}

		return {
			ok: response.ok,
			status: response.status,
			data: data,
		};
	} catch (error) {
		console.error("Delete store error:", error);
		return {
			ok: false,
			error: error.message,
		};
	}
}

async function addNewStore(store) {
	try {
		const response = await fetch("/api/admin/stores", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(store),
			credentials: "include",
		});

		const responseText = await response.text();
		return {
			ok: response.ok,
			status: response.status,
			data: responseText,
		};
	} catch (error) {
		console.error("Add store error:", error);
		return { ok: false, error: error.message };
	}
}

export { fetchStores, updateStore, deleteStore, addNewStore };
