const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = (req, res, next) => {
	try {
		const authHeader = req.get("Authorization");
		if (!authHeader) {
			const error = new Error("Not authenticated!");
			error.statusCode = 401;
			throw error;
		}
		const token = req.get("Authorization").split(" ")[1];
		let decodedToken = jwt.verify(token, config.jwt.secret);

		// if didn't verify the token
		if (!decodedToken) {
			const error = new Error("Not Authenticated");
			error.statusCode = 401;
			throw error;
		}
		req.userId = decodedToken.userId;
		next();
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
