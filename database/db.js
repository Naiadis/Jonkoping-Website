//code adapted from Patrick Riehmann for the Web Development - Advanced Concepts at Jönköping University

const { Client } = require("pg");

const client = new Client({
	user: "postgres",
	host: "host.docker.internal", // Use 'host.docker.internal' if running in Docker
	database: "jkpgcity",
	password: "12345",
	port: 5432,
});

let isConnected = false;

async function connect() {
	if (!isConnected) {
		try {
			await client.connect();
			isConnected = true;
			console.log("Connected to PostgreSQL database");
		} catch (err) {
			console.error("Connection error", err.stack);
			throw err;
		}
	}
}

async function query(sql, params) {
	try {
		await connect();
		return await client.query(sql, params);
	} catch (err) {
		console.error("Query error", err.stack);
		throw err;
	}
}

module.exports = { query };
