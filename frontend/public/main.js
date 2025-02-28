async function fetchStores() {
	try {
		const response = await fetch("/api/stores");
		const stores = await response.json();

		console.log("Stores:", stores);
		return stores;
	} catch (error) {
		console.error("Error fetching stores:", error);
		return [];
	}
}

export { fetchStores };

document.addEventListener("DOMContentLoaded", async () => {
	const stores = await fetchStores();
});
