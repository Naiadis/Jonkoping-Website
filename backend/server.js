const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
const STORES_PATH = path.join(__dirname, "data", "stores.json");
const model = require("./model");
const cookieParser = require("cookie-parser");
const {
	SECRET_KEY,
	generateToken,
	verifyToken,
	hashPassword,
	comparePassword,
} = require("./authUtils");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const app = express();
app.use(
	cors({
		origin: "http://localhost",
		credentials: true,
	})
);
app.use(express.json());
app.use(cookieParser());

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

// Replace the mock users array with database queries
async function findUserByUsername(username) {
	const result = await model.query("SELECT * FROM users WHERE username = $1", [
		username,
	]);
	return result.rows[0];
}

async function createUser(username, password, role = "user") {
	const passwordHash = await hashPassword(password);
	const result = await model.query(
		"INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING *",
		[username, passwordHash, role]
	);
	return result.rows[0];
}

// Login route
app.post("/api/login", async (req, res) => {
	try {
		const { username, password } = req.body;
		const result = await model.query(
			"SELECT * FROM users WHERE username = $1",
			[username]
		);

		const user = result.rows[0];

		if (!user || !(await comparePassword(password, user.password_hash))) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const token = generateToken(user);

		// Set cookie with longer expiration
		res.cookie("auth_token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		});

		res.json({
			message: "Login successful",
			user: { username: user.username, role: user.role },
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Add logout route
app.post("/api/logout", (req, res) => {
	res.clearCookie("auth_token");
	res.json({ message: "Logout successful" });
});

// Middleware to verify JWT
const authenticate = (req, res, next) => {
	const token = req.cookies.auth_token;
	if (!token) return res.status(401).json({ error: "Unauthorized" });

	try {
		const decoded = verifyToken(token);
		req.user = decoded;
		next();
	} catch (err) {
		res.status(401).json({ error: "Invalid token" });
	}
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
	if (req.user.role !== "admin") {
		return res.status(403).json({ error: "Forbidden" });
	}
	next();
};

// Admin routes
app.use("/api/admin", authenticate, isAdmin);

// Add new store
app.post("/api/admin/stores", (req, res) => {
	const newStore = req.body;
	const stores = require(STORES_PATH);
	stores.push(newStore);
	fs.writeFileSync(STORES_PATH, JSON.stringify(stores, null, 2));
	res.status(201).json(newStore);
});

// Update store
app.put("/api/admin/stores/:id", (req, res) => {
	const storeId = req.params.id;
	const updatedStore = req.body;
	const stores = require(STORES_PATH);

	const index = stores.findIndex((s) => s.id === storeId);
	if (index === -1) return res.status(404).json({ error: "Store not found" });

	stores[index] = { ...stores[index], ...updatedStore };
	fs.writeFileSync(STORES_PATH, JSON.stringify(stores, null, 2));
	res.json(stores[index]);
});

// Delete store
app.delete("/api/admin/stores/:id", (req, res) => {
	const storeId = req.params.id;
	const stores = require(STORES_PATH);

	const filteredStores = stores.filter((s) => s.id !== storeId);
	if (stores.length === filteredStores.length) {
		return res.status(404).json({ error: "Store not found" });
	}

	fs.writeFileSync(STORES_PATH, JSON.stringify(filteredStores, null, 2));
	res.json({ message: "Store deleted successfully" });
});

app.get("/", (req, res) => {
	res.send("Backend is running");
});

async function initializeDatabase() {
	try {
		// First ensure tables exist
		await model.query(`
			CREATE TABLE IF NOT EXISTS stores (
				id SERIAL PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				url VARCHAR(255),
				district VARCHAR(255),
				category VARCHAR(255)
			);

			CREATE TABLE IF NOT EXISTS users (
				id SERIAL PRIMARY KEY,
				username VARCHAR(255) UNIQUE NOT NULL,
				password_hash VARCHAR(255) NOT NULL,
				role VARCHAR(50) NOT NULL DEFAULT 'user'
			);
		`);

		// Then try to create admin user
		await createAdminUser();

		console.log("Database initialized successfully");
	} catch (err) {
		console.error("Database initialization error:", err);
	}
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
	console.log(`Server running on port ${PORT}`);
	// Wait a few seconds for the database to be ready
	setTimeout(async () => {
		await initializeDatabase();
	}, 3000);
});

async function generatePassword() {
	const password = "admin123"; // Replace with your desired password
	const hash = await bcrypt.hash(password, 10); // 10 is the salt rounds
	console.log("Hashed password:", hash);
}

generatePassword();

async function createAdminUser() {
	try {
		// Check if admin user exists
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

// Call this function during server startup
createAdminUser();
