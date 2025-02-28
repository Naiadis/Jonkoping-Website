const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
const STORES_PATH = path.join(__dirname, "data", "stores.json");
const model = require("./model");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
	user: process.env.POSTGRES_USER,
	host: process.env.POSTGRES_HOST,
	database: process.env.POSTGRES_DB,
	password: process.env.POSTGRES_PASSWORD,
	port: 5432,
});

const storesData = require(STORES_PATH);

async function populateDatabase() {
	try {
		const stores = require(STORES_PATH);
		for (const store of stores) {
			await model.createStore(store);
		}
		console.log("Database populated with stores");
	} catch (err) {
		console.error("Error populating database:", err);
	}
}

app.get("/api/test", async (req, res) => {
	try {
		const result = await model.query("SELECT NOW()");
		res.json({ success: true, time: result.rows[0].now });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Database error" });
	}
});

app.get("/api/stores", async (req, res) => {
	try {
		const countResult = await model.query("SELECT COUNT(*) FROM stores");
		const count = parseInt(countResult.rows[0].count);

		if (count === 0) {
			await populateDatabase();
		}

		const stores = await model.getStores();
		res.json(stores);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Database error" });
	}
});

app.get("/api/stores/:id", async (req, res) => {
	try {
		const store = await model.getStoreById(req.params.id);
		if (store) {
			res.json(store);
		} else {
			res.status(404).json({ error: "Store not found" });
		}
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({ error: "Database error" });
	}
});

app.post("/api/stores", async (req, res) => {
	try {
		const newStore = await model.createStore(req.body);
		res.status(201).json(newStore);
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({ error: "Database error" });
	}
});

app.get("/", (req, res) => {
	res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
