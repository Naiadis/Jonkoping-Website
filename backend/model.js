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
		const result = await this.query("SELECT * FROM stores");
		return result.rows;
	}

	async getStoreById(id) {
		const result = await this.query("SELECT * FROM stores WHERE id = $1", [id]);
		return result.rows[0];
	}

	async createStore(store) {
		const { name, url, district } = store;
		const result = await this.query(
			"INSERT INTO stores (name, url, district, category) VALUES ($1, $2, $3, $4) RETURNING *",
			[name, url, district, category]
		);
		return result.rows[0];
	}
}

module.exports = new Model();
