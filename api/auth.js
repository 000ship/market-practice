const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation failed; entered data is incorrect.");
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}
	const email = req.body.email;
	const password = req.body.password;
	bcrypt
		.hash(password, 12)
		.then((hashedPW) => {
			const user = new User({
				email: email,
				password: hashedPW,
			});
			return user.save();
		})
		.then((result) => {
			res.status(201).json({ message: "user created!", userId: result.id });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};
