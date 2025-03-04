const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const SECRET_KEY = crypto.randomBytes(32).toString("hex");

const generateToken = (user) => {
	return jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
		expiresIn: "1h",
	});
};

const verifyToken = (token) => {
	return jwt.verify(token, SECRET_KEY);
};

const hashPassword = async (password) => {
	return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
	return await bcrypt.compare(password, hash);
};

module.exports = {
	SECRET_KEY,
	generateToken,
	verifyToken,
	hashPassword,
	comparePassword,
};
