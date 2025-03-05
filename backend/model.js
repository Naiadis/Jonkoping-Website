const { Pool } = require("pg");

class Model {
	constructor() {
		this.pool = new Pool({
			user: process.env.POSTGRES_USER,
			host: process.env.POSTGRES_HOST,
			database: process.env.POSTGRES_DB,
			password: process.env.POSTGRES_PASSWORD,
			port: 5432,
		});
	}

	async query(sql, params = []) {
		try {
			return await this.pool.query(sql, params);
		} catch (err) {
			console.error("Database query error:", err);
			throw err;
		}
	}

	async getStores() {
		try {
			const result = await this.query("SELECT * FROM stores");
			return result.rows;
		} catch (err) {
			console.error("Error fetching stores:", err);
			return []; // Return empty array on error
		}
	}

	async getStoreById(id) {
		try {
			console.log("Getting store with ID:", id);
			const result = await this.query("SELECT * FROM stores WHERE id = $1", [
				id,
			]);
			return result.rows[0];
		} catch (err) {
			console.error("Error fetching store by ID:", err);
			return null; // Return null on error
		}
	}

	async createStore(store) {
		try {
			const { name, url, district, category } = store;
			const result = await this.query(
				"INSERT INTO stores (name, url, district, category) VALUES ($1, $2, $3, $4) RETURNING *",
				[name, url, district, category]
			);
			return result.rows[0];
		} catch (err) {
			console.error("Error creating store:", err);
			// Return a basic object with the store data on error
			return {
				name: store.name,
				url: store.url,
				district: store.district,
				category: store.category,
			};
		}
	}

	async updateStore(id, store) {
		try {
			console.log("Updating store with ID:", id);
			const { name, url, district, category } = store;
			const result = await this.query(
				"UPDATE stores SET name = $1, url = $2, district = $3, category = $4 WHERE id = $5 RETURNING *",
				[name, url, district, category, id]
			);
			if (result.rows.length === 0) {
				console.log("No store found with ID:", id);
				return null;
			}
			return result.rows[0];
		} catch (err) {
			console.error("Error updating store:", err);
			return null;
		}
	}

	async deleteStore(id) {
		try {
			console.log("Deleting store with ID:", id);
			const result = await this.query(
				"DELETE FROM stores WHERE id = $1 RETURNING id",
				[id]
			);
			return result.rows.length > 0;
		} catch (err) {
			console.error("Error deleting store:", err);
			return false;
		}
	}
}

module.exports = new Model();
