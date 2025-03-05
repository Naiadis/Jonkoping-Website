const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

// Import utility functions for authentication
const {
	SECRET_KEY,
	generateToken,
	verifyToken,
	hashPassword,
	comparePassword,
} = require("./authUtils");

// Import database model
const model = require("./model");

// Path to the JSON file with store data
const STORES_PATH = path.join(__dirname, "data", "stores.json");

// Create Express app
const app = express();

// Middleware
app.use(
	cors({
		origin: "http://localhost",
		credentials: true,
	})
);
app.use(express.json());
app.use(cookieParser());

// Authentication middleware
const authenticate = (req, res, next) => {
	const token = req.cookies.auth_token;
	if (!token) return res.status(401).json({ error: "Unauthorized" });

	try {
		const decoded = verifyToken(token);
		req.user = decoded;
		next();
	} catch (err) {
		console.error("Authentication error:", err);
		res.status(401).json({ error: "Invalid token" });
	}
};

// Admin role middleware
const isAdmin = (req, res, next) => {
	if (req.user.role !== "admin") {
		return res.status(403).json({ error: "Forbidden" });
	}
	next();
};

// Helper function to ensure a store ID is numeric
function getNumericId(id) {
	return parseInt(id, 10);
}

// Database initialization functions
async function populateDatabase() {
	try {
		// Read the stores from the JSON file
		const stores = require(STORES_PATH);
		console.log(`Populating database with ${stores.length} stores from JSON`);

		for (const store of stores) {
			await model.createStore(store);
		}
		console.log("Database populated with stores");
	} catch (err) {
		console.error("Error populating database:", err);
	}
}

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

// API Routes
app.get("/api/test", async (req, res) => {
	try {
		const result = await model.query("SELECT NOW()");
		res.json({ success: true, time: result.rows[0].now });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Database error" });
	}
});

// Get all stores
app.get("/api/stores", async (req, res) => {
	try {
		// Check if stores exist in database
		const countResult = await model.query("SELECT COUNT(*) FROM stores");
		const count = parseInt(countResult.rows[0].count);

		if (count === 0) {
			await populateDatabase();
		}

		const stores = await model.getStores();
		res.json(stores);
	} catch (err) {
		console.error("Error fetching stores:", err);
		res.status(500).json({ error: "Server error" });
	}
});

// Get store by ID
app.get("/api/stores/:id", async (req, res) => {
	try {
		const id = getNumericId(req.params.id);
		const store = await model.getStoreById(id);
		if (store) {
			res.json(store);
		} else {
			res.status(404).json({ error: "Store not found" });
		}
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

// Check authentication status
app.get("/api/check-auth", (req, res) => {
	try {
		const token = req.cookies.auth_token;
		if (!token) {
			return res.status(401).json({ authenticated: false });
		}

		const decoded = verifyToken(token);
		return res.json({
			authenticated: true,
			user: { username: decoded.id, role: decoded.role },
			role: decoded.role,
		});
	} catch (err) {
		console.error("Auth check error:", err);
		return res.status(401).json({ authenticated: false });
	}
});

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

		// Set cookie with longer expiration - 7 days
		res.cookie("auth_token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			sameSite: "lax",
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

// Logout route
app.post("/api/logout", (req, res) => {
	res.clearCookie("auth_token");
	res.json({ message: "Logout successful" });
});

// ADMIN ROUTES
// Add a new store
app.post("/api/admin/stores", async (req, res) => {
	try {
		console.log("Adding new store:", req.body);
		const newStore = req.body;

		// Add to JSON file
		const stores = JSON.parse(fs.readFileSync(STORES_PATH, "utf8"));
		if (!newStore.id) {
			const maxId = stores.reduce(
				(max, store) =>
					store.id && parseInt(store.id) > max ? parseInt(store.id) : max,
				0
			);
			newStore.id = (maxId + 1).toString();
		}

		stores.push(newStore);
		fs.writeFileSync(STORES_PATH, JSON.stringify(stores, null, 2));

		// Add to database
		const createdStore = await model.createStore(newStore);

		res.status(201).json(createdStore || newStore);
	} catch (err) {
		console.error("Error adding store:", err);
		res.status(500).json({ error: "Server error" });
	}
});

// Update a store
app.put("/api/admin/stores/:id", authenticate, isAdmin, async (req, res) => {
	try {
		const storeId = req.params.id;
		const updatedStore = req.body;

		console.log(`Updating store ${storeId} with:`, updatedStore);

		// Update in JSON file as backup
		let storeFound = false;
		try {
			const stores = JSON.parse(fs.readFileSync(STORES_PATH, "utf8"));
			const index = stores.findIndex(
				(s) => s.id && s.id.toString() === storeId.toString()
			);

			if (index !== -1) {
				storeFound = true;
				stores[index] = { ...stores[index], ...updatedStore };
				fs.writeFileSync(STORES_PATH, JSON.stringify(stores, null, 2));
				console.log(`Updated store in JSON file at index ${index}`);
			} else {
				console.log(`Store with ID ${storeId} not found in JSON file`);
			}
		} catch (fileError) {
			console.error("Error updating JSON file:", fileError);
		}

		// Update in database - try both numeric and string ID
		const numericId = getNumericId(storeId);
		const updatedDbStore = await model.updateStore(numericId, updatedStore);

		if (updatedDbStore || storeFound) {
			res.json(updatedStore);
		} else {
			res.status(404).json({ error: "Store not found" });
		}
	} catch (err) {
		console.error("Error updating store:", err);
		res.status(500).json({ error: "Server error" });
	}
});

// Delete a store
app.delete("/api/admin/stores/:id", authenticate, isAdmin, async (req, res) => {
	try {
		const storeId = req.params.id;
		console.log(`Attempting to delete store with ID: ${storeId}`);

		// Delete from JSON file as backup
		let storeFound = false;
		try {
			const stores = JSON.parse(fs.readFileSync(STORES_PATH, "utf8"));
			const initialLength = stores.length;
			const filteredStores = stores.filter(
				(s) => !s.id || s.id.toString() !== storeId.toString()
			);

			if (initialLength !== filteredStores.length) {
				storeFound = true;
				fs.writeFileSync(STORES_PATH, JSON.stringify(filteredStores, null, 2));
				console.log(`Deleted store from JSON file`);
			} else {
				console.log(`Store with ID ${storeId} not found in JSON file`);
			}
		} catch (fileError) {
			console.error("Error updating JSON file:", fileError);
		}

		// Delete from database - try both numeric and string ID
		const numericId = getNumericId(storeId);
		const deletedFromDb = await model.deleteStore(numericId);

		if (deletedFromDb || storeFound) {
			res.json({ message: "Store deleted successfully" });
		} else {
			res.status(404).json({ error: "Store not found" });
		}
	} catch (err) {
		console.error("Error deleting store:", err);
		res.status(500).json({ error: "Server error" });
	}
});

// Default route
app.get("/", (req, res) => {
	res.send("Backend is running");
});

// Database initialization
async function initializeDatabase() {
	try {
		// Create tables if they don't exist
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

		// Create admin user
		await createAdminUser();

		console.log("Database initialized successfully");
	} catch (err) {
		console.error("Database initialization error:", err);
	}
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
	console.log(`Server running on port ${PORT}`);

	// Wait a few seconds for the database to be ready
	setTimeout(async () => {
		await initializeDatabase();
	}, 3000);
});
